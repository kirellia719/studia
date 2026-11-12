import jwt from "jsonwebtoken";

import env from "../config/env.js";

// Cookie chỉ gửi kèm request tới /uploads, không dùng được cho API.
export const MEDIA_COOKIE_NAME = "media_session";
export const MEDIA_TOKEN_SCOPE = "media";
export const MEDIA_TOKEN_TTL_SECONDS = 60 * 60;

// Token media sống ngắn và chỉ mở được học liệu, nên lộ URL
// cũng không lộ quyền của access token.
export const signMediaToken = ({ id, role }) =>
    jwt.sign(
        { id, role, scope: MEDIA_TOKEN_SCOPE },
        env.JWT_SECRET,
        { expiresIn: MEDIA_TOKEN_TTL_SECONDS }
    );

export const isMediaToken = (payload) =>
    payload?.scope === MEDIA_TOKEN_SCOPE;
