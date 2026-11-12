// src/modules/learning/learning.service.js

import learningRepository from "./learning.repository.js";

// ==========================================
// Kiểm tra học sinh được phép học bài này
// Dùng chung cho truy cập bài học và làm trắc nghiệm
// ==========================================

const assertLessonAccess = async ({
  lessonId,
  studentId,
}) => {
  const lesson =
    await learningRepository.findLessonById(lessonId);

  if (!lesson) {
    const error = new Error(
      "Không tìm thấy bài học."
    );
    error.statusCode = 404;
    throw error;
  }

  const course = lesson.course;

  if (!course) {
    const error = new Error(
      "Không tìm thấy khóa học của bài học."
    );
    error.statusCode = 404;
    throw error;
  }

  if (course.isDelete) {
    const error = new Error(
      "Khóa học đã bị xóa."
    );
    error.statusCode = 404;
    throw error;
  }

  if (!course.status) {
    const error = new Error(
      "Khóa học hiện đang tạm khóa."
    );
    error.statusCode = 403;
    throw error;
  }

  const enrollment =
    await learningRepository.findEnrollment({
      studentId,
      courseId: course.id,
    });

  // ------------------------------------------
  // Bài miễn phí: học sinh chưa đăng ký vẫn xem được.
  // Các bài còn lại bắt buộc phải tham gia khóa học.
  // ------------------------------------------

  // Bài miễn phí luôn xem được, kể cả khi chưa đăng ký
  // hoặc khóa học đã hết hạn.
  if (lesson.isFree) {
    return { lesson, course, enrollment };
  }

  if (!enrollment) {
    const error = new Error(
      "Bạn cần đăng ký khóa học để xem bài học này."
    );
    error.statusCode = 403;
    throw error;
  }

  if (enrollment.expiresAt <= new Date()) {
    const error = new Error(
      "Thời hạn học khóa học đã hết."
    );
    error.statusCode = 403;
    throw error;
  }

  return { lesson, course, enrollment };
};

// ==========================================
// Quy tắc hoàn thành bài học
//
// - Có video: xem >= 90% thời lượng.
// - Không có video: ở lại bài >= 10 giây.
// - Nếu giáo viên bật bắt buộc ôn tập:
//   phải có lượt làm đạt điểm của đề đã publish.
// ==========================================

const VIDEO_COMPLETION_RATIO = 0.9;
const READING_COMPLETION_SECONDS = 10;

const hasWatchedVideo = (progress) =>
  Boolean(
    progress &&
      progress.videoDurationSeconds > 0 &&
      progress.videoPositionSeconds >=
        Math.floor(
          progress.videoDurationSeconds *
            VIDEO_COMPLETION_RATIO
        )
  );

const hasReadLesson = (progress) =>
  Boolean(
    progress?.lastAccessedAt &&
      Date.now() -
        new Date(progress.lastAccessedAt).getTime() >=
        READING_COMPLETION_SECONDS * 1000
  );

const buildCompletionState = ({
  lesson,
  progress,
  quiz,
  quizPassed,
}) => {
  const quizRequired = Boolean(
    quiz?.requiresPassForCompletion &&
      quiz?._count?.questions > 0
  );

  const videoRequired = Boolean(lesson.video);

  return {
    isCompleted: Boolean(progress?.completedAt),
    completedAt: progress?.completedAt ?? null,
    videoRequired,
    videoCompleted: videoRequired
      ? hasWatchedVideo(progress)
      : null,
    videoPositionSeconds:
      progress?.videoPositionSeconds ?? 0,
    videoDurationSeconds:
      progress?.videoDurationSeconds ?? 0,
    quizRequired,
    quizPassed: quizRequired ? quizPassed : null,
    passingScore: quiz?.passingScore ?? null,
  };
};

