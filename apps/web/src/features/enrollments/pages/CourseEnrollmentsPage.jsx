import { useCallback, useEffect, useState } from "react";

import {
    ArrowRight,
    CalendarPlus,
    Plus,
    Users,
} from "lucide-react";

import { useNavigate, useOutletContext } from "react-router-dom";

import appToast from "@/lib/toast.js";
import formatDate from "@/lib/format/formatDate.js";
import enrollmentApi from "@/features/enrollments/api.js";

import AddStudentModal from "@/features/enrollments/components/AddStudentModal.jsx";
import RenewEnrollmentModal from "@/features/enrollments/components/RenewEnrollmentModal.jsx";


// ==========================================
// Helpers
// ==========================================

const getRemainingDays = (expiresAt) => {
    if (!expiresAt) return null;

    const expiry = new Date(expiresAt);

    if (Number.isNaN(expiry.getTime())) {
        return null;
    }

    const now = new Date();

    // So sánh theo ngày, không phụ thuộc giờ/phút
    const today = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );

    const expiryDate = new Date(
        expiry.getFullYear(),
        expiry.getMonth(),
        expiry.getDate()
    );

    const diffTime = expiryDate.getTime() - today.getTime();

    return Math.ceil(
        diffTime / (1000 * 60 * 60 * 24)
    );
};


const getRemainingLabel = (expiresAt) => {
    const remainingDays = getRemainingDays(expiresAt);

    if (remainingDays === null) {
        return "Không giới hạn";
    }

    if (remainingDays < 0) {
        return "Đã hết hạn";
    }

    if (remainingDays === 0) {
        return "Hết hạn hôm nay";
    }

    if (remainingDays === 1) {
        return "Còn 1 ngày";
    }

    return `Còn ${remainingDays} ngày`;
};


const getRemainingClassName = (expiresAt) => {
    const remainingDays = getRemainingDays(expiresAt);

    if (remainingDays === null) {
        return "text-[var(--muted)]";
    }

    if (remainingDays < 0) {
        return "text-[var(--danger)]";
    }

    if (remainingDays <= 7) {
        return "text-[var(--accent)]";
    }

    return "text-[var(--success)]";
};


// ==========================================
// Component
// ==========================================

