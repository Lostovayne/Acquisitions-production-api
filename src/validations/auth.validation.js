import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(2).max(255).trim(),
  email: z.email().max(255).toLowerCase().trim(),
  password: z.string().min(6).max(120).trim(),
  rol: z.enum(['user', 'admin']),
});

export const loginSchema = z.object({
  email: z.email().max(255).toLowerCase().trim(),
  password: z.string().min(1).trim(),
});
