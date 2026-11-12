import { ArrowLeft, ListVideo } from "lucide-react";

const LearningHeader = ({
    courseTitle,
    currentLessonNumber,
    lessonCount,
    onBack,
    onOpenLessons,
}) => {
    return (
        <header className="page-band sticky top-0 z-30 h-16">
            <div className="mx-auto flex h-full w-full max-w-7xl items-center gap-2 px-4 sm:px-6 lg:px-8">
                <button
                    type="button"
                    onClick={onBack}
                    aria-label="Quay lại danh sách khóa học"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--ink-2)]"
                >
                    <ArrowLeft size={20} />
                </button>

                <p className="min-w-0 flex-1 truncate text-[15px] font-semibold tracking-tight text-[var(--ink)] sm:text-lg">
                    {courseTitle}
                </p>

                <button
                    type="button"
                    onClick={onOpenLessons}
                    aria-label="Mở nội dung khóa học"
                    className="flex h-11 shrink-0 items-center gap-1.5 rounded-full border border-[var(--brand-soft)] bg-[var(--brand-tint)] px-3 text-[12px] font-semibold text-[var(--brand-text)] transition hover:bg-[var(--brand-soft)] lg:hidden"
                >
                    <ListVideo
                        size={17}
                        strokeWidth={1.9}
                    />

                    <span className="tabular-nums">
                        {currentLessonNumber}/{lessonCount}
                    </span>
                </button>
            </div>
        </header>
    );
};

export default LearningHeader;
