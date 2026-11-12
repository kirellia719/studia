// src/modules/quizzes/quiz.service.js

import quizRepository from "./quiz.repository.js";
import learningService from "../learning/learning.service.js";
import lessonRepository from "../lessons/lesson.repository.js";

const MAX_QUESTIONS = 50;
const MIN_OPTIONS = 2;
const MAX_OPTIONS = 6;

const createError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

// ==========================================
// Validate đề trắc nghiệm do giáo viên gửi lên
// ==========================================

const normalizeQuizPayload = (payload = {}) => {
    const title = payload.title?.trim();

    if (!title) {
        throw createError(
            "Vui lòng nhập tên đề trắc nghiệm.",
            400
        );
    }

    let passingScore = 70;

    if (payload.passingScore !== undefined) {
        passingScore = Number(payload.passingScore);

        if (
            !Number.isInteger(passingScore) ||
            passingScore < 0 ||
            passingScore > 100
        ) {
            throw createError(
                "Điểm đạt phải là số nguyên từ 0 đến 100.",
                400
            );
        }
    }

    const rawQuestions = Array.isArray(payload.questions)
        ? payload.questions
        : [];

    if (rawQuestions.length === 0) {
        throw createError(
            "Đề cần ít nhất 1 câu hỏi.",
            400
        );
    }

    if (rawQuestions.length > MAX_QUESTIONS) {
        throw createError(
            `Đề tối đa ${MAX_QUESTIONS} câu hỏi.`,
            400
        );
    }

    const questions = rawQuestions.map(
        (question, questionIndex) => {
            const content = question?.content?.trim();

            if (!content) {
                throw createError(
                    `Câu ${questionIndex + 1} chưa có nội dung.`,
                    400
                );
            }

            const rawOptions = Array.isArray(
                question?.options
            )
                ? question.options
                : [];

            if (
                rawOptions.length < MIN_OPTIONS ||
                rawOptions.length > MAX_OPTIONS
            ) {
                throw createError(
                    `Câu ${questionIndex + 1} cần từ ${MIN_OPTIONS} đến ${MAX_OPTIONS} đáp án.`,
                    400
                );
            }

            const options = rawOptions.map(
                (option) => ({
                    content: option?.content?.trim() ?? "",
                    isCorrect: Boolean(option?.isCorrect),
                })
            );

            if (options.some((option) => !option.content)) {
                throw createError(
                    `Câu ${questionIndex + 1} có đáp án để trống.`,
                    400
                );
            }

            const correctCount = options.filter(
                (option) => option.isCorrect
            ).length;

            if (correctCount !== 1) {
                throw createError(
                    `Câu ${questionIndex + 1} phải có đúng 1 đáp án đúng.`,
                    400
                );
            }

            return {
                content,
                explanation:
                    question?.explanation?.trim() || null,
                options,
            };
        }
    );

    return {
        title,
        description: payload.description?.trim() || null,
        passingScore,
        questions,
    };
};

// ==========================================
// Quyền của giáo viên trên bài học
// ==========================================

const assertTeacherOwnsLesson = async ({
    lessonId,
    teacherId,
}) => {
    const lesson =
        await lessonRepository.findByIdWithCourse(lessonId);

    if (!lesson) {
        throw createError(
            "Không tìm thấy bài học.",
            404
        );
    }

    if (!lesson.course || lesson.course.isDelete) {
        throw createError(
            "Khóa học đã bị xóa.",
            404
        );
    }

    if (lesson.course.teacherId !== teacherId) {
        throw createError(
            "Bạn không có quyền quản lý đề trắc nghiệm của bài học này.",
            403
        );
    }

    return lesson;
};

// ==========================================
// Chuyển đề sang dạng an toàn cho học sinh
// (không lộ đáp án đúng, không lộ giải thích)
// ==========================================

const toStudentQuiz = (quiz) => ({
    id: quiz.id,
    lessonId: quiz.lessonId,
    title: quiz.title,
    description: quiz.description,
    passingScore: quiz.passingScore,
    totalQuestions: quiz.questions.length,
    questions: quiz.questions.map((question) => ({
        id: question.id,
        content: question.content,
        order: question.order,
        options: question.options.map((option) => ({
            id: option.id,
            content: option.content,
            order: option.order,
        })),
    })),
});

