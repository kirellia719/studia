import { useEffect, useState } from "react";

import { Save } from "lucide-react";

import appToast from "@/lib/toast.js";
import lessonApi from "@/features/lessons/api.js";

const createInitialForm = (lesson) => ({
    title: lesson?.title || "",
    description: lesson?.description || "",
    isFree: lesson?.isFree || false,
});

const LessonInfoForm = ({ lesson, onLessonUpdated }) => {
    const [form, setForm] = useState(
        () => createInitialForm(lesson)
    );

    const [saving, setSaving] = useState(false);

    const savedForm = createInitialForm(lesson);

    const dirty =
        form.title.trim() !== savedForm.title.trim() ||
        form.description.trim() !== savedForm.description.trim() ||
        Boolean(form.isFree) !== Boolean(savedForm.isFree);

    useEffect(() => {
        if (!lesson) return;

        setForm((prev) => ({
            ...prev,
            title: lesson.title || "",
            description: lesson.description || "",
            isFree: lesson.isFree || false,
        }));
    }, [
        lesson?.id,
        lesson?.title,
        lesson?.description,
        lesson?.isFree,
    ]);

    useEffect(() => {
        if (!dirty) return undefined;

        const handleBeforeUnload = (event) => {
            event.preventDefault();
            event.returnValue = "";
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () =>
            window.removeEventListener(
                "beforeunload",
                handleBeforeUnload
            );
    }, [dirty]);

    const updateForm = (field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (saving || !dirty) return;

        if (!form.title.trim()) {
            appToast.error(
                "Vui lòng nhập tên bài học."
            );

            return;
        }

        try {
            setSaving(true);

            const formData = new FormData();

            formData.append(
                "title",
                form.title.trim()
            );

            formData.append(
                "description",
                form.description.trim()
            );

            formData.append(
                "isFree",
                String(form.isFree)
            );

            const response =
                await lessonApi.update(
                    lesson.id,
                    formData
                );

            const updatedLesson = response?.data;

            if (updatedLesson) {
                onLessonUpdated?.(updatedLesson);
            }

            appToast.success(
                response?.message ||
                "Cập nhật bài học thành công."
            );
        } catch (error) {
            console.error(
                "Update lesson error:",
                error
            );

            appToast.error(
                error?.response?.data?.message ||
                "Không thể cập nhật bài học."
            );
        } finally {
            setSaving(false);
        }
    };

    if (!lesson) return null;

    return (
        <form
            onSubmit={handleSubmit}
        >
            <div className="space-y-5">
                <div>
                    <label
                        htmlFor="lesson-title"
                        className="mb-1.5 block text-xs font-medium text-[var(--ink-2)]"
                    >
                        Tên bài học
                        <span className="ml-1 text-[var(--danger)]">
                            *
                        </span>
                    </label>

                    <input
                        id="lesson-title"
                        type="text"
                        value={form.title}
                        onChange={(event) =>
                            updateForm(
                                "title",
                                event.target.value
                            )
                        }
                        disabled={saving}
                        placeholder="Nhập tên bài học..."
                        className={[
                            "w-full rounded-full",
                            "border border-[var(--line)]",
                            "bg-[var(--surface)] px-3 py-2.5",
                            "text-sm text-[var(--ink)]",
                            "outline-none",
                            "placeholder:text-[var(--faint)]",
                            "focus:border-[var(--ink)]",
                            "focus:ring-2 focus:ring-black/[0.04]",
                            "disabled:bg-[var(--surface-2)]",
                        ].join(" ")}
                    />
                </div>

                <div>
                    <div className="mb-1.5 flex items-center justify-between">
                        <label
                            htmlFor="lesson-description"
                            className="text-xs font-medium text-[var(--ink-2)]"
                        >
                            Mô tả
                        </label>

                        <span className="text-[12px] text-[var(--faint)]">
                            Không bắt buộc
                        </span>
                    </div>

                    <textarea
                        id="lesson-description"
                        value={form.description}
                        onChange={(event) =>
                            updateForm(
                                "description",
                                event.target.value
                            )
                        }
                        disabled={saving}
                        rows={4}
                        placeholder="Mô tả ngắn về bài học..."
                        className={[
                            "w-full resize-y rounded-2xl",
                            "border border-[var(--line)]",
                            "bg-[var(--surface)] px-3 py-2.5",
                            "text-sm leading-6 text-[var(--ink)]",
                            "outline-none",
                            "placeholder:text-[var(--faint)]",
                            "focus:border-[var(--ink)]",
                            "focus:ring-2 focus:ring-black/[0.04]",
                            "disabled:bg-[var(--surface-2)]",
                        ].join(" ")}
                    />
                </div>

                <div>
                    <p className="mb-2 text-xs font-medium text-[var(--ink-2)]">
                        Quyền truy cập
                    </p>

                    <button
                        type="button"
                        role="switch"
                        aria-checked={Boolean(form.isFree)}
                        aria-label="Bài học miễn phí"
                        onClick={() =>
                            updateForm("isFree", !form.isFree)
                        }
                        disabled={saving}
                        className={[
                            "flex w-full items-center justify-between gap-3",
                            "rounded-lg border border-[var(--line)]",
                            "bg-[var(--surface-3)] px-3 py-2.5",
                            "text-left transition-colors",
                            "hover:bg-[var(--surface-2)]",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                            saving
                                ? "cursor-not-allowed opacity-60"
                                : "",
                        ].join(" ")}
                    >
                        <div>
                            <p className="text-xs font-semibold text-[var(--ink-2)]">
                                Bài học miễn phí
                            </p>

                            <p className="mt-0.5 text-[12px] text-[var(--faint)]">
                                {form.isFree
                                    ? "Học viên có thể xem miễn phí."
                                    : "Chỉ dành cho học viên của khóa học."}
                            </p>
                        </div>

                        <span
                            aria-hidden="true"
                            className={[
                                "flex h-6 w-11 shrink-0 items-center rounded-full p-0.5",
                                "transition-colors",
                                form.isFree
                                    ? "bg-[var(--brand-solid)]"
                                    : "border border-[var(--line)] bg-[var(--surface-2)]",
                            ].join(" ")}
                        >
                            <span
                                className={[
                                    "h-5 w-5 rounded-full bg-white shadow-sm",
                                    "transition-transform",
                                    form.isFree
                                        ? "translate-x-5"
                                        : "translate-x-0",
                                ].join(" ")}
                            />
                        </span>
                    </button>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-[var(--surface-2)] pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p
                        aria-live="polite"
                        className={[
                            "text-[12px]",
                            dirty
                                ? "text-[var(--muted)]"
                                : "text-[var(--faint)]",
                        ].join(" ")}
                    >
                        {dirty
                            ? "Có thay đổi chưa lưu."
                            : "Mọi thay đổi đã được lưu."}
                    </p>

                    <button
                        type="submit"
                        disabled={saving || !dirty}
                        className={[
                            "inline-flex w-full items-center justify-center gap-2",
                            "rounded-full bg-[var(--solid)]",
                            "px-4 py-2.5",
                            "text-xs font-semibold text-white",
                            "hover:bg-[var(--solid-hover)]",
                            "disabled:cursor-not-allowed disabled:opacity-40",
                            "sm:w-auto",
                        ].join(" ")}
                    >
                        <Save size={14} />

                        {saving ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default LessonInfoForm;
