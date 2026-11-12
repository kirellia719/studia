// src/modules/quizzes/quiz.controller.js

import quizService from "./quiz.service.js";

const quizController = {
    // ==========================================
    // TEACHER
    // GET /quizzes/lessons/:lessonId
    // ==========================================

    async getQuizForTeacher(req, res, next) {
        try {
            const data = await quizService.getQuizForTeacher({
                lessonId: req.params.lessonId,
                teacherId: req.user.id,
            });

            return res.status(200).json({
                success: true,
                message:
                    "Lấy đề trắc nghiệm thành công.",
                data,
            });
        } catch (error) {
            next(error);
        }
    },

    // PUT /quizzes/lessons/:lessonId
    async saveQuiz(req, res, next) {
        try {
            const quiz = await quizService.saveQuiz({
                lessonId: req.params.lessonId,
                teacherId: req.user.id,
                payload: req.body,
            });

            return res.status(200).json({
                success: true,
                message: "Lưu đề trắc nghiệm thành công.",
                data: quiz,
            });
        } catch (error) {
            next(error);
        }
    },

    // PATCH /quizzes/lessons/:lessonId/publish
    async setPublished(req, res, next) {
        try {
            const { isPublished } = req.body;

            const quiz = await quizService.setPublished({
                lessonId: req.params.lessonId,
                teacherId: req.user.id,
                isPublished,
            });

            return res.status(200).json({
                success: true,
                message: isPublished
                    ? "Đã mở đề cho học sinh."
                    : "Đã tạm ẩn đề.",
                data: quiz,
            });
        } catch (error) {
            next(error);
        }
    },

    // PATCH /quizzes/lessons/:lessonId/require-completion
    async setRequiresPassForCompletion(req, res, next) {
        try {
            const { required } = req.body;

            const quiz =
                await quizService.setRequiresPassForCompletion({
                    lessonId: req.params.lessonId,
                    teacherId: req.user.id,
                    required,
                });

            return res.status(200).json({
                success: true,
                message: required
                    ? "Đã bắt buộc đạt đề để hoàn thành bài."
                    : "Đã bỏ yêu cầu đạt đề.",
                data: quiz,
            });
        } catch (error) {
            next(error);
        }
    },

    // DELETE /quizzes/lessons/:lessonId
    async deleteQuiz(req, res, next) {
        try {
            await quizService.deleteQuiz({
                lessonId: req.params.lessonId,
                teacherId: req.user.id,
            });

            return res.status(200).json({
                success: true,
                message: "Xóa đề trắc nghiệm thành công.",
            });
        } catch (error) {
            next(error);
        }
    },

    // ==========================================
    // STUDENT
    // GET /learning/lessons/:lessonId/quiz
    // ==========================================

    async getQuizForStudent(req, res, next) {
        try {
            const data = await quizService.getQuizForStudent({
                lessonId: req.params.lessonId,
                studentId: req.user.id,
            });

            return res.status(200).json({
                success: true,
                message:
                    "Lấy đề ôn tập thành công.",
                data,
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /learning/lessons/:lessonId/quiz/attempts
    async startAttempt(req, res, next) {
        try {
            const data = await quizService.startAttempt({
                lessonId: req.params.lessonId,
                studentId: req.user.id,
            });

            return res.status(201).json({
                success: true,
                message: "Bắt đầu làm bài.",
                data,
            });
        } catch (error) {
            next(error);
        }
    },

    // PATCH /learning/quiz-attempts/:attemptId/answers
    async saveAnswers(req, res, next) {
        try {
            const data = await quizService.saveAnswers({
                attemptId: req.params.attemptId,
                studentId: req.user.id,
                answers: req.body?.answers,
            });

            return res.status(200).json({
                success: true,
                message: "Đã lưu bài làm.",
                data,
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /learning/quiz-attempts/:attemptId/submit
    async submitAttempt(req, res, next) {
        try {
            const data = await quizService.submitAttempt({
                attemptId: req.params.attemptId,
                studentId: req.user.id,
            });

            return res.status(200).json({
                success: true,
                message: "Nộp bài thành công.",
                data,
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /learning/quiz-attempts/:attemptId
    async getAttemptResult(req, res, next) {
        try {
            const data = await quizService.getAttemptResult({
                attemptId: req.params.attemptId,
                studentId: req.user.id,
            });

            return res.status(200).json({
                success: true,
                message: "Lấy kết quả bài làm thành công.",
                data,
            });
        } catch (error) {
            next(error);
        }
    },
};

export default quizController;
