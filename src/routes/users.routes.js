import {
  createUserController,
  deleteUserController,
  fetchAllUsers,
  fetchUserById,
  updateUserController,
} from '#controllers/users.controller';
import { authenticateToken, requireAdmin } from '#middlewares/auth.middleware';
import express from 'express';

const userRouter = express.Router();

userRouter.use(authenticateToken);
userRouter.get('/', fetchAllUsers);
userRouter.get('/:id', fetchUserById);
userRouter.post('/', createUserController);
userRouter.put('/:id', updateUserController);
userRouter.delete('/:id', requireAdmin, deleteUserController);

export default userRouter;
