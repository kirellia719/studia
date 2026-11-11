import { useEffect, useState } from "react";

import { BookOpen, CheckCircle2 } from "lucide-react";
import { useParams } from "react-router-dom";

import Loading from "@/components/ui/Loading.jsx";

import learningApi from "@/features/learning/api.js";
import documentApi from "@/features/documents/api.js";

import appToast from "@/lib/toast.js";

import LearningHeader from "@/features/learning/components/LearningHeader.jsx";
import LearningVideo from "@/features/learning/components/LearningVideo.jsx";
import LessonDrawer from "@/features/learning/components/LessonDrawer.jsx";
import DocumentCard from "@/features/documents/components/DocumentCard.jsx";

const StudentCourseDetailPage = () => {
  const { courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] =
    useState(null);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // ==========================================
  // Get course for learning
  // ==========================================

  useEffect(() => {
    if (!courseId) return;

    const fetchCourse = async () => {
      try {
        setLoading(true);

        const response =
          await learningApi.getCourseForLearning(
            courseId
          );

        const data = response?.data;

        if (!data) {
          throw new Error(
            "Không tìm thấy dữ liệu khóa học."
          );
        }

        const courseData = data.course;

        const lessonList = Array.isArray(
          data.lessons
        )
          ? data.lessons
          : [];

        setCourse(courseData);
        setLessons(lessonList);

        const nextLesson = lessonList.find(
          (lesson) =>
            lesson.id === data.continueLessonId
        );

        setSelectedLesson(
          nextLesson ||
          lessonList[0] ||
          null
        );
      } catch (error) {
        console.error(
          "Get course for learning error:",
          error
        );

        appToast.error(
          error?.response?.data?.message ||
          error?.message ||
          "Không thể tải khóa học."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  // ==========================================
  // Student select lesson
  // ==========================================

  const handleSelectLesson = async (lesson) => {
    if (
      !lesson ||
      lesson.id === selectedLesson?.id
    ) {
      return;
    }

    try {
      await learningApi.accessLesson(
        lesson.id
      );

      setSelectedLesson(lesson);
      setDrawerOpen(false);
    } catch (error) {
      console.error(
        "Access lesson error:",
        error
      );

      appToast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Không thể mở bài học."
      );
    }
  };

  // ==========================================
  // Complete lesson
  // ==========================================

  const handleCompleteLesson = async (lessonId) => {
    if (!lessonId) return;

    try {
      const response =
        await learningApi.completeLesson(
          lessonId
        );

      const progress = response?.data;

      setLessons((prevLessons) =>
        prevLessons.map((lesson) =>
          lesson.id === lessonId
            ? {
              ...lesson,
              isCompleted: true,
              completedAt:
                progress?.completedAt ??
                lesson.completedAt ??
                null,
            }
            : lesson
        )
      );

      setSelectedLesson((prevLesson) =>
        prevLesson?.id === lessonId
          ? {
            ...prevLesson,
            isCompleted: true,
            completedAt:
              progress?.completedAt ??
              prevLesson.completedAt ??
              null,
          }
          : prevLesson
      );
    } catch (error) {
      console.error(
        "Complete lesson error:",
        error
      );

      appToast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Không thể cập nhật tiến độ bài học."
      );
    }
  };

  // ==========================================
  // Download document
  // ==========================================

  const handleDownloadDocument = async (
    document
  ) => {
    if (!document?.id) return;

    try {
      await documentApi.download(
        document.id,
        document.name
      );
    } catch (error) {
      console.error(
        "Download document error:",
        error
      );

      appToast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Không thể tải tài liệu."
      );
    }
  };

  // ==========================================
  // Go back
  // ==========================================

  const handleGoBack = () => {
    window.history.back();
  };

  // ==========================================
  // Loading
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[var(--bg)] p-4">
        <Loading text="Đang tải khóa học..." />
      </div>
    );
  }

  // ==========================================
  // Course not found
  // ==========================================

  if (!course) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[var(--bg)] p-4">
        <div className="w-full max-w-sm rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--muted)]">
            <BookOpen
              size={20}
              strokeWidth={1.8}
            />
          </div>

          <p className="mt-4 text-sm font-semibold text-[var(--ink)]">
            Không tìm thấy khóa học
          </p>

          <p className="mt-1.5 text-xs leading-5 text-[var(--muted)]">
            Khóa học không tồn tại hoặc
            bạn không có quyền truy cập.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[var(--bg)]">
      {/* Header */}

      <LearningHeader
        courseTitle={course.title}
        lessonCount={lessons.length}
        onBack={handleGoBack}
        onOpenLessons={() =>
          setDrawerOpen(true)
        }
      />

      {/* Main */}

      <main className="mx-auto w-full max-w-5xl px-3 py-4 pb-10 sm:px-5 sm:py-6">
        {/* Video */}

        <LearningVideo
          lesson={selectedLesson}
          onComplete={handleCompleteLesson}
        />

        {selectedLesson && (
          <div className="mt-4 space-y-4">
            {/* Lesson info */}

            <section className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
              <div className="p-3 sm:p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--brand-soft)] text-xs font-semibold tabular-nums text-[var(--brand)]">
                    {String(selectedLesson.order).padStart(2, "0")}
                  </div>

                  <h1 className="min-w-0 flex-1 truncate text-sm font-semibold leading-6 tracking-tight text-[var(--ink-2)] sm:text-lg">
                    {selectedLesson.title}
                  </h1>

                  {selectedLesson.isCompleted && (
                    <CheckCircle2
                      size={20}
                      strokeWidth={2.2}
                      className="shrink-0 text-[var(--success)]"
                      aria-label="Đã hoàn thành"
                    />
                  )}
                </div>

                {selectedLesson.description && (
                  <div className="mt-3 border-t border-[var(--surface-2)] pt-3">
                    <p className="whitespace-pre-line text-sm leading-6 text-[var(--muted)]">
                      {
                        selectedLesson.description
                      }
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Documents */}

            {selectedLesson.documents?.length > 0 && (
              <section className="mt-4 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
                <div className="flex items-center justify-between border-b border-[var(--surface-2)] px-4 py-3.5 sm:px-5">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-[var(--ink)]">
                      Tài liệu
                    </h2>

                    <span className="rounded-md bg-[var(--brand-soft)] px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-[var(--brand)]">
                      {selectedLesson.documents.length}
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-[var(--surface-2)]">
                  {selectedLesson.documents.map((document) => (
                    <DocumentCard
                      key={document.id}
                      document={document}
                      onDownload={handleDownloadDocument}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {/* Lesson drawer */}

      <LessonDrawer
        open={drawerOpen}
        lessons={lessons}
        selectedLessonId={
          selectedLesson?.id ?? null
        }
        onSelectLesson={
          handleSelectLesson
        }
        onClose={() =>
          setDrawerOpen(false)
        }
      />
    </div>
  );
};

export default StudentCourseDetailPage;