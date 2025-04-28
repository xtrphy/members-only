const { body } = require('express-validator');
const pool = require('../db/pool');
const bcrypt = require('bcryptjs');
require('dotenv').config();

exports.registerValidation = [
    body('username')
        .trim()
        .notEmpty()
        .withMessage('Username required')
        .isLength({ min: 3, max: 20 })
        .withMessage('Username must be between 3 and 20 characters.')
        .matches(/^[a-zA-Z0-9._]+$/)
        .withMessage('Username can only contain letters, numbers, periods and underscores.')
        .custom(async (username) => {
            const result = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
            if (result.rows.length > 0) {
                throw new Error('This nickname is already taken');
            }
            return true;
        }),

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

    body('adminPassword')
        .optional()
        .custom(async (adminPassword, { req }) => {
            if (adminPassword === process.env.ADMIN_PASSWORD) {
                req.body.role = 'admin';
            } else {
                req.body.role = 'user';
            }
            return true;
        })
];

exports.loginValidation = [
    body('username')
        .trim()
        .notEmpty()
        .withMessage('Username is required')
        .custom(async (username, { req }) => {
            const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

            if (result.rows.length === 0) {
                throw new Error('This user does not exist');
            }

            req.user = result.rows[0];

            return true;
        }),

    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .custom(async (enteredPassword, { req }) => {

            const user = req.user;
            if (!user) {
                throw new Error('Wrong password or username');
            }

            const isMatch = await bcrypt.compare(enteredPassword, user.password);

            if (!isMatch) {
                throw new Error('Invalid password');
            }

            return true;
        })
];