const toAttemptSummary = (attempt) => ({
    id: attempt.id,
    startedAt: attempt.startedAt,
    answers: (attempt.answers ?? []).map((answer) => ({
        questionId: answer.questionId,
        selectedOptionId: answer.selectedOptionId,
    })),
});

const toReview = (attempt, passingScore) => ({
    id: attempt.id,
    submittedAt: attempt.submittedAt,
    score: attempt.score ?? 0,
    correctCount: attempt.correctCount,
    totalQuestions: attempt.totalQuestions,
    passingScore,
    passed: (attempt.score ?? 0) >= passingScore,
    answers: (attempt.answers ?? []).map((answer) => ({
        questionId: answer.questionId,
        order: answer.order,
        questionContent: answer.questionContent,
        selectedOptionId: answer.selectedOptionId,
        selectedContent: answer.selectedContent,
        correctOptionId: answer.correctOptionId,
        correctContent: answer.correctContent,
        explanation: answer.explanation,
        isCorrect: answer.isCorrect,
    })),
});

const getPublishedQuiz = async (lessonId) => {
    const quiz = await quizRepository.findByLessonId(lessonId);

    if (!quiz || !quiz.isPublished) {
        throw createError(
            "Bài học này chưa có đề ôn tập.",
            404
        );
    }

    if (quiz.questions.length === 0) {
        throw createError(
            "Bài học này chưa có đề ôn tập.",
            404
        );
    }

    return quiz;
};

const assertStudentAttempt = (attempt, studentId) => {
    if (!attempt) {
        throw createError(
            "Không tìm thấy bài làm.",
            404
        );
    }

    if (attempt.studentId !== studentId) {
        throw createError(
            "Bạn không có quyền xem bài làm này.",
            403
        );
    }
};

