export interface NormalizedLandmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

/**
 * Calculates the angle (in degrees) between three 2D points A -> B -> C,
 * where B is the vertex (e.g., Elbow between Shoulder and Wrist).
 */
export function calculateAngle(
  a: NormalizedLandmark,
  b: NormalizedLandmark,
  c: NormalizedLandmark
): number {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);

  if (angle > 180.0) {
    angle = 360.0 - angle;
  }

  return Math.round(angle);
}

/**
 * Exponential moving average filter for smoothing landmark coordinates
 */
export class LandmarkSmoother {
  private smoothed: Record<number, NormalizedLandmark> = {};
  private alpha: number;

  constructor(alpha: number = 0.6) {
    this.alpha = alpha;
  }

  smooth(landmarks: NormalizedLandmark[]): NormalizedLandmark[] {
    return landmarks.map((lm, idx) => {
      const prev = this.smoothed[idx];
      if (!prev) {
        this.smoothed[idx] = { ...lm };
        return lm;
      }

      const next: NormalizedLandmark = {
        x: this.alpha * lm.x + (1 - this.alpha) * prev.x,
        y: this.alpha * lm.y + (1 - this.alpha) * prev.y,
        z: lm.z !== undefined && prev.z !== undefined
          ? this.alpha * lm.z + (1 - this.alpha) * prev.z
          : lm.z,
        visibility: lm.visibility,
      };

      this.smoothed[idx] = next;
      return next;
    });
  }

  reset() {
    this.smoothed = {};
  }
}

export type PushupStage = 'UP' | 'DOWN' | 'TRANSITION';

export interface PushupAnalysis {
  stage: PushupStage;
  leftElbowAngle: number;
  rightElbowAngle: number;
  activeElbowAngle: number;
  plankAlignmentAngle: number;
  isGoodPlank: boolean;
  formFeedback: string;
  depthPercentage: number; // 0% (full top lock) to 100% (ideal bottom 90° or lower)
}

/**
 * MediaPipe Pose Landmark Indices (Standard 33 keypoints)
 */
export const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
} as const;

/**
 * Analyzes push-up mechanics given a 33-landmark skeleton
 */
export function analyzePushupPose(
  landmarks: NormalizedLandmark[],
  previousStage: PushupStage
): PushupAnalysis {
  const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
  const leftElbow = landmarks[POSE_LANDMARKS.LEFT_ELBOW];
  const leftWrist = landmarks[POSE_LANDMARKS.LEFT_WRIST];

  const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
  const rightElbow = landmarks[POSE_LANDMARKS.RIGHT_ELBOW];
  const rightWrist = landmarks[POSE_LANDMARKS.RIGHT_WRIST];

  const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
  const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
  const leftAnkle = landmarks[POSE_LANDMARKS.LEFT_ANKLE];
  const rightAnkle = landmarks[POSE_LANDMARKS.RIGHT_ANKLE];

  // Calculate elbow angles
  const leftElbowAngle =
    leftShoulder && leftElbow && leftWrist
      ? calculateAngle(leftShoulder, leftElbow, leftWrist)
      : 180;

  const rightElbowAngle =
    rightShoulder && rightElbow && rightWrist
      ? calculateAngle(rightShoulder, rightElbow, rightWrist)
      : 180;

  // Choose the more visible / representative arm
  const leftVis = (leftElbow?.visibility ?? 1) + (leftWrist?.visibility ?? 1);
  const rightVis = (rightElbow?.visibility ?? 1) + (rightWrist?.visibility ?? 1);
  const useRight = rightVis > leftVis;
  const activeElbowAngle = useRight ? rightElbowAngle : leftElbowAngle;

  // Calculate plank body alignment angle (Shoulder -> Hip -> Ankle)
  const shoulder = useRight ? rightShoulder : leftShoulder;
  const hip = useRight ? rightHip : leftHip;
  const ankle = useRight ? rightAnkle : leftAnkle;

  let plankAlignmentAngle = 180;
  if (shoulder && hip && ankle) {
    plankAlignmentAngle = calculateAngle(shoulder, hip, ankle);
  }

  // Plank is good if body angle is reasonably straight (typically 150° - 180°)
  const isGoodPlank = plankAlignmentAngle >= 145 && plankAlignmentAngle <= 190;

  // Depth percentage: 160° (top) -> 90° (bottom target)
  const topAngle = 160;
  const bottomAngle = 90;
  const depthPercentage = Math.min(
    100,
    Math.max(
      0,
      Math.round(((topAngle - activeElbowAngle) / (topAngle - bottomAngle)) * 100)
    )
  );

  // Determine stage and feedback
  let stage: PushupStage = previousStage;
  let formFeedback = 'READY • BEGIN REP';

  if (!isGoodPlank && (hip && shoulder)) {
    if (plankAlignmentAngle < 145) {
      formFeedback = 'ALIGN CORE: HIPS SAGGING';
    } else {
      formFeedback = 'KEEP BODY STRAIGHT';
    }
  } else if (activeElbowAngle > 150) {
    stage = 'UP';
    formFeedback = 'EXTENDED • LOWER CHEST';
  } else if (activeElbowAngle <= 95) {
    stage = 'DOWN';
    formFeedback = 'PERFECT DEPTH • EXPLODE UP!';
  } else {
    stage = 'TRANSITION';
    if (previousStage === 'UP') {
      formFeedback = depthPercentage > 60 ? 'ALMOST THERE • GO LOWER' : 'DESCENDING...';
    } else {
      formFeedback = 'PUSHING UP • FULL EXTENSION';
    }
  }

  return {
    stage,
    leftElbowAngle,
    rightElbowAngle,
    activeElbowAngle,
    plankAlignmentAngle,
    isGoodPlank,
    formFeedback,
    depthPercentage,
  };
}
