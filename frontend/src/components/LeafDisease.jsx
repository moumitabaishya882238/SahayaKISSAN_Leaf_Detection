import { useEffect, useRef, useState } from "react";
import "./LeafDisease.css";

export default function LeafDisease() {
  const [mode, setMode] = useState("upload");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (mode !== "camera") {
      stopCamera();
      return;
    }

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError("Unable to access camera. Please allow camera permissions.");
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
        const errorMessage = data.message || data.error || "Prediction failed";
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Check if backend returned an error in the response
      if (data.error) {
        throw new Error(data.message || "Please enter a valid leaf image");
      }

      setResult(data);
    } catch (err) {
      setError(err.message || "Prediction failed");
    } finally {
      setLoading(false);
      setScanning(false);
    }
  };

  const resetSelection = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setResult(null);
    setError(null);
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

            {result && (
              <div className="result-card">
                <div className="result-title">Prediction</div>
                <div className="result-value">{result.label}</div>
                {result.confidence !== undefined && (
                  <div className="result-sub">
                    Confidence: {(result.confidence * 100).toFixed(2)}%
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </section>
  );
}
