import env from './env.js';

const defaultOrigins = [
    'http://stady.io.vn',
    'https://stady.io.vn',
    'http://localhost:5173',
];

const allowedOrigins =
    env.CORS_ORIGINS.length > 0
        ? env.CORS_ORIGINS
        : defaultOrigins;

export default allowedOrigins;