export default function CourseEnrollmentsPage() {
    const navigate = useNavigate();

    const { course } = useOutletContext();

    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [renewTarget, setRenewTarget] = useState(null);

    const courseId = course?.id;


    // ==========================================
    // Fetch enrollments
    // ==========================================

    useEffect(() => {
        if (!courseId) {
            setEnrollments([]);
            setLoading(false);
            return;
        }

        const fetchEnrollments = async () => {
            try {
                setLoading(true);

                const res =
                    await enrollmentApi.getByCourse(
                        courseId
                    );

                setEnrollments(res.data || []);
            } catch (error) {
                console.error(error);

                appToast.error(
                    "Không thể tải danh sách học sinh."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchEnrollments();
    }, [courseId]);


    // ==========================================
    // Student added
    // ==========================================

    const handleStudentAdded = useCallback(
        (newEnrollment) => {
            if (!newEnrollment) return;

            setEnrollments((prev) => [
                newEnrollment,
                ...prev,
            ]);
        },
        []
    );


    // ==========================================
    // Enrollment renewed
    // ==========================================

    const handleRenewed = useCallback((updated) => {
        if (!updated?.id) return;

        setEnrollments((prev) =>
            prev.map((item) =>
                item.id === updated.id
                    ? { ...item, ...updated }
                    : item
            )
        );
    }, []);


    // ==========================================
    // View student detail
    // ==========================================

    const handleViewStudent = useCallback(
        (enrollmentId) => {
            if (!courseId || !enrollmentId) return;

            navigate(
                `/teacher/courses/${courseId}/enrollments/${enrollmentId}`
            );
        },
        [courseId, navigate]
    );


    // ==========================================
    // Render
    // ==========================================

    return (
        <>
            <section className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]">

                {/* ======================================
                    Header
                ======================================= */}

                <div className="flex gap-3 border-b border-[var(--surface-2)] px-4 py-4 sm:flex-row sm:items-center justify-between sm:px-5">

                    <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand-text)]">
                            <Users size={17} />
                        </div>

                        <div className="min-w-0">
                            <h2 className="truncate text-[14px] font-semibold text-[var(--ink)]">
                                Học sinh tham gia
                            </h2>

                            <p className="mt-0.5 text-[12px] text-[var(--muted)]">
                                {enrollments.length} học sinh
                            </p>
                        </div>

                    </div>


                    <button
                        type="button"
                        onClick={() =>
                            setShowAddModal(true)
                        }
                        className="flex h-9 items-center justify-center gap-1.5 rounded-full bg-[var(--brand-solid)] px-3.5 text-[12px] font-medium text-white transition hover:bg-[var(--brand-solid-hover)] sm:w-auto"
                    >
                        <Plus size={15} />
                        Thêm
                    </button>

                </div>


                {/* ======================================
                    Loading
                ======================================= */}

                {loading ? (
                    <div className="divide-y divide-[var(--surface-2)]">

                        {[1, 2, 3].map((item) => (
                            <div
                                key={item}
                                className="flex items-center gap-3 px-4 py-4 sm:gap-4 sm:px-5"
                            >

                                {/* Index */}
                                <div className="h-8 w-8 shrink-0 animate-pulse rounded-lg bg-[var(--surface-2)]" />

                                {/* Student */}
                                <div className="min-w-0 flex-1">

                                    <div className="h-3.5 w-32 animate-pulse rounded bg-[var(--surface-2)]" />

                                    <div className="mt-2 h-3 w-40 animate-pulse rounded bg-[var(--surface-2)]" />

                                </div>

                                {/* Expiry */}
                                <div className="hidden w-24 shrink-0 sm:block">

                                    <div className="ml-auto h-3.5 w-16 animate-pulse rounded bg-[var(--surface-2)]" />

                                    <div className="mt-2 ml-auto h-3 w-20 animate-pulse rounded bg-[var(--surface-2)]" />

                                </div>

                                {/* Action */}
                                <div className="h-8 w-8 shrink-0 animate-pulse rounded-lg bg-[var(--surface-2)]" />

                            </div>
                        ))}

                    </div>
                ) : enrollments.length === 0 ? (

                    /* ======================================
                       Empty
                    ======================================= */

                    <div className="px-5 py-14 text-center">

                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-2)] text-[var(--muted)]">
                            <Users size={18} />
                        </div>

                        <p className="mt-3 text-[13px] font-medium text-[var(--muted)]">
                            Chưa có học sinh
                        </p>

                        <p className="mt-1 text-[12px] text-[var(--faint)]">
                            Thêm học sinh đầu tiên vào khóa học.
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                setShowAddModal(true)
                            }
                            className="mx-auto mt-4 flex h-8 items-center gap-1.5 rounded-full border border-[var(--line)] px-3 text-[12px] font-medium text-[var(--muted)] transition hover:bg-[var(--surface-3)]"
                        >
                            <Plus size={14} />
                            Thêm học sinh
                        </button>

                    </div>

                ) : (

                    /* ======================================
                       Enrollment list
                    ======================================= */

                    <div className="divide-y divide-[var(--surface-2)]">

                        {enrollments.map(
                            (enrollment, index) => {

                                const studentName =
                                    enrollment.student?.name ||
                                    enrollment.studentName ||
                                    "Chưa có tên";

                                const studentCode =
                                    enrollment.student?.studentCode ||
                                    enrollment.studentCode ||
                                    "—";

                                const expiresAt =
                                    enrollment.expiresAt;

                                const remainingLabel =
                                    getRemainingLabel(
                                        expiresAt
                                    );

                                const remainingClass =
                                    getRemainingClassName(
                                        expiresAt
                                    );

                                return (
                                    <div
                                        key={enrollment.id}
                                        className="flex items-center gap-3 px-4 py-4 transition hover:bg-[var(--surface-3)] sm:gap-4 sm:px-5"
                                    >

                                        {/* ==================================
                                            Index
                                        =================================== */}

                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[12px] font-medium text-[var(--muted)]">
                                            {index + 1}
                                        </div>


                                        {/* ==================================
                                            Student information
                                        =================================== */}

                                        <div className="min-w-0 flex-1">

                                            <p className="truncate text-[13px] font-medium text-[var(--ink)]">
                                                {studentName}
                                            </p>

                                            <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[12px] text-[var(--muted)]">
                                                <span className="truncate">
                                                    {studentCode}
                                                </span>

                                                <span
                                                    aria-hidden="true"
                                                    className="sm:hidden"
                                                >
                                                    ·
                                                </span>

                                                <span
                                                    className={`shrink-0 sm:hidden ${remainingClass}`}
                                                >
                                                    {remainingLabel}
                                                </span>
                                            </div>

                                        </div>


                                        {/* ==================================
                                            Expiration
                                        =================================== */}

                                        <div className="hidden shrink-0 text-right sm:block">

                                            <p
                                                className={`text-[12px] font-semibold ${remainingClass}`}
                                            >
                                                {remainingLabel}
                                            </p>

                                            {expiresAt ? (
                                                <p className="mt-0.5 text-[12px] text-[var(--faint)]">
                                                    Hết hạn{" "}
                                                    {formatDate(
                                                        expiresAt
                                                    )}
                                                </p>
                                            ) : (
                                                <p className="mt-0.5 text-[12px] text-[var(--faint)]">
                                                    Không giới hạn
                                                </p>
                                            )}

                                        </div>


                                        {/* ==================================
                                            Renew
                                        =================================== */}

                                        <button
                                            type="button"
                                            aria-label={`Gia hạn khóa học của ${studentName}`}
                                            title="Gia hạn"
                                            onClick={() =>
                                                setRenewTarget(
                                                    enrollment
                                                )
                                            }
                                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)] transition hover:border-[var(--brand-soft)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand-text)]"
                                        >
                                            <CalendarPlus
                                                size={16}
                                                strokeWidth={1.8}
                                            />
                                        </button>


                                        {/* ==================================
                                            View detail
                                        =================================== */}

                                        <button
                                            type="button"
                                            aria-label={`Xem chi tiết ${studentName}`}
                                            onClick={() =>
                                                handleViewStudent(
                                                    enrollment.id
                                                )
                                            }
                                            className="group flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)] transition hover:border-[var(--brand-soft)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand-text)]"
                                        >
                                            <ArrowRight
                                                size={15}
                                                className="transition group-hover:translate-x-0.5"
                                            />
                                        </button>

                                    </div>
                                );
                            }
                        )}

                    </div>
                )}

            </section>


            {/* ==========================================
                Add Student Modal
            =========================================== */}

            <AddStudentModal
                open={showAddModal}
                courseId={courseId}
                onClose={() =>
                    setShowAddModal(false)
                }
                onAdded={handleStudentAdded}
            />

            <RenewEnrollmentModal
                open={Boolean(renewTarget)}
                enrollment={renewTarget}
                courseDurationMonths={course?.durationMonths}
                onClose={() => setRenewTarget(null)}
                onRenewed={handleRenewed}
            />
        </>
    );
}
