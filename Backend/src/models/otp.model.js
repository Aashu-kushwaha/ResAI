const mongoose = require("mongoose")

const otpSchema = new mongoose.Schema({
  email:{
    type:String,
    unique:[true,"Account already exists with this email address"],
    required:true,
    trim: true,
    lowercase: true,
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid email"],
  },
  otp:{
    type:String,
    require:[true,"Please enter OTP"]
  },
  expiresAt:{
    type:Date,
    required:true,
    index:{expires:0}
  }
})

const otpModel = mongoose.model("otp",otpSchema)

module.exports = otpModel