import express from 'express';
import { db } from '../db/index.js';
import { generateToken, hashPassword, comparePassword, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 1. Standard Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const user = db.findUserByEmail(email);
  if (!user || !comparePassword(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = generateToken(user);
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      vehicleNumber: user.vehicleNumber
    }
  });
});

// 2. 1-Click Demo Login
router.post('/demo-login', (req, res) => {
  const { role } = req.body;
  const targetRole = role || 'seeker';

  const user = Array.from(db.users.values()).find(u => u.role === targetRole);
  if (!user) {
    return res.status(404).json({ error: `No demo account found for role: ${targetRole}` });
  }

  const token = generateToken(user);
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      vehicleNumber: user.vehicleNumber,
      trustScore: user.trustScore,
      verificationTier: user.verificationTier
    }
  });
});

// 3. User Register
router.post('/register', (req, res) => {
  const { name, email, password, role, phone, vehicleNumber } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email, and password required' });
  }

  if (db.findUserByEmail(email)) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  const newUser = {
    id: `user_${Date.now()}`,
    name,
    email,
    passwordHash: hashPassword(password),
    role: role || 'seeker',
    phone: phone || '',
    vehicleNumber: vehicleNumber || '',
    createdAt: new Date().toISOString()
  };

  db.saveUser(newUser);
  const token = generateToken(newUser);

  res.status(201).json({
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      vehicleNumber: newUser.vehicleNumber
    }
  });
});

// 4. Get Current User Session
router.get('/me', authenticateToken, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      phone: req.user.phone,
      vehicleNumber: req.user.vehicleNumber,
      walletBalance: req.user.walletBalance,
      trustScore: req.user.trustScore,
      verificationTier: req.user.verificationTier
    }
  });
});

export default router;
