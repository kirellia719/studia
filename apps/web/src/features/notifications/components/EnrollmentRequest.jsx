import { useState } from "react";

import {
    BookOpen,
    Check,
    Clock,
    X,
} from "lucide-react";

import enrollmentApi from "@/features/enrollments/api.js";
import appToast from "@/lib/toast.js";
import convertToVNTime from "@/lib/format/convertTimeVN.js";

const EnrollmentRequest = ({
    notification,
    onProcessed = () => { },
}) => {
    const [processing, setProcessing] = useState(false);

    const studentName =
        notification?.student?.name ||
        notification?.data?.studentName ||
        "Học viên";

    const courseTitle =
        notification?.course?.title ||
        notification?.data?.courseTitle ||
        "Khóa học";

    const enrollmentId =
        notification?.id ||
        notification?.data?.enrollmentId;

    // ==========================================
    // Approve
    // ==========================================

    const handleApprove = async () => {
        if (processing || !enrollmentId) {
            return;
        }

        try {
            setProcessing(true);

            const response =
                await enrollmentApi.approve(
                    enrollmentId
                );

            appToast.success(
                response?.message ||
                "Đã duyệt yêu cầu đăng ký."
            );

            // Báo cho component cha biết
            // notification đã được xử lý
            onProcessed(enrollmentId);
        } catch (error) {
            console.error(
                "Approve enrollment error:",
                error
            );

            appToast.error(
                error?.response?.data?.message ||
                "Không thể duyệt yêu cầu đăng ký."
            );
        } finally {
            setProcessing(false);
        }
    };

    // ==========================================
    // Reject
    // ==========================================

    const handleReject = async () => {
        if (processing || !enrollmentId) {
            return;
        }

        try {
            setProcessing(true);

            const response =
                await enrollmentApi.reject(
                    enrollmentId
                );

            appToast.success(
                response?.message ||
                "Đã từ chối yêu cầu đăng ký."
            );

            // Báo cho component cha biết
            // notification đã được xử lý
            onProcessed(enrollmentId);
        } catch (error) {
            console.error(
                "Reject enrollment error:",
                error
            );

            appToast.error(
                error?.response?.data?.message ||
                "Không thể từ chối yêu cầu đăng ký."
            );
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div
            className="
                border
                border-[var(--line)]
                bg-[var(--surface)]
                p-4
                shadow-sm
                transition
                hover:border-[var(--line)]
            "
        >
            <div className="flex gap-3">
                {/* Course icon */}
                <div
                    className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        bg-[var(--brand-solid)]/10
                        text-[var(--brand-text)]
                    "
                >
                    <BookOpen size={18} />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                    {/* Message */}
                    <p className="text-sm leading-6 text-[var(--muted)]">
                        <span className="font-medium text-[var(--ink)]">
                            {studentName}
                        </span>{" "}
                        muốn đăng ký khóa học{" "}
                        <span className="font-medium text-[var(--brand-text)]">
                            "{courseTitle}"
                        </span>
                    </p>

                    {/* Time */}
                    <div
                        className="
                            mt-1.5
                            flex
                            items-center
                            gap-1.5
                            text-[12px]
                            text-[var(--faint)]
                        "
                    >
                        <Clock size={12} />

                        <span>
                            {convertToVNTime(
                                notification?.updatedAt ||
                                notification?.createdAt
                            )}
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="mt-3 flex items-center gap-2">
                        {/* Approve */}
                        <button
                            type="button"
                            onClick={handleApprove}
                            disabled={processing}
                            className="
                                inline-flex
                                items-center
                                gap-1.5
                                rounded-full
                                bg-[var(--brand-solid)]
                                px-3
                                py-2
                                text-xs
                                font-semibold
                                text-white
                                transition
                                hover:bg-[var(--brand-solid-hover)]
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >
                            <Check size={14} />

                            {processing
                                ? "Đang xử lý..."
                                : "Duyệt"}
                        </button>

                        {/* Reject */}
                        <button
                            type="button"
                            onClick={handleReject}
                            disabled={processing}
                            className="
                                inline-flex
                                items-center
                                gap-1.5
                                rounded-full
                                border
                                border-[var(--line)]
                                bg-[var(--surface)]
                                px-3
                                py-2
                                text-xs
                                font-medium
                                text-[var(--muted)]
                                transition
                                hover:border-red-200
                                hover:bg-[var(--danger-soft)]
                                hover:text-[var(--danger)]
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >
                            <X size={14} />

                            {processing
                                ? "Đang xử lý..."
                                : "Từ chối"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnrollmentRequest;