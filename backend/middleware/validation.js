const { body, validationResult } = require('express-validator');

/**
 * Signup validation rules for Sisterhood Initiative
 * Simplified schema: full_name, email, phone, referral_source, goals, newsletter_opt_in
 */
const signupValidation = [
    // Full name - required, 2-100 characters
    body('full_name')
        .trim()
        .notEmpty().withMessage('Full name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    
    // Email - required, valid format
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail(),
    
    // Phone - required, 10-15 digits
    body('phone')
        .trim()
        .notEmpty().withMessage('Phone number is required')
        .custom((value) => {
            const digitsOnly = value.replace(/\D/g, '');
            if (digitsOnly.length < 10 || digitsOnly.length > 15) {
                throw new Error('Phone number must be 10-15 digits');
            }
            return true;
        }),
    
    // Referral source - optional
    body('referral_source')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Referral source must be 100 characters or less'),
    
    // Goals - optional, max 1000 characters
    body('goals')
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage('Goals must be 1000 characters or less'),
    
    // Newsletter opt-in - optional boolean
    body('newsletter_opt_in')
        .optional()
        .isBoolean().withMessage('Newsletter opt-in must be true or false')
];

/**
 * Validation middleware to check for errors
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => ({
            field: err.path,
            message: err.msg
        }));
        
        return res.status(400).json({
            error: 'Validation failed',
            message: 'Please correct the following errors',
            details: errorMessages
        });
    }
    
    next();
};

module.exports = {
    signupValidation,
    validate
};