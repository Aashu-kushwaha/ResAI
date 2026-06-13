const jwt = require("jsonwebtoken")
const TokenBlackListModel = require("../models/blacklist.model.js")

async function authUser(req, res, next) {
  const token = req.cookies.token
  if (!token) {
    return res.status(401).json({
      message: "Token not provided."
    })
  }
  const isTokenBlackListed = await TokenBlackListModel.findOne({token})
      if(isTokenBlackListed){
        return res.status(401).json({
          message:"Token is invalid."
        })
      }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)//Everything that is related to this token we stored in decoded
    req.user = decoded//Everything found through this token stored in req.user
    next()
  } catch (err) {
    return res.status(401).json({
      message: "Invalid token."
    })
  }
}
module.exports = {authUser}