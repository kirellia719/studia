import { useEffect, useState } from "react";

import {
    ArrowLeft,
    FileText,
    ListChecks,
    Settings2,
} from "lucide-react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import lessonApi from "@/features/lessons/api.js";

import LessonInfoForm from "@/features/lessons/components/LessonInfoForm.jsx";
import LessonVideoStage from "@/features/lessons/components/LessonVideoStage.jsx";
import LessonDocuments from "@/features/documents/components/LessonDocuments.jsx";
import QuizEditor from "@/features/quizzes/components/QuizEditor.jsx";

const TABS = [
    {
        id: "info",
        label: "Thông tin",
        icon: Settings2,
    },
    {
        id: "documents",
        label: "Tài liệu",
        icon: FileText,
    },
    {
        id: "quiz",
        label: "Câu hỏi",
        icon: ListChecks,
    },
];

const LessonDetailPage = () => {
    const { lessonId } = useParams();
    const navigate = useNavigate();

    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("info");

    useEffect(() => {
        const fetchLesson = async () => {
            if (!lessonId) return;

            try {
                setLoading(true);
                setError("");

                const response = await lessonApi.getById(lessonId);

                setLesson(response?.data || null);
            } catch (error) {
                console.error("Get lesson error:", error);

                const message =
                    error?.response?.data?.message ||
                    "Không thể tải thông tin bài học.";

                setError(message);
            } finally {
                setLoading(false);
            }
        };

        fetchLesson();
    }, [lessonId]);

    const handleLessonUpdated = (updatedLesson) => {
        setLesson((prev) => ({
            ...prev,
            ...updatedLesson,
        }));
    };

    const handleDocumentsUpdated = (documents) => {
        setLesson((prev) => ({
            ...prev,
            documents,
        }));
    };

    const handleBack = () => {
        navigate(-1);
    };

    if (loading) {
        return (
            <div className="w-full">
                <div className="h-[52px] border-b border-[var(--line)]">
                    <div className="grid h-full grid-cols-[40px_1fr_40px] items-center px-2 sm:px-4">
                        <div className="h-9 w-9 animate-pulse rounded-xl bg-[var(--surface-2)]" />

                        <div className="mx-auto h-4 w-40 animate-pulse rounded bg-[var(--surface-2)]" />

                        <div />
                    </div>
                </div>

                <div className="border-b border-[var(--line)] px-3 py-1.5">
                    <div className="mx-auto h-11 w-full max-w-md animate-pulse rounded-lg bg-[var(--surface-2)]" />
                </div>

                <div className="mx-auto w-full max-w-5xl space-y-3 px-3 pt-3 sm:px-4">
                    <div className="aspect-video w-full animate-pulse rounded-xl bg-[var(--surface-2)]" />

                    <div className="space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
                        <div className="h-10 w-full animate-pulse rounded-lg bg-[var(--surface-2)]" />

                        <div className="h-28 w-full animate-pulse rounded-lg bg-[var(--surface-2)]" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !lesson) {
        return (
            <div className="mx-auto flex min-h-[50vh] w-full max-w-4xl items-center justify-center px-4">
                <div className="w-full max-w-md rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 text-center shadow-sm">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[var(--danger-soft)] text-[var(--danger)]">
                        <FileText size={20} strokeWidth={1.8} />
                    </div>

                    <h2 className="mt-4 text-sm font-semibold text-[var(--ink)]">
                        Không thể tải bài học
                    </h2>

                    <p className="mt-1.5 text-xs leading-5 text-[var(--muted)]">
                        {error || "Bài học không tồn tại hoặc đã bị xoá."}
                    </p>

                    <button
                        type="button"
                        onClick={handleBack}
                        className={[
                            "mt-5",
                            "inline-flex items-center gap-2",
                            "rounded-full",
                            "bg-[var(--solid)]",
                            "px-4 py-2.5",
                            "text-xs font-semibold text-white",
                            "transition-colors",
                            "hover:bg-[var(--solid-hover)]",
                            "active:scale-[0.98]",
                        ].join(" ")}
                    >
                        <ArrowLeft size={15} />
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    const documents = Array.isArray(lesson.documents)
        ? lesson.documents
        : [];

    const panelClass = (tabId) =>
        activeTab === tabId ? "block" : "hidden";

    return (
        <div className="w-full pb-10">
            <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[var(--surface)]">
                <div className="grid h-[52px] grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-2 px-2 sm:px-4">
                    <button
                        type="button"
                        onClick={handleBack}
                        aria-label="Quay lại"
                        className={[
                            "flex h-11 w-11 items-center justify-center",
                            "rounded-full",
                            "text-[var(--muted)]",
                            "transition-colors",
                            "hover:bg-[var(--surface-2)]",
                            "hover:text-[var(--ink)]",
                            "active:scale-95",
                        ].join(" ")}
                    >
                        <ArrowLeft size={18} strokeWidth={2} />
                    </button>

                    <h1
                        title={lesson.title}
                        className={[
                            "min-w-0",
                            "px-1",
                            "text-center",
                            "text-sm font-semibold",
                            "leading-5 tracking-tight",
                            "text-[var(--ink)]",
                            "line-clamp-1",
                            "sm:text-[15px]",
                        ].join(" ")}
                    >
                        {lesson.title}
                    </h1>

                    <span
                        className={[
                            "justify-self-end whitespace-nowrap rounded-full px-2 py-1",
                            "text-[12px] font-medium",
                            lesson.isFree
                                ? "bg-[var(--success-soft)] text-[var(--success)]"
                                : "bg-[var(--surface-2)] text-[var(--muted)]",
                        ].join(" ")}
                    >
                        {lesson.isFree ? "Miễn phí" : "Trả phí"}
                    </span>
                </div>
            </header>

            <div className="sticky top-[52px] z-10 border-b border-[var(--line)] bg-[var(--surface)]/95 backdrop-blur">
                <div
                    role="tablist"
                    aria-label="Nội dung bài học"
                    className="mx-auto flex w-full max-w-md gap-1 px-3 py-1.5 sm:px-0"
                >
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                id={`tab-${tab.id}`}
                                type="button"
                                role="tab"
                                aria-selected={isActive}
                                aria-controls={`panel-${tab.id}`}
                                onClick={() => setActiveTab(tab.id)}
                                className={[
                                    "inline-flex h-11 min-w-0 flex-1 items-center justify-center gap-1.5",
                                    "rounded-full px-2",
                                    "text-[12px] font-medium sm:text-xs",
                                    "transition-colors",
                                    isActive
                                        ? "bg-[var(--brand-soft)] font-semibold text-[var(--brand-text)]"
                                        : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]",
                                ].join(" ")}
                            >
                                <Icon
                                    size={15}
                                    strokeWidth={1.9}
                                    className="shrink-0"
                                />

                                <span className="truncate">
                                    {tab.label}
                                </span>

                                {tab.id === "documents" &&
                                    documents.length > 0 && (
                                        <span className="shrink-0 rounded-full bg-[var(--line)] px-1.5 text-[12px] leading-4 text-[var(--muted)] tabular-nums">
                                            {documents.length}
                                        </span>
                                    )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="mx-auto w-full max-w-5xl px-3 pt-3 sm:px-4 sm:pt-4">
                <div
                    id="panel-info"
                    role="tabpanel"
                    aria-labelledby="tab-info"
                    className={panelClass("info")}
                >
                    <section className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                        <div className="flex items-center gap-3 border-b border-[var(--surface-2)] px-4 py-4 sm:px-5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--muted)]">
                                <Settings2 size={16} strokeWidth={1.8} />
                            </div>

                            <div className="min-w-0 flex-1">
                                <h2 className="text-[13px] font-semibold text-[var(--ink)]">
                                    Thông tin bài học
                                </h2>

                                <p className="mt-0.5 text-[12px] text-[var(--faint)]">
                                    Tên, mô tả, quyền truy cập và video
                                </p>
                            </div>
                        </div>

                        <div className="@container">
                            <div className="grid grid-cols-1 @[52rem]:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
                                <div className="p-4 sm:p-5 @[52rem]:order-2 @[52rem]:border-l @[52rem]:border-[var(--surface-2)]">
                                    <LessonInfoForm
                                        lesson={lesson}
                                        onLessonUpdated={
                                            handleLessonUpdated
                                        }
                                    />
                                </div>

                                <div className="border-t border-[var(--surface-2)] p-4 sm:p-5 @[52rem]:order-1 @[52rem]:border-t-0">
                                    <div className="mb-2 flex items-end justify-between gap-3">
                                        <p className="text-xs font-medium text-[var(--ink-2)]">
                                            Video bài học
                                        </p>

                                        <p className="text-[12px] text-[var(--faint)]">
                                            MP4, WebM, MOV · tối đa
                                            500MB
                                        </p>
                                    </div>

                                    <LessonVideoStage
                                        lesson={lesson}
                                        onLessonUpdated={
                                            handleLessonUpdated
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <div
                    id="panel-documents"
                    role="tabpanel"
                    aria-labelledby="tab-documents"
                    className={panelClass("documents")}
                >
                    <LessonDocuments
                        lesson={lesson}
                        onDocumentsUpdated={handleDocumentsUpdated}
                    />
                </div>

                <div
                    id="panel-quiz"
                    role="tabpanel"
                    aria-labelledby="tab-quiz"
                    className={panelClass("quiz")}
                >
                    <QuizEditor lesson={lesson} />
                </div>
            </div>
        </div>
    );
};

export default LessonDetailPage;
