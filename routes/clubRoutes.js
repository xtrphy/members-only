const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { validationResult } = require('express-validator');
const { messageValidation } = require('./newMessageValidator');

router.get('/', async (req, res) => {
    if (req.isAuthenticated()) {
        try {
            const result = await pool.query(`
            SELECT messages.*, users.username AS author_name
            FROM messages
            JOIN users ON messages.author_id = users.id
            ORDER BY messages.created_at ASC    
        `);

            res.render('club', { title: 'Anonymous Hackers Club', isAuthenticated: req.isAuthenticated(), user: req.user, messages: result.rows });
        } catch (err) {
            console.error('Error while requesting messages:', err);
            res.status(500).send('Server Error');
        }
    } else {
        res.redirect('/log-in');
    }
});

router.get('/new-message', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('new-message', { errors: {}, isAuthenticated: req.isAuthenticated() });
    } else {
        res.redirect('/log-in');
    }
});

router.post('/new-message', messageValidation, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorObj = {};
        errors.array().forEach(error => {
            errorObj[error.path] = error.msg;
        });

        return res.status(400).render('new-message', {
            errors: errorObj
        });
    }

    const { message } = req.body;
    const authorId = req.user.id;

    try {
        const result = await pool.query('INSERT INTO messages (content, author_id) VALUES ($1, $2) RETURNING id', [message, authorId]);

        res.redirect('/club');
    } catch (err) {
        console.error('Error while adding message', err);
        res.status(500).send('Server Error');
    }
});

router.post('/:id/delete', async (req, res) => {
    const messageId = req.params.id;

    if (req.user.role === 'admin') {
        try {
            await pool.query('DELETE FROM messages WHERE id = $1', [messageId]);
            res.redirect('/club');
        } catch (err) {
            console.error('Error deleting message', err);
            res.status(500).send('Server error');
        }
    } else {
        res.render('error')
    }
});

module.exports = router;