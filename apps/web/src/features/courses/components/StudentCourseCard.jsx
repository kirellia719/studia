// src/pages/student/courses/StudentCourseCard.jsx

import {
  ArrowRight,
  BookOpen,
  LockKeyhole,
  Play,
} from "lucide-react";

import { Link } from "react-router-dom";

import formatDate from "@/lib/format/formatDate.js";
import getUrl from "@/lib/getUrl.js";

const getRemainingDays = (expiresAt) => {
  if (!expiresAt) return null;

  const expiry = new Date(expiresAt);

  if (Number.isNaN(expiry.getTime())) return null;

  return Math.ceil(
    (expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
};

const StudentCourseCard = ({ enrollment }) => {
  const course = enrollment?.course;

  if (!course) {
    return null;
  }

  // Course status:
  // true  = đang mở
  // false = tạm khoá
  const isLocked = !course.status;

  const completedLessons = course.completedLessons ?? 0;

  const totalLessons = course.totalLessons ?? 0;

  const progress =
    totalLessons > 0
      ? Math.min(
        100,
        Math.round((completedLessons / totalLessons) * 100)
      )
      : 0;

  const hasStarted = completedLessons > 0;

  const isCompleted =
    totalLessons > 0 && completedLessons >= totalLessons;

  const remainingDays = getRemainingDays(enrollment?.expiresAt);

  const actionLabel = isCompleted
    ? "Xem lại khóa học"
    : hasStarted
      ? "Tiếp tục học"
      : "Bắt đầu học";

  const courseUrl = `/student/courses/${course.id}`;

  return (
    <article
      className={[
        "group",
        "relative",
        "flex",
        "w-full",
        "flex-col",
        "overflow-hidden",
        "rounded-2xl",
        "border",
        "border-[var(--line)]",
        "bg-[var(--surface)]",
        "shadow-[0_2px_12px_rgba(15,23,42,0.04)]",
        "transition-all",
        "duration-200",
        "hover:-translate-y-0.5",
        "hover:border-[var(--brand)]",
        "hover:shadow-[0_14px_32px_-12px_var(--ring)]",
      ].join(" ")}
    >
      {/* ==========================================
                Thumbnail
            ========================================== */}

      <Link
        to={isLocked ? "#" : courseUrl}
        onClick={(event) => {
          if (isLocked) {
            event.preventDefault();
          }
        }}
        className={[
          "relative",
          "block",
          "aspect-[16/9]",
          "w-full",
          "overflow-hidden",
          "bg-[var(--brand-soft)]",
        ].join(" ")}
      >
        {course.thumbnail ? (
          <>
            <img
              src={getUrl(course.thumbnail)}
              alt={course.title}
              className={[
                "h-full",
                "w-full",
                "object-cover",
                "transition-transform",
                "duration-500",
                !isLocked
                  ? "group-hover:scale-105"
                  : "",
              ].join(" ")}
            />

            <div
              className={[
                "pointer-events-none",
                "absolute",
                "inset-0",
                isLocked
                  ? "bg-black/40"
                  : "bg-gradient-to-t from-slate-950/25 via-transparent to-transparent",
              ].join(" ")}
            />

            {/* Locked badge - chỉ hiển thị trên thumbnail */}
            {isLocked && (
              <div
                className={[
                  "absolute",
                  "inset-0",
                  "flex",
                  "items-center",
                  "justify-center",
                ].join(" ")}
              >
                <div
                  className={[
                    "flex",
                    "items-center",
                    "gap-2",
                    "rounded-full",
                    "bg-[var(--surface)]/95",
                    "px-3",
                    "py-1.5",
                    "text-xs",
                    "font-semibold",
                    "text-[var(--muted)]",
                    "shadow-sm",
                    "backdrop-blur-sm",
                  ].join(" ")}
                >
                  <LockKeyhole
                    size={14}
                    strokeWidth={2}
                  />

                  <span>Tạm khoá</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <div
            className={[
              "flex",
              "h-full",
              "w-full",
              "items-center",
              "justify-center",
              isLocked
                ? "bg-[var(--line)] text-[var(--muted)]"
                : "bg-gradient-to-br from-[var(--brand-soft)] to-[var(--surface-2)] text-[var(--brand-text)]",
            ].join(" ")}
          >
            {isLocked ? (
              <LockKeyhole
                size={42}
                strokeWidth={1.4}
              />
            ) : (
              <BookOpen
                size={42}
                strokeWidth={1.4}
              />
            )}
          </div>
        )}
      </Link>

      {/* ==========================================
                Content
            ========================================== */}

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Course title */}
        <Link
          to={isLocked ? "#" : courseUrl}
          onClick={(event) => {
            if (isLocked) {
              event.preventDefault();
            }
          }}
          className="block"
        >
          <h2
            className={[
              "line-clamp-2",
              "text-base",
              "font-bold",
              "leading-6",
              "tracking-tight",
              "text-[var(--ink)]",
              !isLocked
                ? "transition-colors duration-200 group-hover:text-[var(--brand-text)]"
                : "",
              "sm:text-[17px]",
            ].join(" ")}
            title={course.title}
          >
            {course.title}
          </h2>
        </Link>

        {/* ======================================
                    Progress
                ====================================== */}

        <div className="mt-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--muted)]">
              Tiến độ học tập
            </span>
            <span
              className={[
                "text-xs",
                "font-bold",
                "tabular-nums",
                isCompleted
                  ? "text-[var(--success)]"
                  : "text-[var(--brand-text)]",
              ].join(" ")}
            >
              {progress}%
            </span>
          </div>

          {/* Progress bar */}
          <div
            className={[
              "mt-2",
              "h-2",
              "w-full",
              "overflow-hidden",
              "rounded-full",
              "bg-[var(--brand-soft)]",
            ].join(" ")}
          >
            <div
              className={[
                "h-full",
                "rounded-full",
                "transition-all",
                "duration-500",
                isCompleted
                  ? "bg-[var(--success)]"
                  : "bg-[var(--brand-solid)]",
              ].join(" ")}
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          {/* Progress detail */}
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--muted)]">
              {completedLessons}/{totalLessons} bài học
            </span>

            {isCompleted ? (
              <span className="text-[12px] font-semibold text-[var(--success)]">
                Hoàn thành
              </span>
            ) : hasStarted ? (
              <span className="text-[12px] font-semibold text-[var(--brand-text)]">
                Đang học
              </span>
            ) : (
              <span className="text-[12px] font-semibold text-[var(--muted)]">
                Chưa bắt đầu
              </span>
            )}
          </div>

          {enrollment?.expiresAt && (
            <p
              className={[
                "mt-2 text-[12px]",
                remainingDays !== null && remainingDays <= 7
                  ? "text-[var(--accent)]"
                  : "text-[var(--muted)]",
              ].join(" ")}
            >
              Hạn học: {formatDate(enrollment.expiresAt)}
              {remainingDays !== null && remainingDays > 0 && remainingDays <= 7
                ? ` (còn ${remainingDays} ngày)`
                : ""}
            </p>
          )}
        </div>

        {/* ======================================
                    Action
                ====================================== */}

        {!isLocked && (
          <Link
            to={isLocked ? "#" : courseUrl}
            onClick={(event) => {
              if (isLocked) {
                event.preventDefault();
              }
            }}
            className={[
              "mt-5",
              "flex",
              "h-10",
              "w-full",
              "items-center",
              "justify-center",
              "gap-2",
              "rounded-full",
              "text-xs",
              "font-semibold",
              "transition-all",
              "duration-200",
              "active:scale-[0.98]",
              isCompleted
                ? [
                  "bg-[var(--success-soft)]",
                  "text-[var(--success)]",
                  "hover:bg-[var(--success-soft)]",
                ].join(" ")
                : [
                  "bg-[var(--brand-solid)]",
                  "text-white",
                  "shadow-sm",
                  "shadow-[var(--brand)]/20",
                  "hover:bg-[var(--brand-solid-hover)]",
                  "hover:shadow-md",
                ].join(" "),
            ].join(" ")}
          >
            {!isCompleted && (
              <Play
                size={15}
                strokeWidth={2.2}
                fill="currentColor"
              />
            )}

            <span>{actionLabel}</span>

            <ArrowRight
              size={15}
              strokeWidth={2.2}
            />
          </Link>
        )}
      </div>
    </article>
  );
};

export default StudentCourseCard;
