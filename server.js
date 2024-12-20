const express = require('express');
const session = require('express-session');
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;

const app = express();

// Учасники
let participants = [];

// Налаштування сесії
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

// Налаштування Steam Strategy
passport.use(new SteamStrategy({
    returnURL: 'http://localhost:3000/auth/steam/return',
    realm: 'http://localhost:3000/',
    apiKey: '0572A781200BCBA0F40670F920BF7B7F' // Вставте ваш Steam API Key
}, (identifier, profile, done) => {
    profile.identifier = identifier;
    return done(null, profile);
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

// Шлях для автентифікації через Steam
app.get('/auth/steam',
    passport.authenticate('steam'),
    (req, res) => {
        // Редирект після входу
    }
);

app.get('/auth/steam/return',
    passport.authenticate('steam', { failureRedirect: '/' }),
    (req, res) => {
        const existingParticipant = participants.find(p => p.steamId === req.user.id);

        if (!existingParticipant) {
            participants.push({
                nickname: req.user.displayName,
                steamId: req.user.id
            });
        }

        res.redirect('/');
    }
);

// API для отримання учасників
app.get('/participants', (req, res) => {
    res.json(participants);
});

// Сервер статичних файлів
app.use(express.static('public'));

// Запуск сервера
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
