import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import { NormalizedLandmark } from './poseGeometry';

let poseLandmarkerInstance: PoseLandmarker | null = null;
let initPromise: Promise<PoseLandmarker | null> | null = null;

const WASM_PATH = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm';
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

/**
 * Initializes and caches the MediaPipe PoseLandmarker singleton
 */
export async function getPoseLandmarker(): Promise<PoseLandmarker | null> {
  if (poseLandmarkerInstance) return poseLandmarkerInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const vision = await FilesetResolver.forVisionTasks(WASM_PATH);
      const landmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: MODEL_URL,
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      poseLandmarkerInstance = landmarker;
      return landmarker;
    } catch (err) {
      console.warn('GPU delegate failed or network slow, attempting CPU fallback...', err);
      try {
        const vision = await FilesetResolver.forVisionTasks(WASM_PATH);
        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MODEL_URL,
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        poseLandmarkerInstance = landmarker;
        return landmarker;
      } catch (fallbackErr) {
        console.error('Failed to initialize MediaPipe PoseLandmarker:', fallbackErr);
        return null;
      }
    }
  })();

  return initPromise;
}

/**
 * Generates synthetic push-up landmarks (33 keypoints) simulating a person in plank/pushup position.
 * progress: 0 (top of pushup) to 1 (bottom of pushup, chest down, elbow at 90°)
 */
export function generateSyntheticPushupLandmarks(progress: number): NormalizedLandmark[] {
  // progress goes 0 -> 1 -> 0
  // When progress = 0: arms extended (elbow y is higher, angle ~ 165°)
  // When progress = 1: arms bent (elbow flares out, chest drops, angle ~ 85°)
  const depthFactor = Math.sin(progress * Math.PI); // 0 at top, 1 at bottom

  const chestY = 0.55 + depthFactor * 0.12;
  const shoulderY = chestY - 0.05;
  const elbowY = 0.55 + depthFactor * 0.04;
  const elbowXOffset = 0.05 + depthFactor * 0.06;

  const landmarks: NormalizedLandmark[] = Array(33).fill(null).map(() => ({
    x: 0.5,
    y: 0.5,
    z: 0,
    visibility: 0.9,
  }));

  // Head
  landmarks[0] = { x: 0.32, y: shoulderY - 0.08, z: 0, visibility: 0.95 }; // Nose

  // Shoulders
  landmarks[11] = { x: 0.38, y: shoulderY, z: -0.05, visibility: 0.95 }; // Left shoulder
  landmarks[12] = { x: 0.36, y: shoulderY + 0.02, z: 0.05, visibility: 0.95 }; // Right shoulder

  // Elbows (bend out and down)
  landmarks[13] = { x: 0.38 - elbowXOffset, y: elbowY, z: -0.05, visibility: 0.95 }; // Left elbow
  landmarks[14] = { x: 0.36 - elbowXOffset * 0.8, y: elbowY + 0.02, z: 0.05, visibility: 0.95 }; // Right elbow

  // Wrists (fixed to ground)
  landmarks[15] = { x: 0.38, y: 0.72, z: -0.05, visibility: 0.98 }; // Left wrist
  landmarks[16] = { x: 0.36, y: 0.72, z: 0.05, visibility: 0.98 }; // Right wrist

  // Hips (maintain plank angle, descend slightly with torso)
  const hipY = 0.56 + depthFactor * 0.07;
  landmarks[23] = { x: 0.60, y: hipY, z: -0.05, visibility: 0.95 }; // Left hip
  landmarks[24] = { x: 0.58, y: hipY + 0.02, z: 0.05, visibility: 0.95 }; // Right hip

  // Knees
  landmarks[25] = { x: 0.72, y: 0.62 + depthFactor * 0.03, z: -0.05, visibility: 0.95 }; // Left knee
  landmarks[26] = { x: 0.70, y: 0.64 + depthFactor * 0.03, z: 0.05, visibility: 0.95 }; // Right knee

  // Ankles / Feet on floor
  landmarks[27] = { x: 0.84, y: 0.70, z: -0.05, visibility: 0.95 }; // Left ankle
  landmarks[28] = { x: 0.82, y: 0.72, z: 0.05, visibility: 0.95 }; // Right ankle

  return landmarks;
}
