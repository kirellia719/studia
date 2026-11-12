// src/modules/learning/learning.controller.js

import learningService from "./learning.service.js";

const learningController = {
  // ==========================================
  // STUDENT
  // Get my enrolled courses
  // GET /enrollment/my-courses
  // ==========================================
  async getMyCourses(req, res, next) {
    try {
      const studentId = req.user.id;

      const { courses, expiredCount } =
        await learningService.getMyCourses({
          studentId,
        });

      return res.status(200).json({
        success: true,
        message:
          "Lấy danh sách khóa học thành công.",
        data: courses,
        meta: {
          expiredCount,
        },
      });
    } catch (error) {
      next(error);
    }
  },
  // ==========================================
  // Get course for learning
  // GET /learning/courses/:courseId
  // ==========================================

  async getCourseForLearning(req, res, next) {
    try {
      const { courseId } = req.params;
      const studentId = req.user.id;

      const data =
        await learningService.getCourseForLearning({
          courseId,
          studentId,
        });

      return res.status(200).json({
        success: true,
        message:
          "Lấy thông tin khóa học thành công.",
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  // ==========================================
  // Access lesson
  // POST /learning/lessons/:lessonId/access
  // ==========================================

  async accessLesson(req, res, next) {
    try {
      const { lessonId } = req.params;
      const studentId = req.user.id;

      const progress =
        await learningService.accessLesson({
          lessonId,
          studentId,
        });

      return res.status(200).json({
        success: true,
        message:
          "Truy cập bài học thành công.",
        data: progress,
      });
    } catch (error) {
      next(error);
    }
  },

  // ==========================================
  // Update video progress
  // PATCH /learning/lessons/:lessonId/progress
  // ==========================================

  async updateVideoProgress(req, res, next) {
    try {
      const { lessonId } = req.params;
      const studentId = req.user.id;

      const completion =
        await learningService.updateVideoProgress({
          lessonId,
          studentId,
          positionSeconds: req.body?.positionSeconds,
          durationSeconds: req.body?.durationSeconds,
        });

      return res.status(200).json({
        success: true,
        message: "Cập nhật tiến độ video thành công.",
        data: completion,
      });
    } catch (error) {
      next(error);
    }
  },

  // ==========================================
  // Reading timer (quy tắc ngầm)
  // POST /learning/lessons/:lessonId/reading
  // ==========================================

  async markReadingComplete(req, res, next) {
    try {
      const { lessonId } = req.params;
      const studentId = req.user.id;

      const completion =
        await learningService.markReadingComplete({
          lessonId,
          studentId,
        });

      return res.status(200).json({
        success: true,
        message: "Đã cập nhật tiến độ bài học.",
        data: completion,
      });
    } catch (error) {
      next(error);
    }
  },

  // ==========================================
  // Get course progress
  // GET /learning/courses/:courseId/progress
  // ==========================================

  async getCourseProgress(req, res, next) {
    try {
      const { courseId } = req.params;
      const studentId = req.user.id;

      const progress =
        await learningService.getCourseProgress({
          courseId,
          studentId,
        });

      return res.status(200).json({
        success: true,
        message:
          "Lấy tiến độ khóa học thành công.",
        data: progress,
      });
    } catch (error) {
      next(error);
    }
  },

  // ==========================================
  // Get lesson progress
  // GET /learning/lessons/:lessonId/progress
  // ==========================================

  async getLessonProgress(req, res, next) {
    try {
      const { lessonId } = req.params;
      const studentId = req.user.id;

      const progress =
        await learningService.getLessonProgress({
          lessonId,
          studentId,
        });

      return res.status(200).json({
        success: true,
        message:
          "Lấy tiến độ bài học thành công.",
        data: progress,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default learningController;
