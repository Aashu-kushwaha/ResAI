const express = require("express")
const multer = require("multer")                                 

const authMiddleware = require("../middleware/auth.middleware")
const interviewController = require("../controllers/interview.controller")
const interviewRouter = express.Router()

const upload = multer({ storage: multer.memoryStorage() })         


interviewRouter.post("/",authMiddleware.authUser,upload.single("resume"),interviewController.generateInterviewReportController)

interviewRouter.get("/report/:interviewId",authMiddleware.authUser,interviewController.getInterviewReportController)

interviewRouter.get("/",authMiddleware.authUser,interviewController.getAllInterviewController)

interviewRouter.post("/resume/:interviewReportId",authMiddleware.authUser,interviewController.generateResumePdfController)

module.exports = interviewRouter