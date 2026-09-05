/**
 * Simple Logger for StudyBuddy AI Agent (OpenClaw)
 */
export const logger = {
  info(message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length ? ` | ${JSON.stringify(sanitizeMeta(meta))}` : '';
    console.log(`[INFO] [${timestamp}] ${message}${metaStr}`);
  },
  warn(message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length ? ` | ${JSON.stringify(sanitizeMeta(meta))}` : '';
    console.warn(`[WARN] [${timestamp}] ${message}${metaStr}`);
  },
  error(message, error = null, meta = {}) {
    const timestamp = new Date().toISOString();
    const errMessage = error ? ` - ${error.message || error}` : '';
    const metaStr = Object.keys(meta).length ? ` | ${JSON.stringify(sanitizeMeta(meta))}` : '';
    console.error(`[ERROR] [${timestamp}] ${message}${errMessage}${metaStr}`);
  }
};

/**
 * Ensures sensitive data like API keys are not logged
 */
function sanitizeMeta(meta) {
  const sanitized = { ...meta };
  const sensitiveKeys = ['apiKey', 'token', 'secret', 'password', 'authorization'];
  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some(s => key.toLowerCase().includes(s))) {
      sanitized[key] = '***REDACTED***';
    }
  }
  return sanitized;
}
