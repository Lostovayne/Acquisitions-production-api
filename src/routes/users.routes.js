import { fetchAllUsers, fetchUserById } from '#controllers/users.controller';
import express from 'express';

const userRouter = express.Router();

userRouter.get('/', fetchAllUsers);
userRouter.get('/:id', fetchUserById);
userRouter.post('/', (req, res) => res.send('Create user route is working!'));
userRouter.put('/:id', (req, res) =>
  res.send(`Update user ID: ${req.params.id}`)
);
userRouter.delete('/:id', (req, res) =>
  res.send(`Delete user ID: ${req.params.id}`)
);

export default userRouter;
