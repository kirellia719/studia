import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock3,
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

import learningApi from "@/features/learning/api.js";
import documentApi from "@/features/documents/api.js";

import formatDuration from "@/lib/format/formatDuration.js";
import appToast from "@/lib/toast.js";

import LearningHeader from "@/features/learning/components/LearningHeader.jsx";
import LearningVideo from "@/features/learning/components/LearningVideo.jsx";
import LearningSidebar from "@/features/learning/components/LearningSidebar.jsx";
import LessonDrawer from "@/features/learning/components/LessonDrawer.jsx";
import LessonNavigation from "@/features/learning/components/LessonNavigation.jsx";
import DocumentCard from "@/features/documents/components/DocumentCard.jsx";
import QuizCard from "@/features/quizzes/components/QuizCard.jsx";
import QuizRunner from "@/features/quizzes/components/QuizRunner.jsx";

const getErrorMessage = (error, fallback) => {
  const status = error?.response?.status;
  const message = error?.response?.data?.message;

  if (status && status < 500 && message) {
    return message;
  }

  return fallback;
};

const SWITCH_SKELETON_MIN_MS = 300;

const StudentCourseDetailPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const contentRef = useRef(null);
  const videoWrapRef = useRef(null);
  const navWrapRef = useRef(null);

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] =
    useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [switchingLessonId, setSwitchingLessonId] =
    useState(null);
  const [quizOpen, setQuizOpen] = useState(false);

  // Thanh "Bài tiếp theo" chỉ hiện khi video đã cuộn khỏi màn hình
  // và khối chuyển bài ở cuối trang chưa xuất hiện.
  const [isVideoVisible, setIsVideoVisible] = useState(true);
  const [isNavVisible, setIsNavVisible] = useState(false);

  // ==========================================
  // Get course for learning
  // ==========================================

  useEffect(() => {
    if (!courseId) return undefined;

    let active = true;

    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError(false);
        setErrorMessage("");

        const response =
          await learningApi.getCourseForLearning(
            courseId
          );

        if (!active) return;

        const data = response?.data;

        if (!data) {
          throw new Error(
            "Không tìm thấy dữ liệu khóa học."
          );
        }

        const lessonList = Array.isArray(data.lessons)
          ? data.lessons
          : [];

        setCourse(data.course);
        setLessons(lessonList);

        const nextLesson = lessonList.find(
          (lesson) =>
            lesson.id === data.continueLessonId
        );

        const initialLesson =
          nextLesson ||
          lessonList.find(
            (lesson) => !lesson.isLocked
          ) ||
          null;

        setSelectedLesson(initialLesson);

        if (initialLesson) {
          learningApi
            .accessLesson(initialLesson.id)
            .catch((accessError) => {
              console.error(
                "Access initial lesson error:",
                accessError
              );
            });
        }
      } catch (fetchError) {
        if (!active) return;

        console.error(
          "Get course for learning error:",
          fetchError
        );

        setCourse(null);
        setLessons([]);
        setSelectedLesson(null);
        setError(true);
        setErrorMessage(
          getErrorMessage(
            fetchError,
            "Kiểm tra kết nối mạng rồi thử lại."
          )
        );

        appToast.error(
          getErrorMessage(
            fetchError,
            "Không thể tải khóa học."
          )
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchCourse();

    return () => {
      active = false;
    };
  }, [courseId, reloadKey]);

  // ==========================================
  // Student select lesson
  // ==========================================

  const handleSelectLesson = async (lesson) => {
    if (
      !lesson ||
      lesson.id === selectedLesson?.id ||
      switchingLessonId
    ) {
      return;
    }

    setSwitchingLessonId(lesson.id);
    setDrawerOpen(false);
    setQuizOpen(false);

    const startedAt = Date.now();

    contentRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    try {
      await learningApi.accessLesson(lesson.id);

      setSelectedLesson(lesson);
    } catch (selectError) {
      console.error(
        "Access lesson error:",
        selectError
      );

      appToast.error(
        getErrorMessage(
          selectError,
          "Không thể mở bài học."
        )
      );
    } finally {
      const remaining =
        SWITCH_SKELETON_MIN_MS - (Date.now() - startedAt);

      if (remaining > 0) {
        await new Promise((resolve) =>
          setTimeout(resolve, remaining)
        );
      }

      setSwitchingLessonId(null);
    }
  };

  // ==========================================
  // Completion
  // ==========================================

  const announcedCompletionRef = useRef(new Set());

  const applyCompletion = useCallback(
    (lessonId, completion) => {
      if (!lessonId || !completion) return;

      const patchLesson = (lesson) =>
        lesson?.id === lessonId
          ? {
            ...lesson,
            isCompleted: Boolean(
              completion.isCompleted
            ),
            completedAt:
              completion.completedAt ??
              lesson.completedAt ??
              null,
            videoPositionSeconds:
              completion.videoPositionSeconds ??
              lesson.videoPositionSeconds ??
              0,
            videoDurationSeconds:
              completion.videoDurationSeconds ??
              lesson.videoDurationSeconds ??
              0,
          }
          : lesson;

      setLessons((prevLessons) =>
        prevLessons.map(patchLesson)
      );
      setSelectedLesson((prevLesson) =>
        patchLesson(prevLesson)
      );
    },
    []
  );

  const announceCompletion = useCallback((lessonId) => {
    if (
      !lessonId ||
      announcedCompletionRef.current.has(lessonId)
    ) {
      return;
    }

    announcedCompletionRef.current.add(lessonId);
    appToast.success("Đã hoàn thành bài học.");
  }, []);

  const handleVideoProgress = async (
    lessonId,
    payload
  ) => {
    if (!lessonId) return;

    try {
      const response =
        await learningApi.updateVideoProgress(
          lessonId,
          payload
        );

      const completion = response?.data;

      if (!completion) return;

      applyCompletion(lessonId, completion);

      if (completion.isCompleted) {
        announceCompletion(lessonId);
      }
    } catch (progressError) {
      console.error(
        "Update video progress error:",
        progressError
      );
    }
  };

  // Bài không có video: đọc đủ 10 giây là hoàn thành
  // (quy tắc ngầm, không hiển thị cho học sinh).
  useEffect(() => {
    const lesson = selectedLesson;

    if (!lesson || lesson.video || lesson.isCompleted) {
      return undefined;
    }

    let seconds = 0;
    let cancelled = false;

    const timer = setInterval(() => {
      if (document.visibilityState !== "visible") {
        return;
      }

      seconds += 1;

      if (seconds < 10) return;

      clearInterval(timer);

      learningApi
        .markReadingComplete(lesson.id)
        .then((response) => {
          if (cancelled) return;

          const completion = response?.data;

          if (!completion) return;

          applyCompletion(lesson.id, completion);

          if (completion.isCompleted) {
            announceCompletion(lesson.id);
          }
        })
        .catch((readingError) => {
          console.error(
            "Mark reading complete error:",
            readingError
          );
        });
    }, 1000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [selectedLesson, applyCompletion, announceCompletion]);

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
    } catch (downloadError) {
      console.error(
        "Download document error:",
        downloadError
      );

      appToast.error(
        getErrorMessage(
          downloadError,
          "Không thể tải tài liệu."
        )
      );
    }
  };

  // ==========================================
  // Quiz
  // ==========================================

  const handleQuizFinished = (result) => {
    if (!result || !selectedLesson?.quiz) return;

    const bestScore = Math.max(
      selectedLesson.quiz.bestScore ?? 0,
      result.score ?? 0
    );

    const updateQuiz = (lesson) =>
      lesson?.id === selectedLesson.id && lesson.quiz
        ? {
          ...lesson,
          quiz: {
            ...lesson.quiz,
            bestScore,
          },
        }
        : lesson;

    setLessons((prevLessons) =>
      prevLessons.map(updateQuiz)
    );
    setSelectedLesson(updateQuiz);

    if (result.lessonCompletion) {
      applyCompletion(
        selectedLesson.id,
        result.lessonCompletion
      );

      if (result.lessonCompletion.isCompleted) {
        announceCompletion(selectedLesson.id);
      }
    }
  };

  // ==========================================
  // Quan sát vị trí video / khối chuyển bài
  // ==========================================

  useEffect(() => {
    const videoEl = videoWrapRef.current;
    const navEl = navWrapRef.current;

    if (!videoEl || !navEl) {
      setIsVideoVisible(!videoEl);
      setIsNavVisible(Boolean(navEl));

      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === videoEl) {
            setIsVideoVisible(entry.isIntersecting);
          }

          if (entry.target === navEl) {
            setIsNavVisible(entry.isIntersecting);
          }
        });
      },
      { threshold: 0 }
    );

    observer.observe(videoEl);
    observer.observe(navEl);

    return () => observer.disconnect();
  }, [selectedLesson?.id, switchingLessonId]);

  // ==========================================
  // Loading / error / not found
  // ==========================================

  if (loading) {
    return <LearningSkeleton />;
  }

  if (error) {
    return (
      <LearningState
        icon={AlertCircle}
        title="Không tải được khóa học"
        description={
          errorMessage ||
          "Kiểm tra kết nối mạng rồi thử lại."
        }
        onRetry={() =>
          setReloadKey((value) => value + 1)
        }
        onBack={() => navigate("/student/courses")}
      />
    );
  }

  if (!course) {
    return (
      <LearningState
        icon={BookOpen}
        title="Không tìm thấy khóa học"
        description="Khóa học không tồn tại hoặc bạn không có quyền truy cập."
        onBack={() => navigate("/student/courses")}
      />
    );
  }

  // ==========================================
  // Derived data
  // ==========================================

  const currentIndex = selectedLesson
    ? lessons.findIndex(
      (lesson) => lesson.id === selectedLesson.id
    )
    : -1;

  // Bỏ qua bài bị khóa (chưa đăng ký khóa học)
  const previousLesson =
    currentIndex > 0
      ? [...lessons.slice(0, currentIndex)]
        .reverse()
        .find((lesson) => !lesson.isLocked) ?? null
      : null;

  const nextLesson =
    currentIndex >= 0
      ? lessons
        .slice(currentIndex + 1)
        .find((lesson) => !lesson.isLocked) ?? null
      : null;

  const isSwitchingLesson = Boolean(switchingLessonId);

  const videoProgressPercent =
    selectedLesson?.videoDurationSeconds > 0
      ? Math.min(
        100,
        Math.round(
          (selectedLesson.videoPositionSeconds /
            selectedLesson.videoDurationSeconds) *
          100
        )
      )
      : 0;

  const videoWatched =
    selectedLesson?.isCompleted ||
    videoProgressPercent >= 90;

  const quizPassed =
    selectedLesson?.quiz?.bestScore !== null &&
    selectedLesson?.quiz?.bestScore !== undefined &&
    selectedLesson.quiz.bestScore >=
    selectedLesson.quiz.passingScore;

  const showNextBar =
    Boolean(nextLesson) &&
    !isVideoVisible &&
    !isNavVisible &&
    !isSwitchingLesson &&
    !drawerOpen &&
    !quizOpen;

  return (
    <div className="min-h-full bg-[var(--surface-3)]">
      <LearningHeader
        courseTitle={course.title}
        currentLessonNumber={
          currentIndex >= 0 ? currentIndex + 1 : 0
        }
        lessonCount={lessons.length}
        onBack={() => navigate("/student/courses")}
        onOpenLessons={() => setDrawerOpen(true)}
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-6">
          <div
            ref={contentRef}
            aria-busy={isSwitchingLesson}
            className="min-w-0 scroll-mt-20 space-y-4 pb-4"
          >
            {!selectedLesson ? (
              <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-5 py-14 text-center shadow-sm">
                <div className="brand-tile mx-auto flex h-14 w-14 items-center justify-center rounded-2xl">
                  <BookOpen size={24} strokeWidth={1.7} />
                </div>

                <h1 className="mt-4 text-base font-semibold text-[var(--ink)]">
                  {lessons.length === 0
                    ? "Khóa học chưa có bài học"
                    : "Cần đăng ký khóa học"}
                </h1>

                <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-6 text-[var(--muted)]">
                  {lessons.length === 0
                    ? "Giáo viên đang chuẩn bị nội dung. Vui lòng quay lại sau."
                    : "Các bài học của khóa này chỉ mở sau khi bạn đăng ký."}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/student/courses")
                  }
                  className="mt-5 inline-flex h-11 items-center justify-center rounded-full border border-[var(--line)] px-5 text-[13px] font-medium text-[var(--muted)] transition hover:bg-[var(--surface-3)]"
                >
                  Về danh sách khóa học
                </button>
              </section>
            ) : isSwitchingLesson ? (
              <LessonSwitchSkeleton />
            ) : (
              <>
                <div ref={videoWrapRef}>
                  <LearningVideo
                    lesson={selectedLesson}
                    poster={course.thumbnail}
                    onProgress={(payload) =>
                      handleVideoProgress(
                        selectedLesson.id,
                        payload
                      )
                    }
                  />
                </div>

                {/* Thông tin bài học */}
                <section className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-sm">
                  <div className="p-4 sm:p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex h-7 items-center rounded-lg bg-[var(--brand-soft)] px-2.5 text-[12px] font-semibold tabular-nums text-[var(--brand-text)]">
                        Bài{" "}
                        {String(
                          selectedLesson.order ?? 0
                        ).padStart(2, "0")}
                      </span>

                      {selectedLesson.duration != null && (
                        <span className="inline-flex h-7 items-center gap-1 rounded-full bg-[var(--surface-2)] px-2.5 text-[12px] font-medium text-[var(--muted)]">
                          <Clock3 size={13} />

                          {formatDuration(
                            selectedLesson.duration
                          )}
                        </span>
                      )}

                      {selectedLesson.isCompleted ? (
                        <span className="inline-flex h-7 items-center gap-1 rounded-full bg-[var(--success-soft)] px-2.5 text-[12px] font-semibold text-[var(--success)]">
                          <CheckCircle2 size={13} />
                          Đã hoàn thành
                        </span>
                      ) : (
                        <span className="inline-flex h-7 items-center rounded-full bg-[var(--brand-tint)] px-2.5 text-[12px] font-medium text-[var(--brand-text)]">
                          Đang học
                        </span>
                      )}
                    </div>

                    <h1 className="mt-3 text-lg font-semibold leading-7 tracking-tight text-[var(--ink)] sm:text-xl">
                      {selectedLesson.title}
                    </h1>

                    {selectedLesson.description && (
                      <p className="mt-2 whitespace-pre-line text-[14px] leading-7 text-[var(--muted)]">
                        {selectedLesson.description}
                      </p>
                    )}

                    {!selectedLesson.isCompleted &&
                      selectedLesson.quiz
                        ?.requiresPassForCompletion && (
                        <div className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--surface-3)] px-3 py-3">
                          <p className="text-[12px] font-semibold text-[var(--ink)]">
                            Điều kiện hoàn thành bài
                          </p>

                          <ul className="mt-2 space-y-2 text-[12px] leading-5 text-[var(--muted)]">
                            {selectedLesson.video && (
                              <li className="flex items-start gap-2">
                                {videoWatched ? (
                                  <CheckCircle2
                                    size={15}
                                    className="mt-0.5 shrink-0 text-[var(--success)]"
                                  />
                                ) : (
                                  <Circle
                                    size={15}
                                    className="mt-0.5 shrink-0 text-[var(--faint)]"
                                  />
                                )}

                                <span>
                                  Xem ít nhất 90% video
                                  {!videoWatched &&
                                    videoProgressPercent >
                                    0 && (
                                      <span className="text-[var(--faint)]">
                                        {" "}
                                        (đã xem{" "}
                                        {videoProgressPercent}
                                        %)
                                      </span>
                                    )}
                                </span>
                              </li>
                            )}

                            <li className="flex items-start gap-2">
                              {quizPassed ? (
                                <CheckCircle2
                                  size={15}
                                  className="mt-0.5 shrink-0 text-[var(--success)]"
                                />
                              ) : (
                                <Circle
                                  size={15}
                                  className="mt-0.5 shrink-0 text-[var(--faint)]"
                                />
                              )}

                              <span>
                                Đạt bài ôn tập (tối thiểu{" "}
                                {
                                  selectedLesson.quiz
                                    .passingScore
                                }
                                %)
                              </span>
                            </li>
                          </ul>
                        </div>
                      )}
                  </div>
                </section>

                {/* Trắc nghiệm ôn tập (mobile/tablet) */}
                {selectedLesson.quiz && (
                  <div className="lg:hidden">
                    <QuizCard
                      quiz={selectedLesson.quiz}
                      onStart={() => setQuizOpen(true)}
                    />
                  </div>
                )}

                {/* Tài liệu */}
                {selectedLesson.documents?.length > 0 && (
                  <section className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-sm">
                    <div className="flex items-center justify-between border-b border-[var(--surface-2)] px-4 py-3.5 sm:px-5">
                      <div className="flex items-center gap-2">
                        <h2 className="text-[13px] font-semibold text-[var(--ink)]">
                          Tài liệu bài học
                        </h2>

                        <span className="rounded-md bg-[var(--brand-soft)] px-1.5 py-0.5 text-[12px] font-semibold tabular-nums text-[var(--brand-text)]">
                          {selectedLesson.documents.length}
                        </span>
                      </div>
                    </div>

                    <div className="divide-y divide-[var(--surface-2)]">
                      {selectedLesson.documents.map(
                        (document) => (
                          <DocumentCard
                            key={document.id}
                            document={document}
                            onDownload={
                              handleDownloadDocument
                            }
                          />
                        )
                      )}
                    </div>
                  </section>
                )}

                {/* Chuyển bài */}
                <div ref={navWrapRef}>
                  <LessonNavigation
                    previousLesson={previousLesson}
                    nextLesson={nextLesson}
                    currentCompleted={selectedLesson.isCompleted}
                    busy={isSwitchingLesson}
                    onSelectLesson={handleSelectLesson}
                  />
                </div>

              </>
            )}
          </div>

          {/* Sidebar desktop */}
          <aside className="mt-6 hidden lg:mt-0 lg:block lg:self-stretch">
            <div className="sticky top-20 space-y-4">
              <LearningSidebar
                lessons={lessons}
                selectedLessonId={
                  selectedLesson?.id ?? null
                }
                onSelectLesson={handleSelectLesson}
                busy={isSwitchingLesson}
              />

              {selectedLesson?.quiz && (
                <QuizCard
                  quiz={selectedLesson.quiz}
                  onStart={() => setQuizOpen(true)}
                />
              )}
            </div>
          </aside>
        </div>
      </div>

      {showNextBar && nextLesson && (
        <div className="fixed inset-x-0 bottom-[calc(4rem_+_env(safe-area-inset-bottom))] z-40 border-t border-[var(--line)] bg-[var(--surface)]/95 backdrop-blur-sm lg:hidden">
          <button
            type="button"
            onClick={() => handleSelectLesson(nextLesson)}
            disabled={isSwitchingLesson}
            className="flex h-14 w-full items-center gap-3 px-4 text-left transition active:bg-[var(--surface-2)] disabled:opacity-60"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-[12px] font-semibold uppercase tracking-wide text-[var(--faint)]">
                Bài tiếp theo
              </span>

              <span className="mt-0.5 block truncate text-[13px] font-semibold text-[var(--ink)]">
                {nextLesson.title}
              </span>
            </span>

            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--brand-solid)] text-white">
              <ChevronRight size={18} />
            </span>
          </button>
        </div>
      )}

      <LessonDrawer
        open={drawerOpen}
        lessons={lessons}
        selectedLessonId={selectedLesson?.id ?? null}
        onSelectLesson={handleSelectLesson}
        onClose={() => setDrawerOpen(false)}
        busy={isSwitchingLesson}
      />

      <QuizRunner
        open={quizOpen}
        lesson={selectedLesson}
        nextLesson={nextLesson}
        onClose={() => setQuizOpen(false)}
        onFinished={handleQuizFinished}
        onSelectNextLesson={handleSelectLesson}
      />
    </div>
  );
};

