const express = require('express');
const rateLimit = require('express-rate-limit');
const PasswordVerifier = require('./core/PasswordVerifier');
const { validateRequest } = require('./utils/Validation');

const app = express();
app.use(express.json());

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);

// Initialize password verifier
const verifier = new PasswordVerifier({
    rateLimit: {
        windowMs: 15 * 60 * 1000,
        maxRequests: 100
    },
    logging: {
        level: 'info'
    }
});

// Verification endpoint
app.post('/verify', async (req, res) => {
    try {
        // Validate request
        const validationError = validateRequest(req.body);
        if (validationError) {
            return res.status(400).json({ error: validationError });
        }

        const { hash, context } = req.body;

        // Verify hash
        const result = await verifier.verifyHash(hash, {
            ...context,
            ip: req.ip,
            userAgent: req.get('user-agent')
        });

        res.json(result);
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 