import jwt from "jsonwebtoken";

import env from "../config/env.js";
import { prisma } from "../config/database.js";
import AppError from "../utils/appError.js";
import { canAccessLessonMedia } from "../utils/lessonMediaAccess.js";
import { MEDIA_COOKIE_NAME } from "../utils/mediaToken.js";

const OBJECT_ID_PATTERN = /^[a-f0-9]{24}$/i;

const getCookie = (header, name) => {
    if (!header) {
        return null;
    }

    for (const part of header.split(";")) {
        const separator = part.indexOf("=");

        if (separator === -1) {
            continue;
        }

        if (part.slice(0, separator).trim() === name) {
            return decodeURIComponent(
                part.slice(separator + 1).trim()
            );
        }
    }

    return null;
};

const getToken = (req) => {
    const [type, token] = (req.headers.authorization || "").split(" ");

    if (type === "Bearer" && token) {
        return token;
    }

    // <video> không gắn được Authorization, nên nhận phiên media
    // qua cookie httpOnly thay vì đặt token vào URL.
    return getCookie(
        req.headers.cookie,
        MEDIA_COOKIE_NAME
    );
};

const findMediaLessons = async (mediaPath) => {
    if (mediaPath.startsWith("/uploads/lessons/")) {
        return prisma.lesson.findMany({
            where: { video: mediaPath },
            include: { course: true },
        });
    }

    if (mediaPath.startsWith("/uploads/documents/")) {
        const documents = await prisma.lessonDocument.findMany({
            where: { url: mediaPath },
            include: {
                lesson: {
                    include: { course: true },
                },
            },
        });

        return documents.map((document) => document.lesson);
    }

    return null;
};

const canAccessAnyLesson = async ({ user, lessons }) => {
    const results = await Promise.all(
        lessons.map((lesson) =>
            canAccessLessonMedia({
                user,
                lesson,
                course: lesson.course,
            })
        )
    );

    return results.some(Boolean);
};

const mediaAuth = async (req, res, next) => {
    try {
        const token = getToken(req);

        if (!token) {
            throw new AppError(
                "Vui lòng đăng nhập để xem học liệu.",
                401
            );
        }

        const user = jwt.verify(token, env.JWT_SECRET);

        if (OBJECT_ID_PATTERN.test(user.id)) {
            const account = await prisma.user.findUnique({
                where: { id: user.id },
                select: { id: true, role: true, isDelete: true },
            });

            if (!account || account.isDelete) {
                throw new AppError(
                    "Tài khoản không còn khả dụng.",
                    401
                );
            }

            user.role = account.role;
        }

        const mediaPath = decodeURIComponent(
            `${req.baseUrl || ""}${req.path || ""}`
        );

        const lessons = await findMediaLessons(mediaPath);

        if (lessons) {
            if (lessons.length === 0) {
                throw new AppError(
                    "Không tìm thấy học liệu.",
                    404
                );
            }

            const allowed = await canAccessAnyLesson({
                user,
                lessons,
            });

            if (!allowed) {
                throw new AppError(
                    "Bạn cần đăng ký khóa học để xem học liệu này.",
                    403
                );
            }
        }

        req.user = user;

        next();
    } catch (error) {
        if (error instanceof AppError) {
            return next(error);
        }

        return next(
            new AppError(
                "Token không hợp lệ hoặc đã hết hạn.",
                401
            )
        );
    }
};

export default mediaAuth;
