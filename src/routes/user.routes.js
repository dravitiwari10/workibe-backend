const { Router } = require('express');
const userRouter = Router();
const { protect } = require("../middleware/authMiddleware");

const userController = require('../controllers/user.controller');


/**
 * @route GET /api/users/me
 * @description Get logged-in user's profile
 * @access Private
 */
userRouter.get("/me",  userController.getProfile);
userRouter.get("/", protect,  userController.getAllUsers);
userRouter.patch("/location", protect, userController.updateLocation);
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