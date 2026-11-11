import test from "node:test";
import assert from "node:assert/strict";

import {
    getRoleHome,
    getRoleFromToken,
} from "../src/lib/roles.js";

const encode = (value) =>
    btoa(JSON.stringify(value));

const makeToken = (payload) =>
    `${encode({ alg: "HS256", typ: "JWT" })}.${encode(payload)}.signature`;

test("getRoleHome: trả đúng trang gốc của từng role", () => {
    assert.equal(getRoleHome("STUDENT"), "/student");
    assert.equal(getRoleHome("TEACHER"), "/teacher");
    assert.equal(getRoleHome("ADMIN"), "/admin");
});

test("getRoleHome: role lạ hoặc rỗng thì về /login", () => {
    assert.equal(getRoleHome("UNKNOWN"), "/login");
    assert.equal(getRoleHome(undefined), "/login");
    assert.equal(getRoleHome(null), "/login");
});

test("getRoleFromToken: đọc role từ payload JWT", () => {
    assert.equal(
        getRoleFromToken(makeToken({ id: "u1", role: "TEACHER" })),
        "TEACHER"
    );
});

test("getRoleFromToken: payload không có role thì trả null", () => {
    assert.equal(getRoleFromToken(makeToken({ id: "u1" })), null);
});

test("getRoleFromToken: token hỏng thì trả null", () => {
    assert.equal(getRoleFromToken("khong-phai-token"), null);
    assert.equal(getRoleFromToken(""), null);
});
