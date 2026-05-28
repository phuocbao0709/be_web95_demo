const mongoose = require("mongoose")

let connectionPromise = null

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection
    }

    if (!connectionPromise) {
      connectionPromise = mongoose.connect(
        process.env.MONGODB_AUTH +
          process.env.MONGODB_HOSTS +
          process.env.MONGODB_DB +
          process.env.MONGODB_OPTIONS
      )
    }

    await connectionPromise
    console.log("Connected to MongoDB")
    return mongoose.connection
  } catch (error) {
    connectionPromise = null
    console.error("Error connecting to MongoDB:", error)
    throw error
  }
}

module.exports = connectDB
