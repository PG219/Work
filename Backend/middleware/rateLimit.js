import Redis from "ioredis";

const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const redisClient = new Redis({ host: REDIS_HOST, port: REDIS_PORT });

redisClient.on('error', (err) => {
    console.error('Redis Connection Error:', err);
});

// --- Configuration ---
const TOTAL_REQUEST_LIMIT = 500;
// ---------------------

/**
 * This is an ASYNC middleware to check a user's total request quota.
 * It must run *after* your authentication middleware.
 */
export const userQuotaLimiter = async (req, res, next) => {
    // 1. Make sure the user is authenticated
    if (!req.user || !req.user._id) {
        console.error("Quota limiter: req.user._id is missing.");
        // You must have user auth before this middleware
        return res.status(401).json({ 
            success: false, 
            message: "Unauthorized" 
        });
    }

    // 2. Create a persistent key for the user
    // This key will NOT expire
    const key = `quota:user:${req.user._id.toString()}`;

    try {
        // 3. Atomically increment the user's count in Redis
        // This returns the *new* count after adding 1
        const currentCount = await redisClient.incr(key);

        // 4. Check if the new count is *over* the limit
        if (currentCount > TOTAL_REQUEST_LIMIT) {
            // User has exceeded their total quota
            return res.status(429).json({ // 429 Too Many Requests
                success: false,
                message: "You have exceeded your total request quota",
                limit: TOTAL_REQUEST_LIMIT,
            });
        }

        // 5. If count is 500 or less, allow the request to proceed
        next();

    } catch (err) {
        // Handle any Redis errors
        console.error("Redis quota check error:", err);
        next(err); // Pass the error to your global error handler
    }
};