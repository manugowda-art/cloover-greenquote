import pino from "pino";

const transport =
  process.env.NODE_ENV === "development"
    ? pino.transport({
        targets: [
          {
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "SYS:standard",
            },
          },
          {
            target: "pino/file",
            options: {
              destination: "./logs/app.log",
              mkdir: true,
            },
          },
        ],
      })
    : pino.destination({
        dest: "./logs/app.log",
        mkdir: true,
        sync: false,
      });

export const logger = pino(
  {
    level: process.env.LOG_LEVEL ?? "info",
    base: {
      service: "cloover-greenquote",
    },
  },
  transport
);