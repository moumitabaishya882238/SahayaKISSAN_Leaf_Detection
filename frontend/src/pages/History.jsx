import { useState, useEffect } from "react";
import "./History.css";

const API_BASE_URL = "http://localhost:5000/api-leaf";

export default function History() {
  const [scans, setScans] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchHistoryData();
  }, []);

  const fetchHistoryData = async () => {
    try {
      const [scansResponse, statsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/history`),
        fetch(`${API_BASE_URL}/history/stats/summary`),
      ]);

      if (!scansResponse.ok || !statsResponse.ok) {
        throw new Error("Failed to fetch history");
      }

      const scansData = await scansResponse.json();
      const statsData = await statsResponse.json();

      // Format scan data for display
      const formatted = scansData.map((scan) => ({
        ...scan,
        timeFormatted: new Date(scan.timestamp).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        dateFormatted: new Date(scan.timestamp).toLocaleDateString(),
      }));

      setScans(formatted);
      setStats(statsData);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error("Error fetching history:", err);
      setError("Failed to load history data");
      setLoading(false);
    }
  };

  return (
    <div className="history-container">
      {/* Header */}
      <header className="history-header">
        <div className="header-content">
          <p className="header-eyebrow">Disease Detection</p>
          <h1 className="header-title">
            Leaf Scan History
            <span className="live-indicator">● Live</span>
          </h1>
          <p className="header-subtitle">
            Track all leaf disease detections • View disease patterns and trends
          </p>
        </div>
      </header>

      {loading && (
        <div style={{ textAlign: "center", padding: "60px", color: "#a5d6a7" }}>
          <h2>Loading history data...</h2>
        </div>
      )}

      {error && (
        <div style={{ textAlign: "center", padding: "60px", color: "#ff9999" }}>
          <h2>{error}</h2>
          <button onClick={fetchHistoryData} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      {!loading && !error && stats && (
        <>
          {/* Statistics Cards */}
          <section className="stats-section">
            <div className="stats-grid">
              {/* Total Scans */}
              <div className="stat-card total-stat">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <h3>Total Scans</h3>
                  <div className="stat-value">{stats.totalScans}</div>
                </div>
              </div>

              {/* Top Disease */}
              <div className="stat-card disease-stat">
                <div className="stat-icon">🦠</div>
                <div className="stat-content">
                  <h3>Most Detected</h3>
                  <div className="stat-value">
                    {Object.entries(stats.diseaseDistribution || {}).length >
                    0 ? (
                      <>
                        {
                          Object.keys(stats.diseaseDistribution).sort(
                            (a, b) =>
                              stats.diseaseDistribution[b] -
                              stats.diseaseDistribution[a],
                          )[0]
                        }
                        <span style={{ fontSize: "0.8em", marginLeft: "8px" }}>
                          (
                          {
                            stats.diseaseDistribution[
                              Object.keys(stats.diseaseDistribution).sort(
                                (a, b) =>
                                  stats.diseaseDistribution[b] -
                                  stats.diseaseDistribution[a],
                              )[0]
                            ]
                          }
                          x)
                        </span>
                      </>
                    ) : (
                      "—"
                    )}
                  </div>
                </div>
              </div>

              {/* Critical Cases */}
              <div className="stat-card critical-stat">
                <div className="stat-icon">⚠️</div>
                <div className="stat-content">
                  <h3>Critical Cases</h3>
                  <div className="stat-value">
                    {stats.severityDistribution?.CRITICAL || 0}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Disease Distribution */}
          <section className="distribution-section">
            <div className="distribution-grid">
              {/* Disease Distribution */}
              <div className="distribution-card">
                <h3 className="distribution-title">Disease Distribution</h3>
                <div className="disease-list">
                  {Object.entries(stats.diseaseDistribution || {})
                    .sort((a, b) => b[1] - a[1])
                    .map(([disease, count]) => (
                      <div key={disease} className="disease-item">
                        <div className="disease-info">
                          <span className="disease-name">
                            {disease.replace(/_/g, " ")}
                          </span>
                          <span className="disease-count">{count}</span>
                        </div>
                        <div className="disease-bar">
                          <div
                            className="disease-bar-fill"
                            style={{
                              width: `${(count / stats.totalScans) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Severity Distribution */}
              <div className="distribution-card">
                <h3 className="distribution-title">Severity Breakdown</h3>
                <div className="severity-list">
                  {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((severity) => (
                    <div key={severity} className="severity-item">
                      <div className="severity-info">
                        <span
                          className={`severity-badge severity-${severity.toLowerCase()}`}
                        >
                          {severity}
                        </span>
                        <span className="severity-count">
                          {stats.severityDistribution?.[severity] || 0}
                        </span>
                      </div>
                      <div className="severity-bar">
                        <div
                          className={`severity-bar-fill severity-${severity.toLowerCase()}`}
                          style={{
                            width: `${((stats.severityDistribution?.[severity] || 0) / stats.totalScans) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Leaf Scans Table */}
          {scans.length > 0 && (
            <section className="scans-section">
              <div className="scans-header">
                <h3>Recent Scans</h3>
                <span className="scan-count">{scans.length} scans</span>
              </div>
              <div className="scans-table-wrapper">
                <table className="scans-table">
                  <thead>
                    <tr>
                      <th>Date & Time</th>
                      <th>Disease</th>
                      <th>Confidence</th>
                      <th>Severity</th>
                      <th>Temp</th>
                      <th>Humidity</th>
                      <th>Soil Moisture</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scans.map((scan, index) => (
                      <tr key={scan._id || index} className="scan-row">
                        <td className="cell-datetime">
                          <div>{scan.dateFormatted}</div>
                          <div className="time">{scan.timeFormatted}</div>
                        </td>
                        <td className="cell-disease">
                          {scan.disease.replace(/_/g, " ")}
                        </td>
                        <td className="cell-confidence">
                          <div className="confidence-bar">
                            <div
                              className="confidence-fill"
                              style={{
                                width: `${(scan.confidence || 0) * 100}%`,
                              }}
                            />
                          </div>
                          <span>
                            {((scan.confidence || 0) * 100).toFixed(1)}%
                          </span>
                        </td>
                        <td className="cell-severity">
                          <span
                            className={`severity-badge severity-${(scan.severity || "MEDIUM").toLowerCase()}`}
                          >
                            {scan.severity}
                          </span>
                        </td>
                        <td className="cell-metric">
                          {scan.temperature
                            ? `${scan.temperature.toFixed(1)}°C`
                            : "—"}
                        </td>
                        <td className="cell-metric">
                          {scan.humidity ? `${scan.humidity.toFixed(1)}%` : "—"}
                        </td>
                        <td className="cell-metric">
                          {scan.soil_moisture
                            ? `${scan.soil_moisture.toFixed(1)}%`
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Refresh Button */}
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <button onClick={fetchHistoryData} className="refresh-btn">
              🔄 Refresh Data
            </button>
          </div>
        </>
      )}

      {!loading && !error && (!stats || stats.totalScans === 0) && (
        <div style={{ textAlign: "center", padding: "60px", color: "#a5d6a7" }}>
          <h2>No leaf scans yet</h2>
          <p>Start scanning tea leaves to build detection history</p>
        </div>
      )}
    </div>
  );
}
