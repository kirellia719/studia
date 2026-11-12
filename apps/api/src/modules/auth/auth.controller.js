import authService from "./auth.service.js";

import AppError from "../../utils/appError.js";
import { MEDIA_COOKIE_NAME } from "../../utils/mediaToken.js";

const authController = {
    async register(req, res, next) {
        try {
            const { name, email, password } = req.body;

            if (!name || !email || !password) {
                throw new AppError(
                    "Vui lòng nhập đầy đủ họ tên, email và mật khẩu.",
                    400
                );
            }

            if (password.length < 6) {
                throw new AppError(
                    "Mật khẩu phải có ít nhất 6 ký tự.",
                    400
                );
            }

            const user = await authService.register({
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password,
            });

            res.status(201).json({
                success: true,
                message: "Đăng ký tài khoản thành công.",
                data: user,
            });
        } catch (error) {
            next(error);
        }
    },

    async login(req, res, next) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                throw new AppError(
                    "Vui lòng nhập email và mật khẩu.",
                    400
                );
            }

            const result = await authService.login({
                email: email.trim().toLowerCase(),
                password,
            });

            res.status(200).json({
                success: true,
                message: "Đăng nhập thành công.",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    },

    async mediaSession(req, res, next) {
        try {
            const { token, expiresIn } =
                authService.createMediaSession(
                    req.user
                );

            res.cookie(MEDIA_COOKIE_NAME, token, {
                httpOnly: true,
                // Frontend và API cùng một site (khác cổng/subdomain)
                // nên Lax vẫn gửi cookie cho <video>, cả khi chạy http.
                sameSite: "lax",
                secure: req.secure,
                path: "/uploads",
                maxAge: expiresIn * 1000,
            });

            res.status(200).json({
                success: true,
                message: "Đã mở phiên học liệu.",
                data: { expiresIn },
            });
        } catch (error) {
            next(error);
        }
    },
};

export default authController;
