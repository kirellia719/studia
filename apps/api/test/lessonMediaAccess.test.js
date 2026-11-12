import test from "node:test";
import assert from "node:assert/strict";

import { canAccessLessonMedia } from "../src/utils/lessonMediaAccess.js";

const course = {
    id: "course-1",
    teacherId: "teacher-1",
    status: true,
    isDelete: false,
};

test("lesson media: admin luôn xem được", async () => {
    assert.equal(
        await canAccessLessonMedia({
            user: { id: "admin-1", role: "ADMIN" },
            lesson: { isFree: false },
            course,
        }),
        true
    );
});

test("lesson media: giáo viên chỉ xem bài của mình", async () => {
    assert.equal(
        await canAccessLessonMedia({
            user: { id: "teacher-1", role: "TEACHER" },
            lesson: { isFree: false },
            course,
        }),
        true
    );

    assert.equal(
        await canAccessLessonMedia({
            user: { id: "teacher-2", role: "TEACHER" },
            lesson: { isFree: false },
            course,
        }),
        false
    );
});

test("lesson media: học sinh xem được bài miễn phí", async () => {
    assert.equal(
        await canAccessLessonMedia({
            user: { id: "student-1", role: "STUDENT" },
            lesson: { isFree: true },
            course,
        }),
        true
    );
});

test("lesson media: khoá đã xoá hoặc tạm đóng thì học sinh không xem được", async () => {
    assert.equal(
        await canAccessLessonMedia({
            user: { id: "student-1", role: "STUDENT" },
            lesson: { isFree: true },
            course: { ...course, isDelete: true },
        }),
        false
    );

    assert.equal(
        await canAccessLessonMedia({
            user: { id: "student-1", role: "STUDENT" },
            lesson: { isFree: true },
            course: { ...course, status: false },
        }),
        false
    );
});
