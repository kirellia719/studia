import jwt from "jsonwebtoken";

import env from "../config/env.js";
import { prisma } from "../config/database.js";
import AppError from "../utils/appError.js";
import { isMediaToken } from "../utils/mediaToken.js";

const OBJECT_ID_PATTERN = /^[a-f0-9]{24}$/i;

const auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // Không có Authorization header
        if (!authHeader) {
            throw new AppError(
                "Vui lòng đăng nhập để tiếp tục.",
                401
            );
        }

        // Kiểm tra format: Bearer <token>
        const [type, token] = authHeader.split(" ");

        if (type !== "Bearer" || !token) {
            throw new AppError(
                "Authorization token không hợp lệ.",
                401
            );
        }

        // Verify JWT
        const decoded = jwt.verify(
            token,
            env.JWT_SECRET
        );

        // Token cấp cho học liệu chỉ dùng ở /uploads,
        // không thay thế được access token của API.
        if (isMediaToken(decoded)) {
            throw new AppError(
                "Token không hợp lệ hoặc đã hết hạn.",
                401
            );
        }

        // Token cũ của tài khoản đã bị xoá mềm cũng không được dùng tiếp.
        if (OBJECT_ID_PATTERN.test(decoded.id)) {
            const user = await prisma.user.findUnique({
                where: { id: decoded.id },
                select: {
                    id: true,
                    role: true,
                    isDelete: true,
                },
            });

            if (!user || user.isDelete) {
                throw new AppError(
                    "Tài khoản không còn khả dụng.",
                    401
                );
            }

            decoded.role = user.role;
        }

        // Lưu thông tin user vào request
        req.user = decoded;

        next();
    } catch (error) {
        // Nếu đã là AppError thì giữ nguyên
        if (error instanceof AppError) {
            return next(error);
        }

        // Lỗi từ jwt.verify()
        return next(
            new AppError(
                "Token không hợp lệ hoặc đã hết hạn.",
                401
            )
        );
    }
};

export default auth;
