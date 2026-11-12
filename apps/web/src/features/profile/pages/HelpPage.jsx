import {
    ArrowUpRight,
    ChevronDown,
    ChevronLeft,
    CircleHelp,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "/badge-amber.png";
import { faqs } from "@/features/profile/faqs.js";

const FB_URL = "https://www.facebook.com/achan.phuong";

const HelpPage = () => {
    const navigate = useNavigate();

    const [openIndex, setOpenIndex] = useState(null);

    const toggleFaq = (index) => {
        setOpenIndex((currentIndex) =>
            currentIndex === index ? null : index
        );
    };

    return (
        <div className="min-h-full bg-[var(--surface-3)] text-[var(--ink)]">
            {/* HEADER */}
            <header className="page-band sticky top-0 z-30 h-16">
                <div className="mx-auto flex h-full w-full max-w-[720px] items-center gap-2 px-4 sm:px-6">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
                        aria-label="Quay lại"
                    >
                        <ChevronLeft
                            size={19}
                            strokeWidth={1.8}
                        />
                    </button>

                    <h1 className="text-[17px] font-semibold text-[var(--ink)]">
                        Trợ giúp
                    </h1>
                    <CircleHelp
                        size={22}
                        strokeWidth={1.7}
                    />
                </div>
            </header>

            <div className="mx-auto w-full max-w-[720px] px-4 pb-10 pt-5 sm:px-6">
                {/* FAQ */}
                <section className="">
                    <div className="mb-2.5 flex items-center justify-between">
                        <h2 className="text-[13px] font-semibold text-[var(--ink)]">
                            Câu hỏi thường gặp
                        </h2>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
                        {faqs.map((item, index) => {
                            const isOpen = openIndex === index;

                            return (
                                <div
                                    key={item.question}
                                    className={
                                        index !== faqs.length - 1
                                            ? "border-b border-[var(--surface-2)]"
                                            : ""
                                    }
                                >
                                    {/* QUESTION */}
                                    <button
                                        type="button"
                                        onClick={() => toggleFaq(index)}
                                        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-[var(--surface-3)]"
                                    >
                                        <span className="min-w-0 flex-1 text-[12px] font-medium leading-5 text-[var(--ink)]">
                                            {item.question}
                                        </span>

                                        <ChevronDown
                                            size={16}
                                            strokeWidth={1.8}
                                            className={`shrink-0 text-[var(--faint)] transition-transform duration-300 ${isOpen ? "rotate-180" : ""
                                                }`}
                                        />
                                    </button>

                                    {/* ANSWER - SLIDE */}
                                    <div
                                        className={`grid transition-all duration-300 ease-in-out ${isOpen
                                            ? "grid-rows-[1fr] opacity-100"
                                            : "grid-rows-[0fr] opacity-0"
                                            }`}
                                    >
                                        <div className="overflow-hidden">
                                            <div className="px-4 pb-4 pr-10">
                                                <p className="text-[12px] leading-5 text-[var(--muted)]">
                                                    {item.answer}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* CONTACT */}

                <section className="mt-6">
                    <div className="mb-2.5">
                        <h2 className="text-[13px] font-semibold text-[var(--ink)]">
                            Cần hỗ trợ thêm?
                        </h2>
                        <p className="mt-0.5 text-[12px] text-[var(--muted)]">
                            Liên hệ trực tiếp với người phụ trách.
                        </p>
                    </div>

                    <a
                        href={FB_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 transition-colors hover:border-[var(--brand-soft)] hover:bg-[var(--surface-3)]"
                    >
                        {/* Avatar */}
                        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-[var(--brand-soft)]">
                            <img
                                src={Logo}
                                alt="Achan Phương"
                                className="h-full w-full object-cover"
                            />
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <p className="truncate text-[13px] font-semibold text-[var(--ink)]">
                                    Achan Phương
                                </p>

                                <span className="shrink-0 rounded-full bg-[var(--success-soft)] px-1.5 py-0.5 text-[12px] font-medium text-[var(--success)]">
                                    Giáo viên
                                </span>
                            </div>

                            <div className="mt-1.5 flex items-center gap-1.5 text-[12px] text-[var(--faint)]">
                                {/* <Facebook size={12} /> */}
                                <span className="truncate">
                                    {FB_URL.replace("https://www.", "")}
                                </span>
                            </div>
                        </div>

                        {/* Facebook button */}
                        <span
                            aria-hidden="true"
                            className={[
                                "flex h-11 w-11 shrink-0 items-center justify-center",
                                "rounded-full",
                                "bg-[var(--brand-soft)]",
                                "text-[var(--brand-text)]",
                            ].join(" ")}
                        >
                            <ArrowUpRight size={16} strokeWidth={2} />
                        </span>
                    </a>
                </section>
            </div>
        </div>
    );
};

export default HelpPage;
