/**
 * Centralized logging utility
 */

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

class Logger {
  /**
   * Format log message with timestamp and level
   */
  static format(level, module, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      module,
      message,
      ...(data && { data })
    };
    return JSON.stringify(logEntry);
  }

  static error(module, message, error = null) {
    const errorData = error instanceof Error 
      ? { message: error.message, stack: error.stack }
      : error;
    console.error(`[${LOG_LEVELS.ERROR}] [${module}] ${message}`, errorData || '');
  }

  static warn(module, message, data = null) {
    console.warn(Logger.format(LOG_LEVELS.WARN, module, message, data));
  }

  static info(module, message, data = null) {
    console.log(Logger.format(LOG_LEVELS.INFO, module, message, data));
  }

  static debug(module, message, data = null) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(Logger.format(LOG_LEVELS.DEBUG, module, message, data));
    }
  }
}

module.exports = Logger;