// ==========================================
// States
// ==========================================

const LearningState = ({
  icon: Icon,
  title,
  description,
  onRetry,
  onBack,
}) => {
  return (
    <div className="flex min-h-full items-center justify-center bg-[var(--surface-3)] px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface-2)]">
          <Icon
            size={24}
            strokeWidth={1.7}
            className="text-[var(--muted)]"
          />
        </div>

        <h1 className="mt-4 text-base font-semibold text-[var(--ink)]">
          {title}
        </h1>

        <p className="mt-1.5 text-[13px] leading-6 text-[var(--muted)]">
          {description}
        </p>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand-solid)] px-5 text-[13px] font-semibold text-white transition hover:bg-[var(--brand-solid-hover)]"
            >
              Thử lại
            </button>
          )}

          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--line)] px-5 text-[13px] font-medium text-[var(--muted)] transition hover:bg-[var(--surface-3)]"
          >
            Về danh sách khóa học
          </button>
        </div>
      </div>
    </div>
  );
};

const LearningSkeleton = () => {
  return (
    <div className="min-h-full bg-[var(--surface-3)]">
      <div className="sticky top-0 z-30 border-b border-[var(--line)] bg-[var(--surface)]">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-3 sm:px-5 lg:px-8">
          <div className="h-11 w-11 animate-pulse rounded-xl bg-[var(--surface-2)]" />

          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-40 max-w-[60%] animate-pulse rounded bg-[var(--line)]" />
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-6">
          <div className="min-w-0 space-y-4">
            <div className="aspect-video w-full animate-pulse rounded-2xl bg-[var(--line)]" />

            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5">
              <div className="h-6 w-20 animate-pulse rounded-lg bg-[var(--surface-2)]" />
              <div className="mt-3 h-6 w-3/4 animate-pulse rounded bg-[var(--line)]" />
              <div className="mt-3 h-3 w-full animate-pulse rounded bg-[var(--surface-2)]" />
              <div className="mt-2 h-3 w-5/6 animate-pulse rounded bg-[var(--surface-2)]" />
              <div className="mt-4 h-11 w-52 max-w-full animate-pulse rounded-lg bg-[var(--line)]" />
            </div>
          </div>

          <div className="mt-6 hidden lg:mt-0 lg:block">
            <div className="h-[420px] animate-pulse rounded-2xl bg-[var(--line)]" />
          </div>
        </div>
      </div>
    </div>
  );
};

