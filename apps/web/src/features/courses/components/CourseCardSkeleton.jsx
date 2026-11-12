const CourseCardSkeleton = () => {
    return (
        <div className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3 sm:flex-col sm:items-stretch sm:gap-0 sm:overflow-hidden sm:p-0">
            {/* Image */}
            <div className="h-16 w-24 shrink-0 animate-pulse rounded-lg bg-[var(--line)] sm:aspect-video sm:h-auto sm:w-full sm:rounded-none" />

            {/* Content */}
            <div className="min-w-0 flex-1 sm:p-4">
                {/* Title */}
                <div className="h-4 w-4/5 animate-pulse rounded bg-[var(--line)]" />

                {/* Meta */}
                <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-[var(--surface-2)]" />

                {/* Price */}
                <div className="mt-3 h-3 w-2/3 animate-pulse rounded bg-[var(--surface-2)] sm:mt-5" />
            </div>
        </div>
    );
};

export default CourseCardSkeleton;
