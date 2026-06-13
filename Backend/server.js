// Purpose: Run server
require("dotenv").config();
const app = require("./src/app.js")
const connectDb = require("./src/config/database.js")
connectDb()
app.listen(3000,()=>{
   console.log("Server is running on 3000")
})