const LessonSwitchSkeleton = () => {
  return (
    <div className="space-y-4">
      <div className="aspect-video w-full animate-pulse rounded-2xl bg-[var(--line)] motion-reduce:animate-none" />

      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap gap-2">
          <div className="h-7 w-16 animate-pulse rounded-lg bg-[var(--surface-2)] motion-reduce:animate-none" />
          <div className="h-7 w-20 animate-pulse rounded-full bg-[var(--surface-2)] motion-reduce:animate-none" />
        </div>

        <div className="mt-3 h-6 w-2/3 animate-pulse rounded bg-[var(--line)] motion-reduce:animate-none" />
        <div className="mt-3 h-3 w-full animate-pulse rounded bg-[var(--surface-2)] motion-reduce:animate-none" />
        <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-[var(--surface-2)] motion-reduce:animate-none" />
        <div className="mt-4 h-11 w-52 max-w-full animate-pulse rounded-lg bg-[var(--line)] motion-reduce:animate-none" />
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="h-11 w-24 animate-pulse rounded-lg bg-[var(--surface-2)] motion-reduce:animate-none" />
        <div className="h-11 w-28 animate-pulse rounded-lg bg-[var(--surface-2)] motion-reduce:animate-none" />
      </div>

      <p role="status" className="sr-only">
        Đang mở bài học...
      </p>
    </div>
  );
};

export default StudentCourseDetailPage;
