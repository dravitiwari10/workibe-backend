const { Router } = require('express');
const userRouter = Router();

const userController = require('../controllers/user.controller');


/**
 * @route GET /api/users/me
 * @description Get logged-in user's profile
 * @access Private
 */
userRouter.get("/me",  userController.getProfile);

/**
 * @route PUT /api/users/me
 * @description Update logged-in user's profile
 * @access Private
 */
userRouter.put("/me",  userController.updateProfile);

/**
 * @route GET /api/users/:id
 * @description Get a user by ID
 * @access Private
 */
userRouter.get("/:id",  userController.getUserById);

module.exports = userRouter;