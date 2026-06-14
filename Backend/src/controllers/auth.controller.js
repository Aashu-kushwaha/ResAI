// Purpose: Write all logic of API here
const userModel = require("../models/user.model.js")
const otpModel = require("../models/otp.model.js")
const TokenBlackListModel = require("../models/blacklist.model.js")
const emailservice = require("../services/email.service.js")
const bcrptjs = require("bcryptjs")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")//Use for create randon number

/**
 * Send OTP before registration
 * POST/api/auth/otp-send
 */
async function sendOTPController(req, res) {
  try {
    const { email } = req.body
    if (!email) {
      return res.status(400).json({
        message: "Please enter email."
      })
    }
    const isUserAlreadyExists = await userModel.findOne({ email })
    if (isUserAlreadyExists) {
      return res.status(422).json({
        message: "User already exists with this email."
      })
    }
    const otp = crypto.randomInt(100000, 999999).toString()
    // Delete any existing OTP for this email
    await otpModel.deleteMany({ email })

    // Save OTP with 5 minute expiry
    await otpModel.create({
      email, otp, expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    })

    // Send OTP email
    await emailservice.sendOTPEmail(email, otp)
    return res.status(200).json({
      message: "OTP sent to your email.Valid for 5 minutes.", email
    })
  }
  catch (err) {
    console.error("Send OTP error:", err)
    return res.status(500).json({
      message: "Internal server error."
    })
  }
}

/**
 * @route  registerUserController 
 * @description Register a new user,expects username,email and password
 * @access Public
 */
async function registerUserController(req, res) {
  try {
    const { fullname, username, email, password, otp } = req.body
    if (!fullname || !username || !email || !password || !otp) {
      return res.status(400).json({
        message: "Please enter all details."
      })
    }
    const userAlreadyExists = await userModel.findOne({ $or: [{ username }, { email }] })
    if (userAlreadyExists) {
      return res.status(400).json({
        message: "User already exists with this email."
      })
    }

    // Verify OTP
    const otpRecord = await otpModel.findOne({ email })

    if (!otpRecord) {
      return res.status(401).json({
        message: "OTP expired or not found.Please send a new OTP."
      })
    }
    if (otpRecord.otp !== otp) {
      return res.status(401).json({
        message: "Invalid OTP.Please enter correct OTP."
      })
    }

    if (otpRecord.expiresAt < new Date()) {
      await otpModel.deleteMany({ email })
      return res.status(401).json({
        message: "OTP has expired. Please send a new OTP."
      })
    }
    // OTP valid — delete it
    await otpModel.deleteMany({ email })

    const hash = await bcrptjs.hash(password, 10)
    // Create new user here
    const user = await userModel.create({ fullname, username, email, password: hash })
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }//One day
    )
    //  Send registration email
    await emailservice.sendRegistrationEmail(user.email, user.fullname,)

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000
    })

    res.status(201).json({
      user: { id: user._id, email: user.email, fullname: user.fullname }, token
    })
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error."
    })
  }
}

/**
 * @route  loginUserController 
 * @description login new user,expects email and password
 * @access Public
 */
async function loginUserController(req, res) {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter all details."
      })
    }
    const user = await userModel.findOne({ email })
    if (!user) {
      return res.status(400).json({
        message: "User not exist with this email."
      })
    }
    const isPasswordValid = await bcrptjs.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid email or password."
      })
    }
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    )
    await emailservice.sendLoginEmail(user.email, user.fullname,)

    res.cookie("token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 24 * 60 * 60 * 1000
})
    return res.status(200).json({
      message: "User loggedIn successfully.",
      user: {
        id: user._id, username: user.username, email: user.email
      }
    })
  }
  catch (err) {
    console.log(err)
  }
}
/**
 * @route  loginUserController 
 * @description login new user,expects email and password
 *  @access Public
 */
async function logoutUserController(req, res) {
  const token = req.cookies.token
  if (token) {
    await TokenBlackListModel.create({ token })
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none"
    })
    return res.status(200).json({
      message: "User loggedOut successfully."
    })
  }
  return res.status(200).json({
    message: "Already logged out."
  })
}
/**
 * @route  getMeUserController 
 * @description get the current logged in user details
 *  @access Public
 */
async function getMeController(req,res){
  const user = await userModel.findById(req.user.id)//req.user come from middleware that we created
  res.status(200).json({
    message:"User detailed fetched successfully.",
    user:{
      id:user._id,
      username:user.username,
      email:user.email
    }
  })
}

async function forgotPasswordSendOTPController(req, res) {
  try {
      const { email } = req.body
      if (!email) return res.status(400).json({ message: "Please enter email." })

      const user = await userModel.findOne({ email })
      if (!user) return res.status(404).json({ message: "No account found with this email." })

      const otp = crypto.randomInt(100000, 999999).toString()
      await otpModel.deleteMany({ email })
      await otpModel.create({ email, otp, expiresAt: new Date(Date.now() + 5 * 60 * 1000) })
      await emailservice.sendOTPEmail(email, otp)

      return res.status(200).json({ message: "OTP sent to your email. Valid for 5 minutes.", email })
  } catch (err) {
      console.error(err)
      return res.status(500).json({ message: "Internal server error." })
  }
}

async function forgotPasswordResetController(req, res) {
  try {
    const { email, otp, newPassword } = req.body
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Please enter all details." })
    }

    const otpRecord = await otpModel.findOne({ email })
    if (!otpRecord) return res.status(401).json({ message: "OTP expired or not found." })
    if (otpRecord.otp !== otp) return res.status(401).json({ message: "Invalid OTP." })
    if (otpRecord.expiresAt < new Date()) {
      await otpModel.deleteMany({ email })
      return res.status(401).json({ message: "OTP has expired." })
    }

    await otpModel.deleteMany({ email })
    const hash = await bcrptjs.hash(newPassword, 10)

    // Store the updated user
    const user = await userModel.findOneAndUpdate(
      { email },
      { password: hash },
      { new: true }
    )

    if (!user) {
      return res.status(404).json({ message: "User not found." })
    }

    await emailservice.sendPasswordResetEmail(user.email, user.fullname)

    return res.status(200).json({ message: "Password reset successfully." })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Internal server error." })
  }
}

module.exports = { registerUserController, sendOTPController, loginUserController, logoutUserController,getMeController,forgotPasswordSendOTPController, forgotPasswordResetController }