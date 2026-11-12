// src/pages/student/courses/learning/LearningVideo.jsx

import { useEffect, useRef, useState } from "react";

import {
  CirclePlay,
} from "lucide-react";
import getUrl from "@/lib/getUrl.js";

const PROGRESS_KEY_PREFIX = "achan-lesson-time:";

const readSavedTime = (lessonId) => {
  try {
    const value = Number(
      localStorage.getItem(`${PROGRESS_KEY_PREFIX}${lessonId}`)
    );

    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
};

const saveTime = (lessonId, seconds) => {
  try {
    const value = Math.floor(seconds);

    if (value > 0) {
      localStorage.setItem(
        `${PROGRESS_KEY_PREFIX}${lessonId}`,
        String(value)
      );
    }
  } catch {
    // Trình duyệt chặn localStorage: bỏ qua, không ảnh hưởng việc học.
  }
};

const clearSavedTime = (lessonId) => {
  try {
    localStorage.removeItem(
      `${PROGRESS_KEY_PREFIX}${lessonId}`
    );
  } catch {
    // Không có gì để dọn nếu localStorage bị chặn.
  }
};

const formatClock = (totalSeconds) => {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  const pad = (value) => String(value).padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(remainder)}`;
  }

  return `${minutes}:${pad(remainder)}`;
};

const LearningVideo = ({ lesson, poster, onProgress }) => {
  const videoRef = useRef(null);

  const lastSavedRef = useRef(0);
  const lastReportedRef = useRef(0);
  const completedReportRef = useRef(false);
  const resumeTimerRef = useRef(null);

  const [errorLessonId, setErrorLessonId] = useState(null);
  const [readyLessonId, setReadyLessonId] = useState(null);
  const [resume, setResume] = useState(null);

  useEffect(() => {
    lastSavedRef.current = 0;
    lastReportedRef.current = 0;
    completedReportRef.current = false;

    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }, [lesson?.id]);

  useEffect(
    () => () => {
      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current);
      }
    },
    []
  );

  if (!lesson) {
    return (
      <section className="flex aspect-video w-full items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-sm">
        <div className="text-center">
          <CirclePlay
            size={36}
            strokeWidth={1.5}
            className="mx-auto mb-3 text-gray-300"
          />

          <p className="text-sm font-medium text-[var(--muted)]">
            Chưa có bài học để hiển thị.
          </p>
        </div>
      </section>
    );
  }

  const videoFailed = errorLessonId === lesson.id;

  const ready = readyLessonId === lesson.id;

  const handleLoadedMetadata = () => {
    const video = videoRef.current;

    if (!video) return;

    const serverTime = Number(
      lesson.videoPositionSeconds
    );

    const savedTime =
      Number.isFinite(serverTime) && serverTime > 0
        ? serverTime
        : readSavedTime(lesson.id);

    if (
      savedTime > 0 &&
      Number.isFinite(video.duration) &&
      savedTime < video.duration - 3
    ) {
      video.currentTime = savedTime;

      if (savedTime >= 5) {
        setResume({
          lessonId: lesson.id,
          seconds: Math.floor(savedTime),
        });

        if (resumeTimerRef.current) {
          clearTimeout(resumeTimerRef.current);
        }

        resumeTimerRef.current = setTimeout(() => {
          setResume(null);
        }, 5000);
      }
    }
  };

  const reportProgress = (video) => {
    if (
      !video ||
      !onProgress ||
      !Number.isFinite(video.currentTime) ||
      !Number.isFinite(video.duration) ||
      video.duration <= 0
    ) {
      return;
    }

    onProgress({
      positionSeconds: Math.floor(video.currentTime),
      durationSeconds: Math.floor(video.duration),
    });
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;

    if (!video || !Number.isFinite(video.currentTime)) {
      return;
    }

    const currentTime = Math.floor(video.currentTime);

    if (currentTime - lastSavedRef.current >= 5) {
      lastSavedRef.current = currentTime;

      saveTime(lesson.id, currentTime);
    }

    const shouldReport =
      currentTime - lastReportedRef.current >= 15 ||
      (!completedReportRef.current &&
        Number.isFinite(video.duration) &&
        video.duration > 0 &&
        video.currentTime >= video.duration * 0.9);

    if (shouldReport) {
      lastReportedRef.current = currentTime;

      if (
        Number.isFinite(video.duration) &&
        video.currentTime >= video.duration * 0.9
      ) {
        completedReportRef.current = true;
      }

      reportProgress(video);
    }
  };

  const handlePause = () => {
    const video = videoRef.current;

    if (video && Number.isFinite(video.currentTime)) {
      saveTime(lesson.id, video.currentTime);
      reportProgress(video);
    }
  };

  const handleVideoEnded = () => {
    clearSavedTime(lesson.id);

    reportProgress(videoRef.current);
  };

  return (
    <>
      {resume && resume.lessonId === lesson.id && (
        <div className="pointer-events-none fixed inset-x-0 top-[4.75rem] z-40 flex justify-center px-4">
          <button
            type="button"
            onClick={() => setResume(null)}
            className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-[var(--ink)]/90 px-3.5 py-2 text-[12px] font-medium text-white shadow-lg backdrop-blur-sm"
          >
            <CirclePlay size={13} />
            Đã tiếp tục từ {formatClock(resume.seconds)}
          </button>
        </div>
      )}

      <section className="-mx-4 -mt-4 overflow-hidden border-y border-[var(--line)] bg-[var(--solid)] sm:mx-0 sm:mt-0 sm:rounded-2xl sm:border sm:bg-[var(--surface)] sm:shadow-sm">
        {/* Video */}
        <div className="relative aspect-video bg-[var(--solid)]">
        {lesson.video && !videoFailed ? (
          <>
            <video
              ref={videoRef}
              key={lesson.id}
              src={getUrl(lesson.video)}
              poster={poster ? getUrl(poster) : undefined}
              controls
              preload="metadata"
              playsInline
              disablePictureInPicture
              disableRemotePlayback
              controlsList="nodownload noremoteplayback"
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              onPause={handlePause}
              onSeeked={() =>
                reportProgress(videoRef.current)
              }
              onCanPlay={() =>
                setReadyLessonId(lesson.id)
              }
              onWaiting={() =>
                setReadyLessonId(null)
              }
              onEnded={handleVideoEnded}
              onError={() => setErrorLessonId(lesson.id)}
              className="h-full w-full object-contain"
            />

            {!ready && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[var(--solid)]/70">
                <span
                  aria-hidden="true"
                  className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white"
                />

                <span className="sr-only">
                  Đang tải video
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="relative flex h-full items-center justify-center overflow-hidden">
            {poster && (
              <img
                src={getUrl(poster)}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover opacity-30"
              />
            )}

            <div className="relative text-center text-white/80">
              <CirclePlay
                size={38}
                strokeWidth={1.5}
                className="mx-auto mb-2"
              />

              <p className="text-sm">
                {videoFailed
                  ? "Video đang được cập nhật. Vui lòng thử lại sau."
                  : "Bài học chưa có video."}
              </p>
            </div>
          </div>
        )}
        </div>
      </section>
    </>
  );
};

export default LearningVideo;
