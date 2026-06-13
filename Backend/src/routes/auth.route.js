// Purpose: Create API here

// const express  = require("express")
// const authRouter = express.Router()

// OR
const {Router}= require("express")
const authRouter = Router()
const authController = require("../controllers/auth.controller.js")
const authMiddleware = require("../middleware/auth.middleware.js")
// JS comment string
/**
 * @route POST/api/auth/register
 * @description Register a new user
 * @access Public
 */
authRouter.post("/register",authController.registerUserController)
/**
 * @route POST/api/auth/login
 * @description  login user with email and password
 * @access Public
 */
authRouter.post("/login",authController.loginUserController)
/**
 * @route POST/api/auth/send-otp
 * @description  Send OTP during registration
 * @access Public
 */
authRouter.post("/send-otp",  authController.sendOTPController) 
/**
 * @route GET/api/auth/logout
 * @description clear token from user cookie and add the token in Blacklist
 * @access Public
 */
authRouter.get("/logout",authController.logoutUserController)
/**
 * @route GET/api/auth/logout
 * @description clear token from user cookie and add the token in Blacklist
 * @access Public
 */
authRouter.get("/get-me",authMiddleware.authUser,authController.getMeController)
module.exports  = authRouter

authRouter.post("/forgot-password/send-otp", authController.forgotPasswordSendOTPController)

authRouter.post("/forgot-password/reset", authController.forgotPasswordResetController)