const quizService = {
    // ==========================================
    // TEACHER
    // ==========================================

    async getQuizForTeacher({
        lessonId,
        teacherId,
    }) {
        await assertTeacherOwnsLesson({
            lessonId,
            teacherId,
        });

        const quiz =
            await quizRepository.findByLessonId(lessonId);

        if (!quiz) {
            return {
                quiz: null,
                stats: {
                    attemptCount: 0,
                    averageScore: 0,
                },
            };
        }

        const stats = await quizRepository.getStats(quiz.id);

        return { quiz, stats };
    },

    async saveQuiz({
        lessonId,
        teacherId,
        payload,
    }) {
        await assertTeacherOwnsLesson({
            lessonId,
            teacherId,
        });

        const data = normalizeQuizPayload(payload);

        const existing =
            await quizRepository.findByLessonId(lessonId);

        let quizId;

        if (existing) {
            quizId = existing.id;

            await quizRepository.update({
                lessonId,
                data: {
                    title: data.title,
                    description: data.description,
                    passingScore: data.passingScore,
                },
            });
        } else {
            const quiz = await quizRepository.create({
                lessonId,
                data: {
                    title: data.title,
                    description: data.description,
                    passingScore: data.passingScore,
                    isPublished: false,
                },
            });

            quizId = quiz.id;
        }

        await quizRepository.deleteQuestionsByQuizId(quizId);

        for (let index = 0; index < data.questions.length; index += 1) {
            await quizRepository.createQuestion({
                quizId,
                question: data.questions[index],
                order: index,
            });
        }

        // Đề đang publish mà bị sửa thì giữ nguyên trạng thái publish.
        const quiz =
            await quizRepository.findByLessonId(lessonId);

        return quiz;
    },

    async setPublished({
        lessonId,
        teacherId,
        isPublished,
    }) {
        await assertTeacherOwnsLesson({
            lessonId,
            teacherId,
        });

        const quiz =
            await quizRepository.findByLessonId(lessonId);

        if (!quiz) {
            throw createError(
                "Bài học này chưa có đề ôn tập.",
                404
            );
        }

        if (isPublished && quiz.questions.length === 0) {
            throw createError(
                "Đề chưa có câu hỏi nên chưa thể mở cho học sinh.",
                400
            );
        }

        const updated = await quizRepository.update({
            lessonId,
            data: {
                isPublished: Boolean(isPublished),
                // Đề bị ẩn thì không thể là điều kiện hoàn thành.
                ...(isPublished
                    ? {}
                    : {
                        requiresPassForCompletion: false,
                    }),
            },
        });

        return updated;
    },

    async setRequiresPassForCompletion({
        lessonId,
        teacherId,
        required,
    }) {
        await assertTeacherOwnsLesson({
            lessonId,
            teacherId,
        });

        const quiz =
            await quizRepository.findByLessonId(lessonId);

        if (!quiz) {
            throw createError(
                "Bài học này chưa có đề ôn tập.",
                404
            );
        }

        if (required) {
            if (!quiz.isPublished) {
                throw createError(
                    "Hãy mở đề cho học sinh trước khi bắt buộc đạt đề.",
                    400
                );
            }

            if (quiz.questions.length === 0) {
                throw createError(
                    "Đề chưa có câu hỏi nên chưa thể bắt buộc.",
                    400
                );
            }
        }

        return quizRepository.update({
            lessonId,
            data: {
                requiresPassForCompletion: Boolean(
                    required
                ),
            },
        });
    },

    async deleteQuiz({ lessonId, teacherId }) {
        await assertTeacherOwnsLesson({
            lessonId,
            teacherId,
        });

        const quiz =
            await quizRepository.findByLessonId(lessonId);

        if (!quiz) return;

        const attemptIds =
            await quizRepository.findAttemptIdsByQuizId(
                quiz.id
            );

        if (attemptIds.length > 0) {
            await quizRepository.deleteAnswersByAttemptIds(
                attemptIds
            );

            await quizRepository.deleteAttemptsByQuizId(
                quiz.id
            );
        }

        await quizRepository.deleteQuestionsByQuizId(quiz.id);

        await quizRepository.deleteByLessonId(lessonId);
    },

    // ==========================================
    // STUDENT
    // ==========================================

    async getQuizForStudent({
        lessonId,
        studentId,
    }) {
        await learningService.assertLessonAccess({
            lessonId,
            studentId,
        });

        const quiz = await getPublishedQuiz(lessonId);

        const [bestScore, attemptCount, inProgress] =
            await Promise.all([
                quizRepository.findBestScore({
                    quizId: quiz.id,
                    studentId,
                }),
                quizRepository.countSubmittedAttempts({
                    quizId: quiz.id,
                    studentId,
                }),
                quizRepository.findInProgressAttempt({
                    quizId: quiz.id,
                    studentId,
                }),
            ]);

        return {
            quiz: toStudentQuiz(quiz),
            bestScore,
            attemptCount,
            inProgressAttempt: inProgress
                ? toAttemptSummary(inProgress)
                : null,
        };
    },

    async startAttempt({
        lessonId,
        studentId,
    }) {
        await learningService.assertLessonAccess({
            lessonId,
            studentId,
        });

        const quiz = await getPublishedQuiz(lessonId);

        const existing =
            await quizRepository.findInProgressAttempt({
                quizId: quiz.id,
                studentId,
            });

        if (existing) {
            const questionIds = new Set(
                quiz.questions.map((question) => question.id)
            );

            const hasStaleAnswer = existing.answers.some(
                (answer) => !questionIds.has(answer.questionId)
            );

            // Đề bị sửa giữa chừng: bỏ lượt làm cũ để không trộn câu hỏi.
            if (hasStaleAnswer) {
                await quizRepository.deleteAnswersByAttemptIds([
                    existing.id,
                ]);
                await quizRepository.deleteAttempt(existing.id);
            } else {
                return {
                    quiz: toStudentQuiz(quiz),
                    attempt: toAttemptSummary(existing),
                };
            }
        }

        const attempt =
            await quizRepository.createAttempt({
                quizId: quiz.id,
                studentId,
                totalQuestions: quiz.questions.length,
            });

        return {
            quiz: toStudentQuiz(quiz),
            attempt: toAttemptSummary(attempt),
        };
    },

    async saveAnswers({
        attemptId,
        studentId,
        answers,
    }) {
        const attempt =
            await quizRepository.findAttemptById(attemptId);

        assertStudentAttempt(attempt, studentId);

        if (attempt.submittedAt) {
            throw createError(
                "Bài làm đã được nộp.",
                400
            );
        }

        const quiz = await quizRepository.findById(
            attempt.quizId
        );

        if (!quiz) {
            throw createError(
                "Không tìm thấy đề trắc nghiệm.",
                404
            );
        }

        const questionMap = new Map(
            quiz.questions.map((question) => [
                question.id,
                question,
            ])
        );

        const list = Array.isArray(answers) ? answers : [];
        let savedCount = 0;

        for (const answer of list) {
            const question = questionMap.get(
                answer?.questionId
            );

            if (!question) continue;

            const option = question.options.find(
                (item) => item.id === answer?.selectedOptionId
            );

            if (!option) continue;

            const correctOption = question.options.find(
                (item) => item.isCorrect
            );

            if (!correctOption) continue;

            await quizRepository.upsertAnswer({
                attemptId,
                questionId: question.id,
                order: question.order,
                questionContent: question.content,
                selectedOptionId: option.id,
                selectedContent: option.content,
                correctOptionId: correctOption.id,
                correctContent: correctOption.content,
                explanation: question.explanation ?? null,
                isCorrect: option.id === correctOption.id,
            });

            savedCount += 1;
        }

        return { savedCount };
    },

    async submitAttempt({ attemptId, studentId }) {
        const attempt =
            await quizRepository.findAttemptById(attemptId);

        assertStudentAttempt(attempt, studentId);

        const quiz = await quizRepository.findById(
            attempt.quizId
        );

        if (!quiz) {
            throw createError(
                "Không tìm thấy đề trắc nghiệm.",
                404
            );
        }

        if (attempt.submittedAt) {
            return toReview(attempt, quiz.passingScore);
        }

        await quizRepository.deleteAnswersExceptQuestions({
            attemptId,
            questionIds: quiz.questions.map(
                (question) => question.id
            ),
        });

        const answers = await quizRepository.findAnswersByAttemptId(
            attemptId
        );

        const answerMap = new Map(
            answers.map((answer) => [
                answer.questionId,
                answer,
            ])
        );

        let correctCount = 0;

        for (const question of quiz.questions) {
            const correctOption = question.options.find(
                (option) => option.isCorrect
            );

            if (!correctOption) continue;

            const existing = answerMap.get(question.id);

            if (!existing) {
                // Câu chưa trả lời: vẫn ghi lại để màn xem kết quả đủ câu.
                await quizRepository.upsertAnswer({
                    attemptId,
                    questionId: question.id,
                    order: question.order,
                    questionContent: question.content,
                    selectedOptionId: null,
                    selectedContent: null,
                    correctOptionId: correctOption.id,
                    correctContent: correctOption.content,
                    explanation: question.explanation ?? null,
                    isCorrect: false,
                });

                continue;
            }

            const isCorrect =
                existing.selectedOptionId === correctOption.id;

            if (isCorrect) correctCount += 1;

            if (isCorrect !== existing.isCorrect) {
                await quizRepository.upsertAnswer({
                    attemptId,
                    questionId: question.id,
                    order: question.order,
                    questionContent: question.content,
                    selectedOptionId: existing.selectedOptionId,
                    selectedContent: existing.selectedContent,
                    correctOptionId: correctOption.id,
                    correctContent: correctOption.content,
                    explanation: question.explanation ?? null,
                    isCorrect,
                });
            }
        }

        const totalQuestions = quiz.questions.length;
        const score =
            totalQuestions > 0
                ? Math.round(
                    (correctCount / totalQuestions) * 100
                )
                : 0;

        await quizRepository.updateAttempt(attemptId, {
            submittedAt: new Date(),
            correctCount,
            totalQuestions,
            score,
        });

        let lessonCompletion = null;

        if (score >= quiz.passingScore) {
            try {
                lessonCompletion =
                    await learningService.refreshLessonCompletion(
                    {
                        lessonId: quiz.lessonId,
                        studentId,
                    }
                );
            } catch (completionError) {
                console.error(
                    "Sync lesson completion error:",
                    completionError
                );
            }
        }

        const review =
            await quizRepository.findAttemptById(attemptId);

        return {
            ...toReview(review, quiz.passingScore),
            lessonCompletion,
        };
    },

    async getAttemptResult({ attemptId, studentId }) {
        const attempt =
            await quizRepository.findAttemptById(attemptId);

        assertStudentAttempt(attempt, studentId);

        if (!attempt.submittedAt) {
            throw createError(
                "Bài làm chưa được nộp.",
                400
            );
        }

        return toReview(
            attempt,
            attempt.quiz?.passingScore ?? 70
        );
    },
};

export default quizService;
