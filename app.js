const path = require('node:path');
const pool = require('./db/pool');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const authRouter = require('./routes/authRoutes');
const communityRouter = require('./routes/community');
const clubRouter = require('./routes/clubRoutes');

// Set up
dotenv.config();
const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

passport.use(
    new LocalStrategy(async (username, password, done) => {
        try {
            const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
            const user = rows[0];

            if (!user) {
                return done(null, false, { message: 'Incorrect username' });
            }

            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return done(null, false, { message: 'Incorrect password' });
            }

            return done(null, user);

        } catch (err) {
            return done(err);
        }
    })
)

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        const user = rows[0];

        done(null, user);
    } catch (err) {
        done(err);
    }
});


// Basic routes
app.get('/', (req, res) => {
    res.render('index', { isAuthenticated: req.isAuthenticated(), user: req.user });
});

// Log-in, Sign-up, Log-out
app.use('/', authRouter);

// Communitiy Route
app.use('/community', communityRouter);

app.use('/club', clubRouter);


// Start server
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});