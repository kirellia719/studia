import { useRef } from "react";
import {
    ImagePlus,
    Save,
    Loader2,
    Upload,
} from "lucide-react";

import getUrl from "@/lib/getUrl.js";

const CourseBasicInfo = ({
    form,
    thumbnailPreview,
    saving,
    onFormChange,
    onSelectImage,
    onSave,
}) => {
    const fileInputRef = useRef(null);
    const isPublished = form.status === true;

    const handleThumbnailClick = () => {
        if (saving) return;
        fileInputRef.current?.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        onSelectImage(file);
        event.target.value = "";
    };

    const handleStatusToggle = () => {
        if (saving) return;

        onFormChange("status", !form.status);
    };

    const inputClass = [
        "w-full rounded-xl border border-[var(--line)]",
        "bg-[var(--surface)] px-3.5 py-2.5",
        "text-sm text-[var(--ink)]",
        "placeholder:text-[var(--faint)]",
        "transition-colors",
        "focus:border-[var(--brand)]",
        "focus:outline-none",
        "focus:ring-2 focus:ring-[var(--brand-soft)]",
        "disabled:cursor-not-allowed",
        "disabled:bg-[var(--surface-3)]",
        "disabled:text-[var(--faint)]",
    ].join(" ");

    const labelClass =
        "mb-1.5 block text-xs font-medium text-[var(--ink-2)]";

    return (
        <form
            onSubmit={onSave}
            className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]"
        >
            {/* Header */}
            <div className="border-b border-[var(--surface-2)] px-4 py-4 sm:px-5">
                <h2 className="text-sm font-semibold text-[var(--ink)]">
                    Thông tin khóa học
                </h2>

                <p className="mt-0.5 text-[12px] text-[var(--faint)]">
                    Cập nhật nội dung, giá và trạng thái khóa học.
                </p>
            </div>

            {/* Content */}
            <div className="space-y-6 p-4 sm:p-5">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
                    {/* Thumbnail */}
                    <div>
                        <label className={labelClass}>
                            Ảnh khóa học
                        </label>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={handleFileChange}
                        />

                        <button
                            type="button"
                            onClick={handleThumbnailClick}
                            disabled={saving}
                            className={[
                                "group relative block aspect-video w-full",
                                "overflow-hidden rounded-2xl",
                                "border border-[var(--line)]",
                                "bg-[var(--surface-3)]",
                                "transition-colors",
                                "hover:border-[var(--brand-soft)]",
                                "disabled:cursor-not-allowed",
                                "disabled:opacity-60",
                            ].join(" ")}
                        >
                            {thumbnailPreview ? (
                                <>
                                    <img
                                        src={getUrl(thumbnailPreview)}
                                        alt={
                                            form.title ||
                                            "Thumbnail khóa học"
                                        }
                                        className="h-full w-full object-cover"
                                    />

                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--surface)] px-3 py-1.5 text-xs font-medium text-[var(--ink-2)] shadow-sm">
                                            <Upload
                                                size={14}
                                                className="text-[var(--brand-text)]"
                                            />
                                            Đổi ảnh
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <div className="flex h-full flex-col items-center justify-center">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--surface)] text-[var(--faint)] shadow-sm">
                                        <ImagePlus size={19} />
                                    </div>

                                    <p className="mt-2 text-xs font-medium text-[var(--ink-2)]">
                                        Tải ảnh lên
                                    </p>

                                    <p className="mt-0.5 text-[12px] text-[var(--faint)]">
                                        PNG, JPG hoặc WEBP
                                    </p>
                                </div>
                            )}
                        </button>
                    </div>

                    {/* Fields */}
                    <div className="space-y-5">
                        {/* Course title */}
                        <div>
                            <label
                                htmlFor="course-title"
                                className={labelClass}
                            >
                                Tên khóa học
                            </label>

                            <input
                                id="course-title"
                                type="text"
                                value={form.title}
                                onChange={(event) =>
                                    onFormChange(
                                        "title",
                                        event.target.value
                                    )
                                }
                                placeholder="Ví dụ: Lập trình ReactJS từ cơ bản đến nâng cao"
                                disabled={saving}
                                className={inputClass}
                            />
                        </div>

                        {/* Price + Duration */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="course-price"
                                    className={labelClass}
                                >
                                    Giá khóa học
                                </label>

                                <div className="relative">
                                    <input
                                        id="course-price"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={form.price ?? ""}
                                        onChange={(event) =>
                                            onFormChange(
                                                "price",
                                                event.target.value
                                            )
                                        }
                                        placeholder="0"
                                        disabled={saving}
                                        className={`${inputClass} pr-20`}
                                    />

                                    <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[12px] font-medium text-[var(--faint)]">
                                        nghìn VNĐ
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="course-duration"
                                    className={labelClass}
                                >
                                    Thời hạn truy cập
                                </label>

                                <div className="relative">
                                    <input
                                        id="course-duration"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={
                                            form.durationMonths ?? ""
                                        }
                                        onChange={(event) =>
                                            onFormChange(
                                                "durationMonths",
                                                event.target.value
                                            )
                                        }
                                        placeholder="Ví dụ: 6"
                                        disabled={saving}
                                        className={`${inputClass} pr-16`}
                                    />

                                    <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[12px] font-medium text-[var(--faint)]">
                                        Tháng
                                    </span>
                                </div>
                            </div>
                        </div>

                        <p className="text-[12px] leading-4 text-[var(--faint)]">
                            Giá = 0 nếu miễn phí. Thời hạn = 0 hoặc
                            để trống nếu học trọn đời.
                        </p>

                        {/* Status */}
                        <div className="flex items-center justify-between border-t border-[var(--surface-2)] pt-5">
                            <div>
                                <p className="text-xs font-medium text-[var(--ink-2)]">
                                    Trạng thái khóa học
                                </p>

                                <p className="mt-0.5 text-[12px] text-[var(--faint)]">
                                    {isPublished
                                        ? "Khóa học đang công khai"
                                        : "Khóa học đang tạm đóng"}
                                </p>
                            </div>

                            <button
                                type="button"
                                role="switch"
                                aria-checked={isPublished}
                                aria-label="Trạng thái khóa học"
                                disabled={saving}
                                onClick={handleStatusToggle}
                                className="-mr-2 flex h-11 w-12 shrink-0 items-center justify-center rounded-full transition hover:bg-[var(--surface-2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <span
                                    className={[
                                        "flex h-6 w-11 items-center rounded-full p-0.5 transition-colors",
                                        isPublished
                                            ? "bg-[var(--brand-solid)]"
                                            : "border border-[var(--line)] bg-[var(--surface-2)]",
                                    ].join(" ")}
                                >
                                    <span
                                        className={[
                                            "h-5 w-5 rounded-full bg-white shadow-sm",
                                            "transition-transform",
                                            isPublished
                                                ? "translate-x-5"
                                                : "translate-x-0",
                                        ].join(" ")}
                                    />
                                </span>
                            </button>
                        </div>

                        {/* Description */}
                        <div>
                            <label
                                htmlFor="course-description"
                                className={labelClass}
                            >
                                Mô tả ngắn
                            </label>

                            <textarea
                                id="course-description"
                                rows={4}
                                value={form.description}
                                onChange={(event) =>
                                    onFormChange(
                                        "description",
                                        event.target.value
                                    )
                                }
                                placeholder="Tóm tắt ngắn gọn nội dung và giá trị khóa học..."
                                disabled={saving}
                                className={[
                                    inputClass,
                                    "resize-none leading-5",
                                ].join(" ")}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end border-t border-[var(--surface-2)] px-4 py-3 sm:px-5">
                <button
                    type="submit"
                    disabled={saving}
                    className={[
                        "inline-flex w-full items-center justify-center gap-2",
                        "rounded-full bg-[var(--solid)]",
                        "px-4 py-2.5",
                        "text-xs font-semibold text-white",
                        "transition-colors",
                        "hover:bg-[var(--solid-hover)]",
                        "focus:outline-none",
                        "focus:ring-2 focus:ring-[var(--line-strong)]",
                        "disabled:cursor-not-allowed",
                        "disabled:opacity-60",
                        "sm:w-auto",
                    ].join(" ")}
                >
                    {saving ? (
                        <>
                            <Loader2
                                size={15}
                                className="animate-spin"
                            />
                            Đang lưu...
                        </>
                    ) : (
                        <>
                            <Save size={15} />
                            Lưu thay đổi
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

export default CourseBasicInfo;
