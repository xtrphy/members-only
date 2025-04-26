const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const passport = require('passport');
const bcrypt = require('bcryptjs');

// Sign-up
router.get('/sign-up', (req, res) => {
    res.render('sign-up', { title: 'Sign Up' });
});

router.post('/sign-up', async (req, res, next) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [
            req.body.username,
            hashedPassword,
        ]);
        res.redirect('/log-in');
    } catch (err) {
        console.error(err);
        next(err);
    }
});


// Log-in
router.get('/log-in', (req, res) => {
    res.render('log-in', { title: 'Log In' });
});

router.post(
    "/log-in",
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/log-in"
    })
);


router.post('/log-out', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});


module.exports = router;