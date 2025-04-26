const { body } = require('express-validator');

exports.registerValidation = [
    body('username')
        .trim()
        .notEmpty()
        .withMessage('Username required')
        .isLength({ min: 3, max: 20 })
        .withMessage('Username must be between 3 and 20 characters.')
        .matches(/^[a-zA-Z0-9._]+$/)
        .withMessage('Username can only contain letters, numbers, periods and underscores.'),

    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long'),

    body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match')
            }
            return true;
        }),
];

exports.loginValidation = [
    body('username')
        .trim()
        .notEmpty()
        .withMessage('Username is required'),

    body('password')
        .notEmpty()
        .withMessage('Password is required'),
];