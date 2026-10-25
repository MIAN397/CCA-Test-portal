import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Quiz, Student, Submission, IntegrityAudit, Question, ProctorSnapshot } from '../types';
import { useModalScrollLock } from '../utils/lenis';
import {
  Clock,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  X,
  ShieldAlert,
  Maximize2,
  Minimize2,
  AlertTriangle,
  Lock,
  Flag,
  ShieldCheck,
  AlertCircle,
  Camera,
  Eye,
  EyeOff,
  Play,
} from 'lucide-react';

interface TakeAssessmentModalProps {
  quiz: Quiz;
  student: Student;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    quiz: Quiz,
    student: Student,
    answers: Record<string, number>,
    timeSpent: number,
    integrityAudit?: IntegrityAudit
  ) => Submission;
  onTestCompleted: (submission: Submission) => void;
}

export const isTouchOrMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    window.innerWidth <= 820 ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent)
  );
};

export const isFullscreenSupported = (): boolean => {
  if (typeof document === 'undefined' || isTouchOrMobileDevice()) return false;
  const doc = document as any;
  return !!(
    doc.fullscreenEnabled ||
    doc.webkitFullscreenEnabled ||
    doc.mozFullScreenEnabled ||
    doc.msFullscreenEnabled
  );
};

const checkIsFullscreen = (): boolean => {
  if (typeof document === 'undefined') return false;
  // Mobile / touch devices operate in full viewport lockdown mode without native HTML5 Fullscreen API
  if (!isFullscreenSupported() || isTouchOrMobileDevice()) {
    return true;
  }
  const doc = document as any;
  return !!(
    document.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.mozFullScreenElement ||
    doc.msFullscreenElement
  );
};

const requestFullscreenSafe = async (): Promise<boolean> => {
  if (!isFullscreenSupported() || isTouchOrMobileDevice()) {
    return true;
  }
  try {
    const docEl = document.documentElement as any;
    if (docEl.requestFullscreen) {
      await docEl.requestFullscreen();
      return true;
    } else if (docEl.webkitRequestFullscreen) {
      await docEl.webkitRequestFullscreen();
      return true;
    } else if (docEl.mozRequestFullScreen) {
      await docEl.mozRequestFullScreen();
      return true;
    } else if (docEl.msRequestFullscreen) {
      await docEl.msRequestFullscreen();
      return true;
    }
  } catch (err) {
    console.warn('Fullscreen request rejected or not supported:', err);
  }
  return false;
};

const exitFullscreenSafe = async (): Promise<void> => {
  try {
    if (!isFullscreenSupported() || isTouchOrMobileDevice()) {
      return;
    }
    const doc = document as any;
    if (document.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement) {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        await doc.webkitExitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        await doc.mozCancelFullScreen();
      } else if (doc.msExitFullscreen) {
        await doc.msExitFullscreen();
      }
    }
  } catch (err) {
    // Ignore any exit fullscreen failures
  }
};

