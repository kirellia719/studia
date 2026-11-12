import { BookOpen } from "lucide-react";

const Loading = ({
    text = "Đang tải...",
    fullScreen = false,
}) => {
    return (
        <div
            className={`
                relative
                flex
                items-center
                justify-center
                overflow-hidden
                ${fullScreen ? "min-h-screen" : "min-h-full"}
            `}
        >
            {/* Decorative background */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {/* Small dots */}
                <span className="absolute left-[20%] top-[25%] h-2 w-2 rounded-full bg-[var(--brand-solid)]/50" />

                <span className="absolute right-[22%] top-[32%] h-2.5 w-2.5 rounded-full bg-[var(--accent-soft)]/60" />

                <span className="absolute bottom-[25%] left-[25%] h-2.5 w-2.5 rounded-full bg-[var(--success-soft)]/60" />

                {/* Decorative flower */}
                <div className="absolute right-[15%] bottom-[27%] rotate-12 text-[var(--brand-text)]/30">
                    <div className="relative h-12 w-12">
                        <span className="absolute left-4 top-0 h-6 w-6 rounded-full bg-current" />
                        <span className="absolute bottom-0 left-4 h-6 w-6 rounded-full bg-current" />
                        <span className="absolute left-0 top-4 h-6 w-6 rounded-full bg-current" />
                        <span className="absolute right-0 top-4 h-6 w-6 rounded-full bg-current" />

                        <span className="absolute left-4 top-4 h-4 w-4 rounded-full bg-[var(--accent-soft)]" />
                    </div>
                </div>
            </div>

            {/* Loading content */}
            <div className="relative z-10 flex flex-col items-center">
                {/* Icon */}
                <div className="relative flex h-20 w-20 items-center justify-center">
                    {/* Outer ring */}
                    <div
                        className="
                            absolute
                            inset-0
                            rounded-full
                            border-[3px]
                            border-[var(--brand-soft)]
                        "
                    />

                    {/* Spinning ring */}
                    <div
                        className="
                            absolute
                            inset-0
                            animate-spin
                            rounded-full
                            border-[3px]
                            border-transparent
                            border-t-[var(--brand)]
                        "
                    />

                    {/* Icon background */}
                    <div
                        className="
                            flex
                            h-12
                            w-12
                            items-center
                            justify-center
                            rounded-2xl
                            bg-gradient-to-br
                            from-[var(--brand-solid)]
                            to-[var(--brand-solid)]
                            text-white
                            shadow-[0_8px_25px_rgba(232,154,0,0.28)]
                        "
                    >
                        <BookOpen
                            size={23}
                            strokeWidth={1.8}
                        />
                    </div>
                </div>

                {/* Brand */}
                <div className="mt-5 text-center">
                    <h2 className="text-[17px] font-bold tracking-tight text-[var(--ink)]">
                        Stady
                    </h2>

                    <p className="mt-1 text-[12px] text-[var(--muted)]">
                        {text}
                    </p>
                </div>

                {/* Loading dots */}
                <div className="mt-4 flex items-center gap-1.5">
                    <span
                        className="
                            h-1.5
                            w-1.5
                            animate-bounce
                            rounded-full
                            bg-[var(--brand-solid)]
                        "
                    />

                    <span
                        className="
                            h-1.5
                            w-1.5
                            animate-bounce
                            rounded-full
                            bg-[var(--brand-solid)]
                            [animation-delay:150ms]
                        "
                    />

                    <span
                        className="
                            h-1.5
                            w-1.5
                            animate-bounce
                            rounded-full
                            bg-[var(--brand-solid)]
                            [animation-delay:300ms]
                        "
                    />
                </div>
            </div>
        </div>
    );
};

export default Loading;