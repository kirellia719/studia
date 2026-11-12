import test from "node:test";
import assert from "node:assert/strict";

import errorMiddleware from "../src/middlewares/errorMiddleware.js";

const run = (err) =>
    new Promise((resolve) => {
        const res = {
            statusCode: 200,
            body: null,
            status(code) {
                this.statusCode = code;
                return this;
            },
            json(body) {
                this.body = body;
                resolve(this);
            },
        };

        errorMiddleware(err, {}, res, () => {});
    });

test("errorMiddleware: ObjectID sai định dạng trả 400, không lộ Prisma", async () => {
    const res = await run({
        message:
            "Invalid `prisma.course.findUnique()` invocation: Malformed ObjectID",
    });

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.message, "ID không hợp lệ.");
});

test("errorMiddleware: lỗi 500 không trả nội dung kỹ thuật", async () => {
    const originalConsoleError = console.error;
    console.error = () => {};

    let res;

    try {
        res = await run(
            new Error("connect ECONNREFUSED 127.0.0.1:27017")
        );
    } finally {
        console.error = originalConsoleError;
    }

    assert.equal(res.statusCode, 500);
    assert.equal(res.body.message, "Đã xảy ra lỗi máy chủ");
});
