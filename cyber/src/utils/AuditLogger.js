const winston = require('winston');
const path = require('path');

class AuditLogger {
    constructor(options = {}) {
        this.logger = winston.createLogger({
            level: options.level || 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
            transports: [
                new winston.transports.File({
                    filename: path.join(__dirname, '../../logs/audit.log'),
                    maxsize: 5242880, // 5MB
                    maxFiles: 5,
                }),
                new winston.transports.Console({
                    format: winston.format.simple()
                })
            ]
        });
    }

    logAttempt(context) {
        this.logger.info('Verification attempt', {
            timestamp: new Date().toISOString(),
            ip: context.ip,
            userAgent: context.userAgent,
            userId: context.userId
        });
    }

    logResult(context, result) {
        this.logger.info('Verification result', {
            timestamp: new Date().toISOString(),
            ip: context.ip,
            userAgent: context.userAgent,
            userId: context.userId,
            success: result.found,
            algorithm: result.algorithm
        });
    }

    logError(context, error) {
        this.logger.error('Verification error', {
            timestamp: new Date().toISOString(),
            ip: context.ip,
            userAgent: context.userAgent,
            userId: context.userId,
            error: error.message,
            stack: error.stack
        });
    }
}

module.exports = { AuditLogger }; 