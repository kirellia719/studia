// src/modules/learning/learning.repository.js

import { prisma } from "../../config/database.js";

const learningRepository = {

  // ==========================================
  // Get all enrollments of a student
  // ==========================================

  async findByStudentId(studentId) {
    return prisma.enrollment.findMany({
      where: {
        studentId,
        expiresAt: {
          gt: new Date(),
        },
        course: {
          isDelete: false,
          status: true,
        },
      },
      include: {
        course: true,
      },
      orderBy: {
        enrolledAt: "desc",
      },
    });
  },

  async countExpiredByStudentId(studentId) {
    return prisma.enrollment.count({
      where: {
        studentId,
        expiresAt: {
          lte: new Date(),
        },
        course: {
          isDelete: false,
          status: true,
        },
      },
    });
  },

  async countLessonsByCourseId(courseId) {
    return prisma.lesson.count({
      where: {
        courseId,
      },
    });
  },

  async findCompletedLessonIdsByStudentAndCourse({
    studentId,
    courseId,
  }) {
    const progressList =
      await prisma.lessonProgress.findMany({
        where: {
          studentId,
          lesson: {
            courseId,
          },
          completedAt: {
            not: null,
          },
        },
        select: {
          lessonId: true,
        },
      });

    return progressList.map(
      (progress) => progress.lessonId
    );
  },
  // ==========================================
  // Course
  // ==========================================

  async findCourseById(courseId) {
    return prisma.course.findUnique({
      where: {
        id: courseId,
      },
    });
  },

  // ==========================================
  // Enrollment
  // ==========================================

  async findEnrollment({
    studentId,
    courseId,
  }) {
    return prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
    });
  },

  // ==========================================
  // Lesson
  // ==========================================

  async findLessonsByCourseId(courseId) {
    return prisma.lesson.findMany({
      where: {
        courseId,
      },
      include: {
        documents: true,
        quiz: {
          select: {
            id: true,
            title: true,
            passingScore: true,
            isPublished: true,
            requiresPassForCompletion: true,
            _count: {
              select: {
                questions: true,
              },
            },
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    });
  },

  async findQuizAttemptScores({
    quizIds,
    studentId,
  }) {
    if (quizIds.length === 0) return [];

    return prisma.quizAttempt.findMany({
      where: {
        studentId,
        quizId: {
          in: quizIds,
        },
        submittedAt: {
          not: null,
        },
      },
      select: {
        quizId: true,
        score: true,
      },
    });
  },

  async findPublishedQuizByLesson(lessonId) {
    return prisma.quiz.findFirst({
      where: {
        lessonId,
        isPublished: true,
      },
      select: {
        id: true,
        passingScore: true,
        requiresPassForCompletion: true,
        _count: {
          select: {
            questions: true,
          },
        },
      },
    });
  },

  async hasPassedQuizAttempt({
    quizId,
    studentId,
    passingScore,
  }) {
    const attempt = await prisma.quizAttempt.findFirst({
      where: {
        quizId,
        studentId,
        submittedAt: {
          not: null,
        },
        score: {
          gte: passingScore,
        },
      },
      select: {
        id: true,
      },
    });

    return Boolean(attempt);
  },

  async findLessonById(lessonId) {
    return prisma.lesson.findUnique({
      where: {
        id: lessonId,
      },
      include: {
        course: true,
      },
    });
  },

  // ==========================================
  // Lesson Progress
  // ==========================================

  async findLessonProgress({
    studentId,
    lessonId,
  }) {
    return prisma.lessonProgress.findUnique({
      where: {
        studentId_lessonId: {
          studentId,
          lessonId,
        },
      },
    });
  },

  async findLessonProgressByCourse({
    studentId,
    courseId,
  }) {
    return prisma.lessonProgress.findMany({
      where: {
        studentId,
        lesson: {
          courseId,
        },
      },
    });
  },

  async createLessonProgress(data) {
    return prisma.lessonProgress.create({
      data,
    });
  },

  async updateLessonProgress({
    studentId,
    lessonId,
    data,
  }) {
    return prisma.lessonProgress.update({
      where: {
        studentId_lessonId: {
          studentId,
          lessonId,
        },
      },
      data,
    });
  },
};

export default learningRepository;
