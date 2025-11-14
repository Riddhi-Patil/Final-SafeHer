import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

function signToken(userId) {
  const secret = process.env.JWT_SECRET || 'safeher_dev_secret';
  return jwt.sign({ sub: userId }, secret, { expiresIn: '7d' });
}

function sanitizeUser(u) {
  return { id: u._id.toString(), name: u.name, email: u.email };
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ error: 'Email already registered' });

    const user = await User.create({ name, email, password });
    const token = signToken(user._id);
    return res.json({ user: sanitizeUser(user), token });
  } catch (err) {
    console.error('Register error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'No account found for this email' });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ error: 'Incorrect password' });

    const token = signToken(user._id);
    return res.json({ user: sanitizeUser(user), token });
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});
export default router;