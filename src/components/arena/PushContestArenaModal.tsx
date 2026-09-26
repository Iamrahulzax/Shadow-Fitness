import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Swords,
  Timer,
  Play,
  RotateCcw,
  Sparkles,
  Camera,
  Volume2,
  VolumeX,
  Trophy,
  Flame,
  Award,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { CONTEST_RIVALS } from '../../data/pushContestData';
import { PushContestRival, ContestMode, PushContestResult } from '../../types';
import { soundFx } from '../../utils/audio';
import {
  analyzePushupPose,
  LandmarkSmoother,
  PushupStage,
  POSE_LANDMARKS,
} from '../../utils/poseGeometry';
import { getPoseLandmarker } from '../../utils/aiPoseDetector';

interface PushContestArenaModalProps {
  onClose: () => void;
  initialRivalId?: string;
}

export const PushContestArenaModal: React.FC<PushContestArenaModalProps> = ({
  onClose,
  initialRivalId,
}) => {
  const [state, actions] = usePlayerStore();
  const { player } = state;

  // Selected setup
  const [selectedRival, setSelectedRival] = useState<PushContestRival>(() => {
    return (
      CONTEST_RIVALS.find((r) => r.id === initialRivalId) ||
      CONTEST_RIVALS.find((r) => r.id === 'rival-cha-hae-in') ||
      CONTEST_RIVALS[0]
    );
  });

  const [contestMode, setContestMode] = useState<ContestMode>('60s');
  const [inputMethod, setInputMethod] = useState<'camera' | 'tap'>('tap');
  const [speechEnabled, setSpeechEnabled] = useState(true);

  // Match progression stages: 'setup' | 'countdown' | 'battle' | 'finished'
  const [matchStage, setMatchStage] = useState<'setup' | 'countdown' | 'battle' | 'finished'>('setup');
  const [countdownNum, setCountdownNum] = useState<number>(3);

  // Live Reps
  const [playerReps, setPlayerReps] = useState<number>(0);
  const [rivalReps, setRivalReps] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [rivalQuote, setRivalQuote] = useState<string>('Prepare your stance, Hunter!');

  // Camera & AI Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const smootherRef = useRef<LandmarkSmoother>(new LandmarkSmoother(0.55));
  const animationFrameRef = useRef<number | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Pose detection state
  const currentStageRef = useRef<PushupStage>('UP');
  const [elbowAngle, setElbowAngle] = useState(165);
  const [formFeedback, setFormFeedback] = useState('FORM READY • ALIGN IN FRAME');

  // Match durations
  const totalDuration = contestMode === '30s' ? 30 : 60;

  // Voice speech announcement
  const speak = useCallback(
    (text: string) => {
      if (!speechEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = 1.2;
        utter.pitch = 1.0;
        window.speechSynthesis.speak(utter);
      } catch {
        // ignore speech error
      }
    },
    [speechEnabled]
  );

  // Stop camera helper
  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      cameraStreamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // Start Camera
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });
      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      console.warn('Camera initialization error:', err);
      setCameraError('Camera access unavailable. Falling back to Battle Tap Mode.');
      setInputMethod('tap');
    }
  }, []);

  // AI Pose Detection Loop during Battle
  useEffect(() => {
    if (matchStage !== 'battle' || inputMethod !== 'camera' || !cameraActive) return;

    let isMounted = true;

    async function runDetection() {
      const landmarker = await getPoseLandmarker();
      if (!landmarker || !videoRef.current || !canvasRef.current || !isMounted) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx || video.readyState < 2) {
        animationFrameRef.current = requestAnimationFrame(runDetection);
        return;
      }

      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const now = performance.now();
      const results = landmarker.detectForVideo(video, now);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (results.landmarks && results.landmarks.length > 0) {
        const rawLandmarks = results.landmarks[0];
        const smoothedLandmarks = smootherRef.current.smooth(rawLandmarks);

        // Analyze pushup geometry
        const analysis = analyzePushupPose(smoothedLandmarks, currentStageRef.current);
        setElbowAngle(Math.round(analysis.activeElbowAngle));
        setFormFeedback(analysis.formFeedback);

        // Check rep completion: UP -> DOWN -> UP
        if (currentStageRef.current === 'DOWN' && analysis.activeElbowAngle >= 148) {
          currentStageRef.current = 'UP';
          setPlayerReps((prev) => {
            const next = prev + 1;
            soundFx.playStatUp();
            speak(`${next}`);
            return next;
          });
        } else if (analysis.stage === 'DOWN') {
          currentStageRef.current = 'DOWN';
        }

        // Draw HUD tech skeleton
        const leftElbow = smoothedLandmarks[POSE_LANDMARKS.LEFT_ELBOW];
        const rightElbow = smoothedLandmarks[POSE_LANDMARKS.RIGHT_ELBOW];
        const targetElbow = leftElbow && (leftElbow.visibility ?? 1) > 0.4 ? leftElbow : rightElbow;

        if (targetElbow) {
          ctx.beginPath();
          ctx.arc(targetElbow.x * canvas.width, targetElbow.y * canvas.height, 12, 0, 2 * Math.PI);
          ctx.fillStyle = analysis.isGoodPlank ? 'rgba(0, 212, 255, 0.4)' : 'rgba(255, 59, 92, 0.4)';
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = analysis.isGoodPlank ? '#00D4FF' : '#FF3B5C';
          ctx.stroke();
        }

      }

      if (isMounted) {
        animationFrameRef.current = requestAnimationFrame(runDetection);
      }
    }

    runDetection();

    return () => {
      isMounted = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [matchStage, inputMethod, cameraActive, speak]);

  // Start the match flow
  const handleStartMatch = () => {
    soundFx.playClick();
    setPlayerReps(0);
    setRivalReps(0);
    setTimeLeft(totalDuration);
    setCombatLog([`Battle engaged: ${player.name} VS ${selectedRival.name}!`]);
    setMatchStage('countdown');
    setCountdownNum(3);

    if (inputMethod === 'camera') {
      startCamera();
    }
  };

  // 3-second Countdown effect
  useEffect(() => {
    if (matchStage !== 'countdown') return;

    if (countdownNum > 0) {
      soundFx.playClick();
      speak(`${countdownNum}`);
      const timer = setTimeout(() => {
        setCountdownNum((c) => c - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      soundFx.playQuestComplete();
      speak('ARISE! PUSH!');
      setMatchStage('battle');
    }
  }, [matchStage, countdownNum, speak]);

  // Battle Match Clock Timer
  useEffect(() => {
    if (matchStage !== 'battle') return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setMatchStage('finished');
          return 0;
        }

        // Final 10 seconds audio beep
        if (prev <= 10) {
          soundFx.playClick();
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [matchStage]);

  // Check 'first50' target victory condition
  useEffect(() => {
    if (matchStage !== 'battle' || contestMode !== 'first50') return;
    if (playerReps >= 50 || rivalReps >= 50) {
      setMatchStage('finished');
    }
  }, [matchStage, contestMode, playerReps, rivalReps]);

  // Realistic Rival Rep Engine
  useEffect(() => {
    if (matchStage !== 'battle') return;

    // Base interval in ms between rival reps (e.g. 60000ms / 52 reps ≈ 1150ms)
    const baseIntervalMs = Math.round(60000 / selectedRival.baseRepsPerMin);

    const rivalPacingInterval = setInterval(() => {
      setRivalReps((prev) => {
        // Stop if target reached in first50 mode
        if (contestMode === 'first50' && prev >= 50) return prev;

        // Dynamic human variance: slight pause or sudden sprint
        const rand = Math.random();
        let increment = 1;

        // Rival surges if player is far ahead (AI catch-up tension)
        if (playerReps > prev + 3 && rand > 0.4) {
          increment = 2;
        }

        const nextReps = prev + increment;

        // Random rival combat taunt / quote
        if (nextReps % 10 === 0) {
          const quotes = [
            `"${selectedRival.name} strikes with flawless cadence!"`,
            `"${selectedRival.name}: 'Is that all your shadow power has to offer?'"`,
            `"${selectedRival.name} accelerates into high gear!"`,
            `"${selectedRival.name}: 'Keep pushing, Hunter!'"`
          ];
          const q = quotes[Math.floor(Math.random() * quotes.length)];
          setRivalQuote(q);
          setCombatLog((logs) => [q, ...logs.slice(0, 5)]);
        }

        return nextReps;
      });
    }, baseIntervalMs + (Math.random() * 400 - 200));

    return () => clearInterval(rivalPacingInterval);
  }, [matchStage, selectedRival, contestMode, playerReps]);

  // Manual Rep Click / Spacebar
  const handlePlayerRep = useCallback(() => {
    if (matchStage !== 'battle') return;
    setPlayerReps((prev) => {
      const next = prev + 1;
      soundFx.playStatUp();

      if (next % 5 === 0) {
        speak(`${next}`);
      }

      if (next % 10 === 0) {
        setCombatLog((logs) => [
          `⚡ ${player.name} delivers a thunderous 10-rep milestone! (${next} total)`,
          ...logs.slice(0, 5),
        ]);
      }

      return next;
    });
  }, [matchStage, player.name, speak]);

  // Spacebar keybind for manual reps
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && matchStage === 'battle') {
        e.preventDefault();
        handlePlayerRep();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [matchStage, handlePlayerRep]);

  // Handle Match Finish / Rewards
  const resultRecordedRef = useRef(false);
  const isWin = playerReps > rivalReps;
  const isTie = playerReps === rivalReps;

  useEffect(() => {
    if (matchStage !== 'finished' || resultRecordedRef.current) return;
    resultRecordedRef.current = true;
    stopCamera();

    const xpEarned = isWin ? 350 + playerReps * 3 : Math.round(playerReps * 2.5);
    const goldEarned = isWin ? 500 : 100;

    if (isWin) {
      soundFx.playDungeonClear();
      try {
        confetti({
          particleCount: 100,
          spread: 120,
          origin: { y: 0.6 },
          colors: ['#00D4FF', '#FF3B5C', '#F59E0B', '#FFFFFF'],
        });
      } catch {
        // ignore
      }
      speak(`VICTORY! You defeated ${selectedRival.name} with ${playerReps} push-ups!`);
    } else if (isTie) {
      soundFx.playQuestComplete();
      speak(`Stalemate! Both hunters reached ${playerReps} push-ups!`);
    } else {
      soundFx.playClick();
      speak(`Match concluded. Great effort with ${playerReps} push-ups.`);
    }

    const result: PushContestResult = {
      matchId: `contest-${Date.now()}`,
      timestamp: Date.now(),
      rivalName: selectedRival.name,
      rivalRank: selectedRival.rank,
      playerReps,
      rivalReps,
      isWin,
      mode: contestMode,
      xpEarned,
      goldEarned,
    };

    actions.recordPushContestMatch(result);
  }, [matchStage, isWin, isTie, playerReps, rivalReps, selectedRival, contestMode, actions, speak, stopCamera]);

  // Cleanup camera on modal unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Lead calculation
  const repDiff = playerReps - rivalReps;
  const totalRepsCombined = Math.max(1, playerReps + rivalReps);
  const playerBarPercent = Math.min(90, Math.max(10, Math.round((playerReps / totalRepsCombined) * 100)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,59,92,0.18)_0%,transparent_75%)] pointer-events-none" />

      <div className="relative w-full max-w-4xl max-h-[94vh] bg-[#0A0A10] border-2 border-rose-500/60 shadow-[0_0_50px_rgba(255,59,92,0.4)] clip-corner-both flex flex-col overflow-hidden">
        {/* Top Window Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#110B13] border-b border-rose-500/30 shrink-0">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600" />
            </span>
            <h3 className="font-hud text-xs sm:text-sm font-black text-white uppercase tracking-widest flex items-center gap-1.5">
              <Swords className="w-4 h-4 text-rose-500" />
              <span>LIVE PUSH CONTEST ARENA • 1V1 CLASH</span>
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSpeechEnabled(!speechEnabled)}
              className="text-slate-400 hover:text-white p-1"
              title={speechEnabled ? 'Mute AI Announcer' : 'Enable AI Announcer'}
            >
              {speechEnabled ? (
                <Volume2 className="w-4 h-4 text-cyan-400" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="p-1 text-slate-400 hover:text-white rounded-sm hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar space-y-5">
          {/* ================= STAGE 1: SETUP SCREEN ================= */}
          {matchStage === 'setup' && (
            <div className="space-y-5 animate-in fade-in">
              {/* Rival Challenger Selection */}
              <div>
                <span className="font-tech text-xs text-slate-300 uppercase tracking-wider font-bold block mb-2">
                  Select Your Challenger
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {CONTEST_RIVALS.map((rival) => {
                    const isSelected = rival.id === selectedRival.id;
                    return (
                      <div
                        key={rival.id}
                        onClick={() => setSelectedRival(rival)}
                        className={`p-3 bg-black/60 border rounded-none cursor-pointer transition-all duration-200 text-left ${
                          isSelected
                            ? 'border-rose-500 bg-rose-950/40 ring-1 ring-rose-500 shadow-[0_0_15px_rgba(255,59,92,0.3)]'
                            : 'border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-hud text-xs font-bold text-white truncate">
                            {rival.name}
                          </span>
                          <span className="font-hud text-[9px] px-1 py-0.2 bg-rose-600 text-white font-bold uppercase">
                            {rival.rank}
                          </span>
                        </div>
                        <span className="font-tech text-[10px] text-rose-300 block">
                          Pace: ~{rival.baseRepsPerMin} reps/min
                        </span>
                        <span className="font-tech text-[9px] text-slate-400 block mt-0.5 truncate">
                          {rival.difficulty.toUpperCase()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mode & Input Method Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Contest Mode */}
                <div>
                  <span className="font-tech text-xs text-slate-300 uppercase tracking-wider font-bold block mb-2">
                    Battle Duration & Quota
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: '60s', label: '60s Blitz', desc: 'Standard Clash' },
                      { id: '30s', label: '30s Sprint', desc: 'Rapid Burst' },
                      { id: 'first50', label: 'First to 50', desc: 'Speed Race' },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setContestMode(mode.id as ContestMode)}
                        className={`p-2.5 border rounded-none text-left transition-all ${
                          contestMode === mode.id
                            ? 'border-cyan-400 bg-cyan-950/60 text-cyan-300 shadow-[0_0_12px_rgba(0,212,255,0.3)]'
                            : 'border-slate-800 bg-black/40 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span className="font-hud text-xs font-bold block uppercase">{mode.label}</span>
                        <span className="font-tech text-[9px] block text-slate-400">{mode.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input Method */}
                <div>
                  <span className="font-tech text-xs text-slate-300 uppercase tracking-wider font-bold block mb-2">
                    Rep Tracking Verification
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setInputMethod('tap')}
                      className={`p-2.5 border rounded-none text-left transition-all ${
                        inputMethod === 'tap'
                          ? 'border-amber-400 bg-amber-950/60 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                          : 'border-slate-800 bg-black/40 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span className="font-hud text-xs font-bold uppercase">Battle Tap</span>
                      </div>
                      <span className="font-tech text-[9px] block text-slate-400">
                        Tap screen or press Spacebar
                      </span>
                    </button>

                    <button
                      onClick={() => setInputMethod('camera')}
                      className={`p-2.5 border rounded-none text-left transition-all ${
                        inputMethod === 'camera'
                          ? 'border-cyan-400 bg-cyan-950/60 text-cyan-300 shadow-[0_0_12px_rgba(0,212,255,0.3)]'
                          : 'border-slate-800 bg-black/40 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <Camera className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="font-hud text-xs font-bold uppercase">AI Webcam</span>
                      </div>
                      <span className="font-tech text-[9px] block text-slate-400">
                        Automatic elbow angle detection
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Matchup Preview Banner */}
              <div className="p-4 bg-gradient-to-r from-cyan-950/60 via-purple-950/40 to-rose-950/60 border border-white/10 flex items-center justify-between flex-wrap gap-4">
                {/* You */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 border-2 border-cyan-400 bg-cyan-950/80 flex items-center justify-center font-hud text-lg font-black text-cyan-300 shadow-[0_0_12px_#00D4FF]">
                    YOU
                  </div>
                  <div>
                    <h4 className="font-hud text-sm font-bold text-white">{player.name}</h4>
                    <span className="font-tech text-xs text-cyan-300">Level {player.level} • Rank {player.rank}</span>
                  </div>
                </div>

                {/* VS Emblem */}
                <div className="flex flex-col items-center">
                  <span className="font-hud text-2xl font-black text-rose-500 animate-pulse drop-shadow-[0_0_10px_#FF3B5C]">
                    VS
                  </span>
                  <span className="font-tech text-[10px] text-slate-400 uppercase tracking-wider">
                    {contestMode === 'first50' ? 'Target: 50 Reps' : `${totalDuration}s Duel`}
                  </span>
                </div>

                {/* Rival */}
                <div className="flex items-center gap-3 text-right">
                  <div>
                    <h4 className="font-hud text-sm font-bold text-white">{selectedRival.name}</h4>
                    <span className="font-tech text-xs text-rose-300">
                      {selectedRival.title} • Rank {selectedRival.rank}
                    </span>
                  </div>
                  <div className="w-12 h-12 border-2 border-rose-500 bg-rose-950/80 flex items-center justify-center font-hud text-lg font-black text-rose-300 shadow-[0_0_12px_#FF3B5C]">
                    {selectedRival.name.charAt(0)}
                  </div>
                </div>
              </div>

              {/* Start Duel Button */}
              <button
                onClick={handleStartMatch}
                className="w-full py-3.5 bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-hud text-sm font-black uppercase tracking-widest clip-hex-btn shadow-[0_0_25px_rgba(255,59,92,0.5)] active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>COMMENCE DUEL ({contestMode.toUpperCase()})</span>
              </button>
            </div>
          )}

          {/* ================= STAGE 2: COUNTDOWN SCREEN ================= */}
          {matchStage === 'countdown' && (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in">
              <span className="font-tech text-xs text-rose-400 uppercase tracking-widest font-bold">
                BATTLE COMMENCING IN
              </span>
              <div className="w-28 h-28 rounded-full border-4 border-rose-500 bg-black/80 flex items-center justify-center shadow-[0_0_40px_rgba(255,59,92,0.6)]">
                <span className="font-hud text-6xl font-black text-white animate-ping">
                  {countdownNum}
                </span>
              </div>
              <p className="font-hud text-sm text-cyan-300 tracking-wider uppercase">
                Assume push-up position • Prepare to push!
              </p>
            </div>
          )}

          {/* ================= STAGE 3: LIVE BATTLE ARENA ================= */}
          {matchStage === 'battle' && (
            <div className="space-y-4 animate-in fade-in">
              {/* Top Arena Bar: Timer & Dynamic Momentum */}
              <div className="p-3 bg-black/70 border border-white/10 flex items-center justify-between flex-wrap gap-3">
                {/* Timer Clock */}
                <div className="flex items-center gap-2">
                  <div
                    className={`px-3 py-1 border font-hud text-lg font-black tracking-wider flex items-center gap-1.5 ${
                      timeLeft <= 10
                        ? 'border-rose-500 bg-rose-950/80 text-rose-400 animate-pulse shadow-[0_0_15px_#FF3B5C]'
                        : 'border-cyan-400 bg-cyan-950/60 text-cyan-300'
                    }`}
                  >
                    <Timer className="w-4 h-4" />
                    <span>
                      {contestMode === 'first50'
                        ? 'RACE TO 50'
                        : `00:${String(timeLeft).padStart(2, '0')}`}
                    </span>
                  </div>
                </div>

                {/* Lead Status Pill */}
                <div>
                  {repDiff > 0 ? (
                    <span className="px-3 py-1 bg-cyan-950/90 border border-cyan-400 text-cyan-300 font-hud text-xs font-bold uppercase tracking-wider shadow-[0_0_12px_#00D4FF] flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                      YOU LEAD BY +{repDiff} REPS!
                    </span>
                  ) : repDiff < 0 ? (
                    <span className="px-3 py-1 bg-rose-950/90 border border-rose-500 text-rose-300 font-hud text-xs font-bold uppercase tracking-wider shadow-[0_0_12px_#FF3B5C] flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                      RIVAL LEADS BY {Math.abs(repDiff)} REPS — SURGE!
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-amber-950/90 border border-amber-400 text-amber-300 font-hud text-xs font-bold uppercase tracking-wider">
                      ⚔️ TIED DEAD HEAT ({playerReps} - {rivalReps})
                    </span>
                  )}
                </div>

                <div className="font-tech text-xs text-slate-400">
                  Target: {contestMode === 'first50' ? '50' : 'Max Reps'}
                </div>
              </div>

              {/* Proportional Momentum Bar */}
              <div className="w-full bg-slate-900 h-2.5 flex overflow-hidden border border-white/10">
                <div
                  className="bg-cyan-400 h-full transition-all duration-300 shadow-[0_0_8px_#00D4FF]"
                  style={{ width: `${playerBarPercent}%` }}
                />
                <div
                  className="bg-rose-500 h-full transition-all duration-300 shadow-[0_0_8px_#FF3B5C]"
                  style={{ width: `${100 - playerBarPercent}%` }}
                />
              </div>

              {/* Head-to-Head Split Arena Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* ================= LEFT: PLAYER COMBAT FRAME ================= */}
                <div className="p-4 bg-black/60 border-2 border-cyan-400/80 shadow-[0_0_20px_rgba(0,212,255,0.25)] flex flex-col justify-between space-y-3 relative">
                  <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-cyan-400 rounded-none shadow-[0_0_6px_#00D4FF]" />
                      <span className="font-hud text-xs font-bold text-cyan-300 uppercase">
                        {player.name} (YOU)
                      </span>
                    </div>
                    <span className="font-tech text-[10px] text-slate-400">Level {player.level}</span>
                  </div>

                  {/* Mega Illuminated Reps Display */}
                  <div className="text-center py-2">
                    <span className="font-hud text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-200 to-cyan-400 drop-shadow-[0_0_20px_rgba(0,212,255,0.8)]">
                      {playerReps}
                    </span>
                    <span className="font-tech text-xs uppercase tracking-widest text-cyan-300 block mt-1">
                      VERIFIED REPS
                    </span>
                  </div>

                  {/* Camera Video / Pose Canvas OR Tap Action Button */}
                  {inputMethod === 'camera' ? (
                    <div className="relative aspect-video bg-black/80 border border-cyan-500/40 overflow-hidden">
                      <video
                        ref={videoRef}
                        playsInline
                        muted
                        className="w-full h-full object-cover transform -scale-x-100"
                      />
                      <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full pointer-events-none transform -scale-x-100"
                      />
                      <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-black/70 border border-cyan-500/40 text-[10px] font-tech text-cyan-300">
                        Elbow Angle: {elbowAngle}° • {formFeedback}
                      </div>
                    </div>
                  ) : null}

                  {/* Rapid Tap Button (Always Available) */}
                  <button
                    onClick={handlePlayerRep}
                    className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:scale-95 text-white font-hud text-sm font-black uppercase tracking-widest shadow-[0_0_20px_rgba(0,212,255,0.4)] transition-all flex items-center justify-center gap-2"
                  >
                    <Zap className="w-5 h-5 animate-pulse" />
                    <span>PUSH! (TAP OR SPACEBAR)</span>
                  </button>

                  <span className="font-tech text-[10px] text-slate-400 text-center block">
                    Every valid push-up updates your score instantly
                  </span>
                </div>

                {/* ================= RIGHT: RIVAL COMBAT FRAME ================= */}
                <div className="p-4 bg-black/60 border-2 border-rose-500/80 shadow-[0_0_20px_rgba(255,59,92,0.25)] flex flex-col justify-between space-y-3 relative">
                  <div className="flex items-center justify-between border-b border-rose-500/20 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-rose-500 rounded-none shadow-[0_0_6px_#FF3B5C]" />
                      <span className="font-hud text-xs font-bold text-rose-300 uppercase">
                        {selectedRival.name}
                      </span>
                    </div>
                    <span className="font-tech text-[10px] text-slate-400">
                      Rank {selectedRival.rank} • {selectedRival.guild}
                    </span>
                  </div>

                  {/* Rival Mega Reps Display */}
                  <div className="text-center py-2">
                    <span className="font-hud text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-rose-200 to-rose-400 drop-shadow-[0_0_20px_rgba(255,59,92,0.8)]">
                      {rivalReps}
                    </span>
                    <span className="font-tech text-xs uppercase tracking-widest text-rose-300 block mt-1">
                      RIVAL REPS
                    </span>
                  </div>

                  {/* Rival Visual & Quote Bubble */}
                  <div className="p-3 bg-black/80 border border-rose-500/30 flex items-center gap-3">
                    <div className="w-12 h-12 bg-rose-950/80 border border-rose-500 flex items-center justify-center font-hud text-lg font-bold text-rose-300 shrink-0">
                      {selectedRival.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <span className="font-tech text-[10px] text-rose-400 block uppercase font-bold">
                        Pace: ~{selectedRival.baseRepsPerMin} reps/min
                      </span>
                      <p className="font-tech text-xs text-slate-300 italic truncate">
                        {rivalQuote}
                      </p>
                    </div>
                  </div>

                  {/* Live Combat Feed */}
                  <div className="p-2.5 bg-black/90 border border-white/10 text-left font-tech text-[11px] space-y-1 max-h-24 overflow-y-auto">
                    <span className="text-slate-500 text-[10px] block uppercase font-bold">
                      Battle Telemetry Feed
                    </span>
                    {combatLog.map((log, idx) => (
                      <div key={idx} className="text-slate-300 truncate">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= STAGE 4: FINISHED / REWARDS SCREEN ================= */}
          {matchStage === 'finished' && (
            <div className="py-6 space-y-6 text-center animate-in zoom-in-95 duration-300">
              {/* Victory / Defeat Header */}
              {isWin ? (
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-400 text-amber-300 font-tech text-xs uppercase tracking-widest font-bold shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    CONQUEST ACHIEVED • ARENA CHAMPION
                  </div>
                  <h2 className="font-hud text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-200 to-cyan-400 drop-shadow-[0_0_25px_rgba(0,212,255,0.8)]">
                    VICTORY!
                  </h2>
                  <p className="font-tech text-sm text-slate-300 uppercase tracking-wider">
                    You out-pushed {selectedRival.name} with {playerReps} against {rivalReps} push-ups!
                  </p>
                </div>
              ) : isTie ? (
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-tech text-xs uppercase tracking-widest font-bold">
                    ⚔️ STALEMATE • EQUAL TITANS
                  </div>
                  <h2 className="font-hud text-3xl sm:text-4xl font-black text-white">
                    DRAW MATCH
                  </h2>
                  <p className="font-tech text-sm text-slate-300 uppercase">
                    Both warriors conquered {playerReps} push-ups with ferocious discipline!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/20 border border-rose-500 text-rose-300 font-tech text-xs uppercase tracking-widest font-bold">
                    TRIAL CONCLUDED
                  </div>
                  <h2 className="font-hud text-3xl sm:text-4xl font-black text-slate-200">
                    DEFEAT
                  </h2>
                  <p className="font-tech text-sm text-slate-400 uppercase">
                    {selectedRival.name} prevailed with {rivalReps} push-ups. Return stronger!
                  </p>
                </div>
              )}

              {/* Score Recap Card */}
              <div className="max-w-md mx-auto p-4 bg-black/70 border border-white/10 flex items-center justify-around">
                <div className="text-center">
                  <span className="font-tech text-xs text-slate-400 uppercase block">Your Reps</span>
                  <span className="font-hud text-3xl sm:text-4xl font-black text-cyan-400">
                    {playerReps}
                  </span>
                </div>

                <div className="font-hud text-xl text-slate-500">VS</div>

                <div className="text-center">
                  <span className="font-tech text-xs text-slate-400 uppercase block">
                    {selectedRival.name.split(' ')[0]}'s Reps
                  </span>
                  <span className="font-hud text-3xl sm:text-4xl font-black text-rose-400">
                    {rivalReps}
                  </span>
                </div>
              </div>

              {/* Rewards Claim Card */}
              <div className="max-w-md mx-auto p-4 bg-gradient-to-r from-cyan-950/40 via-purple-950/40 to-amber-950/40 border border-amber-500/40 text-left space-y-2.5 font-tech text-xs">
                <span className="font-hud text-xs text-amber-300 font-bold uppercase tracking-wider block">
                  Match Rewards Claimed
                </span>
                <div className="flex justify-between items-center py-1 border-b border-white/10">
                  <span className="text-slate-300">Experience Yield</span>
                  <span className="font-hud text-cyan-400 font-bold">
                    +{isWin ? 350 + playerReps * 3 : Math.round(playerReps * 2.5)} XP
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/10">
                  <span className="text-slate-300">Hunter Gold Bounty</span>
                  <span className="font-hud text-amber-400 font-bold">
                    +{isWin ? 500 : 100} Gold
                  </span>
                </div>
                {isWin && (
                  <div className="flex justify-between items-center py-1 border-b border-white/10">
                    <span className="text-slate-300">Strength Stat Advancement</span>
                    <span className="font-hud text-rose-400 font-bold">+1 STR</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-300">Daily Push-up Quest Progress</span>
                  <span className="font-hud text-emerald-400 font-bold">
                    +{playerReps} Reps Credited
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="max-w-md mx-auto flex items-center gap-3">
                <button
                  onClick={() => {
                    resultRecordedRef.current = false;
                    handleStartMatch();
                  }}
                  className="flex-1 py-3 bg-cyan-950 hover:bg-cyan-900 border border-cyan-400 text-cyan-300 font-hud text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Rematch Duel</span>
                </button>

                <button
                  onClick={() => {
                    resultRecordedRef.current = false;
                    setMatchStage('setup');
                  }}
                  className="flex-1 py-3 bg-rose-950 hover:bg-rose-900 border border-rose-500 text-rose-300 font-hud text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                >
                  <Swords className="w-4 h-4" />
                  <span>Choose Rival</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-4 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-hud text-xs uppercase"
                >
                  Exit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
