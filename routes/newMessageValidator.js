const { body } = require('express-validator');

exports.messageValidation = [
    body('message')
        .trim()
        .notEmpty()
        .withMessage('Message field can not be empty'),
];