const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const connectDB = require("./config/db");
const router = require("./routes");
const stripeWebhook = require("./controller/payment/stripeWebhook");

const app = express();

const configuredOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_PREVIEW_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

const allowedOrigins = [...new Set(configuredOrigins)];

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin not allowed by CORS: ${origin}`));
  },
  credentials: true,
  optionsSuccessStatus: 204,
};

app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook,
);

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Backend is running",
  });
});
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api", router);

const PORT = process.env.PORT || 8080;

connectDB().catch((error) => {
  console.error("Database bootstrap failed", error);
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log("connnect to DB");
    console.log("Server is running " + PORT);
  });
}

module.exports = app;
