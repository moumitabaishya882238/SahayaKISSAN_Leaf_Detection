const express = require("express");
const router = express.Router();
const SensorData = require("../models/SensorData");

// -------------------- POST: ESP32 → MONGODB --------------------
router.post("/sensor-data", async (req, res) => {
  try {
    const { temperature, humidity, soil_moisture } = req.body;

    if (
      temperature === undefined ||
      humidity === undefined ||
      soil_moisture === undefined
    ) {
      return res.status(400).json({
        error: "Invalid sensor data",
      });
    }

    const sensorEntry = new SensorData({
      temperature,
      humidity,
      soil_moisture,
    });

    await sensorEntry.save();

    console.log("📥 Sensor Data Stored:", sensorEntry);

    res.status(200).json({
      message: "Sensor data stored successfully",
    });
  } catch (error) {
    console.error("❌ Error saving sensor data:", error.message);
    res.status(500).json({ error: "Database error" });
  }
});

// -------------------- GET: LATEST SENSOR DATA --------------------
router.get("/sensor-data", async (req, res) => {
  try {
    const latestData = await SensorData.findOne().sort({ timestamp: -1 });
    res.status(200).json(latestData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch latest data" });
  }
});

// -------------------- GET: SENSOR HISTORY (FOR GRAPHS) --------------------
router.get("/sensor-history", async (req, res) => {
  try {
    const history = await SensorData.find()
      .sort({ timestamp: -1 })
      .limit(200); // last 200 readings

    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch sensor history" });
  }
});
// GET: LIVE SENSOR DATA FOR AI SEVERITY
router.get("/sensor-live", async (req, res) => {
  try {
    const latest = await SensorData.findOne().sort({ timestamp: -1 });

    if (!latest) {
      return res.status(404).json({ error: "No sensor data available" });
    }

    // Optional freshness check (10 sec)
    const age = Date.now() - new Date(latest.timestamp).getTime();
    if (age > 15000) {
      return res.status(503).json({ error: "Sensor offline" });
    }

    res.status(200).json(latest);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch live sensor data" });
  }
});

module.exports = router;
