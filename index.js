const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
require('dotenv').config()
const connectDB = require('./config/db')
const router = require('./routes')

const app = express()

const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.FRONTEND_PREVIEW_URL
].filter(Boolean)

app.use(cors({
    origin : allowedOrigins.length ? allowedOrigins : true,
    credentials : true
}))
app.use(express.json())
app.use(cookieParser())

app.get("/",(req,res)=>{
    res.json({
        success : true,
        message : "Backend is running"
    })
})

app.use("/api",router)

const PORT = process.env.PORT || 8080

connectDB().catch((error)=>{
    console.error("Database bootstrap failed", error)
})

if (require.main === module) {
    app.listen(PORT,()=>{
        console.log("connnect to DB")
        console.log("Server is running "+PORT)
    })
}

module.exports = app
