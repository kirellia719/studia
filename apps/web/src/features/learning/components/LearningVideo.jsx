// src/pages/student/courses/learning/LearningVideo.jsx

import { useRef, useState } from "react";

import {
  CirclePlay,
} from "lucide-react";
import getUrl from "@/lib/getUrl.js";


const LearningVideo = ({ lesson, onComplete }) => {
  const videoRef = useRef(null);

  const [completing, setCompleting] = useState(false);
  const [errorLessonId, setErrorLessonId] = useState(null);

  if (!lesson) {
    return (
      <section className="flex aspect-video w-full items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--surface)] shadow-sm">
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

  const isCompleted = lesson.isCompleted;

  const videoFailed = errorLessonId === lesson.id;

  const handleVideoEnded = async () => {
    if (isCompleted || completing) {
      return;
    }

    try {
      setCompleting(true);

      await onComplete?.(lesson.id);
    } catch (error) {
      console.error(
        "Complete lesson error:",
        error
      );
    } finally {
      setCompleting(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--surface)] shadow-sm">
      {/* Video */}
      <div className="relative aspect-video bg-[var(--solid)]">
        {lesson.video && !videoFailed ? (
          <video
            ref={videoRef}
            key={lesson.id}
            src={getUrl(lesson.video)}
            controls
            disablePictureInPicture
            disableRemotePlayback
            controlsList="nodownload noremoteplayback"
            onEnded={handleVideoEnded}
            onError={() => setErrorLessonId(lesson.id)}
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-white/70">
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
  );
};

export default LearningVideo;