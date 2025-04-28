const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { registerValidation, loginValidation } = require('./authValidator');
const { validationResult } = require('express-validator');
const passport = require('passport');
const bcrypt = require('bcryptjs');

// Sign-up
router.get('/sign-up', (req, res) => {
    res.render('sign-up', { errors: {}, oldInput: {} });
});

router.post('/sign-up', registerValidation, async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorObj = {};
        errors.array().forEach(error => {
            errorObj[error.path] = error.msg;
        });

        return res.status(400).render('sign-up', {
            errors: errorObj,
            oldInput: {
                username: req.body.username,
            }
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        await pool.query('INSERT INTO users (username, password, role) VALUES ($1, $2, $3)', [
            req.body.username,
            hashedPassword,
            req.body.role
        ]);

        res.redirect('/log-in?registered=true');
    } catch (err) {
        console.error(err);
        next(err);
    }
});


// Log-in
router.get('/log-in', (req, res) => {
    res.render('log-in', { query: req.query, errors: {}, oldInput: {} });
});

router.post('/log-in', loginValidation, (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorObj = {};
        errors.array().forEach(error => {
            errorObj[error.path] = error.msg;
        });

        return res.status(400).render('log-in', {
            errors: errorObj,
            oldInput: {
                username: req.body.username
            },
            query: req.query
        });
    }

    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/log-in'
    })(req, res, next);
});


router.post('/log-out', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});


module.exports = router;