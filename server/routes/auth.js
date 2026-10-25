import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User, { normalizeGmail } from '../models/User.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'cca_super_secret_jwt_key_2026';

// Helper to generate token
const signToken = (user) => {
  return jwt.sign(
    {
      id: user.id || user._id,
      loginId: user.loginId,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

/**
 * POST /api/auth/login
 * Universal institutional login supporting loginId, email, and password.
 */
router.post('/login', async (req, res) => {
  try {
    const { loginId, email, password, role } = req.body;
    const identifier = (loginId || email || '').trim().toLowerCase();

    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Login ID or Email is required.' });
    }

    const normEmail = normalizeGmail(identifier);
    const query = {
      $or: [
        { loginId: identifier },
        { email: identifier },
        { email: normEmail }
      ]
    };
    if (role) {
      query.role = role;
    }

    let user = await User.findOne(query);

    if (!user) {
      // Auto-fallback: check if this is default dev or admin credentials
      return res.status(404).json({ success: false, message: 'Account not found with these credentials.' });
    }

    // Password verification: support both bcrypt and direct match for initial migrated accounts
    const inputPassword = (password || '').trim();
    const storedPassword = (user.password || '').trim();

    let isMatch = false;
    if (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(inputPassword, storedPassword);
    } else {
      isMatch = inputPassword === storedPassword || (storedPassword === 'password123' && inputPassword === 'password123');
    }

    if (!isMatch && storedPassword) {
      return res.status(401).json({ success: false, message: 'Invalid password.' });
    }

    const token = signToken(user);
    const userObj = user.toObject();
    delete userObj.password;

    res.json({
      success: true,
      token,
      user: userObj
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
});

/**
 * POST /api/auth/google
 * Google OAuth single sign-on / registration
 */
router.post('/google', async (req, res) => {
  try {
    const { googleId, email, name, picture, role } = req.body;
    const cleanEmail = normalizeGmail(email);

    if (!cleanEmail) {
      return res.status(400).json({ success: false, message: 'Email required for Google Authentication.' });
    }

    let user = await User.findOne({
      $or: [{ googleId }, { email: cleanEmail }]
    });

    if (!user) {
      user = new User({
        id: `usr-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        name: name || 'Cadet User',
        email: cleanEmail,
        loginId: cleanEmail.split('@')[0],
        googleId,
        googlePicture: picture || '',
        role: role || 'student',
        password: 'password123'
      });
      await user.save();
    } else {
      // Update google metadata if missing
      if (!user.googleId && googleId) user.googleId = googleId;
      if (picture) user.googlePicture = picture;
      await user.save();
    }

    const token = signToken(user);
    const userObj = user.toObject();
    delete userObj.password;

    res.json({
      success: true,
      token,
      user: userObj
    });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(500).json({ success: false, message: 'Google Authentication failed.' });
  }
});

/**
 * GET /api/auth/me
 * Returns current authenticated profile
 */
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findOne({
      $or: [{ id: decoded.id }, { _id: decoded.id }, { loginId: decoded.loginId }]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userObj = user.toObject();
    delete userObj.password;
    res.json({ success: true, user: userObj });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired session token.' });
  }
});

export default router;
