const express = require("express");
const cookieParser = require("cookie-parser")
const app= express()//Server initiate
const cors = require("cors")

app.use(express.json()) //
app.use(cookieParser())
app.use(cors({
  origin:"http://localhost:5173",
  credentials:true //Fetch data from backend
}))
const authRouter =require("./routes/auth.route.js")//Require all the route here
const interviewRouter = require("./routes/interview.routes.js")

app.use("/api/auth",authRouter) // Using all the authentication route here
app.use("/api/interview",interviewRouter)

module.exports = app;