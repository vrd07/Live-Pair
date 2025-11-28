import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import prisma from './db.ts';

// Serialize user to session
passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Configure GitHub Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(
        new GitHubStrategy(
            {
                clientID: process.env.GITHUB_CLIENT_ID,
                clientSecret: process.env.GITHUB_CLIENT_SECRET,
                callbackURL: 'http://localhost:1234/auth/github/callback',
            },
            async (accessToken: string, refreshToken: string, profile: any, done: any) => {
                try {
                    // Find or create user
                    const user = await prisma.user.upsert({
                        where: { githubId: profile.id },
                        update: {
                            username: profile.username,
                            avatarUrl: profile.photos?.[0]?.value,
                        },
                        create: {
                            githubId: profile.id,
                            username: profile.username,
                            avatarUrl: profile.photos?.[0]?.value,
                        },
                    });
                    return done(null, user);
                } catch (error) {
                    return done(error, null);
                }
            }
        )
    );
} else {
    console.warn("GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET not set. GitHub auth will not work.");
}

export default passport;
