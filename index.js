const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const connectDB = require("./config/db");
const router = require("./routes");
const stripeWebhook = require("./controller/payment/stripeWebhook");

const app = express();
const stableFrontendOrigins = [
  "https://fe-web95-demo-pxo8.vercel.app",
];

const configuredOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_PREVIEW_URL,
]
  .flatMap((value) => String(value || "").split(","))
  .map((value) => value.trim())
  .filter(Boolean);

const allowedOrigins = [...new Set([...stableFrontendOrigins, ...configuredOrigins])];

const isAllowedOrigin = (origin) => {
  if (!origin) {
    return true;
  }

  if (allowedOrigins.includes(origin)) {
    return true;
  }

  try {
    const { protocol, hostname } = new URL(origin);
    const isHttp = protocol === "http:" || protocol === "https:";

    if (!isHttp) {
      return false;
    }

    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return true;
    }

    if (/^fe-web95-demo(?:-[a-z0-9-]+)?\.vercel\.app$/i.test(hostname)) {
      return true;
    }
  } catch (_error) {
    return false;
  }

  return false;
};

const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    console.warn(`Blocked by CORS: ${origin}`);
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
