const mongoose = require("mongoose")
const blackListTokenSchema = new mongoose.Schema({
  token:{
    type:String,
    required:[true,"Token is required to be added in Blacklist"]
  }
},{
  timestamps:true
})
const TokenBlackListModel = mongoose.model("BlacklistToken",blackListTokenSchema)

module.exports = TokenBlackListModel