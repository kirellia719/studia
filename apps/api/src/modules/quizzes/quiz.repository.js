// src/modules/quizzes/quiz.repository.js

import { prisma } from "../../config/database.js";

const quizWithQuestions = {
    questions: {
        orderBy: {
            order: "asc",
        },
        include: {
            options: {
                orderBy: {
                    order: "asc",
                },
            },
        },
    },
};

const quizRepository = {
    // ==========================================
    // Quiz
    // ==========================================

    async findByLessonId(lessonId) {
        return prisma.quiz.findUnique({
            where: {
                lessonId,
            },
            include: quizWithQuestions,
        });
    },

    async findById(quizId) {
        return prisma.quiz.findUnique({
            where: {
                id: quizId,
            },
            include: quizWithQuestions,
        });
    },

    async create({ lessonId, data }) {
        return prisma.quiz.create({
            data: {
                lessonId,
                ...data,
            },
        });
    },

    async update({ lessonId, data }) {
        return prisma.quiz.update({
            where: {
                lessonId,
            },
            data,
        });
    },

    async deleteByLessonId(lessonId) {
        return prisma.quiz.delete({
            where: {
                lessonId,
            },
        });
    },

    // ==========================================
    // Questions
    //
    // MongoDB chưa chắc chạy được transaction,
    // nên thay đề theo từng bước tuần tự.
    // ==========================================

    async findQuestionIdsByQuizId(quizId) {
        const questions = await prisma.question.findMany({
            where: {
                quizId,
            },
            select: {
                id: true,
            },
        });

        return questions.map((question) => question.id);
    },

    async deleteQuestionsByQuizId(quizId) {
        const questionIds =
            await quizRepository.findQuestionIdsByQuizId(
                quizId
            );

        if (questionIds.length === 0) return;

        await prisma.questionOption.deleteMany({
            where: {
                questionId: {
                    in: questionIds,
                },
            },
        });

        await prisma.question.deleteMany({
            where: {
                id: {
                    in: questionIds,
                },
            },
        });
    },

    async createQuestion({ quizId, question, order }) {
        return prisma.question.create({
            data: {
                quizId,
                content: question.content,
                explanation: question.explanation ?? null,
                order,
                options: {
                    create: question.options.map(
                        (option, index) => ({
                            content: option.content,
                            isCorrect: Boolean(
                                option.isCorrect
                            ),
                            order: index,
                        })
                    ),
                },
            },
        });
    },

    // ==========================================
    // Attempts
    // ==========================================

    async findAttemptById(attemptId) {
        return prisma.quizAttempt.findUnique({
            where: {
                id: attemptId,
            },
            include: {
                answers: {
                    orderBy: {
                        order: "asc",
                    },
                },
                quiz: {
                    select: {
                        id: true,
                        title: true,
                        passingScore: true,
                        lessonId: true,
                    },
                },
            },
        });
    },

    async findInProgressAttempt({
        quizId,
        studentId,
    }) {
        return prisma.quizAttempt.findFirst({
            where: {
                quizId,
                studentId,
                submittedAt: null,
            },
            orderBy: {
                startedAt: "desc",
            },
            include: {
                answers: {
                    orderBy: {
                        order: "asc",
                    },
                },
            },
        });
    },

    async createAttempt({
        quizId,
        studentId,
        totalQuestions,
    }) {
        return prisma.quizAttempt.create({
            data: {
                quizId,
                studentId,
                totalQuestions,
                // Ghi rõ null để bộ lọc "đang làm" khớp trên MongoDB.
                submittedAt: null,
            },
        });
    },

    async countSubmittedAttempts({
        quizId,
        studentId,
    }) {
        return prisma.quizAttempt.count({
            where: {
                quizId,
                studentId,
                submittedAt: {
                    not: null,
                },
            },
        });
    },

    async findBestScore({ quizId, studentId }) {
        const result = await prisma.quizAttempt.aggregate({
            where: {
                quizId,
                studentId,
                submittedAt: {
                    not: null,
                },
            },
            _max: {
                score: true,
            },
        });

        return result._max.score ?? null;
    },

    // ==========================================
    // Answers
    // ==========================================

    async findAnswersByAttemptId(attemptId) {
        return prisma.quizAnswer.findMany({
            where: {
                attemptId,
            },
            orderBy: {
                order: "asc",
            },
        });
    },

    async upsertAnswer({
        attemptId,
        questionId,
        order,
        questionContent,
        selectedOptionId,
        selectedContent,
        correctOptionId,
        correctContent,
        explanation,
        isCorrect,
    }) {
        return prisma.quizAnswer.upsert({
            where: {
                attemptId_questionId: {
                    attemptId,
                    questionId,
                },
            },
            create: {
                attemptId,
                questionId,
                order,
                questionContent,
                selectedOptionId,
                selectedContent,
                correctOptionId,
                correctContent,
                explanation,
                isCorrect,
            },
            update: {
                order,
                questionContent,
                selectedOptionId,
                selectedContent,
                correctOptionId,
                correctContent,
                explanation,
                isCorrect,
            },
        });
    },

    async updateAttempt(attemptId, data) {
        return prisma.quizAttempt.update({
            where: {
                id: attemptId,
            },
            data,
        });
    },

    async getStats(quizId) {
        const result = await prisma.quizAttempt.aggregate({
            where: {
                quizId,
                submittedAt: {
                    not: null,
                },
            },
            _count: {
                _all: true,
            },
            _avg: {
                score: true,
            },
        });

        return {
            attemptCount: result._count._all,
            averageScore: Math.round(
                result._avg.score ?? 0
            ),
        };
    },

    async findAttemptIdsByQuizId(quizId) {
        const attempts = await prisma.quizAttempt.findMany({
            where: {
                quizId,
            },
            select: {
                id: true,
            },
        });

        return attempts.map((attempt) => attempt.id);
    },

    async deleteAnswersByAttemptIds(attemptIds) {
        return prisma.quizAnswer.deleteMany({
            where: {
                attemptId: {
                    in: attemptIds,
                },
            },
        });
    },

    async deleteAnswersExceptQuestions({
        attemptId,
        questionIds,
    }) {
        return prisma.quizAnswer.deleteMany({
            where: {
                attemptId,
                questionId: {
                    notIn: questionIds,
                },
            },
        });
    },

    async deleteAttempt(attemptId) {
        return prisma.quizAttempt.delete({
            where: {
                id: attemptId,
            },
        });
    },

    async deleteAttemptsByQuizId(quizId) {
        return prisma.quizAttempt.deleteMany({
            where: {
                quizId,
            },
        });
    },
};

export default quizRepository;
