const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
require('dotenv').config();

router.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('community', { isAuthenticated: req.isAuthenticated(), user: req.user, error: '' });
    } else {
        res.redirect('/log-in');
    }
});

router.post('/', async (req, res) => {
    try {
        const userId = req.user.id;
        const { password } = req.body;

        if (password !== process.env.COMMUNITY_PASSWORD) {
            return res.status(400).render('community', { error: 'Incorrect password', isAuthenticated: req.isAuthenticated(), user: req.user });
        }

        await pool.query(
            'UPDATE users SET role = $1 WHERE id = $2',
            ['member', userId]
        );

        res.redirect('/club');
    } catch (err) {
        console.error(err.message);
        res.status(500).render('error', { isAuthenticated: req.isAuthenticated() });
    }
});

module.exports = router;