const evaluateLessonCompletion = async ({
  lesson,
  studentId,
  progress,
}) => {
  const quiz =
    await learningRepository.findPublishedQuizByLesson(
      lesson.id
    );

  const quizRequired = Boolean(
    quiz?.requiresPassForCompletion &&
      quiz?._count?.questions > 0
  );

  const quizPassed = quizRequired
    ? await learningRepository.hasPassedQuizAttempt({
        quizId: quiz.id,
        studentId,
        passingScore: quiz.passingScore,
      })
    : false;

  let current = progress;

  if (current && !current.completedAt) {
    // Bài có video: phải xem đủ 90% và (nếu bật) đạt đề.
    // Bài không có video: đọc 10 giây; nếu bắt buộc đề
    // thì đạt đề là đủ, không cần chờ thêm.
    const canComplete = lesson.video
      ? hasWatchedVideo(current) &&
        (!quizRequired || quizPassed)
      : quizRequired
        ? quizPassed
        : hasReadLesson(current);

    if (canComplete) {
      current =
        await learningRepository.updateLessonProgress({
          studentId,
          lessonId: lesson.id,
          data: {
            completedAt: new Date(),
          },
        });
    }
  }

  return {
    progress: current,
    completion: buildCompletionState({
      lesson,
      progress: current,
      quiz,
      quizPassed,
    }),
  };
};