export const TakeAssessmentModal: React.FC<TakeAssessmentModalProps> = ({
  quiz,
  student,
  isOpen,
  onClose,
  onSubmit,
  onTestCompleted,
}) => {
  useModalScrollLock(isOpen);

  // Exam Progress State
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(quiz.durationMinutes * 60);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Security & Cheating Bust Protocol Requirements (Configured per Quiz by Teacher)
  const isAntiCheatingEnabled = quiz.enableAntiCheating !== false;
  const isWebcamRequired = isAntiCheatingEnabled && quiz.enableWebcamProctoring !== false;
  const isTabSwitchRequired = isAntiCheatingEnabled && quiz.enableTabSwitchDetection !== false;
  const isFullscreenRequired = isAntiCheatingEnabled && quiz.enableFullscreenLockdown !== false;
  const isClipboardBlockingRequired = isAntiCheatingEnabled && quiz.enableClipboardBlocking !== false;
  const maxAllowedStrikes = quiz.maxStrikes || 3;

  const MAX_GAZE_AWAY_SECONDS = 15; // Strict 15-second total out-of-screen termination limit
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [candidateGaze, setCandidateGaze] = useState<'focused' | 'away' | 'no_face'>('focused');
  const [headPoseDetail, setHeadPoseDetail] = useState<string>('Eyes Focused');
  const [gazeAwayCount, setGazeAwayCount] = useState(0);
  const [faceAbsenceCount, setFaceAbsenceCount] = useState(0);
  const [totalGazeAwaySeconds, setTotalGazeAwaySeconds] = useState(0);
  const [proctorSnapshots, setProctorSnapshots] = useState<ProctorSnapshot[]>([]);
  const [gazeWarningToast, setGazeWarningToast] = useState<string | null>(null);
  const [isPipMinimized, setIsPipMinimized] = useState<boolean>(isTouchOrMobileDevice());
  const lastViolationTimeRef = useRef<number>(0);

  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const gateVideoRef = useRef<HTMLVideoElement | null>(null);
  const visionCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const webcamStreamRef = useRef<MediaStream | null>(null);
  const totalGazeAwaySecondsRef = useRef<number>(0);
  useEffect(() => {
    totalGazeAwaySecondsRef.current = totalGazeAwaySeconds;
  }, [totalGazeAwaySeconds]);

  // In-App Dialog States (Replacing native window.confirm to eliminate window blur strikes)
  const [isConfirmSubmitOpen, setIsConfirmSubmitOpen] = useState(false);
  const [isConfirmExitOpen, setIsConfirmExitOpen] = useState(false);

  // Anti-Cheating Telemetry State
  const [tabSwitches, setTabSwitches] = useState(0);
  const [copyAttempts, setCopyAttempts] = useState(0);
  const [fullscreenExits, setFullscreenExits] = useState(0);
  const [infractions, setInfractions] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(checkIsFullscreen());
  const [strikeAlert, setStrikeAlert] = useState<{
    strike: number;
    title: string;
    message: string;
    isDisqualified?: boolean;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Submission Guard Ref (Synchronous flag to prevent any event listeners from logging violations on submission)
  const isSubmittingOrDoneRef = useRef(false);

  // Dynamic Question & Option Shuffling (Seeded per attempt)
  const shuffledQuestions: Question[] = useMemo(() => {
    if (quiz.shuffleQuestions === false) {
      return quiz.questions;
    }
    // Randomize questions for this student attempt
    return [...quiz.questions].sort(() => Math.random() - 0.5);
  }, [quiz.id]);

  // Stale closure guard: answersRef always holds the latest selected answers
  const answersRef = useRef<Record<string, number>>(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // Telemetry refs for auto-submit
  const telemetryRef = useRef({
    tabSwitches,
    copyAttempts,
    fullscreenExits,
    infractions,
    gazeAwayCount,
    faceAbsenceCount,
    totalGazeAwaySeconds,
    proctorSnapshots,
  });
  useEffect(() => {
    telemetryRef.current = {
      tabSwitches,
      copyAttempts,
      fullscreenExits,
      infractions,
      gazeAwayCount,
      faceAbsenceCount,
      totalGazeAwaySeconds,
      proctorSnapshots,
    };
  }, [tabSwitches, copyAttempts, fullscreenExits, infractions, gazeAwayCount, faceAbsenceCount, totalGazeAwaySeconds, proctorSnapshots]);

  // Camera Initialization with Multi-Tier Fallback
  const initializeCamera = useCallback(async () => {
    if (!isWebcamRequired) return;
    try {
      setCameraError(null);
      let stream: MediaStream | null = null;

      // Tier 1: User-facing camera with ideal framing
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });
      } catch (e1) {
        // Tier 2: Universal bare video constraint fallback
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      webcamStreamRef.current = stream;
      setWebcamStream(stream);
      setIsCameraReady(true);

      if (gateVideoRef.current) {
        gateVideoRef.current.srcObject = stream;
        gateVideoRef.current.play().catch(() => {});
      }
      if (videoElementRef.current) {
        videoElementRef.current.srcObject = stream;
        videoElementRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Webcam access error:', err);
      setIsCameraReady(false);
      setCameraError(
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Camera permission denied. Please allow camera access in browser to enable AI proctor.'
          : 'Could not connect to camera. Please check your webcam and permissions.'
      );
    }
  }, [isWebcamRequired]);

  useEffect(() => {
    if (isOpen && isWebcamRequired) {
      initializeCamera();
    }
    return () => {
      if (webcamStreamRef.current) {
        webcamStreamRef.current.getTracks().forEach((t) => t.stop());
        webcamStreamRef.current = null;
      }
    };
  }, [isOpen, isWebcamRequired, initializeCamera]);

  // Stream Attachment Watcher
  useEffect(() => {
    if (webcamStream) {
      if (videoElementRef.current && videoElementRef.current.srcObject !== webcamStream) {
        videoElementRef.current.srcObject = webcamStream;
        videoElementRef.current.play().catch(() => {});
      }
      if (gateVideoRef.current && gateVideoRef.current.srcObject !== webcamStream) {
        gateVideoRef.current.srcObject = webcamStream;
        gateVideoRef.current.play().catch(() => {});
      }
    }
  }, [webcamStream, isExamStarted]);

  // Record an infraction event
  const logInfraction = useCallback((description: string) => {
    if (isSubmittingOrDoneRef.current) return;
    const timeStr = new Date().toLocaleTimeString();
    const entry = `[${timeStr}] ${description}`;
    setInfractions((prev) => [...prev, entry]);
  }, []);

  // Real-time Canvas Vision Analyzer Loop
  const gazeAwayStartRef = useRef<number | null>(null);
  const noFaceStartRef = useRef<number | null>(null);
  const lastSnapshotTimeRef = useRef<number>(0);
  const baselineFaceYRef = useRef<number | null>(null);
  const baselineFaceXRef = useRef<number | null>(null);
  const calibrationFramesRef = useRef<number>(0);

  useEffect(() => {
    if (!isOpen || !isExamStarted || isSubmitting || !webcamStream || !isWebcamRequired) return;

    const interval = setInterval(() => {
      if (isSubmittingOrDoneRef.current) return;
      const videoEl = videoElementRef.current;
      if (!videoEl) return;

      // Re-attach stream if not attached yet
      if (videoEl.srcObject !== webcamStream) {
        videoEl.srcObject = webcamStream;
        videoEl.play().catch(() => {});
      }

      if (videoEl.paused) {
        videoEl.play().catch(() => {});
      }

      if (videoEl.readyState < 2 || videoEl.videoWidth === 0) return;

      try {
        let canvas = visionCanvasRef.current;
        if (!canvas) {
          canvas = document.createElement('canvas');
          canvas.width = 160;
          canvas.height = 120;
          visionCanvasRef.current = canvas;
        }
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        ctx.drawImage(videoEl, 0, 0, 160, 120);
        const frame = ctx.getImageData(0, 0, 160, 120);
        const data = frame.data;

        let totalFacePixels = 0;
        let weightedY = 0;
        let weightedX = 0;
        let topHalfSkin = 0;
        let bottomHalfSkin = 0;
        let leftHalfSkin = 0;
        let rightHalfSkin = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Normalized YCbCr + RGB Skin & Face Pixel Detection
          const yCb = 0.299 * r + 0.587 * g + 0.114 * b;
          const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
          const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

          const isSkin =
            (cb >= 75 && cb <= 135 && cr >= 128 && cr <= 178 && yCb > 20) || // Standard skin locus
            (r > 40 && g > 25 && b > 15 && r > g && r > b && (r - g) > 4) || // Direct warm skin
            (r > 25 && g > 20 && b > 18 && Math.abs(r - g) < 35 && r > 0.7 * b); // Low-light / cool lighting

          if (isSkin) {
            const pixelIndex = i / 4;
            const x = pixelIndex % 160;
            const y = Math.floor(pixelIndex / 160);
            totalFacePixels++;
            weightedX += x;
            weightedY += y;

            if (y < 60) topHalfSkin++;
            else bottomHalfSkin++;

            if (x < 80) leftHalfSkin++;
            else rightHalfSkin++;
          }
        }

        const skinRatio = totalFacePixels / (160 * 120);
        const now = Date.now();

        // Condition 1: No Face Detected in frame
        if (skinRatio < 0.02) {
          if (!noFaceStartRef.current) noFaceStartRef.current = now;
          gazeAwayStartRef.current = null;

          const newTotal = totalGazeAwaySecondsRef.current + 0.25;
          setTotalGazeAwaySeconds(newTotal);
          const remainingSecs = Math.max(0, Math.ceil(MAX_GAZE_AWAY_SECONDS - newTotal));

          if (newTotal >= MAX_GAZE_AWAY_SECONDS) {
            setCandidateGaze('no_face');
            setHeadPoseDetail('TERMINATED (15s Out of Screen)');
            setStrikeAlert({
              strike: 3,
              title: 'AUTOMATIC DISQUALIFICATION — 15S GAZE LIMIT EXCEEDED',
              message:
                'You have exceeded the maximum allowed out-of-screen gaze limit (15 total seconds spent away from the assessment screen). Your examination is terminated immediately with 0 marks.',
              isDisqualified: true,
            });
            logInfraction('Automatic Disqualification: Accumulated 15 seconds away from examination screen.');
            setTimeout(() => {
              performSubmitRef.current(
                true,
                'Exceeded maximum gaze violation limit: Accumulated 15 total seconds away from examination screen.'
              );
            }, 2500);
            return;
          }

          if (now - noFaceStartRef.current > 750) {
            setCandidateGaze('no_face');
            setHeadPoseDetail('Face Not Detected');
            setGazeWarningToast(`Face Not Detected (${remainingSecs}s until auto-termination). Please stay centered!`);

            if (now - lastSnapshotTimeRef.current > 5000) {
              lastSnapshotTimeRef.current = now;
              const snapshotUrl = canvas.toDataURL('image/jpeg', 0.6);
              setProctorSnapshots((prev) => [
                ...prev,
                {
                  timestamp: new Date().toLocaleTimeString(),
                  reason: 'Candidate left camera frame / No face detected',
                  imageBase64: snapshotUrl,
                },
              ]);
              setFaceAbsenceCount((c) => c + 1);
              logInfraction('AI Proctor: Candidate face not detected in camera frame.');
            }
          }
          return;
        } else {
          noFaceStartRef.current = null;
        }

        // Calculate facial centroid
        const centroidY = weightedY / totalFacePixels;
        const centroidX = weightedX / totalFacePixels;

        // Auto-calibration in first few seconds (smoothing baseline)
        if (calibrationFramesRef.current < 15) {
          calibrationFramesRef.current++;
          if (baselineFaceYRef.current === null) {
            baselineFaceYRef.current = centroidY;
            baselineFaceXRef.current = centroidX;
          } else {
            baselineFaceYRef.current = (baselineFaceYRef.current * 0.8) + (centroidY * 0.2);
            baselineFaceXRef.current = (baselineFaceXRef.current! * 0.8) + (centroidX * 0.2);
          }
        }

        const baseY = baselineFaceYRef.current || 55;
        const baseX = baselineFaceXRef.current || 80;

        // Condition 2: Head Tilted UP (Looking above screen / Phone mounted on top / Looking up)
        const isHeadTiltedUp = centroidY < baseY - 6 || (topHalfSkin > bottomHalfSkin * 1.35);

        // Condition 3: Head Tilted DOWN (Looking at Desk / Phone on desk or lap)
        const isHeadTiltedDown = centroidY > baseY + 6 || (bottomHalfSkin > topHalfSkin * 1.35);

        // Condition 4: Head Turned LEFT or RIGHT (Looking away from screen)
        const isTurnedLeft = centroidX < baseX - 14 || (leftHalfSkin > rightHalfSkin * 1.45);
        const isTurnedRight = centroidX > baseX + 14 || (rightHalfSkin > leftHalfSkin * 1.45);

        const isLookingAway = isHeadTiltedUp || isHeadTiltedDown || isTurnedLeft || isTurnedRight;

        if (isLookingAway) {
          if (!gazeAwayStartRef.current) gazeAwayStartRef.current = now;

          const specificReason = isHeadTiltedUp
            ? 'Looking UP (Above Screen / Phone on Top)'
            : isHeadTiltedDown
            ? 'Looking DOWN (Desk / Phone on Lap)'
            : isTurnedLeft
            ? 'Head Turned LEFT (Looking Away)'
            : 'Head Turned RIGHT (Looking Away)';

          const newTotal = totalGazeAwaySecondsRef.current + 0.25;
          setTotalGazeAwaySeconds(newTotal);
          const remainingSecs = Math.max(0, Math.ceil(MAX_GAZE_AWAY_SECONDS - newTotal));

          setHeadPoseDetail(specificReason);

          if (newTotal >= MAX_GAZE_AWAY_SECONDS) {
            setCandidateGaze('away');
            setHeadPoseDetail('TERMINATED (15s Out of Screen)');
            setStrikeAlert({
              strike: 3,
              title: 'AUTOMATIC DISQUALIFICATION — 15S GAZE LIMIT EXCEEDED',
              message:
                'You have exceeded the maximum allowed out-of-screen gaze limit (15 total seconds spent looking away/up/down from the assessment). Your examination is terminated immediately with 0 marks.',
              isDisqualified: true,
            });
            logInfraction('Automatic Disqualification: Accumulated 15 seconds looking away from examination screen.');
            setTimeout(() => {
              performSubmitRef.current(
                true,
                'Exceeded maximum gaze violation limit: Accumulated 15 total seconds looking away from examination screen.'
              );
            }, 2500);
            return;
          }

          if (now - gazeAwayStartRef.current > 750) {
            setCandidateGaze('away');
            setGazeWarningToast(`GAZE VIOLATION (${remainingSecs}s until auto-termination): ${specificReason}. Keep eyes on screen!`);

            if (now - lastSnapshotTimeRef.current > 5000) {
              lastSnapshotTimeRef.current = now;
              const snapshotUrl = canvas.toDataURL('image/jpeg', 0.6);
              setProctorSnapshots((prev) => [
                ...prev,
                {
                  timestamp: new Date().toLocaleTimeString(),
                  reason: `Suspicious Head Pose: ${specificReason}`,
                  imageBase64: snapshotUrl,
                },
              ]);
              setGazeAwayCount((c) => c + 1);
              logInfraction(`AI Proctor: ${specificReason}`);
            }
          }
        } else {
          gazeAwayStartRef.current = null;
          setCandidateGaze('focused');
          setHeadPoseDetail('Eyes Focused (On Exam)');
          setGazeWarningToast(null);
        }
      } catch (e) {
        // Safe fallback
      }
    }, 250);

    return () => clearInterval(interval);
  }, [isOpen, isExamStarted, isSubmitting, webcamStream, isWebcamRequired, logInfraction]);

  // Execution: Submit Test
  const handlePerformSubmit = useCallback(
    (disqualified: boolean = false, reason?: string) => {
      if (isSubmittingOrDoneRef.current) return;
      isSubmittingOrDoneRef.current = true;
      setIsSubmitting(true);

      const timeSpent = Math.max(1, Math.floor((Date.now() - startTime) / 1000));
      const currentAnswers = answersRef.current;
      const currentTelemetry = telemetryRef.current;

      const integrityAudit: IntegrityAudit = {
        tabSwitches: currentTelemetry.tabSwitches,
        copyAttempts: currentTelemetry.copyAttempts,
        fullscreenExits: currentTelemetry.fullscreenExits,
        isDisqualified: disqualified,
        disqualificationReason: disqualified ? reason : undefined,
        infractionTimestamps: currentTelemetry.infractions,
        webcamAudit: {
          isCameraEnabled: !!webcamStreamRef.current,
          gazeAwayCount: currentTelemetry.gazeAwayCount,
          faceAbsenceCount: currentTelemetry.faceAbsenceCount,
          totalGazeAwaySeconds: Math.round(currentTelemetry.totalGazeAwaySeconds),
          snapshots: currentTelemetry.proctorSnapshots,
        },
      };

      // Stop camera tracks cleanly
      if (webcamStreamRef.current) {
        webcamStreamRef.current.getTracks().forEach((t) => t.stop());
        webcamStreamRef.current = null;
      }

      // Cleanly exit fullscreen without triggering any listeners
      exitFullscreenSafe();

      const sub = onSubmit(quiz, student, currentAnswers, timeSpent, integrityAudit);
      onTestCompleted(sub);
    },
    [startTime, quiz, student, onSubmit, onTestCompleted]
  );

  const performSubmitRef = useRef(handlePerformSubmit);
  useEffect(() => {
    performSubmitRef.current = handlePerformSubmit;
  });

  // Start Examination Handler
  const handleStartExam = async () => {
    if (webcamStream && videoElementRef.current) {
      videoElementRef.current.srcObject = webcamStream;
      videoElementRef.current.play().catch(() => {});
    }
    if (isFullscreenRequired && isFullscreenSupported() && !isTouchOrMobileDevice()) {
      await requestFullscreenSafe();
    }
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
    setIsFullscreen(true);
    setStartTime(Date.now());
    setIsExamStarted(true);
  };

  // Re-enter Fullscreen Handler
  const handleResumeFullscreen = async () => {
    if (isFullscreenRequired && isFullscreenSupported() && !isTouchOrMobileDevice()) {
      await requestFullscreenSafe();
    }
    setIsFullscreen(true);
  };

  // Countdown timer with stale-closure-free expiry handler
  useEffect(() => {
    if (!isOpen || !isExamStarted || isSubmitting) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          performSubmitRef.current(false, 'Time expired.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isExamStarted, isSubmitting, quiz]);

  // Fullscreen change listener (Active only on supported desktop browsers when fullscreen is required)
  useEffect(() => {
    if (!isFullscreenRequired || !isFullscreenSupported() || isTouchOrMobileDevice()) return;

    const handleFullscreenChange = () => {
      const isNowFullscreen = checkIsFullscreen();
      setIsFullscreen(isNowFullscreen);

      if (isSubmittingOrDoneRef.current) return;

      if (!isNowFullscreen && isOpen && isExamStarted) {
        setFullscreenExits((c) => c + 1);
        logInfraction('Exited fullscreen examination mode.');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [isOpen, isExamStarted, isFullscreenRequired, logInfraction]);

  // Anti-cheating: visibility change, tab-switching, and window blur monitoring with strike system
  useEffect(() => {
    if (!isOpen || !isExamStarted || isSubmitting || !isTabSwitchRequired) return;

    const isMobile = isTouchOrMobileDevice();

    const handleViolation = (violationType: string) => {
      if (isSubmittingOrDoneRef.current) return;

      const now = Date.now();
      if (now - lastViolationTimeRef.current < 3500) {
        return; // Prevent duplicate multi-strikes from rapid browser event cycles
      }
      lastViolationTimeRef.current = now;

      setTabSwitches((prevCount) => {
        const newCount = prevCount + 1;
        const infractionDesc = `${violationType} (Strike ${newCount}/${maxAllowedStrikes})`;
        logInfraction(infractionDesc);

        if (newCount >= maxAllowedStrikes) {
          // Disqualification
          setStrikeAlert({
            strike: newCount,
            title: 'AUTOMATIC DISQUALIFICATION',
            message: `You have exceeded the maximum allowed security infractions (${newCount}/${maxAllowedStrikes} strikes). Your examination is terminated immediately with 0 score.`,
            isDisqualified: true,
          });
          setTimeout(() => {
            performSubmitRef.current(
              true,
              `Exceeded security infractions: ${newCount} tab/app switch events detected during exam.`
            );
          }, 3000);
        } else if (newCount === 1) {
          // Strike 1: Warning
          setStrikeAlert({
            strike: newCount,
            title: `SECURITY STRIKE 1 / ${maxAllowedStrikes} — TAB/APP SWITCH DETECTED`,
            message:
              'Warning: You switched tabs or minimized the examination window. All infractions are logged and audited.',
          });
        } else {
          // Additional Strikes: Severe Warning
          setStrikeAlert({
            strike: newCount,
            title: `CRITICAL STRIKE ${newCount} / ${maxAllowedStrikes} — FINAL WARNING`,
            message:
              'DANGER: Further tab switches, window minimization, or external app access will trigger INSTANT AUTOMATIC DISQUALIFICATION with zero marks.',
          });
        }

        return newCount;
      });
    };

    // Standard Visibility Change (Reliable across Safari, Chrome, iOS & Android)
    const handleVisibilityChange = () => {
      if (document.hidden && !isSubmittingOrDoneRef.current) {
        handleViolation('Tab switched or minimized to background / app switched');
      }
    };

    // Desktop-only debounced blur handler (Mobile devices NEVER use window.blur due to toolbar/keyboard resizing)
    let blurTimer: any = null;
    const handleWindowBlur = () => {
      if (isMobile || isSubmittingOrDoneRef.current) return;
      blurTimer = setTimeout(() => {
        if (!document.hasFocus() && document.hidden && !isSubmittingOrDoneRef.current) {
          handleViolation('Examination window lost focus / external app opened');
        }
      }, 500);
    };

    const handleWindowFocus = () => {
      if (blurTimer) {
        clearTimeout(blurTimer);
        blurTimer = null;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    if (!isMobile) {
      window.addEventListener('blur', handleWindowBlur);
      window.addEventListener('focus', handleWindowFocus);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (!isMobile) {
        window.removeEventListener('blur', handleWindowBlur);
        window.removeEventListener('focus', handleWindowFocus);
      }
      if (blurTimer) clearTimeout(blurTimer);
    };
  }, [isOpen, isExamStarted, isSubmitting, isTabSwitchRequired, maxAllowedStrikes, logInfraction]);

  // Accidental Page Refresh / Tab Close Guard during live exam
  useEffect(() => {
    if (!isOpen || !isExamStarted || isSubmitting) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isSubmittingOrDoneRef.current) return;
      e.preventDefault();
      e.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isOpen, isExamStarted, isSubmitting]);

  // Keyboard shortcut interception (A, B, C, D, 1, 2, 3, 4, F, Arrow keys) & Copy/Paste blocking
  useEffect(() => {
    if (!isOpen || !isExamStarted || isSubmitting) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSubmittingOrDoneRef.current) return;

      // Block Ctrl+C, Cmd+C (Copy)
      if (isClipboardBlockingRequired && (e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        setCopyAttempts((c) => c + 1);
        logInfraction('Attempted copy shortcut (Ctrl+C / Cmd+C)');
      }
      // Block Ctrl+V, Cmd+V (Paste)
      if (isClipboardBlockingRequired && (e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'V')) {
        e.preventDefault();
        setCopyAttempts((c) => c + 1);
        logInfraction('Attempted paste shortcut (Ctrl+V / Cmd+V)');
      }
      // Block F12 and DevTools shortcuts
      if (
        isClipboardBlockingRequired &&
        (e.key === 'F12' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i')))
      ) {
        e.preventDefault();
        logInfraction('Attempted DevTools shortcut');
      }

      // Keyboard Option Selection (A, B, C, D or 1, 2, 3, 4)
      const currentQuestion = shuffledQuestions[currentQIndex];
      if (currentQuestion && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const key = e.key.toUpperCase();
        if (key === 'A' || key === '1') {
          if (currentQuestion.options[0]) handleSelectOption(currentQuestion.id, 0);
        } else if (key === 'B' || key === '2') {
          if (currentQuestion.options[1]) handleSelectOption(currentQuestion.id, 1);
        } else if (key === 'C' || key === '3') {
          if (currentQuestion.options[2]) handleSelectOption(currentQuestion.id, 2);
        } else if (key === 'D' || key === '4') {
          if (currentQuestion.options[3]) handleSelectOption(currentQuestion.id, 3);
        } else if (key === 'F') {
          // Toggle Flag
          toggleFlagQuestion(currentQuestion.id);
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          if (currentQIndex < shuffledQuestions.length - 1) {
            setCurrentQIndex((idx) => idx + 1);
          }
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          if (currentQIndex > 0) {
            setCurrentQIndex((idx) => idx - 1);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isExamStarted, isSubmitting, currentQIndex, shuffledQuestions, logInfraction]);

  if (!isOpen) return null;

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const toggleFlagQuestion = (questionId: string) => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const handleRequestSubmit = () => {
    setIsConfirmSubmitOpen(true);
  };

  const handleConfirmSubmit = () => {
    setIsConfirmSubmitOpen(false);
    handlePerformSubmit(false);
  };

  const handleRequestExit = () => {
    setIsConfirmExitOpen(true);
  };

  const handleConfirmExit = () => {
    isSubmittingOrDoneRef.current = true;
    setIsConfirmExitOpen(false);
    exitFullscreenSafe();
    onClose();
  };

  const currentQ = shuffledQuestions[currentQIndex];
  const isTimeLow = secondsRemaining < 60;
  const isCurrentQFlagged = currentQ ? !!flaggedQuestions[currentQ.id] : false;
  const answeredCount = Object.keys(answers).length;
  const totalCount = shuffledQuestions.length;
  const unansweredCount = totalCount - answeredCount;
  const flaggedCount = Object.values(flaggedQuestions).filter(Boolean).length;

  return (
    <div className="modal-overlay" data-lenis-prevent="true" style={{ zIndex: 9999 }}>
      {/* 1. PRE-EXAM FULLSCREEN SECURITY GATE */}
      {!isExamStarted && (
        <motion.div
          className="modal-container"
          data-lenis-prevent="true"
          style={{
            maxWidth: '560px',
            maxHeight: '94vh',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            background: '#ffffff',
            boxShadow: '0 25px 60px -15px rgba(6, 14, 26, 0.4)',
          }}
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0b1728 0%, #172c4a 100%)',
              border: '2px solid #d4af37',
              color: '#d4af37',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              boxShadow: '0 8px 24px rgba(212, 175, 55, 0.25)',
            }}
          >
            <Lock size={36} />
          </div>

          <span
            style={{
              background: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              color: '#b38e22',
              padding: '0.25rem 0.8rem',
              borderRadius: '999px',
              fontSize: '0.76rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Institutional Security Protocol
          </span>

          <h2 style={{ color: 'var(--text-heading)', fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.4rem' }}>
            {quiz.title}
          </h2>

          <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            Student: <strong>{student.name}</strong> ({student.className}) • Subject: <strong>{quiz.subject}</strong>
          </p>

          {/* Live Camera Calibration Box */}
          {isWebcamRequired && (
            <div
              style={{
                background: '#0f172a',
                borderRadius: '10px',
                padding: '0.85rem 1rem',
                marginBottom: '1.25rem',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    width: '90px',
                    height: '68px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    background: '#000000',
                    position: 'relative',
                    flexShrink: 0,
                    border: `2px solid ${isCameraReady ? '#22c55e' : '#ef4444'}`,
                  }}
                >
                  <video
                    ref={(el) => {
                      gateVideoRef.current = el;
                      if (el && webcamStream && el.srcObject !== webcamStream) {
                        el.srcObject = webcamStream;
                        el.play().catch(() => {});
                      }
                    }}
                    autoPlay={true}
                    playsInline={true}
                    muted={true}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800, fontSize: '0.86rem' }}>
                    <Camera size={16} color={isCameraReady ? '#4ade80' : '#f87171'} />
                    <span>{isCameraReady ? 'AI Webcam Proctor Calibrated' : 'Webcam Calibration'}</span>
                  </div>
                  <p style={{ fontSize: '0.74rem', color: '#94a3b8', margin: '0.2rem 0 0 0', lineHeight: 1.4, maxWidth: '320px' }}>
                    {isCameraReady
                      ? 'Live face framing and gaze tracking active. Keep your face centered.'
                      : cameraError
                      ? cameraError
                      : 'Connecting to candidate camera stream...'}
                  </p>
                </div>
              </div>

              {!isCameraReady && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.25)' }}
                  onClick={initializeCamera}
                >
                  <Camera size={14} />
                  <span>Grant / Retry Camera</span>
                </button>
              )}
            </div>
          )}

          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '1rem',
              textAlign: 'left',
              marginBottom: '1.5rem',
              fontSize: '0.84rem',
              color: '#334155',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#0f172a' }}>
              <ShieldCheck size={16} color="#16a34a" />
              <span>Examination Integrity Guidelines:</span>
            </div>
            {!isAntiCheatingEnabled ? (
              <div style={{ paddingLeft: '1.5rem', lineHeight: 1.5, color: '#15803d' }}>
                • <strong>Open Practice Assessment:</strong> Cheating bust protocols are disabled for this quiz. You can attempt questions freely without camera proctoring or fullscreen restrictions.
              </div>
            ) : (
              <>
                {isFullscreenRequired && (
                  <div style={{ paddingLeft: '1.5rem', lineHeight: 1.5 }}>
                    • <strong>{isTouchOrMobileDevice() ? 'Exam Lockdown:' : 'Mandatory Fullscreen:'}</strong> {isTouchOrMobileDevice() ? 'The assessment runs in full immersion mode. App switching and leaving the browser are logged as strikes.' : 'The examination runs in full size. You cannot escape fullscreen until submitted.'}
                  </div>
                )}
                {isWebcamRequired && (
                  <div style={{ paddingLeft: '1.5rem', lineHeight: 1.5 }}>
                    • <strong>AI Gaze & 15s Termination Rule:</strong> Looking away, looking down at a desk/phone, or looking up for a cumulative total of <strong>15 seconds</strong> will result in <strong>INSTANT AUTOMATIC DISQUALIFICATION</strong>.
                  </div>
                )}
                {isTabSwitchRequired && (
                  <div style={{ paddingLeft: '1.5rem', lineHeight: 1.5 }}>
                    • <strong>Anti-Cheating Proctor:</strong> Tab switching and window blur are monitored with an automatic {maxAllowedStrikes >= 999 ? 'audit logging' : `${maxAllowedStrikes}-strike disqualification`} rule.
                  </div>
                )}
              </>
            )}
            <div style={{ paddingLeft: '1.5rem', lineHeight: 1.5 }}>
              • <strong>Time Limit:</strong> {quiz.durationMinutes} minutes ({shuffledQuestions.length} questions).
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                exitFullscreenSafe();
                onClose();
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                fontSize: '0.95rem',
                fontWeight: 700,
              }}
              onClick={handleStartExam}
            >
              {isFullscreenRequired && !isTouchOrMobileDevice() ? <Maximize2 size={18} /> : <Play size={18} />}
              <span>{isFullscreenRequired && !isTouchOrMobileDevice() ? 'Enter Fullscreen & Begin Exam' : 'Begin Assessment'}</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* 2. STRICT FULLSCREEN ESCAPE LOCKDOWN ENFORCEMENT (Desktop Only) */}
      {isExamStarted && isFullscreenRequired && isFullscreenSupported() && !isTouchOrMobileDevice() && !isFullscreen && !isSubmitting && (
        <div
          data-lenis-prevent="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(6, 14, 26, 0.96)',
            backdropFilter: 'blur(10px)',
            zIndex: 10010,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <motion.div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '520px',
              width: '100%',
              padding: '2.5rem 2rem',
              textAlign: 'center',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
              borderTop: '6px solid #ef4444',
            }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: '#fee2e2',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                boxShadow: '0 0 0 8px rgba(239, 68, 68, 0.15)',
              }}
            >
              <ShieldAlert size={38} />
            </div>

            <h3 style={{ fontSize: '1.3rem', color: '#09131f', marginBottom: '0.75rem', fontWeight: 800 }}>
              FULLSCREEN LOCKDOWN REQUIRED
            </h3>

            <p style={{ color: '#334862', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              You have exited fullscreen examination mode. All question items are locked to prevent cheating.
              <br />
              <strong style={{ color: '#b91c1c' }}>You cannot escape full size until this quiz is submitted.</strong>
            </p>

            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                padding: '0.75rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                color: '#991b1b',
                marginBottom: '1.5rem',
              }}
            >
              Fullscreen exit has been logged in your institutional audit trail (Exit Count: {fullscreenExits}).
            </div>

            <button
              type="button"
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.85rem 1.5rem',
                fontSize: '1rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
              }}
              onClick={handleResumeFullscreen}
            >
              <Maximize2 size={20} />
              <span>Resume Fullscreen Examination</span>
            </button>
          </motion.div>
        </div>
      )}

      {/* 3. STRIKE ALERT INTERCEPT MODAL */}
      {strikeAlert && (
        <div
          data-lenis-prevent="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(6, 14, 26, 0.92)',
            zIndex: 10020,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <motion.div
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              maxWidth: '520px',
              width: '100%',
              padding: '2.25rem 2rem',
              textAlign: 'center',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              borderTop: `6px solid ${strikeAlert.isDisqualified ? '#ef4444' : strikeAlert.strike === 2 ? '#ea580c' : '#f59e0b'}`,
            }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: strikeAlert.isDisqualified ? '#fee2e2' : '#fef3c7',
                color: strikeAlert.isDisqualified ? '#ef4444' : '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}
            >
              {strikeAlert.isDisqualified ? <ShieldAlert size={36} /> : <AlertTriangle size={36} />}
            </div>

            <h3 style={{ fontSize: '1.25rem', color: '#09131f', marginBottom: '0.75rem', fontWeight: 800 }}>
              {strikeAlert.title}
            </h3>

            <p style={{ color: '#334862', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {strikeAlert.message}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
              {!strikeAlert.isDisqualified && (
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ minWidth: '160px' }}
                  onClick={() => setStrikeAlert(null)}
                >
                  I Understand • Return to Examination Desk
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* 4. IN-APP SUBMISSION CONFIRMATION MODAL (Prevents window blur & false strikes) */}
      {isConfirmSubmitOpen && (
        <div
          data-lenis-prevent="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(6, 14, 26, 0.85)',
            backdropFilter: 'blur(5px)',
            zIndex: 10015,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={() => setIsConfirmSubmitOpen(false)}
        >
          <motion.div
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              maxWidth: '480px',
              width: '100%',
              padding: '2rem',
              textAlign: 'center',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4)',
              borderTop: '5px solid #22c55e',
            }}
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#dcfce7',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
              }}
            >
              <CheckCircle size={32} />
            </div>

            <h3 style={{ fontSize: '1.2rem', color: '#09131f', fontWeight: 800, marginBottom: '0.5rem' }}>
              Submit Examination Paper?
            </h3>

            <p style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '1.25rem' }}>
              You have answered <strong>{answeredCount}</strong> of <strong>{totalCount}</strong> questions.
            </p>

            {unansweredCount > 0 && (
              <div
                style={{
                  background: '#fef3c7',
                  border: '1px solid #fde68a',
                  padding: '0.65rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  color: '#92400e',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                  textAlign: 'left',
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>Notice: You have <strong>{unansweredCount}</strong> unanswered questions remaining.</span>
              </div>
            )}

            {flaggedCount > 0 && (
              <div
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  padding: '0.65rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  color: '#334155',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1.25rem',
                  textAlign: 'left',
                }}
              >
                <Flag size={15} color="#d4af37" style={{ flexShrink: 0 }} />
                <span>You have <strong>{flaggedCount}</strong> questions flagged for review.</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsConfirmSubmitOpen(false)}
              >
                Review Questions
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ background: '#16a34a', borderColor: '#16a34a' }}
                onClick={handleConfirmSubmit}
              >
                <CheckCircle size={17} />
                <span>Yes, Finalize & Submit</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 5. IN-APP FORFEIT / EXIT CONFIRMATION MODAL */}
      {isConfirmExitOpen && (
        <div
          data-lenis-prevent="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(6, 14, 26, 0.85)',
            backdropFilter: 'blur(5px)',
            zIndex: 10015,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={() => setIsConfirmExitOpen(false)}
        >
          <motion.div
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              maxWidth: '460px',
              width: '100%',
              padding: '2rem',
              textAlign: 'center',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4)',
              borderTop: '5px solid #ef4444',
            }}
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
              }}
            >
              <AlertTriangle size={28} />
            </div>

            <h3 style={{ fontSize: '1.2rem', color: '#09131f', fontWeight: 800, marginBottom: '0.5rem' }}>
              Quit & Forfeit Examination?
            </h3>

            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Are you sure you want to exit? Any unsaved answers will be discarded and retakes may be locked.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsConfirmExitOpen(false)}
              >
                Continue Exam
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ background: '#dc2626', borderColor: '#dc2626' }}
                onClick={handleConfirmExit}
              >
                Forfeit & Exit
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 6. MAIN EXAMINATION TERMINAL */}
      {isExamStarted && (
        <motion.div
          ref={containerRef}
          data-lenis-prevent="true"
          className="modal-container large exam-terminal-modal"
          style={{
            maxWidth: '960px',
            height: '92vh',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
          }}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          onCopy={(e) => {
            e.preventDefault();
            setCopyAttempts((c) => c + 1);
            logInfraction('Blocked copy attempt');
          }}
          onCut={(e) => {
            e.preventDefault();
            logInfraction('Blocked cut attempt');
          }}
          onPaste={(e) => {
            e.preventDefault();
            logInfraction('Blocked paste attempt');
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            logInfraction('Blocked right-click context menu');
          }}
        >
          {/* Anti-Cheating Header Proctor Bar */}
          <div
            style={{
              background: tabSwitches === 0 ? '#0b1728' : tabSwitches === 1 ? '#854d0e' : '#991b1b',
              color: '#ffffff',
              padding: '0.45rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.78rem',
              fontWeight: 700,
              transition: 'background 0.3s ease',
              flexShrink: 0,
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={14} color="#e5c158" />
              <span>{isTouchOrMobileDevice() ? 'Institutional Secure Desk' : 'Institutional Secure Examination Desk • Anti-AI & Proctoring Active'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              {isWebcamRequired && (
                <span
                  style={{
                    background: candidateGaze === 'focused' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.3)',
                    border: `1px solid ${candidateGaze === 'focused' ? '#22c55e' : '#ef4444'}`,
                    padding: '0.18rem 0.5rem',
                    borderRadius: '999px',
                    fontSize: '0.7rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <Camera size={11} />
                  <span>{candidateGaze === 'focused' ? 'Gaze: OK' : 'Gaze: Away'}</span>
                </span>
              )}

              <span
                style={{
                  background: tabSwitches === 0 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.3)',
                  border: `1px solid ${tabSwitches === 0 ? '#22c55e' : '#ef4444'}`,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '999px',
                  fontSize: '0.74rem',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                {tabSwitches === 0 ? 'Zero Infractions' : `Security Strikes: ${tabSwitches} / ${maxAllowedStrikes}`}
              </span>

              <span
                style={{
                  background: isFullscreen ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.3)',
                  border: `1px solid ${isFullscreen ? '#22c55e' : '#ef4444'}`,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '999px',
                  fontSize: '0.74rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <Maximize2 size={12} />
                <span>Fullscreen Locked</span>
              </span>
            </div>
          </div>

          {/* Exam Header */}
          <div className="exam-header" style={{ flexShrink: 0 }}>
            <div>
              <h3 style={{ color: '#ffffff', fontSize: '1.15rem', margin: 0, fontWeight: 800 }}>{quiz.title}</h3>
              <span style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '0.2rem', display: 'inline-block' }}>
                Student: <strong>{student.name}</strong> ({student.className}) • Subject: <strong>{quiz.subject}</strong>
              </span>
            </div>

            <div className={`timer-box ${isTimeLow ? 'warning' : ''}`}>
              <Clock size={20} />
              <span>{formatTime(secondsRemaining)}</span>
            </div>
          </div>

          {/* Exam Body */}
          <div
            className="modal-body"
            data-lenis-prevent="true"
            style={{ background: '#f8fafc', padding: '1.75rem', overflowY: 'auto', flex: '1 1 auto' }}
          >
            {currentQ && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQ.id}
                  className="question-box"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="badge badge-gold font-mono">
                        Question {currentQIndex + 1} of {shuffledQuestions.length}
                      </span>
                      <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
                        Marks: {currentQ.points} Points
                      </span>
                    </div>

                    {/* Bookmark / Flag For Review Button */}
                    <motion.button
                      type="button"
                      className={`btn btn-sm ${isCurrentQFlagged ? 'btn-primary' : 'btn-secondary'}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.3rem 0.75rem',
                        fontSize: '0.76rem',
                      }}
                      onClick={() => toggleFlagQuestion(currentQ.id)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      title="Flag this question to review later (Hotkey: F)"
                    >
                      <Flag size={13} fill={isCurrentQFlagged ? 'currentColor' : 'none'} />
                      <span>{isCurrentQFlagged ? 'Flagged for Review' : 'Flag Question (F)'}</span>
                    </motion.button>
                  </div>

                  <div className="question-prompt" style={{ userSelect: 'none' }}>
                    {currentQ.questionText}
                  </div>

                  <div className="options-list">
                    {currentQ.options.map((optText, optIdx) => {
                      const isSelected = answers[currentQ.id] === optIdx;
                      return (
                        <motion.div
                          key={optIdx}
                          className={`option-choice-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleSelectOption(currentQ.id, optIdx)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className="option-circle">{String.fromCharCode(65 + optIdx)}</div>
                          <span style={{ fontSize: '0.95rem', fontWeight: isSelected ? 700 : 500, userSelect: 'none', flex: 1 }}>
                            {optText}
                          </span>
                          {isSelected && (
                            <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--ccap-navy-900)' }}>
                              Selected
                            </span>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>
            )}

            {/* Navigation Controls */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '1.25rem',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                disabled={currentQIndex === 0}
                onClick={() => setCurrentQIndex(currentQIndex - 1)}
              >
                <ChevronLeft size={18} />
                <span>Previous (←)</span>
              </button>

              <div style={{ fontSize: '0.88rem', color: '#64748b', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                {Object.keys(answers).length} / {shuffledQuestions.length} Answered •{' '}
                {Object.values(flaggedQuestions).filter(Boolean).length} Flagged
              </div>

              {currentQIndex < shuffledQuestions.length - 1 ? (
                <button
                  type="button"
                  className="btn btn-navy"
                  onClick={() => setCurrentQIndex(currentQIndex + 1)}
                >
                  <span>Next (→)</span>
                  <ChevronRight size={18} />
                </button>
              ) : (
                <button type="button" className="btn btn-primary" onClick={handleRequestSubmit}>
                  <CheckCircle size={18} />
                  <span>Submit Exam</span>
                </button>
              )}
            </div>

            {/* Question Palette Grid */}
            <div className="question-nav-grid">
              {shuffledQuestions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined;
                const isFlagged = !!flaggedQuestions[q.id];
                const isCurrent = idx === currentQIndex;

                return (
                  <button
                    key={q.id}
                    type="button"
                    className={`q-nav-btn ${isAnswered ? 'answered' : ''} ${isCurrent ? 'active' : ''}`}
                    style={{
                      position: 'relative',
                      borderColor: isFlagged ? '#d4af37' : undefined,
                      boxShadow: isFlagged ? '0 0 0 2px rgba(212, 175, 55, 0.4)' : undefined,
                    }}
                    onClick={() => setCurrentQIndex(idx)}
                    title={`Question ${idx + 1}: ${isAnswered ? 'Answered' : 'Unanswered'}${isFlagged ? ' (Flagged)' : ''}`}
                  >
                    <span>{idx + 1}</span>
                    {isFlagged && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '-3px',
                          right: '-3px',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#d4af37',
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer" style={{ justifyContent: 'space-between', flexShrink: 0 }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleRequestExit}
            >
              <X size={16} />
              <span>Exit Exam</span>
            </button>

            {currentQIndex === shuffledQuestions.length - 1 ? (
              <button type="button" className="btn btn-primary" onClick={handleRequestSubmit}>
                <CheckCircle size={18} />
                <span>Finish & Submit Examination</span>
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-navy"
                onClick={() => setCurrentQIndex(currentQIndex + 1)}
              >
                <span>Next Question</span>
                <ChevronRight size={18} />
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* 7. FLOATING CANDIDATE AI PROCTOR VIDEO TILE */}
      {isExamStarted && isWebcamRequired && (
        isPipMinimized ? (
          <div
            className="floating-proctor-pip-minimized"
            style={{
              position: 'fixed',
              bottom: '4.5rem',
              right: '1rem',
              zIndex: 10005,
              background: 'rgba(9, 19, 31, 0.95)',
              backdropFilter: 'blur(8px)',
              border: `1.5px solid ${candidateGaze === 'focused' ? '#22c55e' : candidateGaze === 'away' ? '#f59e0b' : '#ef4444'}`,
              borderRadius: '999px',
              padding: '0.28rem 0.65rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
              cursor: 'pointer',
              color: '#ffffff',
              transition: 'all 0.2s ease',
            }}
            onClick={() => setIsPipMinimized(false)}
            title="Click to expand camera preview"
          >
            <div style={{ position: 'relative', width: '20px', height: '20px', borderRadius: '50%', overflow: 'hidden', background: '#000000', flexShrink: 0 }}>
              <video
                ref={(el) => {
                  if (el && webcamStream && el.srcObject !== webcamStream) {
                    el.srcObject = webcamStream;
                    el.play().catch(() => {});
                  }
                }}
                autoPlay={true}
                playsInline={true}
                muted={true}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
              />
            </div>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: candidateGaze === 'focused' ? '#22c55e' : '#ef4444', flexShrink: 0 }} />
              <span>{candidateGaze === 'focused' ? 'AI Gaze: Focused' : 'AI Gaze: Flagged'}</span>
            </span>
            <Maximize2 size={12} color="#cbd5e1" style={{ flexShrink: 0 }} />
          </div>
        ) : (
          <div
            className="floating-proctor-pip"
            style={{
              position: 'fixed',
              bottom: '4.5rem',
              right: '1rem',
              width: '165px',
              height: '148px',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)',
              border: `2.5px solid ${candidateGaze === 'focused' ? '#22c55e' : candidateGaze === 'away' ? '#f59e0b' : '#ef4444'}`,
              background: '#09131f',
              zIndex: 10005,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ position: 'relative', width: '100%', height: '94px', background: '#000000' }}>
              <video
                ref={(el) => {
                  videoElementRef.current = el;
                  if (el && webcamStream && el.srcObject !== webcamStream) {
                    el.srcObject = webcamStream;
                    el.play().catch(() => {});
                  }
                }}
                autoPlay={true}
                playsInline={true}
                muted={true}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'scaleX(-1)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '5px',
                  left: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'rgba(0, 0, 0, 0.75)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '0.62rem',
                  color: '#ffffff',
                  fontWeight: 800,
                }}
              >
                <span
                  style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    backgroundColor: '#ef4444',
                    display: 'inline-block',
                  }}
                />
                <span>AI REC</span>
              </div>

              <button
                type="button"
                onClick={() => setIsPipMinimized(true)}
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  background: 'rgba(0, 0, 0, 0.75)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '2px 5px',
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                  fontSize: '0.6rem',
                  fontWeight: 700,
                }}
                title="Minimize Camera View"
              >
                <Minimize2 size={10} />
                <span>Mini</span>
              </button>
            </div>

          {/* Direction Status */}
          <div
            style={{
              height: '26px',
              background: candidateGaze === 'focused' ? '#14532d' : candidateGaze === 'away' ? '#78350f' : '#7f1d1d',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              fontSize: '0.64rem',
              fontWeight: 700,
              letterSpacing: '0.01em',
              padding: '0 4px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {candidateGaze === 'focused' ? (
              <>
                <Eye size={12} color="#4ade80" />
                <span>{headPoseDetail}</span>
              </>
            ) : candidateGaze === 'away' ? (
              <>
                <AlertTriangle size={12} color="#fde047" />
                <span>{headPoseDetail}</span>
              </>
            ) : (
              <>
                <EyeOff size={12} color="#fca5a5" />
                <span>{headPoseDetail}</span>
              </>
            )}
          </div>

          {/* 15s Grace Meter */}
          <div
            style={{
              height: '24px',
              background: totalGazeAwaySeconds > 10 ? '#450a0a' : totalGazeAwaySeconds > 5 ? '#451a03' : '#022c22',
              color: '#cbd5e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 8px',
              fontSize: '0.62rem',
              fontWeight: 600,
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <span>Screen Grace:</span>
            <span
              style={{
                color: totalGazeAwaySeconds > 10 ? '#ef4444' : totalGazeAwaySeconds > 5 ? '#fbbf24' : '#4ade80',
                fontWeight: 800,
              }}
            >
              {Math.max(0, Math.ceil(MAX_GAZE_AWAY_SECONDS - totalGazeAwaySeconds))}s / 15s
            </span>
          </div>
        </div>
      )
    )}

      {/* 8. REAL-TIME GAZE WARNING TOAST */}
      <AnimatePresence>
        {gazeWarningToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            style={{
              position: 'fixed',
              top: '20px',
              left: '50%',
              background: '#7f1d1d',
              color: '#ffffff',
              border: '2px solid #ef4444',
              padding: '0.75rem 1.25rem',
              borderRadius: '8px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
              zIndex: 10025,
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.86rem',
              fontWeight: 700,
            }}
          >
            <AlertTriangle size={18} color="#fde047" />
            <span>{gazeWarningToast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
