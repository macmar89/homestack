import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import cookieParser from 'cookie-parser';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/error.middleware.js';
import apiRouter from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use(pinoHttp({ logger }));

app.use('/api/v1', apiRouter);

app.use(errorHandler)

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});