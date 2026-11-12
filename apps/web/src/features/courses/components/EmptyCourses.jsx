import { BookOpen, Plus } from "lucide-react";

const EmptyCourses = ({ onCreate }) => {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--line-strong)] bg-[var(--surface)] px-6 py-14 text-center">
            <span className="brand-tile flex h-14 w-14 items-center justify-center rounded-2xl">
                <BookOpen size={26} strokeWidth={1.9} />
            </span>

            <h3 className="mt-4 text-base font-semibold text-[var(--ink)]">
                Chưa có khóa học
            </h3>

            <p className="mt-1.5 max-w-sm text-sm leading-6 text-[var(--muted)]">
                Tạo khóa học đầu tiên để bắt đầu chia sẻ kiến thức của mình.
            </p>

            {onCreate && (
                <button
                    type="button"
                    onClick={onCreate}
                    className={[
                        "mt-5 inline-flex h-11 items-center justify-center gap-1.5",
                        "rounded-full px-4",
                        "bg-[var(--brand-solid)] text-sm font-semibold text-white",
                        "shadow-sm shadow-[var(--ring)]",
                        "transition-colors duration-150",
                        "hover:bg-[var(--brand-solid-hover)]",
                        "active:bg-[var(--brand-strong)]",
                    ].join(" ")}
                >
                    <Plus size={17} strokeWidth={2.2} />

                    Tạo khóa học
                </button>
            )}
        </div>
    );
};

export default EmptyCourses;
