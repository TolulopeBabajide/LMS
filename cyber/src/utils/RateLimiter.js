class RateLimiter {
    constructor(options = {}) {
        this.windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes
        this.maxRequests = options.maxRequests || 100;
        this.requests = new Map();
    }

    check(context) {
        const key = this.getKey(context);
        const now = Date.now();
        const windowStart = now - this.windowMs;

        // Clean up old requests
        this.cleanup(windowStart);

        // Get current requests for this key
        const requests = this.requests.get(key) || [];

        // Check if limit is exceeded
        if (requests.length >= this.maxRequests) {
            return false;
        }

        // Add new request
        requests.push(now);
        this.requests.set(key, requests);

        return true;
    }

    getKey(context) {
        // Create a unique key based on context
        // This could be IP, user ID, or other identifiers
        return context.ip || 'default';
    }

    cleanup(windowStart) {
        for (const [key, requests] of this.requests.entries()) {
            const validRequests = requests.filter(time => time > windowStart);
            if (validRequests.length === 0) {
                this.requests.delete(key);
            } else {
                this.requests.set(key, validRequests);
            }
        }
    }
}

module.exports = { RateLimiter }; 