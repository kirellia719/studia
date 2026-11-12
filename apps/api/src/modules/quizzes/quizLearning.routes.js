// src/modules/quizzes/quizLearning.routes.js
// Học sinh làm đề trắc nghiệm ôn tập.

import { Router } from "express";

import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";

import quizController from "./quiz.controller.js";

const router = Router();

router.use(auth);
router.use(authorize("STUDENT"));

router.get(
    "/lessons/:lessonId/quiz",
    quizController.getQuizForStudent
);

router.post(
    "/lessons/:lessonId/quiz/attempts",
    quizController.startAttempt
);

router.get(
    "/quiz-attempts/:attemptId",
    quizController.getAttemptResult
);

router.patch(
    "/quiz-attempts/:attemptId/answers",
    quizController.saveAnswers
);

router.post(
    "/quiz-attempts/:attemptId/submit",
    quizController.submitAttempt
);

export default router;
