const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

const router = express.Router();

const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, safeName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

router.post("/leaf/predict", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Image file is required" });
  }

  const imagePath = req.file.path;
  const scriptPath = path.join(__dirname, "..", "ml", "predict.py");
  const modelPath = path.join(
    __dirname,
    "..",
    "..",
    "Training",
    "tea_leaf_disease_model.keras",
  );
  const classPath = path.join(
    __dirname,
    "..",
    "..",
    "Training",
    "class_names.json",
  );

  const pythonProcess = spawn("python", [
    scriptPath,
    imagePath,
    modelPath,
    classPath,
  ]);

  let stdout = "";
  let stderr = "";

  pythonProcess.stdout.on("data", (data) => {
    stdout += data.toString();
  });

  pythonProcess.stderr.on("data", (data) => {
    stderr += data.toString();
  });

  pythonProcess.on("close", (code) => {
    fs.unlink(imagePath, () => {});

    const output = stdout.trim();

    if (code !== 0) {
      // Try to parse stdout first - it might contain a structured error (legacy format)
      try {
        const result = JSON.parse(output);
        if (result.error) {
          return res.status(400).json({
            error: result.error,
            message: result.message || "Invalid image",
          });
        }
      } catch (e) {
        if (output === "Please enter a valid tea leaf image") {
          return res.status(400).json({
            error: "invalid_image",
            message: output,
          });
        }
      }

      return res.status(500).json({
        error: "Prediction failed",
        details: stderr || "Unknown error",
      });
    }

    try {
      const result = JSON.parse(output);

      if (result.error) {
        return res.status(400).json({
          error: result.error,
          message: result.message || "Invalid image",
        });
      }

      return res.status(200).json(result);
    } catch (err) {
      if (output === "Please enter a valid tea leaf image") {
        return res.status(400).json({
          error: "invalid_image",
          message: output,
        });
      }

      if (output) {
        return res.status(200).json({ label: output });
      }

      return res.status(500).json({
        error: "Invalid prediction output",
        details: stderr || "Empty output",
      });
    }
  });
});

module.exports = router;
