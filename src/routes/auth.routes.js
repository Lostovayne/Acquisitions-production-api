import { signup, signin, signout, getProfile } from '#controllers/auth.controller';
import { authenticateToken } from '#middlewares/auth.middleware';
import express from 'express';

const authRoutes = express.Router();

// Public routes
authRoutes.post('/sign-up', signup);
authRoutes.post('/sign-in', signin);
authRoutes.post('/sign-out', signout);

// Protected routes
authRoutes.get('/profile', authenticateToken, getProfile);

export default authRoutes;
