//Purpose: Create schema of database
const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    unique: [true, "Username already taken"],
    required: true,
  },
  email: {
    type: String,
    unique: [true, "Account already exists with this email address"],
    required: true,
    trim: true,
    lowercase: true,
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid email"],
  },
  password: {
    type: String,
    required: true,
  }
}, {
  timestamps: true
})

const userModel = mongoose.model("Resume_user", userSchema)

module.exports = userModel