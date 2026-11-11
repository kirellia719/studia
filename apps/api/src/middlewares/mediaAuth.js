import jwt from "jsonwebtoken";

import env from "../config/env.js";
import AppError from "../utils/appError.js";

const getToken = (req) => {
    const [type, token] = (req.headers.authorization || "").split(" ");

    if (type === "Bearer" && token) {
        return token;
    }

    // <video>/<img> không gắn được header, nên chấp nhận token qua query
    return req.query.token;
};

const mediaAuth = (req, res, next) => {
    try {
        const token = getToken(req);

        if (!token) {
            throw new AppError(
                "Vui lòng đăng nhập để xem học liệu.",
                401
            );
        }

        req.user = jwt.verify(token, env.JWT_SECRET);

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
