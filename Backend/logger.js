const winston = require("winston");
const expressWinston = require("express-winston");
const fs = require("fs");
const path = require("path");

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, "logs");
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Configure transports (console and file)
const transports = [
    new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(), // Colorize logs for the console
            winston.format.simple(), // Simple output format
        ),
    }),
    new winston.transports.File({
        filename: path.join(logsDir, "app.log"),
        format: winston.format.json(), // JSON format for file logs
    }),
];

// Create a logger with the configured transports
const logger = winston.createLogger({
    level: "info",
    transports: transports,
});

// Middleware for logging API requests
const apiLoggerMiddleware = expressWinston.logger({
    transports: transports,
    format: winston.format.combine(
        winston.format.colorize(), // Colorize logs for the console
        winston.format.timestamp(),
        winston.format.json(),
    ),
    meta: false, // Log additional metadata (such as query parameters)
    msg: "HTTP {{req.method}} {{req.url}} - Body: {{JSON.stringify(req.body)}}",
    expressFormat: true,
    colorize: true, // Enable colorization for the express middleware logs
});

module.exports = {
    logger: logger,
    apiLoggerMiddleware: apiLoggerMiddleware,
};
