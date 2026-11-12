import { prisma } from "../config/database.js";

const findActiveEnrollment = async ({ studentId, courseId }) => {
    const enrollment = await prisma.enrollment.findUnique({
        where: {
            studentId_courseId: {
                studentId,
                courseId,
            },
        },
    });

    return Boolean(
        enrollment && enrollment.expiresAt > new Date()
    );
};

export const canAccessLessonMedia = async ({
    user,
    lesson,
    course,
}) => {
    if (!user || !lesson || !course) {
        return false;
    }

    if (user.role === "ADMIN") {
        return true;
    }

    if (user.role === "TEACHER") {
        return course.teacherId === user.id;
    }

    if (user.role !== "STUDENT") {
        return false;
    }

    if (course.isDelete || !course.status) {
        return false;
    }

    // Bài miễn phí được xem trước, kể cả khi chưa đăng ký
    // hoặc đã hết hạn học khóa.
    if (lesson.isFree) {
        return true;
    }

    return findActiveEnrollment({
        studentId: user.id,
        courseId: course.id,
    });
};
