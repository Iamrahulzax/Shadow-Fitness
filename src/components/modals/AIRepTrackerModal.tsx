import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Zap,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';
import {
  POSE_LANDMARKS,
  NormalizedLandmark,
  PushupStage,
  analyzePushupPose,
  LandmarkSmoother,
} from '../../utils/poseGeometry';
import {
  getPoseLandmarker,
  generateSyntheticPushupLandmarks,
} from '../../utils/aiPoseDetector';
import { soundFx } from '../../utils/audio';

interface AIRepTrackerModalProps {
  onClose: () => void;
  defaultTarget?: 'quest' | 'workout';
}

export const AIRepTrackerModal: React.FC<AIRepTrackerModalProps> = ({
  onClose,
  defaultTarget = 'quest',
}) => {
  const [state, actions] = usePlayerStore();
  const [targetType, setTargetType] = useState<'quest' | 'workout'>(defaultTarget);

  // Video & Canvas refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const smootherRef = useRef<LandmarkSmoother>(new LandmarkSmoother(0.55));
  const animationFrameRef = useRef<number | null>(null);

  // States
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speechEnabled, setSpeechEnabled] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  // Biometrics & Counters
  const [reps, setReps] = useState<number>(0);
  const [currentStage, setCurrentStage] = useState<PushupStage>('UP');
  const currentStageRef = useRef<PushupStage>('UP');
  const demoProgressRef = useRef<number>(0);
  const demoDirectionRef = useRef<number>(1);
  const [elbowAngle, setElbowAngle] = useState<number>(165);
  const [plankAngle, setPlankAngle] = useState<number>(175);
  const [formFeedback, setFormFeedback] = useState<string>('SYSTEM READY • ALIGN BODY');
  const [depthPercent, setDepthPercent] = useState<number>(0);
  const [goodRepsCount, setGoodRepsCount] = useState<number>(0);
  const [sessionStartTime] = useState<number>(() => Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Pushup quest reference
  const pushupQuest = state.quests.find((q) => q.id === 'q-sys-1');
  const initialCurrent = pushupQuest ? pushupQuest.current : 0;
  const questTarget = pushupQuest ? pushupQuest.target : 100;
  const estimatedXP = Math.round(reps * 2 + (reps >= 10 ? 50 : 0));

  // Voice announcement helper
  const speakCount = useCallback((count: number, note?: string) => {
    if (!speechEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const text = note ? `${count}! ${note}` : `${count}`;
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 1.15;
      utter.pitch = 1.0;
      utter.volume = 0.9;
      window.speechSynthesis.speak(utter);
    } catch {
      // ignore speech errors
    }
  }, [speechEnabled]);

  // Audio tone synthesizer for reps
  const playRepBeep = useCallback((isMilestone: boolean) => {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = isMilestone ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(isMilestone ? 880 : 587.33, ctx.currentTime); // A5 or D5
      if (isMilestone) {
        osc.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.18); // D6
      }

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (isMilestone ? 0.3 : 0.15));

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + (isMilestone ? 0.35 : 0.2));
    } catch {
      // AudioContext fallback
    }
  }, []);

  // Timer interval
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - sessionStartTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionStartTime]);

  // Handle stage transition and rep trigger
  const handlePoseUpdate = useCallback((analysis: ReturnType<typeof analyzePushupPose>) => {
    setElbowAngle(analysis.activeElbowAngle);
    setPlankAngle(analysis.plankAlignmentAngle);
    setFormFeedback(analysis.formFeedback);
    setDepthPercent(analysis.depthPercentage);

    // Stage progression logic: UP -> (TRANSITION/DOWN) -> UP
    setCurrentStage((prevStage) => {
      let nextStage = prevStage;
      // If we were at bottom (DOWN) and now pushed back UP (elbow > 150)
      if (prevStage === 'DOWN' && analysis.activeElbowAngle >= 148) {
        setReps((prevReps) => {
          const nextReps = prevReps + 1;
          const isMilestone = nextReps % 5 === 0;

          playRepBeep(isMilestone);
          if (isMilestone) {
            soundFx.playLevelUp();
            speakCount(nextReps, 'Powerful Rep!');
          } else {
            speakCount(nextReps);
          }

          if (analysis.isGoodPlank && analysis.depthPercentage >= 85) {
            setGoodRepsCount((g) => g + 1);
          }
          return nextReps;
        });
        nextStage = 'UP';
      } else if (analysis.stage === 'DOWN') {
        nextStage = 'DOWN';
      }

      currentStageRef.current = nextStage;
      return nextStage;
    });
  }, [playRepBeep, speakCount]);

  // Draw skeleton on canvas
  const drawSkeleton = useCallback(
    (landmarks: NormalizedLandmark[], width: number, height: number, angleDegrees: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, width, height);

      // SKELETON CONNECTIONS
      const connections: [number, number][] = [
        // Torso
        [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.RIGHT_SHOULDER],
        [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_HIP],
        [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_HIP],
        [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.RIGHT_HIP],
        // Left arm
        [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW],
        [POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST],
        // Right arm
        [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW],
        [POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST],
        // Legs
        [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_KNEE],
        [POSE_LANDMARKS.LEFT_KNEE, POSE_LANDMARKS.LEFT_ANKLE],
        [POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_KNEE],
        [POSE_LANDMARKS.RIGHT_KNEE, POSE_LANDMARKS.RIGHT_ANKLE],
      ];

      // Draw Connections (Laser Lines)
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#00D4FF';
      ctx.shadowColor = '#00D4FF';
      ctx.shadowBlur = 10;

      connections.forEach(([p1, p2]) => {
        const pt1 = landmarks[p1];
        const pt2 = landmarks[p2];
        if (pt1 && pt2 && (pt1.visibility ?? 1) > 0.4 && (pt2.visibility ?? 1) > 0.4) {
          ctx.beginPath();
          ctx.moveTo(pt1.x * width, pt1.y * height);
          ctx.lineTo(pt2.x * width, pt2.y * height);
          ctx.stroke();
        }
      });

      // Draw Keypoint Nodes
      landmarks.forEach((pt, idx) => {
        if (!pt || (pt.visibility ?? 1) < 0.4) return;
        const x = pt.x * width;
        const y = pt.y * height;

        const isArmJoint =
          idx === POSE_LANDMARKS.LEFT_ELBOW ||
          idx === POSE_LANDMARKS.RIGHT_ELBOW ||
          idx === POSE_LANDMARKS.LEFT_WRIST ||
          idx === POSE_LANDMARKS.RIGHT_WRIST;

        ctx.beginPath();
        ctx.arc(x, y, isArmJoint ? 6 : 4, 0, 2 * Math.PI);
        ctx.fillStyle = isArmJoint ? '#A855F7' : '#00E5FF';
        ctx.shadowColor = isArmJoint ? '#A855F7' : '#00E5FF';
        ctx.shadowBlur = 12;
        ctx.fill();

        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();
      });

      // Draw active elbow angle indicator
      const activeElbow = landmarks[POSE_LANDMARKS.RIGHT_ELBOW] || landmarks[POSE_LANDMARKS.LEFT_ELBOW];
      if (activeElbow && (activeElbow.visibility ?? 1) > 0.4) {
        const ex = activeElbow.x * width;
        const ey = activeElbow.y * height;

        ctx.font = 'bold 13px Rajdhani, monospace';
        ctx.fillStyle = '#00FFFF';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.fillText(`${angleDegrees}°`, ex + 14, ey - 6);
      }
    },
    []
  );

  // Real Camera Stream initialization
  useEffect(() => {
    let stream: MediaStream | null = null;
    let isActive = true;

    async function initCamera() {
      try {
        setCameraError(null);
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });

        if (!isActive) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              videoRef.current.play().catch(console.error);
              setCameraActive(true);
            }
          };
        }
      } catch (err: unknown) {
        console.warn('Webcam permission error or no camera detected:', err);
        setCameraError('Camera access not granted or unavailable. Switching to Simulation Mode.');
        setIsDemoMode(true);
      }
    }

    initCamera();

    return () => {
      isActive = false;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Continuous Inference Loop
  useEffect(() => {
    let isRunning = true;

    async function runDetectionLoop() {
      const landmarker = await getPoseLandmarker();

      const loop = () => {
        if (!isRunning) return;

        if (isPaused) {
          animationFrameRef.current = requestAnimationFrame(loop);
          return;
        }

        const canvas = canvasRef.current;
        const video = videoRef.current;

        // MODE 1: DEMO / SIMULATION MODE
        if (isDemoMode || !cameraActive || !landmarker) {
          demoProgressRef.current += 0.015 * demoDirectionRef.current;
          if (demoProgressRef.current >= 1) {
            demoProgressRef.current = 1;
            demoDirectionRef.current = -1;
          } else if (demoProgressRef.current <= 0) {
            demoProgressRef.current = 0;
            demoDirectionRef.current = 1;
          }

          const rawLandmarks = generateSyntheticPushupLandmarks(demoProgressRef.current);
          const smoothedLandmarks = smootherRef.current.smooth(rawLandmarks);
          const analysis = analyzePushupPose(smoothedLandmarks, currentStageRef.current);
          handlePoseUpdate(analysis);

          if (canvas) {
            drawSkeleton(smoothedLandmarks, canvas.width, canvas.height, analysis.activeElbowAngle);
          }

          animationFrameRef.current = requestAnimationFrame(loop);
          return;
        }

        // MODE 2: LIVE WEBCAM INFERENCE VIA MEDIAPIPE
        if (video && video.readyState >= 2 && landmarker) {
          const timestamp = performance.now();
          const results = landmarker.detectForVideo(video, timestamp);

          if (canvas && video.videoWidth > 0 && video.videoHeight > 0) {
            if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
            }

            if (results.landmarks && results.landmarks.length > 0) {
              const raw = results.landmarks[0] as NormalizedLandmark[];
              const smoothed = smootherRef.current.smooth(raw);
              const analysis = analyzePushupPose(smoothed, currentStageRef.current);
              handlePoseUpdate(analysis);
              drawSkeleton(smoothed, canvas.width, canvas.height, analysis.activeElbowAngle);
            } else {
              setFormFeedback('DETECTING HUNTER SKELETON...');
              const ctx = canvas.getContext('2d');
              if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
          }
        }

        animationFrameRef.current = requestAnimationFrame(loop);
      };

      animationFrameRef.current = requestAnimationFrame(loop);
    }

    runDetectionLoop();

    return () => {
      isRunning = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [cameraActive, isDemoMode, isPaused, handlePoseUpdate, drawSkeleton]);

  // Form score calculation
  const formScore = reps > 0 ? Math.min(100, Math.round((goodRepsCount / reps) * 100)) : 100;

  // Finish and commit
  const handleCommit = () => {
    actions.commitAIReps(reps, targetType);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-[#090A10] border-2 border-cyan-400 p-4 sm:p-6 clip-corner-both shadow-[0_0_40px_rgba(0,212,255,0.4)] flex flex-col max-h-[95vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500 shadow-[0_0_8px_#00D4FF]"></span>
            </span>
            <div>
              <h2 className="font-hud text-base sm:text-lg font-bold text-white tracking-wider uppercase flex items-center gap-2">
                SYSTEM VISION MATRIX • PUSH-UP AI DETECTOR
              </h2>
              <span className="font-tech text-[10px] text-cyan-400 tracking-widest block">
                NEURAL POSE SKELETON CAPTURE // BIO-ANGLE ANALYSIS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSpeechEnabled(!speechEnabled)}
              title={speechEnabled ? 'Mute Speech Coach' : 'Enable Speech Coach'}
              className="p-1.5 bg-black/60 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 transition-colors"
            >
              {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 bg-black/60 border border-slate-700 hover:border-rose-500 text-slate-300 hover:text-rose-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Viewport Screen + HUD Area */}
        <div className="relative w-full aspect-video bg-black/80 rounded-none border border-cyan-500/40 overflow-hidden flex items-center justify-center">
          {/* Live Video Feed */}
          <video
            ref={videoRef}
            playsInline
            muted
            className={`absolute inset-0 w-full h-full object-cover -scale-x-100 ${
              isDemoMode || !cameraActive ? 'hidden' : 'block'
            }`}
          />

          {/* Skeleton Drawing Canvas */}
          <canvas
            ref={canvasRef}
            width={640}
            height={360}
            className={`absolute inset-0 w-full h-full object-cover pointer-events-none z-10 ${
              isDemoMode ? '' : '-scale-x-100'
            }`}
          />

          {/* Cyber Scan Grid Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(rgba(0,212,255,0.06)_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          {/* Fallback & Simulation Notification Banner */}
          {isDemoMode && (
            <div className="absolute top-3 left-3 z-20 px-2.5 py-1 bg-violet-950/80 border border-violet-400/60 font-tech text-xs text-violet-300 flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-spin" />
              <span>SIMULATION MATRIX ENGAGED (AUTO-REP TEST RUN)</span>
            </div>
          )}

          {/* Real-time Angle & Depth HUD Badge */}
          <div className="absolute top-3 right-3 z-20 p-2.5 bg-black/80 border border-cyan-500/50 backdrop-blur-md text-right">
            <span className="font-tech text-[10px] text-slate-400 uppercase block">Elbow Angle</span>
            <span className="font-hud text-2xl font-black text-cyan-300 drop-shadow-[0_0_8px_#00D4FF]">
              {elbowAngle}°
            </span>
            <div className="w-24 h-1.5 bg-slate-800 mt-1 overflow-hidden border border-cyan-500/30">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 transition-all duration-100"
                style={{ width: `${depthPercent}%` }}
              />
            </div>
            <span className="font-tech text-[9px] text-cyan-400 block mt-0.5">
              DEPTH: {depthPercent}%
            </span>
          </div>

          {/* Center Form Feedback Pill */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 bg-black/85 border border-cyan-400 shadow-[0_0_15px_rgba(0,212,255,0.3)] backdrop-blur-md">
            <span className="font-hud text-xs sm:text-sm font-bold tracking-wider text-cyan-300 uppercase">
              {formFeedback}
            </span>
          </div>

          {/* Rep Counter Floating Hero */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 text-center pointer-events-none">
            <div className="px-5 py-1.5 bg-black/80 border border-cyan-500/60 backdrop-blur-md shadow-[0_0_20px_rgba(0,212,255,0.3)]">
              <span className="font-tech text-[10px] text-cyan-400 uppercase tracking-widest block">
                CAPTURED REPS
              </span>
              <span className="font-hud text-4xl sm:text-5xl font-black text-white drop-shadow-[0_0_12px_#00D4FF]">
                {reps}
              </span>
            </div>
          </div>
        </div>

        {/* Camera Error Notice if any */}
        {cameraError && (
          <div className="mt-2.5 px-3 py-1.5 bg-amber-950/60 border border-amber-500/40 text-amber-300 font-tech text-xs flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{cameraError}</span>
          </div>
        )}

        {/* Realtime Telemetry Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3">
          <div className="p-2 bg-black/60 border border-slate-800 text-center">
            <span className="font-tech text-[10px] text-slate-400 uppercase block">Pose Phase</span>
            <span className="font-hud text-xs font-bold text-cyan-300 truncate block">
              {currentStage}
            </span>
          </div>

          <div className="p-2 bg-black/60 border border-slate-800 text-center">
            <span className="font-tech text-[10px] text-slate-400 uppercase block">Plank Core</span>
            <span className={`font-hud text-xs font-bold ${plankAngle >= 145 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {plankAngle}° {plankAngle >= 145 ? '• Locked' : '• Sagging'}
            </span>
          </div>

          <div className="p-2 bg-black/60 border border-slate-800 text-center">
            <span className="font-tech text-[10px] text-slate-400 uppercase block">Form Score</span>
            <span className="font-hud text-xs font-bold text-cyan-300">
              {formScore}%
            </span>
          </div>

          <div className="p-2 bg-black/60 border border-slate-800 text-center">
            <span className="font-tech text-[10px] text-slate-400 uppercase block">Time Elapsed</span>
            <span className="font-hud text-xs font-bold text-white">
              {Math.floor(elapsedSeconds / 60)}m {elapsedSeconds % 60}s
            </span>
          </div>

          <div className="p-2 bg-black/60 border border-slate-800 text-center col-span-2 sm:col-span-1">
            <span className="font-tech text-[10px] text-slate-400 uppercase block">Yield XP</span>
            <span className="font-hud text-xs font-bold text-amber-300">
              +{estimatedXP} XP
            </span>
          </div>
        </div>

        {/* Quest Sync Progress Preview */}
        {targetType === 'quest' && pushupQuest && (
          <div className="mt-3 p-3 bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="font-hud text-xs font-bold text-white block">
                  {pushupQuest.title}
                </span>
                <span className="font-tech text-[11px] text-slate-400">
                  Current: {initialCurrent} / {questTarget} reps ➔ Will reach: {Math.min(questTarget, initialCurrent + reps)} / {questTarget}
                </span>
              </div>
            </div>

            <span className="font-hud text-xs font-bold text-cyan-300">
              {Math.min(100, Math.round(((initialCurrent + reps) / questTarget) * 100))}%
            </span>
          </div>
        )}

        {/* Action Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="px-3 py-2 bg-black/60 border border-slate-700 hover:border-cyan-400 font-hud text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5 transition-colors"
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
              {isPaused ? 'Resume' : 'Pause'}
            </button>

            <button
              onClick={() => {
                setReps(0);
                setGoodRepsCount(0);
              }}
              className="px-3 py-2 bg-black/60 border border-slate-700 hover:border-rose-500 font-hud text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" /> Reset
            </button>

            <button
              onClick={() => setIsDemoMode(!isDemoMode)}
              className={`px-3 py-2 border font-hud text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                isDemoMode
                  ? 'bg-violet-900/60 border-violet-400 text-violet-200 shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                  : 'bg-black/60 border-slate-700 text-slate-300 hover:border-violet-400'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              {isDemoMode ? 'Demo Active' : 'Test Simulation'}
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Target selector toggle */}
            <div className="flex border border-slate-800 bg-black/60">
              <button
                onClick={() => setTargetType('quest')}
                className={`px-2.5 py-1.5 font-tech text-[11px] uppercase tracking-wider transition-colors ${
                  targetType === 'quest' ? 'bg-cyan-950 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Daily Quest
              </button>
              <button
                onClick={() => setTargetType('workout')}
                className={`px-2.5 py-1.5 font-tech text-[11px] uppercase tracking-wider transition-colors ${
                  targetType === 'workout' ? 'bg-cyan-950 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Raid Workout
              </button>
            </div>

            {/* Commit Button */}
            <button
              onClick={handleCommit}
              disabled={reps === 0}
              className="flex-1 sm:flex-initial px-5 py-2.5 bg-gradient-to-r from-cyan-600 via-indigo-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 disabled:opacity-40 text-white font-hud font-bold text-xs tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(0,212,255,0.4)] clip-hex-btn flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-cyan-200" />
              <span>Commit {reps} Reps & Apply</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
