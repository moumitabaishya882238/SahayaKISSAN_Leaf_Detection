import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./HistoryCharts.css";

// ---- Calibration values (IMPORTANT) ----
const SOIL_DRY = 3500;
const SOIL_WET = 1500;

// Convert ADC → percentage
function soilToPercent(raw) {
  const percent =
    ((SOIL_DRY - raw) / (SOIL_DRY - SOIL_WET)) * 100;
  return Math.max(0, Math.min(100, percent));
}

export default function HistoryCharts({ data }) {
  const formattedData = data.map(item => ({
    ...item,
    time: new Date(item.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    soil_percent: soilToPercent(item.soil_moisture),
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

    return (
      <div className="custom-tooltip">
        <div className="tooltip-time">{label}</div>

        {payload.map((entry, index) => {
          const isSoil = entry.dataKey === "soil_percent";

          return (
            <div key={index} className="tooltip-item">
              <span
                className={`tooltip-dot tooltip-dot--${entry.dataKey}`}
              />
              <span className="tooltip-label">
                {isSoil ? "Soil Moisture" : "Humidity"}
              </span>
              <span className="tooltip-value">
                {Math.round(entry.value)}
                {isSoil ? "%" : "%"}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="history-charts">
      <div className="charts-header">
        <h3 className="charts-title">
          🌾 Sensor History (Last Readings)
        </h3>
      </div>

      {/* HUMIDITY */}
      <div className="chart-container">
        <h4 className="chart-title">Humidity (%)</h4>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="time" />
            <YAxis tickFormatter={v => `${v}%`} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="humidity"
              stroke="#007bff"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* SOIL MOISTURE */}
      <div className="chart-container">
        <h4 className="chart-title">Soil Moisture (%)</h4>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="time" />
            <YAxis tickFormatter={v => `${v}%`} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="soil_percent"
              stroke="#28a745"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
