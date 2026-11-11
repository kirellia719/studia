import { BookOpen } from "lucide-react";

const EmptyCourses = () => {
    return (
        <div className="m-3 flex min-h-[320px] flex-col items-center justify-center rounded-sm border border-dashed border-[var(--line)] bg-[var(--surface)] px-6 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-solid)]/10 text-[var(--brand)]">
                <BookOpen size={28} />
            </div>

            <h3 className="mt-4 text-base font-semibold text-[var(--ink)]">
                Chưa có khóa học
            </h3>

            <p className="mt-1 max-w-sm text-sm leading-6 text-[var(--muted)]">
                Bạn chưa có khóa học nào. Hãy tạo khóa học đầu tiên
                để bắt đầu chia sẻ kiến thức của mình.
            </p>
        </div>
    );
};

export default EmptyCourses;