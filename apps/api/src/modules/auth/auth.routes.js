import { Router } from 'express';

import auth from '../../middlewares/auth.js';
import { authLimiter } from '../../middlewares/rateLimiter.js';
import authController from './auth.controller.js';

const router = Router();

router.post(
    '/register',
    authLimiter,
    authController.register
);

router.post(
    '/login',
    authLimiter,
    authController.login
);

// Cấp cookie ngắn hạn cho /uploads để URL học liệu
// không phải mang token.
router.get(
    '/media-session',
    auth,
    authController.mediaSession
);

export default router;
