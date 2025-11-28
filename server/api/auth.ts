import express from 'express';
import passport from '../auth.ts';

const router = express.Router();

// Start GitHub Login
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

// GitHub Callback
router.get(
    '/github/callback',
    passport.authenticate('github', { failureRedirect: 'http://localhost:5173/?error=login_failed' }),
    (req, res) => {
        // Successful authentication, redirect home.
        res.redirect('http://localhost:5173/');
    }
);

// Get Current User
router.get('/me', (req, res) => {
    if (req.isAuthenticated()) {
        res.json(req.user);
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ message: 'Logged out' });
    });
});

export default router;
