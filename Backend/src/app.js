const express = require("express");
const cookieParser = require("cookie-parser")
const app = express()
const cors = require("cors")

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'https://res-ai-seven.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

const authRouter = require("./routes/auth.route.js")
const interviewRouter = require("./routes/interview.routes.js")

app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

module.exports = app;