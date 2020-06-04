import { createLogger, format, transports } from 'winston';

const customFormat = format.combine(
  format.errors({ stack: true }),
  format.label({ label: 'BOT' }),
  format.timestamp({ format: 'MM/DD/YYYY HH:mm:ss' }),
  format.printf((info: any): string => {
    const { timestamp, label, level, message, event, ...rest } = info;
    return `[${timestamp}][${label}][${level.toUpperCase()}]${
      event ? `[${event}]` : ''
    }: ${message}${
      Object.keys(rest).length ? `\n${JSON.stringify(rest, null, 2)}` : ''
    }`;
  })
);

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: customFormat,
  transports: [
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' }),
    new transports.Console({ format: customFormat }),
  ],
});

export default logger;
