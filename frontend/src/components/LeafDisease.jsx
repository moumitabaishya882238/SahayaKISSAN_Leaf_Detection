import { useEffect, useRef, useState } from "react";
import "./LeafDisease.css";
import { calculateSeverity, getAdvisory } from "../utils/severityCalculator";

export default function LeafDisease() {
  const [mode, setMode] = useState("upload");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [sensorData, setSensorData] = useState(null);
  const [severity, setSeverity] = useState(null);
  const [advisory, setAdvisory] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [iotConnected, setIotConnected] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const isSensorDataFresh = (data) => {
    if (!data?.timestamp) return false;
    const dataTime = new Date(data.timestamp).getTime();
    const ageSeconds = (Date.now() - dataTime) / 1000;
    return ageSeconds < 30;
  };

  // Save scan result to database
  const saveScanToDatabase = async (
    predictionData,
    severityLevel,
    advisoryData,
    currentSensorData,
  ) => {
    try {
      const payload = {
        imageUrl: imagePreview || "",
        imagePath: "",
        disease: predictionData.label,
        confidence: predictionData.confidence || 0,
        severity: severityLevel || "MEDIUM",
        temperature: currentSensorData?.temperature,
        humidity: currentSensorData?.humidity,
        soil_moisture: currentSensorData?.soil_moisture,
        recommendations: advisoryData?.actions || [],
      };

      const response = await fetch("http://localhost:5000/api-leaf/history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log("✅ Scan saved to database successfully");
      } else {
        console.error("❌ Failed to save scan to database");
      }
    } catch (err) {
      console.error("Error saving scan to database:", err);
    }
  };

  // Fetch sensor data on component mount and periodicallydaskjdkasjd
  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api-sensor/sensor-data",
        );
        if (response.ok) {
          const data = await response.json();
          if (isSensorDataFresh(data)) {
            setSensorData(data);
            setIotConnected(true);
          } else {
            setSensorData(null);
            setIotConnected(false);
          }
        } else {
          setSensorData(null);
          setIotConnected(false);
        }
      } catch (err) {
        console.error("Failed to fetch sensor data:", err);
        setSensorData(null);
        setIotConnected(false);
      }
    };

    fetchSensorData();
    const interval = setInterval(fetchSensorData, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (mode !== "camera") {
      stopCamera();
      return;
    }

    // Reset preview when switching to camera mode
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setImageFile(null);

    const startCamera = async () => {
      try {
        // Stop any existing stream first
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError("Unable to access camera. Please allow camera permissions.");
        console.error("Camera error:", err);
      }
    };

    startCamera();

    return () => stopCamera();
  }, [mode]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const handleUploadChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file (JPG, PNG, etc.)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Image file is too large. Please upload an image smaller than 5MB.",
      );
      return;
    }

    setError(null);
    setResult(null);
    setImageFile(file);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");

    // Flip the canvas horizontally to correct the mirrored video
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], "leaf-capture.jpg", { type: "image/jpeg" });
      setImageFile(file);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(URL.createObjectURL(blob));
      setResult(null);
      setError(null);
    }, "image/jpeg");
  };

  const handleScan = async () => {
    if (!imageFile) {
      setError("Please select or capture a leaf image first.");
      return;
    }

    setError(null);
    setResult(null);
    setSeverity(null);
    setAdvisory(null);
    setScanning(true);
    setLoading(true);

    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      const [response] = await Promise.all([
        fetch("http://localhost:5000/api/leaf/predict", {
          method: "POST",
          body: formData,
        }),
        new Promise((resolve) => setTimeout(resolve, 1200)),
      ]);

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const errorMessage =
          data.message ||
          data.error ||
          `Server error (${response.status}). Check if Python/TensorFlow is installed.`;
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Check if backend returned an error in the response
      if (data.error) {
        throw new Error(data.message || "Please enter a valid leaf image");
      }

      // Validate response
      if (!data.label) {
        throw new Error("Invalid response from server");
      }

      setResult(data);

      // Fetch latest sensor data after disease detection
      try {
        const sensorResponse = await fetch(
          "http://localhost:5000/api-sensor/sensor-data",
        );
        if (sensorResponse.ok) {
          const latestSensorData = await sensorResponse.json();
          if (isSensorDataFresh(latestSensorData)) {
            setSensorData(latestSensorData);
            setIotConnected(true);

            // Calculate severity with the latest sensor data
            const calculatedSeverity = calculateSeverity(
              data.label,
              latestSensorData,
            );
            setSeverity(calculatedSeverity);

            // Get advisory based on disease and severity
            const advisoryData = getAdvisory(data.label, calculatedSeverity);
            setAdvisory(advisoryData);

            // Speak the advisory recommendations
            speakAdvisory(advisoryData, data.label, calculatedSeverity);

            // Save to database
            saveScanToDatabase(
              data,
              calculatedSeverity,
              advisoryData,
              latestSensorData,
            );
          } else {
            setSensorData(null);
            setIotConnected(false);
          }
        } else {
          // Fallback to existing sensor data if fetch fails
          const calculatedSeverity = calculateSeverity(data.label, sensorData);
          setSeverity(calculatedSeverity);

          const advisoryData = getAdvisory(data.label, calculatedSeverity);
          setAdvisory(advisoryData);

          speakAdvisory(advisoryData, data.label, calculatedSeverity);

          // Save to database
          saveScanToDatabase(
            data,
            calculatedSeverity,
            advisoryData,
            sensorData,
          );
        }
      } catch (sensorErr) {
        console.warn(
          "Failed to fetch sensor data after prediction:",
          sensorErr,
        );
        // Fallback to existing sensor data
        const calculatedSeverity = calculateSeverity(data.label, sensorData);
        setSeverity(calculatedSeverity);

        const advisoryData = getAdvisory(data.label, calculatedSeverity);
        setAdvisory(advisoryData);

        speakAdvisory(advisoryData, data.label, calculatedSeverity);

        // Save to database
        saveScanToDatabase(data, calculatedSeverity, advisoryData, sensorData);
      }
    } catch (err) {
      setError(err.message || "Prediction failed");
    } finally {
      setLoading(false);
      setScanning(false);
    }
  };

  const speakAdvisory = (advisoryData, diseaseLabel, severityLevel) => {
    if (!advisoryData || !window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Prepare the text to speak
    const diseaseName = diseaseLabel.replace(/_/g, " ");
    const severityText =
      severityLevel === "LOW"
        ? "low"
        : severityLevel === "MEDIUM"
          ? "medium"
          : "high";

    let textToSpeak = `Prediction complete. Disease detected: ${diseaseName}. Severity level: ${severityText}. `;
    textToSpeak += `Recommended actions: `;

    advisoryData.actions.forEach((action, index) => {
      textToSpeak += `${index + 1}. ${action}. `;
    });

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const replaySpeech = () => {
    if (advisory && result && severity) {
      speakAdvisory(advisory, result.label, severity);
    }
  };

  const resetSelection = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setResult(null);
    setSeverity(null);
    setAdvisory(null);
    setError(null);
    stopSpeaking();
    // If in camera mode, the camera will automatically restart due to the useEffect
  };

  return (
    <section className="leaf-disease">
      <header className="leaf-disease__header">
        <h2 className="leaf-disease__title">Leaf Disease Detection</h2>
        <p className="leaf-disease__subtitle">
          Choose how you want to scan a tea leaf: use the camera or upload a
          photo.
        </p>
      </header>

      {/* Sensor Data Panel */}
      {iotConnected && sensorData ? (
        <div className="sensor-data-panel">
          <h3 className="sensor-data__title">📊 Live Sensor Data</h3>
          <div className="sensor-data__grid">
            <div className="sensor-item">
              <span className="sensor-label">🌡️ Temperature</span>
              <span className="sensor-value">
                {sensorData.temperature?.toFixed(1) || "N/A"}°C
              </span>
            </div>
            <div className="sensor-item">
              <span className="sensor-label">💧 Humidity</span>
              <span className="sensor-value">
                {sensorData.humidity?.toFixed(1) || "N/A"}%
              </span>
            </div>
            <div className="sensor-item">
              <span className="sensor-label">🌱 Soil Moisture</span>
              <span className="sensor-value">
                {sensorData.soil_moisture?.toFixed(1) || "N/A"}%
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="sensor-data-panel sensor-warning">
          <h3 className="sensor-data__title">⚠️ IoT Device Not Connected</h3>
          <p className="sensor-data__subtitle sensor-warning__text">
            Live sensor data is unavailable. Please connect the ESP32 to get the
            latest readings.
          </p>
          <p className="sensor-warning__hint">
            Ensure the device is powered on and connected to the same network.
          </p>
        </div>
      )}

      <div className="leaf-disease__card">
        <div className="leaf-disease__options">
          <button
            className={`option-button ${mode === "camera" ? "active" : ""}`}
            onClick={() => setMode("camera")}
            disabled={loading}
          >
            Use Camera
          </button>
          <button
            className={`option-button ${mode === "upload" ? "active" : ""}`}
            onClick={() => setMode("upload")}
            disabled={loading}
          >
            Upload Image
          </button>
        </div>

        <div className="leaf-disease__content">
          <div className="preview-panel">
            {mode === "camera" && !imagePreview && (
              <video ref={videoRef} autoPlay playsInline />
            )}
            {mode === "camera" && imagePreview && (
              <img src={imagePreview} alt="Captured leaf" />
            )}
            {mode === "upload" && imagePreview && (
              <img src={imagePreview} alt="Leaf preview" />
            )}
            {!imagePreview && mode !== "camera" && (
              <div className="preview-placeholder">
                No image selected yet. Upload a photo to preview.
              </div>
            )}
            <div className={`scan-overlay ${scanning ? "active" : ""}`}>
              {scanning && (
                <>
                  <div className="scan-line" />
                  Scanning leaf...
                </>
              )}
            </div>
          </div>

          <div className="controls-panel">
            {mode === "upload" && (
              <div className="control-group">
                <label className="upload-label" htmlFor="leaf-upload">
                  📤 Choose image
                </label>
                <input
                  id="leaf-upload"
                  className="file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleUploadChange}
                  disabled={loading}
                />
              </div>
            )}

            {mode === "camera" && (
              <div className="control-group">
                <button
                  className="secondary-button"
                  onClick={handleCapture}
                  disabled={loading}
                >
                  Capture Leaf
                </button>
              </div>
            )}

            <div className="control-group">
              <button
                className="primary-button"
                onClick={handleScan}
                disabled={loading}
              >
                {loading ? "Analyzing..." : "Scan & Predict"}
              </button>
              <button
                className="secondary-button"
                onClick={resetSelection}
                disabled={loading}
              >
                Reset
              </button>
            </div>

            {error && <div className="error-text">{error}</div>}

            {/* Prediction Result */}
            {result && (
              <div className="result-card">
                <div className="result-title">🔍 Prediction</div>
                <div className="result-value">
                  {result.label.replace(/_/g, " ")}
                </div>
                {result.confidence !== undefined && (
                  <div className="result-sub">
                    Confidence: {(result.confidence * 100).toFixed(2)}%
                  </div>
                )}
              </div>
            )}

            {/* Severity Level */}
            {severity && (
              <div className="severity-card">
                <div className="severity-badge">
                  {getAdvisory(result.label, severity).severity}
                </div>
              </div>
            )}

            {/* Advisory Recommendations */}
            {advisory && (
              <div className="advisory-card">
                <div className="advisory-header">
                  <span className="advisory-emoji">{advisory.emoji}</span>
                  <h4 className="advisory-title">{advisory.title}</h4>
                </div>
                <ul className="advisory-actions">
                  {advisory.actions.map((action, index) => (
                    <li key={index} className="action-item">
                      ✔ {action}
                    </li>
                  ))}
                </ul>
                <div className="voice-controls">
                  {isSpeaking ? (
                    <button
                      className="voice-button stop"
                      onClick={stopSpeaking}
                      title="Stop voice"
                    >
                      🔇 Stop Voice
                    </button>
                  ) : (
                    <button
                      className="voice-button replay"
                      onClick={replaySpeech}
                      title="Replay advisory"
                    >
                      🔊 Replay Advisory
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </section>
  );
}
