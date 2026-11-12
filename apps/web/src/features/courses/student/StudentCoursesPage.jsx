// src/pages/student/courses/StudentCoursesPage.jsx

import { useEffect, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import appToast from "@/lib/toast.js";
import learningApi from "@/features/learning/api.js";

import StudentCourseCard from "@/features/courses/components/StudentCourseCard.jsx";

const StudentCoursesPage = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [expiredCount, setExpiredCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const navigate = useNavigate();

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(false);

      const response = await learningApi.getMyCourses();

      setEnrollments(response?.data || []);
      setExpiredCount(response?.meta?.expiredCount ?? 0);
    } catch (error) {
      console.error("Get student courses error:", error);

      setError(true);

      appToast.error(
        error?.response?.data?.message ||
        "Không thể tải danh sách khóa học."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-dvh bg-[var(--surface-3)]">
      {/* =====================================================
                PAGE HEADER
            ====================================================== */}
      <header className="page-band sticky top-0 z-30 h-16">
        <div className="mx-auto flex h-full max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <span className="brand-tile flex h-10 w-10 items-center justify-center rounded-xl">
            <BookOpen size={19} strokeWidth={2} />
          </span>

          <h1 className="text-lg font-semibold tracking-tight text-[var(--ink)] sm:text-xl">
            Khóa học của tôi
          </h1>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        {/* =====================================================
                    ERROR STATE
                ====================================================== */}
        {error && <ErrorState onRetry={fetchCourses} />}

        {/* =====================================================
                    EMPTY STATE
                ====================================================== */}
        {!error && enrollments.length === 0 && (
          <EmptyState
            expiredCount={expiredCount}
            onExplore={() => navigate("/student/explore")}
          />
        )}

        {/* =====================================================
                    EXPIRED NOTICE
                ====================================================== */}
        {!error && enrollments.length > 0 && expiredCount > 0 && (
          <div className="mb-4 rounded-lg border border-[var(--accent-soft)] bg-[var(--accent-soft)] px-4 py-3">
            <p className="text-sm font-medium text-[var(--accent)]">
              {expiredCount} khóa học đã hết hạn truy cập
            </p>

            <p className="mt-1 text-sm text-[var(--accent)]">
              Liên hệ giáo viên phụ trách để gia hạn thêm thời gian
              học.
            </p>
          </div>
        )}

        {/* =====================================================
                    COURSE LIST
                ====================================================== */}
        {!error && enrollments.length > 0 && (
          <section>
            <div className="grid gap-4 lg:grid-cols-2">
              {enrollments.map((enrollment) => (
                <StudentCourseCard
                  key={enrollment.id}
                  enrollment={enrollment}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

/* =========================================================
   LOADING
========================================================= */

const LoadingState = () => {
  return (
    <div className="min-h-dvh bg-[var(--surface-3)]">
      <header className="page-band sticky top-0 z-30 h-16">
        <div className="mx-auto flex h-full max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <div className="space-y-2">
            <div className="h-5 w-36 animate-pulse rounded-md bg-[var(--line)]" />
            <div className="hidden h-3 w-56 animate-pulse rounded bg-[var(--surface-2)] sm:block" />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        {/* Summary skeleton */}
        <div className="mb-6 space-y-3">
          <div className="h-8 w-40 animate-pulse rounded-md bg-[var(--line)]" />
          <div className="h-4 w-64 animate-pulse rounded bg-[var(--surface-2)]" />
        </div>

        {/* Course skeletons */}
        <div className="grid gap-4 lg:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]"
            >
              <div className="flex">
                <div className="h-28 w-28 shrink-0 animate-pulse bg-[var(--line)] sm:h-32 sm:w-36" />

                <div className="min-w-0 flex-1 space-y-3 p-4">
                  <div className="h-4 w-4/5 animate-pulse rounded bg-[var(--line)]" />

                  <div className="h-3 w-2/5 animate-pulse rounded bg-[var(--surface-2)]" />

                  <div className="h-2 w-full animate-pulse rounded-full bg-[var(--surface-2)]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   EMPTY STATE
========================================================= */

const EmptyState = ({ expiredCount = 0, onExplore }) => {
  const hasExpired = expiredCount > 0;

  return (
    <section className="relative flex min-h-[55vh] items-center justify-center overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-6 shadow-sm sm:px-6 sm:py-8 lg:px-8 lg:py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[var(--brand-soft)] opacity-70 blur-3xl"
      />

      <div className="w-full max-w-md text-center">
        <div className="brand-tile mx-auto flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm">
          <BookOpen size={24} strokeWidth={1.7} />
        </div>

        <div className="mt-5">
          <h2 className="text-base font-semibold text-[var(--ink)]">
            {hasExpired
              ? "Khóa học đã hết hạn truy cập"
              : "Chưa có khóa học nào"}
          </h2>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">
            {hasExpired
              ? `Bạn có ${expiredCount} khóa học đã hết hạn. Liên hệ giáo viên phụ trách để gia hạn, hoặc khám phá khóa học mới.`
              : "Khám phá các khóa học phù hợp với bạn và bắt đầu xây dựng kỹ năng mới."}
          </p>
        </div>

        <button
          type="button"
          onClick={onExplore}
          className={[
            "mt-5 inline-flex items-center gap-2",
            "rounded-full",
            "bg-[var(--brand-solid)] px-4 py-2.5",
            "text-sm font-medium text-white",
            "transition-colors duration-150",
            "hover:bg-[var(--brand-solid-hover)]",
            "cursor-pointer",
          ].join(" ")}
        >
          <Sparkles size={15} strokeWidth={1.9} />
          Khám phá khóa học
        </button>
      </div>
    </section>
  );
};

/* =========================================================
   ERROR
========================================================= */

const ErrorState = ({ onRetry }) => {
  return (
    <section className="flex min-h-[55vh] items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-6 text-center shadow-sm sm:px-6 sm:py-8">
      <div className="w-full max-w-md">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface-2)]">
          <AlertCircle
            size={24}
            strokeWidth={1.7}
            className="text-[var(--danger)]"
          />
        </div>

        <h2 className="mt-5 text-base font-semibold text-[var(--ink)]">
          Không tải được khóa học
        </h2>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">
          Kiểm tra kết nối mạng rồi thử lại.
        </p>

        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand-solid)] px-5 text-sm font-medium text-white transition-colors duration-150 hover:bg-[var(--brand-solid-hover)]"
        >
          Thử lại
        </button>
      </div>
    </section>
  );
};

export default StudentCoursesPage;
