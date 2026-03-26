// routes/googleAuth.js
import express from 'express';
import passport from 'passport';
import session from 'express-session';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import { generateToken } from './auth.js';
import dotenv from 'dotenv';
dotenv.config(); // Load env variables

const router = express.Router();

// Load from .env
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;
const FRONTEND_URL = process.env.FRONTEND_URL;
const SESSION_SECRET = process.env.SESSION_SECRET;

// Express session setup (required by Passport)
router.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

// Passport middleware
router.use(passport.initialize());
router.use(passport.session());

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email,
            googleId: profile.id,
            role: 'user',
            isActive: true,
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Serialize & Deserialize
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-password');
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Route: Google login entry
router.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

// Route: Callback handler (merged and fixed)
router.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: `${FRONTEND_URL}/login` }),
  async (req, res) => {
    try {
      // Update lastLogin time for this user
      await User.findByIdAndUpdate(req.user._id, { lastLogin: new Date() });

      // Generate token
      const token = generateToken(req.user._id);

      // Redirect to frontend OAuth callback handler with token
      res.redirect(`${FRONTEND_URL}/oauth/callback?token=${token}`);
    } catch (err) {
      console.error('Google callback error:', err);
      res.redirect(`${FRONTEND_URL}/login`);
    }
  }
);

export default router;
