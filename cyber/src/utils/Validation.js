const Joi = require('joi');

const requestSchema = Joi.object({
    hash: Joi.string().required().min(32).max(128),
    context: Joi.object({
        algorithm: Joi.string().valid('bcrypt', 'md5', 'sha256').default('bcrypt'),
        saltRounds: Joi.number().min(1).max(20).default(10),
        maxAttempts: Joi.number().min(1).max(1000).default(100),
        timeout: Joi.number().min(1000).max(300000).default(30000)
    }).default()
});

function validateRequest(data) {
    const { error } = requestSchema.validate(data, {
        abortEarly: false,
        stripUnknown: true
    });

    if (error) {
        return error.details.map(detail => detail.message).join(', ');
    }

    return null;
}

module.exports = { validateRequest }; 