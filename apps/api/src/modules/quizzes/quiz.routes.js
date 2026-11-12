// src/modules/quizzes/quiz.routes.js
// Giáo viên quản lý đề trắc nghiệm của bài học.

import { Router } from "express";

import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";

import quizController from "./quiz.controller.js";

const router = Router();

router.use(auth);
router.use(authorize("TEACHER"));

router.get(
    "/lessons/:lessonId",
    quizController.getQuizForTeacher
);

router.put(
    "/lessons/:lessonId",
    quizController.saveQuiz
);

router.patch(
    "/lessons/:lessonId/publish",
    quizController.setPublished
);

router.patch(
    "/lessons/:lessonId/require-completion",
    quizController.setRequiresPassForCompletion
);

router.delete(
    "/lessons/:lessonId",
    quizController.deleteQuiz
);

export default router;