const learningService = {
  assertLessonAccess,

  async getMyCourses({ studentId }) {
    const [enrollments, expiredCount] =
      await Promise.all([
        learningRepository.findByStudentId(studentId),
        learningRepository.countExpiredByStudentId(studentId),
      ]);

    const courses = await Promise.all(
      enrollments.map(async (enrollment) => {
        const totalLessons =
          await learningRepository.countLessonsByCourseId(
            enrollment.courseId
          );

        const completedLessonIds =
          await learningRepository.findCompletedLessonIdsByStudentAndCourse(
            {
              studentId,
              courseId: enrollment.courseId,
            }
          );

        const completedLessons =
          completedLessonIds.length;

        const progress =
          totalLessons > 0
            ? Math.round(
              (completedLessons /
                totalLessons) *
              100
            )
            : 0;

        return {
          ...enrollment,
          course: {
            ...enrollment.course,
            totalLessons,
            completedLessons,
            progress,
          },
        };
      })
    );

    return {
      courses,
      expiredCount,
    };
  },
  // ==========================================
  // Get course for learning
  // ==========================================

  async getCourseForLearning({
    courseId,
    studentId,
  }) {
    // ------------------------------------------
    // 1. Find course
    // ------------------------------------------

    const course =
      await learningRepository.findCourseById(
        courseId
      );

    if (!course) {
      const error = new Error(
        "Không tìm thấy khóa học."
      );
      error.statusCode = 404;
      throw error;
    }

    // ------------------------------------------
    // 2. Check soft delete
    // ------------------------------------------

    if (course.isDelete) {
      const error = new Error(
        "Khóa học đã bị xóa."
      );
      error.statusCode = 404;
      throw error;
    }

    // ------------------------------------------
    // 3. Check course status
    // true  = đang mở
    // false = tạm khóa
    // ------------------------------------------

    if (!course.status) {
      const error = new Error(
        "Khóa học hiện đang tạm khóa."
      );
      error.statusCode = 403;
      throw error;
    }

    // ------------------------------------------
    // 4. Check enrollment
    //
    // Không bắt buộc: học sinh chưa đăng ký vẫn
    // xem được các bài miễn phí.
    // ------------------------------------------

    const enrollment =
      await learningRepository.findEnrollment({
        studentId,
        courseId,
      });

    // ------------------------------------------
    // 5. Check enrollment expiration
    // ------------------------------------------

    const now = new Date();

    const hasFullAccess = Boolean(
      enrollment && enrollment.expiresAt > now
    );

    // ------------------------------------------
    // 6. Get lessons
    // ------------------------------------------

    const lessons =
      await learningRepository.findLessonsByCourseId(
        courseId
      );

    // ------------------------------------------
    // 7. Get student's progress
    // ------------------------------------------

    const progressList =
      await learningRepository.findLessonProgressByCourse({
        studentId,
        courseId,
      });

    // ------------------------------------------
    // 8. Create progress map
    // ------------------------------------------

    const progressMap = new Map(
      progressList.map((progress) => [
        progress.lessonId,
        progress,
      ])
    );

    // ------------------------------------------
    // 9. Best quiz score per lesson
    // ------------------------------------------

    const publishedQuizIds = lessons
      .filter(
        (lesson) =>
          lesson.quiz?.isPublished &&
          lesson.quiz._count.questions > 0
      )
      .map((lesson) => lesson.quiz.id);

    const quizAttempts =
      await learningRepository.findQuizAttemptScores({
        quizIds: publishedQuizIds,
        studentId,
      });

    const bestScoreMap = new Map();

    quizAttempts.forEach((attempt) => {
      const current = bestScoreMap.get(attempt.quizId);

      if (
        attempt.score !== null &&
        (current === undefined || attempt.score > current)
      ) {
        bestScoreMap.set(attempt.quizId, attempt.score);
      }
    });

    // ------------------------------------------
    // 10. Merge lesson + progress + quiz summary
    // ------------------------------------------

    const lessonsWithProgress =
      lessons.map((lesson) => {
        const progress =
          progressMap.get(lesson.id);

        // Bài không miễn phí chỉ mở khi học sinh
        // đã đăng ký khóa học.
        const isLocked =
          !hasFullAccess && !lesson.isFree;

        const quiz =
          lesson.quiz?.isPublished &&
          lesson.quiz._count.questions > 0
            ? {
              id: lesson.quiz.id,
              title: lesson.quiz.title,
              passingScore:
                lesson.quiz.passingScore,
              totalQuestions:
                lesson.quiz._count.questions,
              bestScore:
                bestScoreMap.get(lesson.quiz.id) ??
                null,
              requiresPassForCompletion: Boolean(
                lesson.quiz
                  .requiresPassForCompletion
              ),
              quizPassed:
                (bestScoreMap.get(lesson.quiz.id) ??
                  null) !== null &&
                bestScoreMap.get(lesson.quiz.id) >=
                  lesson.quiz.passingScore,
            }
            : null;

        return {
          ...lesson,
          quiz,

          isLocked,

          // Không trả link video/tài liệu của bài
          // bị khóa cho học sinh chưa đăng ký.
          video: isLocked ? null : lesson.video,
          documents: isLocked
            ? []
            : lesson.documents,

          // completedAt có giá trị
          // => bài học đã hoàn thành
          isCompleted:
            progress?.completedAt !== null &&
            progress?.completedAt !== undefined,

          completedAt:
            progress?.completedAt ?? null,

          lastAccessedAt:
            progress?.lastAccessedAt ?? null,

          videoPositionSeconds:
            progress?.videoPositionSeconds ?? 0,

          videoDurationSeconds:
            progress?.videoDurationSeconds ?? 0,
        };
      });

    // ------------------------------------------
    // 11. Find continue lesson
    // ------------------------------------------

    const accessibleLessons =
      lessonsWithProgress.filter(
        (lesson) => !lesson.isLocked
      );

    const continueLesson =
      accessibleLessons.find(
        (lesson) => !lesson.isCompleted
      );

    return {
      course,
      lessons: lessonsWithProgress,

      continueLessonId:
        continueLesson?.id ??
        accessibleLessons[0]?.id ??
        null,

      enrollment: hasFullAccess
        ? {
          enrolledAt:
            enrollment.enrolledAt,

          expiresAt:
            enrollment.expiresAt,
        }
        : null,

      enrollmentExpired: Boolean(
        enrollment && enrollment.expiresAt <= now
      ),
    };
  },

  // ==========================================
  // Access lesson
  // ==========================================

  async accessLesson({
    lessonId,
    studentId,
  }) {
    await learningService.assertLessonAccess({
      lessonId,
      studentId,
    });

    const now = new Date();

    // ------------------------------------------
    // 5. Find existing progress
    // ------------------------------------------

    const existingProgress =
      await learningRepository.findLessonProgress({
        studentId,
        lessonId,
      });

    // ------------------------------------------
    // 6. Progress already exists
    // ------------------------------------------

    if (existingProgress) {
      return learningRepository.updateLessonProgress({
        studentId,
        lessonId,
        data: {
          lastAccessedAt: now,
        },
      });
    }

    // ------------------------------------------
    // 7. Create progress
    // ------------------------------------------

    return learningRepository.createLessonProgress({
      studentId,
      lessonId,
      lastAccessedAt: now,
    });
  },

  // ==========================================
  // Complete lesson
  // ==========================================

  // ==========================================
  // Video progress
  // PATCH /learning/lessons/:lessonId/progress
  // ==========================================

  async updateVideoProgress({
    lessonId,
    studentId,
    positionSeconds,
    durationSeconds,
  }) {
    const { lesson } =
      await learningService.assertLessonAccess({
        lessonId,
        studentId,
      });

    const existingProgress =
      await learningRepository.findLessonProgress({
        studentId,
        lessonId,
      });

    const reportedDuration = Math.max(
      0,
      Math.floor(Number(durationSeconds) || 0)
    );

    // Thời lượng lưu trong bài học là nguồn chuẩn;
    // không tin thời lượng do client gửi lên.
    const lessonDuration = Math.max(
      0,
      Math.floor(Number(lesson.duration) || 0)
    );

    const effectiveDuration =
      lessonDuration > 0
        ? lessonDuration
        : reportedDuration > 0
          ? reportedDuration
          : existingProgress?.videoDurationSeconds ?? 0;

    const rawPosition = Math.max(
      0,
      Math.floor(Number(positionSeconds) || 0)
    );

    const safePosition =
      effectiveDuration > 0
        ? Math.min(rawPosition, effectiveDuration)
        : rawPosition;

    let progress;

    if (!existingProgress) {
      progress =
        await learningRepository.createLessonProgress({
          studentId,
          lessonId,
          lastAccessedAt: new Date(),
          videoPositionSeconds: safePosition,
          videoDurationSeconds: effectiveDuration,
        });
    } else {
      progress =
        await learningRepository.updateLessonProgress({
          studentId,
          lessonId,
          data: {
            videoPositionSeconds: safePosition,
            videoDurationSeconds: effectiveDuration,
          },
        });
    }

    const { completion } =
      await evaluateLessonCompletion({
        lesson,
        studentId,
        progress,
      });

    return completion;
  },

  // ==========================================
  // Reading timer (quy tắc ngầm 10 giây)
  // POST /learning/lessons/:lessonId/reading
  // ==========================================

  async markReadingComplete({
    lessonId,
    studentId,
  }) {
    const { lesson } =
      await learningService.assertLessonAccess({
        lessonId,
        studentId,
      });

    const progress =
      await learningRepository.findLessonProgress({
        studentId,
        lessonId,
      });

    if (!progress) {
      return buildCompletionState({
        lesson,
        progress: null,
        quiz: null,
        quizPassed: false,
      });
    }

    const { completion } =
      await evaluateLessonCompletion({
        lesson,
        studentId,
        progress,
      });

    return completion;
  },

  // ==========================================
  // Đồng bộ hoàn thành sau khi học sinh làm đề
  // ==========================================

  async refreshLessonCompletion({
    lessonId,
    studentId,
  }) {
    const lesson =
      await learningRepository.findLessonById(lessonId);

    if (!lesson) return null;

    const progress =
      await learningRepository.findLessonProgress({
        studentId,
        lessonId,
      });

    if (!progress) return null;

    const { completion } =
      await evaluateLessonCompletion({
        lesson,
        studentId,
        progress,
      });

    return completion;
  },

  // ==========================================
  // Get course progress
  // ==========================================

  async getCourseProgress({
    courseId,
    studentId,
  }) {
    // ------------------------------------------
    // 1. Find course
    // ------------------------------------------

    const course =
      await learningRepository.findCourseById(
        courseId
      );

    if (!course) {
      const error = new Error(
        "Không tìm thấy khóa học."
      );
      error.statusCode = 404;
      throw error;
    }

    if (course.isDelete) {
      const error = new Error(
        "Khóa học đã bị xóa."
      );
      error.statusCode = 404;
      throw error;
    }

    // ------------------------------------------
    // 2. Check enrollment
    // ------------------------------------------

    const enrollment =
      await learningRepository.findEnrollment({
        studentId,
        courseId,
      });

    if (!enrollment) {
      const error = new Error(
        "Bạn chưa tham gia khóa học này."
      );
      error.statusCode = 403;
      throw error;
    }

    // ------------------------------------------
    // 3. Check expiration
    // ------------------------------------------

    const now = new Date();

    if (enrollment.expiresAt <= now) {
      const error = new Error(
        "Thời hạn học khóa học đã hết."
      );
      error.statusCode = 403;
      throw error;
    }

    // ------------------------------------------
    // 4. Get lessons
    // ------------------------------------------

    const lessons =
      await learningRepository.findLessonsByCourseId(
        courseId
      );

    // ------------------------------------------
    // 5. Get progress
    // ------------------------------------------

    const progressList =
      await learningRepository.findLessonProgressByCourse({
        studentId,
        courseId,
      });

    // ------------------------------------------
    // 6. Calculate progress
    // ------------------------------------------

    const completedLessonIds = new Set(
      progressList
        .filter(
          (progress) =>
            progress.completedAt !== null
        )
        .map(
          (progress) =>
            progress.lessonId
        )
    );

    const totalLessons = lessons.length;

    const completedLessons =
      completedLessonIds.size;

    const progress =
      totalLessons > 0
        ? Math.round(
          (completedLessons /
            totalLessons) *
          100
        )
        : 0;

    return {
      courseId,
      totalLessons,
      completedLessons,
      progress,
    };
  },

  // ==========================================
  // Get lesson progress
  // ==========================================

  async getLessonProgress({
    lessonId,
    studentId,
  }) {
    // ------------------------------------------
    // 1. Find lesson
    // ------------------------------------------

    const lesson =
      await learningRepository.findLessonById(
        lessonId
      );

    if (!lesson) {
      const error = new Error(
        "Không tìm thấy bài học."
      );
      error.statusCode = 404;
      throw error;
    }

    const course = lesson.course;

    // ------------------------------------------
    // 2. Check course
    // ------------------------------------------

    if (!course) {
      const error = new Error(
        "Không tìm thấy khóa học của bài học."
      );
      error.statusCode = 404;
      throw error;
    }

    if (course.isDelete) {
      const error = new Error(
        "Khóa học đã bị xóa."
      );
      error.statusCode = 404;
      throw error;
    }

    // ------------------------------------------
    // 3. Check enrollment
    // ------------------------------------------

    const enrollment =
      await learningRepository.findEnrollment({
        studentId,
        courseId: course.id,
      });

    if (!lesson.isFree && !enrollment) {
      const error = new Error(
        "Bạn chưa tham gia khóa học này."
      );
      error.statusCode = 403;
      throw error;
    }

    // ------------------------------------------
    // 4. Check expiration
    // ------------------------------------------

    const now = new Date();

    if (
      !lesson.isFree &&
      enrollment &&
      enrollment.expiresAt <= now
    ) {
      const error = new Error(
        "Thời hạn học khóa học đã hết."
      );
      error.statusCode = 403;
      throw error;
    }

    // ------------------------------------------
    // 5. Get progress
    // ------------------------------------------

    const progress =
      await learningRepository.findLessonProgress({
        studentId,
        lessonId,
      });

    return {
      lessonId,

      isCompleted:
        progress?.completedAt !== null &&
        progress?.completedAt !== undefined,

      completedAt:
        progress?.completedAt ?? null,

      lastAccessedAt:
        progress?.lastAccessedAt ?? null,
    };
  },
};

export default learningService;
