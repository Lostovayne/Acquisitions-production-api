import logger from '#config/logger';
import { getAllUsers, getUserById } from '#services/users.service';
import { HTTP_STATUS } from 'src/constants/http-status';

export const fetchAllUsers = async (req, res, next) => {
  try {
    const allUsers = await getAllUsers();
    res.status(HTTP_STATUS.OK).json({ users: allUsers });
  } catch (error) {
    logger.error('Error in getAllUsers controller:', error);
    next(error);
  }
};

export const fetchUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: 'User ID is required' });
    }
    const user = await getUserById(userId);
    if (!user) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: 'User not found' });
    }
    res.status(HTTP_STATUS.OK).json({ user });
  } catch (error) {
    logger.error('Error in getUserById controller:', error);
    next(error);
  }
};
