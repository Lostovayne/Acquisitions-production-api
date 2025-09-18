import express from 'express';

const authRoutes = express.Router();

authRoutes.post('/sign-up', (req, res) => {
  res.send('POST /api/auth/sign-up');
});

authRoutes.post('/sign-in', (req, res) => {
  res.send('POST /api/auth/sign-in');
});

authRoutes.post('/sign-out', (req, res) => {
  res.send('POST /api/auth/sign-out');
});

export default authRoutes;
