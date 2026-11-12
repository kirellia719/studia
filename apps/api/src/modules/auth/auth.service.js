import jwt from "jsonwebtoken";

import authRepository from "./auth.repository.js";

import { hashPassword, comparePassword } from "../../utils/password.js";

import AppError from "../../utils/appError.js";

import env from "../../config/env.js";
import {
    signMediaToken,
    MEDIA_TOKEN_TTL_SECONDS,
} from "../../utils/mediaToken.js";

const authService = {
    async register({ name, email, password }) {
        const existingUser = await authRepository.findUserByEmail(email);

        if (existingUser) {
            throw new AppError(
                "Email đã được sử dụng",
                409
            );
        }

        const hashedPassword = await hashPassword(password);

        const studentCount = await authRepository.countStudents();

        const studentCode = `HS${String(studentCount + 1).padStart(4, "0")}`;

        const user = await authRepository.createUser({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            role: "STUDENT",
            studentCode,
        });

        // Không trả password về client
        const { password: _, ...safeUser } = user;

        return safeUser;
    },

    async login({ email, password }) {
        const user = await authRepository.findUserByEmail(email);

        if (!user || user.isDelete) {
            throw new AppError(
                "Email hoặc mật khẩu không chính xác.",
                401
            );
        }

        const isPasswordValid = await comparePassword(
            password,
            user.password
        );

        if (!isPasswordValid) {
            throw new AppError(
                "Email hoặc mật khẩu không chính xác.",
                401
            );
        }

        const accessToken = jwt.sign(
            {
                id: user.id,
                role: user.role,
            },
            env.JWT_SECRET,
            {
                expiresIn: "1h",
            }
        );

        // Không trả password về client
        const { password: _, ...safeUser } = user;

        return {
            user: safeUser,
            accessToken,
        };
    },

    // Phiên ngắn hạn để thẻ <video> tải học liệu bằng cookie,
    // tránh đặt access token vào URL.
    createMediaSession(user) {
        return {
            token: signMediaToken({
                id: user.id,
                role: user.role,
            }),
            expiresIn: MEDIA_TOKEN_TTL_SECONDS,
        };
    },
};

export default authService;
