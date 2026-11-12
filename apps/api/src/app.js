import express from 'express';
import path from 'path';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';

import allowedOrigins from './config/cors.js';

import routes from './routes/index.js';
import notFound from './middlewares/notFound.js';
import { globalLimiter } from './middlewares/rateLimiter.js';
import errorMiddleware from './middlewares/errorMiddleware.js';
import mediaAuth from './middlewares/mediaAuth.js';

const app = express();

// ==========================================
// Security
// ==========================================

app.use(
    helmet({
        crossOriginResourcePolicy: {
            policy: "cross-origin",
        },
    })
);

app.set("trust proxy", 1);

// ==========================================
// CORS
// ==========================================

app.use(
    cors({
        origin: (origin, callback) => {
            // Cho phép request không có Origin
            // Ví dụ: Postman hoặc server-to-server
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
                return callback(null, true);
            }

            return callback(
                new Error('Not allowed by CORS')
            );
        },

        credentials: true,
    })
);

// ==========================================
// Logger
// ==========================================

app.use(
    morgan('dev', {
        // Không log request tĩnh của học liệu
        skip: (req) => req.path.startsWith('/uploads'),
    })
);

// ==========================================
// Body parser
// ==========================================

app.use(express.json());
app.use(
    express.urlencoded({
        extended: true,
    })
);

// ==========================================
// Static files
// ==========================================

const uploadsDir = path.join(process.cwd(), 'uploads');

// Ảnh khóa học: công khai để landing/card dùng trực tiếp
app.use(
    '/uploads/courses',
    express.static(
        path.join(uploadsDir, 'courses')
    )
);

// Học liệu: chỉ người đã đăng nhập mới tải được
app.use(
    '/uploads/lessons',
    mediaAuth,
    express.static(
        path.join(uploadsDir, 'lessons')
    )
);

app.use(
    '/uploads/documents',
    mediaAuth,
    express.static(
        path.join(uploadsDir, 'documents')
    )
);

// ==========================================
// Rate limit
// ==========================================

app.use(globalLimiter);

// ==========================================
// Routes
// ==========================================

app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "API is healthy",
    });
});

app.use('/api', routes);

// ==========================================
// 404
// ==========================================

app.use(notFound);

// ==========================================
// Error handler
// ==========================================

app.use(errorMiddleware);

export default app;