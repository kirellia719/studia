import 'dotenv/config';

const required = (name) => {
    const value = process.env[name];

    if (!value) {
        throw new Error(
            `Thiếu biến môi trường ${name}. Xem .env.example để biết các biến cần thiết.`
        );
    }

    return value;
};

const env = {
    NODE_ENV: process.env.NODE_ENV || 'development',

    PORT: Number(process.env.PORT) || 5000,

    DATABASE_URL: process.env.DATABASE_URL || 'mongodb://localhost:27017/studia',

    JWT_SECRET: required('JWT_SECRET'),

    CORS_ORIGINS: (process.env.CORS_ORIGINS || '')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
};

export default env;
