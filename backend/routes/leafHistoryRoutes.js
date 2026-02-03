const express = require("express");
const LeafScanHistory = require("../models/LeafScanHistory");

const router = express.Router();

// Get all leaf scan history (latest first)
router.get("/history", async (req, res) => {
  try {
    const history = await LeafScanHistory.find()
      .sort({ timestamp: -1 })
      .limit(200);
    res.json(history);
  } catch (err) {
    console.error("Error fetching leaf scan history:", err);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// Get paginated history
router.get("/history/page/:page", async (req, res) => {
  try {
    const page = parseInt(req.params.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const total = await LeafScanHistory.countDocuments();
    const history = await LeafScanHistory.find()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      data: history,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Error fetching paginated history:", err);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// Get statistics summary
router.get("/history/stats/summary", async (req, res) => {
  try {
    const totalScans = await LeafScanHistory.countDocuments();

    if (totalScans === 0) {
      return res.json({
        totalScans: 0,
        diseaseDistribution: {},
        severityDistribution: {},
      });
    }

    const diseaseAgg = await LeafScanHistory.aggregate([
      {
        $group: {
          _id: "$disease",
          count: { $sum: 1 },
        },
      },
      { $match: { _id: { $ne: null } } },
    ]);

    const severityAgg = await LeafScanHistory.aggregate([
      {
        $group: {
          _id: "$severity",
          count: { $sum: 1 },
        },
      },
      { $match: { _id: { $ne: null } } },
    ]);

    const diseaseDistribution = diseaseAgg.reduce(
      (acc, d) => ({ ...acc, [d._id]: d.count }),
      {},
    );

    const severityDistribution = severityAgg.reduce(
      (acc, s) => ({ ...acc, [s._id]: s.count }),
      {},
    );

    res.json({
      totalScans,
      diseaseDistribution,
      severityDistribution,
    });
  } catch (err) {
    console.error("Error fetching statistics:", err);
    res.status(500).json({
      totalScans: 0,
      diseaseDistribution: {},
      severityDistribution: {},
      error: "Failed to fetch statistics",
    });
  }
});

// Get single scan by ID
router.get("/history/:id", async (req, res) => {
  try {
    const scan = await LeafScanHistory.findById(req.params.id);
    if (!scan) {
      return res.status(404).json({ error: "Scan not found" });
    }
    res.json(scan);
  } catch (err) {
    console.error("Error fetching scan:", err);
    res.status(500).json({ error: "Failed to fetch scan" });
  }
});

// Save new leaf scan
router.post("/history", async (req, res) => {
  try {
    const {
      imageUrl,
      imagePath,
      disease,
      confidence,
      severity,
      temperature,
      humidity,
      soil_moisture,
      recommendations,
    } = req.body;

    const newScan = new LeafScanHistory({
      imageUrl,
      imagePath,
      disease,
      confidence,
      severity,
      temperature,
      humidity,
      soil_moisture,
      recommendations: recommendations || [],
      timestamp: new Date(),
    });

    await newScan.save();
    res.status(201).json(newScan);
  } catch (err) {
    console.error("Error saving leaf scan:", err);
    res.status(500).json({ error: "Failed to save scan" });
  }
});

// Delete leaf scan by ID
router.delete("/history/:id", async (req, res) => {
  try {
    const deleted = await LeafScanHistory.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Scan not found" });
    }
    res.json({ message: "Scan deleted successfully" });
  } catch (err) {
    console.error("Error deleting scan:", err);
    res.status(500).json({ error: "Failed to delete scan" });
  }
});

module.exports = router;
