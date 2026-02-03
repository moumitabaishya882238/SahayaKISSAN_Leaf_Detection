const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const sensorRoutes = require("./routes/sensorRoutes");
const leafRoutes = require("./routes/leafRoutes");
const leafHistoryRoutes = require("./routes/leafHistoryRoutes");

// -------------------- ENV SETUP --------------------
dotenv.config();

// -------------------- APP INIT --------------------
const app = express();
const PORT = process.env.PORT || 5000;

// -------------------- DB CONNECT --------------------
connectDB();

// -------------------- CORS OPTIONS --------------------
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests from Vercel domains or localhost
    const allowedOrigins = [
      "http://localhost:5173",
      "https://sahaya-kissan-leaf-detection.vercel.app/",
    ];

    // Allow all Vercel preview deployments
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      origin.endsWith(".vercel.app")
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type"],
  credentials: true,
};

// -------------------- MIDDLEWARES --------------------
app.use(cors(corsOptions));
app.use(express.json());

// -------------------- HEALTH CHECK --------------------
app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "IoT Backend is running",
    time: new Date(),
  });
});

// -------------------- ROUTES --------------------
app.use("/api-sensor", sensorRoutes);
app.use("/api", leafRoutes);
app.use("/api-leaf", leafHistoryRoutes);

// -------------------- SERVER START --------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running at ${PORT}`);
});
