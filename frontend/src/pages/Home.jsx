import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import "./Home.css";

const API_BASE_URL = "http://localhost:5000/api-sensor";

export default function SensorDashboard() {
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({});
  const [latestData, setLatestData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [iotConnected, setIotConnected] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);

  const formatLastSeen = (timestamp) => {
    if (!timestamp) return "Never";
    const time = new Date(timestamp);
    if (Number.isNaN(time.getTime())) return "Unknown";
    const diffSeconds = Math.floor((Date.now() - time.getTime()) / 1000);
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return time.toLocaleString();
  };

  // Fetch sensor data from backend
  const fetchSensorData = async () => {
    try {
      // Fetch sensor history for charts
      const historyResponse = await fetch(`${API_BASE_URL}/sensor-history`);
      if (!historyResponse.ok)
        throw new Error("Failed to fetch sensor history");

      const history = await historyResponse.json();

      // Format data for charts
      const formatted = history.reverse().map((d) => ({
        ...d,
        time: new Date(d.timestamp).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      }));

      setData(formatted);

      // Get latest data point
      const latest = formatted[formatted.length - 1] || {};
      setLatestData(latest);

      if (latest?.timestamp) {
        setLastSeen(latest.timestamp);
        const ageSeconds =
          (Date.now() - new Date(latest.timestamp).getTime()) / 1000;
        setIotConnected(ageSeconds < 30);
      } else {
        setIotConnected(false);
      }

      // Check thresholds and show alerts
      if (Object.keys(latest).length > 0) {
        checkDiseaseRisk(latest);
      }

      setLoading(false);
      setError(null);
    } catch (err) {
      console.error("Error fetching sensor data:", err);
      setError(
        "Failed to load sensor data. Please check if the backend is running.",
      );
      setIotConnected(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchSensorData();

    // Set up polling every 5 seconds to match ESP32 update frequency
    const interval = setInterval(() => {
      fetchSensorData();
    }, 5000);

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, []);

  const checkDiseaseRisk = (latest) => {
    if (!latest) return;

    const { temperature, humidity, soil_moisture } = latest;

    // Priority 1: Blister Blight (Highest Risk)
    if (humidity > 80 && temperature >= 22 && temperature <= 28) {
      setModalContent({
        title: "🚨 CRITICAL: Blister Blight Risk",
        severity: "high",
        disease: "Blister Blight",
        message:
          "CRITICAL CONDITIONS DETECTED! High humidity combined with moderate temperature creates ideal conditions for Blister Blight outbreak.",
        action: "IMMEDIATE ACTION REQUIRED within 24 hours!",
        recommendations: [
          "✂️ Pluck and remove infected young leaves immediately",
          "🔥 Burn or bury infected material - DO NOT leave in field",
          "💊 Apply Copper oxychloride or Hexaconazole fungicide",
          "🌬️ Improve air circulation by pruning dense bushes",
          "💧 Avoid overhead irrigation",
          "🔄 Repeat spray after 7-10 days",
        ],
        currentConditions: {
          temp: temperature,
          humidity: humidity,
          moisture: soil_moisture,
        },
      });
      setShowModal(true);
    }
    // Priority 2: Brown Blight
    else if (
      humidity > 75 &&
      temperature >= 18 &&
      temperature <= 25 &&
      soil_moisture > 2650
    ) {
      setModalContent({
        title: "⚠️ HIGH: Brown Blight Risk",
        severity: "high",
        disease: "Brown Blight",
        message:
          "Cool temperature with high humidity and excessive moisture detected. Brown Blight fungal infection likely.",
        action: "Take action within 24-48 hours.",
        recommendations: [
          "🍂 Remove all affected leaves immediately",
          "💧 Improve drainage - avoid water stagnation",
          "💊 Apply Carbendazim or Mancozeb fungicide",
          "🌿 For mild stage: Use Neem-based bio-fungicide",
          "🔄 Repeat treatment every 10-14 days",
          "🌱 Monitor plant closely for spread",
        ],
        currentConditions: {
          temp: temperature,
          humidity: humidity,
          moisture: soil_moisture,
        },
      });
      setShowModal(true);
    }
    // Priority 3: Red Rust (Nutrient Deficiency + Stress)
    else if (
      humidity >= 70 &&
      humidity <= 85 &&
      soil_moisture < 2400 &&
      temperature >= 22
    ) {
      setModalContent({
        title: "⚠️ MEDIUM: Red Rust Risk",
        severity: "medium",
        disease: "Red Rust",
        message:
          "Poor soil nutrition combined with stress conditions. Plants weakened and susceptible to Red Rust.",
        action: "Address within 2-3 days to prevent spread.",
        recommendations: [
          "🍁 Remove heavily infected leaves",
          "🌾 Add compost or organic manure immediately",
          "⚗️ Apply balanced NPK fertilizer",
          "💊 Spray copper-based fungicide or 1% Bordeaux mixture",
          "🔄 Repeat spray every 15 days",
          "☀️ Regulate shade levels in the field",
        ],
        currentConditions: {
          temp: temperature,
          humidity: humidity,
          moisture: soil_moisture,
        },
      });
      setShowModal(true);
    }
    // Priority 4: General High Humidity Warning
    else if (humidity > 70 && temperature >= 20 && temperature <= 28) {
      setModalContent({
        title: "ℹ️ Elevated Disease Risk",
        severity: "low",
        disease: "General Alert",
        message:
          "Environmental conditions favor fungal disease development. Preventive action recommended.",
        action: "Monitor closely and apply preventive measures.",
        recommendations: [
          "👀 Conduct daily field inspections",
          "🌬️ Maintain good air circulation",
          "💧 Keep drainage systems clear",
          "🌱 Maintain regular plucking cycle",
          "📋 Check for early disease symptoms",
          "🛡️ Consider preventive bio-fungicide spray",
        ],
        currentConditions: {
          temp: temperature,
          humidity: humidity,
          moisture: soil_moisture,
        },
      });
      setShowModal(true);
    }
    // Priority 5: Extreme Conditions Warning
    else if (soil_moisture > 2700 || soil_moisture < 2300) {
      setModalContent({
        title: "⚠️ Soil Moisture Alert",
        severity: "medium",
        disease: "Environmental Stress",
        message:
          soil_moisture > 2700
            ? "Excessive soil moisture detected. Risk of root rot and fungal diseases."
            : "Low soil moisture detected. Plant stress increases disease susceptibility.",
        action:
          soil_moisture > 2700
            ? "Improve drainage immediately."
            : "Irrigation needed within 24 hours.",
        recommendations:
          soil_moisture > 2700
            ? [
                "💧 Check and clear drainage channels",
                "🌊 Reduce irrigation frequency",
                "🌱 Monitor for fungal growth",
                "🔍 Inspect roots for rot symptoms",
              ]
            : [
                "💦 Irrigate field immediately",
                "🌾 Apply mulch to retain moisture",
                "📊 Adjust irrigation schedule",
                "🌡️ Monitor temperature to prevent stress",
              ],
        currentConditions: {
          temp: temperature,
          humidity: humidity,
          moisture: soil_moisture,
        },
      });
      setShowModal(true);
    }
  };

  const getStatusColor = (value, type) => {
    if (type === "temperature") {
      if (value < 18) return "status-critical";
      if (value < 20) return "status-low";
      if (value > 30) return "status-critical";
      if (value > 28) return "status-high";
      return "status-normal";
    }
    if (type === "humidity") {
      if (value < 50) return "status-low";
      if (value > 85) return "status-critical";
      if (value > 80) return "status-high";
      if (value > 70) return "status-warning";
      return "status-normal";
    }
    if (type === "soil_moisture") {
      if (value < 2300) return "status-critical";
      if (value < 2400) return "status-low";
      if (value > 2700) return "status-critical";
      if (value > 2650) return "status-high";
      return "status-normal";
    }
  };

  const getWarningBadge = (value, type) => {
    if (type === "temperature") {
      if (value < 18 || value > 30)
        return { text: "CRITICAL", class: "badge-critical" };
      if (value < 20 || value > 28)
        return { text: "HIGH", class: "badge-high" };
      return null;
    }
    if (type === "humidity") {
      if (value > 85) return { text: "CRITICAL", class: "badge-critical" };
      if (value > 80) return { text: "DISEASE RISK", class: "badge-high" };
      if (value > 70) return { text: "WATCH", class: "badge-warning" };
      if (value < 50) return { text: "LOW", class: "badge-low" };
      return null;
    }
    if (type === "soil_moisture") {
      if (value < 2300 || value > 2700)
        return { text: "CRITICAL", class: "badge-critical" };
      if (value < 2400 || value > 2650)
        return { text: "WARNING", class: "badge-high" };
      return null;
    }
    return null;
  };

  const getStatusMessage = (value, type) => {
    if (type === "temperature") {
      if (value < 18)
        return {
          level: "CRITICAL",
          message:
            "🚨 EXTREME COLD: Plants at severe stress. Risk of growth stoppage and frost damage. Immediate action required!",
          class: "message-critical",
        };
      if (value < 20)
        return {
          level: "WARNING",
          message:
            "⚠️ Below Optimal: Temperature too low for ideal growth. Monitor closely and consider protective measures.",
          class: "message-warning",
        };
      if (value > 30)
        return {
          level: "CRITICAL",
          message:
            "🚨 EXTREME HEAT: Severe plant stress. Risk of leaf burn and wilting. Immediate irrigation and shading needed!",
          class: "message-critical",
        };
      if (value > 28)
        return {
          level: "HIGH",
          message:
            "⚠️ Above Optimal: Heat stress possible. Ensure adequate irrigation and monitor for wilting symptoms.",
          class: "message-high",
        };
      return {
        level: "NORMAL",
        message:
          "✓ Optimal Range: Temperature is ideal for tea plant growth and development. Continue monitoring.",
        class: "message-normal",
      };
    }

    if (type === "humidity") {
      if (value > 85)
        return {
          level: "CRITICAL",
          message:
            "🚨 EXTREME HUMIDITY: Very high disease risk! Blister blight and fungal infections imminent. Spray fungicide immediately!",
          class: "message-critical",
        };
      if (value > 80)
        return {
          level: "HIGH",
          message:
            "⚠️ HIGH DISEASE RISK: Humidity levels favor blister blight. Prepare for preventive spraying within 24 hours.",
          class: "message-high",
        };
      if (value > 70)
        return {
          level: "CAUTION",
          message:
            "⚠️ Elevated Humidity: Conditions favorable for fungal diseases. Increase field inspections and ensure good air circulation.",
          class: "message-warning",
        };
      if (value < 50)
        return {
          level: "LOW",
          message:
            "ℹ️ Low Humidity: Plants may experience moisture stress. Consider irrigation if temperature is also high.",
          class: "message-low",
        };
      return {
        level: "NORMAL",
        message:
          "✓ Optimal Range: Humidity levels are ideal. Low disease risk. Continue regular monitoring.",
        class: "message-normal",
      };
    }

    if (type === "soil_moisture") {
      if (value < 2300)
        return {
          level: "CRITICAL",
          message:
            "🚨 SEVERE DROUGHT: Plants under extreme water stress. Risk of permanent damage. Irrigate immediately!",
          class: "message-critical",
        };
      if (value < 2400)
        return {
          level: "WARNING",
          message:
            "⚠️ Low Moisture: Soil moisture below optimal. Plants weakening. Schedule irrigation within 24 hours.",
          class: "message-warning",
        };
      if (value > 2700)
        return {
          level: "CRITICAL",
          message:
            "🚨 WATERLOGGED: Excessive moisture detected. Risk of root rot and fungal diseases. Improve drainage immediately!",
          class: "message-critical",
        };
      if (value > 2650)
        return {
          level: "HIGH",
          message:
            "⚠️ High Moisture: Soil may be oversaturated. Check drainage and reduce irrigation frequency.",
          class: "message-high",
        };
      return {
        level: "NORMAL",
        message:
          "✓ Optimal Range: Soil moisture is ideal for root health and nutrient uptake. Maintain current irrigation schedule.",
        class: "message-normal",
      };
    }
  };

  const getSeverityClass = (severity) => {
    const classes = {
      high: "modal-high",
      medium: "modal-medium",
      low: "modal-low",
    };
    return classes[severity] || "";
  };

  return (
    <div className="sensor-dashboard">
      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: "center", padding: "60px", color: "#a5d6a7" }}>
          <h2>Loading sensor data...</h2>
          <p>Connecting to IoT devices...</p>
        </div>
      )}

      {/* Offline / Locked State */}
      {!loading && !iotConnected && (
        <div className="dashboard-lock">
          <div className="offline-card">
            <div className="offline-header">
              <span className="offline-badge">Device Offline</span>
              <h2>⚠️ Please connect to ESP32</h2>
              <p>
                Live sensor data is unavailable. Connect the IoT device to
                unlock the dashboard.
              </p>
            </div>
            <div className="offline-details">
              <div>
                <span className="detail-label">Last seen:</span>
                <span className="detail-value">{formatLastSeen(lastSeen)}</span>
              </div>
              {error && <div className="detail-error">{error}</div>}
            </div>
            <div className="offline-actions">
              <button className="offline-button" onClick={fetchSensorData}>
                Retry Connection
              </button>
              <button
                className="offline-button ghost"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Dashboard - Only show when data is loaded and device is online */}
      {!loading && iotConnected && (
        <>
          {/* Header */}
          <header className="dashboard-header">
            <div className="header-content">
              <p className="header-eyebrow">Real-Time Monitoring</p>
              <h1 className="header-title">
                Sensor Dashboard
                <span className="live-indicator">● Live</span>
              </h1>
              <p className="header-subtitle">
                Field conditions tracked every 5 seconds • AI-powered disease
                prediction
              </p>
            </div>
          </header>

          {/* Current Sensor Cards */}
          <section className="sensor-cards-section">
            <div className="sensor-cards-grid">
              <div className="sensor-card-wrapper">
                {getStatusMessage(latestData.temperature, "temperature") && (
                  <div
                    className={`status-message-box ${getStatusMessage(latestData.temperature, "temperature").class}`}
                  >
                    <div className="status-message-level">
                      {
                        getStatusMessage(latestData.temperature, "temperature")
                          .level
                      }
                    </div>
                    <div className="status-message-text">
                      {
                        getStatusMessage(latestData.temperature, "temperature")
                          .message
                      }
                    </div>
                  </div>
                )}
                <div
                  className={`sensor-card temp-card ${getStatusColor(latestData.temperature, "temperature")}`}
                >
                  <div className="card-icon">🌡️</div>
                  <div className="card-content">
                    <h3 className="card-label">Temperature</h3>
                    <p className="card-value">
                      {latestData.temperature}
                      <span className="unit">°C</span>
                    </p>
                    <p className="card-status">Optimal range: 20-28°C</p>
                    {getWarningBadge(latestData.temperature, "temperature") && (
                      <span
                        className={`warning-badge ${getWarningBadge(latestData.temperature, "temperature").class}`}
                      >
                        {
                          getWarningBadge(latestData.temperature, "temperature")
                            .text
                        }
                      </span>
                    )}
                  </div>
                  <div className="card-info-icon">ⓘ</div>
                </div>
              </div>

              <div className="sensor-card-wrapper">
                {getStatusMessage(latestData.humidity, "humidity") && (
                  <div
                    className={`status-message-box ${getStatusMessage(latestData.humidity, "humidity").class}`}
                  >
                    <div className="status-message-level">
                      {getStatusMessage(latestData.humidity, "humidity").level}
                    </div>
                    <div className="status-message-text">
                      {
                        getStatusMessage(latestData.humidity, "humidity")
                          .message
                      }
                    </div>
                  </div>
                )}
                <div
                  className={`sensor-card humidity-card ${getStatusColor(latestData.humidity, "humidity")}`}
                >
                  <div className="card-icon">💧</div>
                  <div className="card-content">
                    <h3 className="card-label">Humidity</h3>
                    <p className="card-value">
                      {latestData.humidity}
                      <span className="unit">%</span>
                    </p>
                    <p className="card-status">Optimal range: 50-70%</p>
                    {getWarningBadge(latestData.humidity, "humidity") && (
                      <span
                        className={`warning-badge ${getWarningBadge(latestData.humidity, "humidity").class}`}
                      >
                        {getWarningBadge(latestData.humidity, "humidity").text}
                      </span>
                    )}
                  </div>
                  <div className="card-info-icon">ⓘ</div>
                </div>
              </div>

              <div className="sensor-card-wrapper">
                {getStatusMessage(
                  latestData.soil_moisture,
                  "soil_moisture",
                ) && (
                  <div
                    className={`status-message-box ${getStatusMessage(latestData.soil_moisture, "soil_moisture").class}`}
                  >
                    <div className="status-message-level">
                      {
                        getStatusMessage(
                          latestData.soil_moisture,
                          "soil_moisture",
                        ).level
                      }
                    </div>
                    <div className="status-message-text">
                      {
                        getStatusMessage(
                          latestData.soil_moisture,
                          "soil_moisture",
                        ).message
                      }
                    </div>
                  </div>
                )}
                <div
                  className={`sensor-card moisture-card ${getStatusColor(latestData.soil_moisture, "soil_moisture")}`}
                >
                  <div className="card-icon">🌱</div>
                  <div className="card-content">
                    <h3 className="card-label">Soil Moisture</h3>
                    <p className="card-value">
                      {latestData.soil_moisture}
                      <span className="unit">units</span>
                    </p>
                    <p className="card-status">Optimal range: 2400-2650</p>
                    {getWarningBadge(
                      latestData.soil_moisture,
                      "soil_moisture",
                    ) && (
                      <span
                        className={`warning-badge ${getWarningBadge(latestData.soil_moisture, "soil_moisture").class}`}
                      >
                        {
                          getWarningBadge(
                            latestData.soil_moisture,
                            "soil_moisture",
                          ).text
                        }
                      </span>
                    )}
                  </div>
                  <div className="card-info-icon">ⓘ</div>
                </div>
              </div>

              <div className="sensor-card status-card">
                <div className="card-icon">✓</div>
                <div className="card-content">
                  <h3 className="card-label">System Status</h3>
                  <p className="card-value status-ok">All Systems OK</p>
                  <p className="card-status">Last update: {latestData.time}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Charts Section */}
          <section className="charts-section">
            {/* Temperature Line Chart */}
            <div className="chart-card">
              <div className="chart-header">
                <h3>Temperature Trend</h3>
                <span className="chart-badge">Last 60 seconds</span>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff9966" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#ff9966" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis dataKey="time" stroke="#a5d6a7" fontSize={11} />
                  <YAxis stroke="#a5d6a7" fontSize={11} domain={[23, 26]} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(18, 28, 22, 0.95)",
                      border: "1px solid rgba(126, 227, 156, 0.3)",
                      borderRadius: "12px",
                      color: "#e6f4ea",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="temperature"
                    stroke="#ff9966"
                    fillOpacity={1}
                    fill="url(#colorTemp)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Humidity Bar Chart */}
            <div className="chart-card">
              <div className="chart-header">
                <h3>Humidity Levels</h3>
                <span className="chart-badge">Bar View</span>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis dataKey="time" stroke="#a5d6a7" fontSize={11} />
                  <YAxis stroke="#a5d6a7" fontSize={11} domain={[55, 65]} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(18, 28, 22, 0.95)",
                      border: "1px solid rgba(126, 227, 156, 0.3)",
                      borderRadius: "12px",
                      color: "#e6f4ea",
                    }}
                  />
                  <Bar
                    dataKey="humidity"
                    fill="#66b3ff"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Soil Moisture Line Chart */}
            <div className="chart-card chart-full">
              <div className="chart-header">
                <h3>Soil Moisture Over Time</h3>
                <span className="chart-badge">Multi-line</span>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis dataKey="time" stroke="#a5d6a7" fontSize={11} />
                  <YAxis stroke="#a5d6a7" fontSize={11} domain={[2300, 2700]} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(18, 28, 22, 0.95)",
                      border: "1px solid rgba(126, 227, 156, 0.3)",
                      borderRadius: "12px",
                      color: "#e6f4ea",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="soil_moisture"
                    stroke="#7ee39c"
                    strokeWidth={3}
                    dot={{ fill: "#7ee39c", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Disease Alert Modal */}
          {showModal && (
            <div className="modal-overlay" onClick={() => setShowModal(false)}>
              <div
                className={`modal-content ${getSeverityClass(modalContent.severity)}`}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="modal-close"
                  onClick={() => setShowModal(false)}
                >
                  ✕
                </button>
                <div className="modal-disease-badge">
                  {modalContent.disease}
                </div>
                <h2 className="modal-title">{modalContent.title}</h2>
                <p className="modal-message">{modalContent.message}</p>

                {modalContent.currentConditions && (
                  <div className="modal-conditions">
                    <h4>Current Readings:</h4>
                    <div className="conditions-grid">
                      <div className="condition-item">
                        <span className="condition-label">Temp:</span>
                        <span className="condition-value">
                          {modalContent.currentConditions.temp}°C
                        </span>
                      </div>
                      <div className="condition-item">
                        <span className="condition-label">Humidity:</span>
                        <span className="condition-value">
                          {modalContent.currentConditions.humidity}%
                        </span>
                      </div>
                      <div className="condition-item">
                        <span className="condition-label">Moisture:</span>
                        <span className="condition-value">
                          {modalContent.currentConditions.moisture}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="modal-action">
                  <strong>Action Required:</strong> {modalContent.action}
                </div>
                <div className="modal-recommendations">
                  <h4>Recommendations:</h4>
                  <ul>
                    {modalContent.recommendations?.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
                <button
                  className="modal-button"
                  onClick={() => setShowModal(false)}
                >
                  Acknowledge & Close
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
