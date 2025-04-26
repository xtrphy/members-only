const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

router.post('/join-community', async (req, res) => {
    try {
        const userId = req.user.id;
        const { password } = req.body;

        if (password !== '123456789') {
            return res.status(400).render('community', { message: 'Incorrect password' });
        }

        await pool.query(
            'UPDATE users SET role = $1 WHERE id = $2',
            ['member', userId]
        );

        res.redirect('club', { title: 'Anonymous Hackers Club' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;