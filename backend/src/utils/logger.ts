import pino, { type LoggerOptions } from 'pino';

const pinoOptions: LoggerOptions = {
    level: process.env.LOG_LEVEL || 'info',
};

if (process.env.NODE_ENV === 'development') {
    pinoOptions.transport = {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
        },
    };
}

export const logger = pino(pinoOptions);