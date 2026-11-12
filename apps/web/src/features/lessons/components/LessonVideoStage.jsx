import { useEffect, useState } from "react";

import {
    Clock3,
    Trash2,
    Upload,
    Video,
} from "lucide-react";

import appToast from "@/lib/toast.js";
import getUrl from "@/lib/getUrl.js";
import lessonApi from "@/features/lessons/api.js";

const MAX_VIDEO_SIZE = 500 * 1024 * 1024;

const ALLOWED_VIDEO_TYPES = [
    "video/mp4",
    "video/webm",
    "video/quicktime",
];

const formatFileSize = (bytes) => {
    if (!bytes || bytes <= 0) return "0 KB";

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(0)} KB`;
    }

    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const formatDuration = (seconds) => {
    if (
        seconds === null ||
        seconds === undefined ||
        seconds <= 0
    ) {
        return "--:--";
    }

    const totalSeconds = Math.floor(seconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const remainingSeconds = totalSeconds % 60;

    if (hours > 0) {
        return `${String(hours).padStart(2, "0")}:${String(
            minutes
        ).padStart(2, "0")}:${String(
            remainingSeconds
        ).padStart(2, "0")}`;
    }

    return `${String(minutes).padStart(2, "0")}:${String(
        remainingSeconds
    ).padStart(2, "0")}`;
};

const LessonVideoStage = ({ lesson, onLessonUpdated }) => {
    const [videoFile, setVideoFile] = useState(null);
    const [videoPreview, setVideoPreview] = useState("");
    const [saving, setSaving] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        return () => {
            if (videoPreview) {
                URL.revokeObjectURL(videoPreview);
            }
        };
    }, [videoPreview]);

    useEffect(() => {
        if (!videoFile) return undefined;

        const handleBeforeUnload = (event) => {
            event.preventDefault();
            event.returnValue = "";
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () =>
            window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [videoFile]);

    const clearNewVideo = () => {
        if (videoPreview) {
            URL.revokeObjectURL(videoPreview);
        }

        setVideoPreview("");
        setVideoFile(null);
        setUploadProgress(0);
    };

    const handleSelectVideo = (event) => {
        const file = event.target.files?.[0];

        event.target.value = "";

        if (!file) return;

        if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
            appToast.error(
                "Chỉ hỗ trợ video MP4, WebM hoặc MOV."
            );

            return;
        }

        if (file.size > MAX_VIDEO_SIZE) {
            appToast.error(
                "Video không được vượt quá 500MB."
            );

            return;
        }

        if (videoPreview) {
            URL.revokeObjectURL(videoPreview);
        }

        setVideoPreview(URL.createObjectURL(file));
        setVideoFile(file);
        setUploadProgress(0);
    };

    const handleSaveVideo = async () => {
        if (!videoFile || saving) return;

        try {
            setSaving(true);
            setUploadProgress(0);

            const formData = new FormData();

            formData.append("video", videoFile);

            const response = await lessonApi.update(
                lesson.id,
                formData,
                (progress) => {
                    setUploadProgress(progress);
                }
            );

            const updatedLesson = response?.data;

            if (updatedLesson) {
                onLessonUpdated?.(updatedLesson);
            }

            appToast.success(
                response?.message ||
                "Cập nhật video bài học thành công."
            );

            clearNewVideo();
        } catch (error) {
            console.error("Update lesson video error:", error);

            appToast.error(
                error?.response?.data?.message ||
                "Không thể cập nhật video bài học."
            );

            setUploadProgress(0);
        } finally {
            setSaving(false);
        }
    };

    const currentVideo = videoPreview || getUrl(lesson?.video);

    if (!currentVideo) {
        return (
            <label className="group relative flex aspect-video w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-[var(--line-strong)] bg-[var(--surface-2)] px-4 text-center transition-colors hover:border-[var(--faint)] hover:bg-[var(--surface-3)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface)] text-[var(--muted)] shadow-sm">
                    <Video size={20} strokeWidth={1.8} />
                </div>

                <span className="mt-3 text-sm font-semibold text-[var(--ink)]">
                    Chọn video bài học
                </span>

                <span className="mt-1 text-[12px] text-[var(--faint)]">
                    MP4, WebM, MOV · tối đa 500MB
                </span>

                <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    onChange={handleSelectVideo}
                    className="hidden"
                />
            </label>
        );
    }

    return (
        <div className="space-y-2">
            <div className="relative overflow-hidden rounded-xl border border-[var(--line)] bg-black">
                <video
                    key={currentVideo}
                    src={currentVideo}
                    controls
                    playsInline
                    className="aspect-video w-full bg-black object-contain"
                />

                {lesson?.duration > 0 && !videoPreview && (
                    <span className="pointer-events-none absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[12px] font-medium text-white">
                        <Clock3 size={11} />
                        {formatDuration(lesson.duration)}
                    </span>
                )}

                {videoFile && !saving && (
                    <label className="absolute right-2 top-2 inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-white/20 bg-black/60 px-3 text-[12px] font-medium text-white backdrop-blur transition-colors hover:bg-black/80">
                        <Upload size={13} />
                        Thay video

                        <input
                            type="file"
                            accept="video/mp4,video/webm,video/quicktime"
                            onChange={handleSelectVideo}
                            className="hidden"
                        />
                    </label>
                )}

                {saving && (
                    <div className="absolute inset-x-0 bottom-0 bg-black/70 p-3 backdrop-blur">
                        <div className="mb-1.5 flex items-center justify-between text-[12px] text-white/90">
                            <span>
                                {uploadProgress >= 100
                                    ? "Đang xử lý..."
                                    : "Đang tải video..."}
                            </span>

                            <span>{uploadProgress}%</span>
                        </div>

                        <div className="h-1 overflow-hidden rounded-full bg-white/20">
                            <div
                                className="h-full rounded-full bg-white transition-all"
                                style={{
                                    width: `${uploadProgress}%`,
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {videoFile ? (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2.5">
                    <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-[var(--ink-2)]">
                            {videoFile.name}
                        </p>

                        <p className="mt-0.5 text-[12px] text-[var(--faint)]">
                            {formatFileSize(videoFile.size)} · chưa lưu
                        </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                        <button
                            type="button"
                            onClick={clearNewVideo}
                            disabled={saving}
                            className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--faint)] transition-colors hover:bg-[var(--danger-soft)] hover:text-[var(--danger)] disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Bỏ video vừa chọn"
                        >
                            <Trash2 size={15} />
                        </button>

                        <button
                            type="button"
                            onClick={handleSaveVideo}
                            disabled={saving}
                            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[var(--solid)] px-3 text-[12px] font-semibold text-white transition-colors hover:bg-[var(--solid-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving
                                ? "Đang lưu..."
                                : "Lưu video"}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-end">
                    <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 text-[12px] font-medium text-[var(--muted)] transition-colors hover:bg-[var(--surface-3)] hover:text-[var(--ink)]">
                        <Upload size={13} />
                        Thay video

                        <input
                            type="file"
                            accept="video/mp4,video/webm,video/quicktime"
                            onChange={handleSelectVideo}
                            className="hidden"
                        />
                    </label>
                </div>
            )}
        </div>
    );
};

export default LessonVideoStage;
