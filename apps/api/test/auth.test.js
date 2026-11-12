import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

const { default: auth } = await import("../src/middlewares/auth.js");
const { default: mediaAuth } = await import("../src/middlewares/mediaAuth.js");
const { default: env } = await import("../src/config/env.js");

const run = (middleware, req) =>
    new Promise((resolve) => {
        middleware(req, {}, (error) => resolve(error));
    });

const sign = (payload = { id: "user-1", role: "STUDENT" }, options) =>
    jwt.sign(payload, env.JWT_SECRET, options);

test("auth: thiếu Authorization header thì trả 401", async () => {
    const error = await run(auth, { headers: {} });

    assert.equal(error?.statusCode, 401);
});

test("auth: sai định dạng Bearer thì trả 401", async () => {
    const error = await run(auth, {
        headers: { authorization: `Token ${sign()}` },
    });

    assert.equal(error?.statusCode, 401);
});

test("auth: token hợp lệ thì gắn req.user và đi tiếp", async () => {
    const req = {
        headers: { authorization: `Bearer ${sign()}` },
    };

    const error = await run(auth, req);

    assert.equal(error, undefined);
    assert.equal(req.user.id, "user-1");
    assert.equal(req.user.role, "STUDENT");
});

test("auth: token hết hạn thì trả 401", async () => {
    const error = await run(auth, {
        headers: { authorization: `Bearer ${sign({}, { expiresIn: -10 })}` },
    });

    assert.equal(error?.statusCode, 401);
});

test("mediaAuth: nhận token qua cookie phiên media", async () => {
    const mediaToken = sign({
        id: "user-1",
        role: "STUDENT",
        scope: "media",
    });
    const req = {
        headers: {
            cookie: `khac=1; media_session=${mediaToken}`,
        },
        query: {},
    };

    const error = await run(mediaAuth, req);

    assert.equal(error, undefined);
    assert.equal(req.user.role, "STUDENT");
});

test("mediaAuth: không nhận token qua query nữa", async () => {
    const error = await run(mediaAuth, {
        headers: {},
        query: { token: sign() },
    });

    assert.equal(error?.statusCode, 401);
});

test("mediaAuth: nhận token qua header Bearer", async () => {
    const req = {
        headers: { authorization: `Bearer ${sign()}` },
        query: {},
    };

    const error = await run(mediaAuth, req);

    assert.equal(error, undefined);
});

test("mediaAuth: không có token thì trả 401", async () => {
    const error = await run(mediaAuth, { headers: {}, query: {} });

    assert.equal(error?.statusCode, 401);
});

test("mediaAuth: token sai thì trả 401", async () => {
    const error = await run(mediaAuth, {
        headers: { cookie: "media_session=khong-phai-token" },
        query: {},
    });

    assert.equal(error?.statusCode, 401);
});

test("auth: token phiên media không dùng được cho API", async () => {
    const error = await run(auth, {
        headers: {
            authorization: `Bearer ${sign({
                id: "user-1",
                role: "STUDENT",
                scope: "media",
            })}`,
        },
    });

    assert.equal(error?.statusCode, 401);
});
