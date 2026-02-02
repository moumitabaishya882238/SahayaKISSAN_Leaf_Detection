# IoT Sensor + ML Prediction Integration Summary

## Overview

Successfully integrated IoT sensor data (temperature, humidity, soil moisture) with ML-based leaf disease predictions to determine disease severity levels and provide context-aware actionable advisories.

## Changes Made

### 1. **Backend** (No changes needed)

The backend already exposes sensor data via `/api-sensor/sensor-data` endpoint which returns:

```json
{
  "temperature": 28.5,
  "humidity": 75.2,
  "soil_moisture": 55.3,
  "timestamp": "2025-02-03T..."
}
```

### 2. **Frontend - New Utility Module**

**File:** `frontend/src/utils/severityCalculator.js`

#### Functions Created:

**A. `calculateSeverity(diseaseLabel, sensorData)`**

- Takes disease prediction and sensor readings
- Returns severity level: `LOW`, `MEDIUM`, or `HIGH`
- Implements disease-specific logic for 6 disease types + healthy leaves:

| Disease              | LOW Conditions                                      | MEDIUM Conditions               | HIGH Conditions                            |
| -------------------- | --------------------------------------------------- | ------------------------------- | ------------------------------------------ |
| **Healthy_leaves**   | Temp: 20-30°C, Humidity: 60-75%, Moisture: 40-70%   | 1 parameter out of range        | 2+ parameters out of range                 |
| **Blister_Blight**   | Humidity: 70-80%, Temp: 18-25°C, Moisture: 40-70%   | Humidity >80%, Temp in range    | Humidity >85%, Temp 18-25°C, Moisture >70% |
| **Brown_Blight**     | Temp: 24-28°C, Humidity: 70-80%, Moisture normal    | Humidity >80%, Temp ~30°C       | Humidity >85%, Temp 25-32°C, Moisture >70% |
| **Leaf_Red_Rust**    | Humidity 60-80%, Moisture stable, Temp 22-30°C      | Humidity >80%, Uneven moisture  | Humidity >85%, Wet soil, Low light         |
| **Red_Spider_Mite**  | Temp <30°C, Humidity >60%, Moisture adequate        | Temp >30°C OR Humidity <50%     | Temp >32°C, Humidity <45%, Soil dry        |
| **Tea_Mosquito_Bug** | Temp: 24-28°C, Humidity moderate, Moisture balanced | Temp 28-32°C, Moderate humidity | Temp >30°C, Humidity >50%, Stressed soil   |

**B. `getAdvisory(diseaseLabel, severity)`**

- Returns comprehensive advisory object with:
  - `emoji`: Visual indicator
  - `title`: Disease name and context
  - `severity`: Severity badge (🟢 LOW, 🟡 MEDIUM, 🔴 HIGH)
  - `actions`: Array of 3-6 actionable recommendations

### 3. **Frontend - Updated LeafDisease Component**

**File:** `frontend/src/components/LeafDisease.jsx`

#### New Features:

1. **Real-time Sensor Data Fetching**
   - Fetches live sensor data on component mount
   - Updates every 10 seconds
   - Gracefully handles connection failures

2. **Enhanced Prediction Flow**
   - After ML prediction received, automatically calculates severity
   - Retrieves advisory recommendations
   - No additional user input needed

3. **New State Variables**

   ```javascript
   const [sensorData, setSensorData] = useState(null); // Latest sensor readings
   const [severity, setSeverity] = useState(null); // Calculated severity level
   const [advisory, setAdvisory] = useState(null); // Recommendation object
   ```

4. **Updated UI Components**
   - Sensor Data Panel (top): Shows live temperature, humidity, soil moisture
   - Prediction Card: Displays disease name and confidence
   - Severity Badge: Shows 🟢/🟡/🔴 with severity level
   - Advisory Card: Lists actionable recommendations with emoji indicators

### 4. **Styling Updates**

**File:** `frontend/src/components/LeafDisease.css`

New CSS classes added:

- `.sensor-data-panel`: Purple gradient panel for live sensor readings
- `.sensor-data__grid`: 3-column responsive grid for sensor values
- `.severity-card`: Badge display for severity level
- `.advisory-card`: Card container for actionable recommendations
- `.advisory-header`: Header with emoji and title
- `.advisory-actions`: Bullet list of actions
- Responsive mobile layout adjustments

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERACTION                         │
│                  (Upload/Capture Image)                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              ML PREDICTION (predict.py)                     │
│              Returns: disease label + confidence            │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                 │
        ▼                                 ▼
┌──────────────────┐          ┌──────────────────────┐
│  ML Prediction   │          │  IoT Sensor Data     │
│  (disease_label) │          │ (temp, humidity, SM) │
└────────┬─────────┘          └──────────┬───────────┘
         │                               │
         └───────────┬───────────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │ calculateSeverity()    │
        │ (disease-specific logic)
        │ Returns: LOW/MEDIUM/HIGH
        └────────────┬───────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │ getAdvisory()          │
        │ Returns: recommendations
        └────────────┬───────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │   UI Display           │
        │ - Prediction           │
        │ - Severity Badge       │
        │ - Advisories           │
        └────────────────────────┘
```

## Example Output

**Scenario:** Brown Blight detected with temperature 28°C, humidity 82%, soil moisture 65%

```
Display:
┌─────────────────────────────────┐
│  📊 Live Sensor Data            │
│  🌡️ Temperature: 28.5°C         │
│  💧 Humidity: 82.0%             │
│  🍂 Soil Moisture: 65.0%         │
└─────────────────────────────────┘

🔍 Prediction: Brown Blight
Confidence: 94.32%

🟡 MEDIUM (Spreading on young shoots)

🍂 Brown Blight
✔ Apply systemic fungicide
✔ Reduce moisture stress on plants
✔ Increase field sanitation
✔ Improve drainage if water logging
✔ Reduce shade to increase light exposure
```

## Disease-Specific Thresholds

### Blister Blight

- **Favors:** Cool, humid conditions (18-25°C, >80% humidity)
- **Key Metric:** Humidity duration and temperature range combination

### Brown Blight

- **Favors:** Warm, wet conditions (24-32°C, >80% humidity, high soil moisture)
- **Key Metric:** Temperature warmth + humidity persistence

### Leaf Red Rust

- **Favors:** High humidity with poor drainage (>80% humidity, uneven soil moisture)
- **Key Metric:** Prolonged humidity + soil wetness

### Red Spider Mite

- **Favors:** Hot, dry stress conditions (>30°C, <50% humidity, dry soil)
- **Key Metric:** Heat + Aridity = Mite population explosion

### Tea Mosquito Bug

- **Favors:** Warm, post-rain stress (28-32°C, after dry periods)
- **Key Metric:** Temperature + Humidity + Soil stress combination

### Healthy Leaves

- **Optimal:** 20-30°C, 60-75% humidity, 40-70% soil moisture
- **Risk Increases:** When 1+ parameters deviate from range

## Testing Checklist

- [x] Sensor data fetching works correctly
- [x] Severity calculation for all 6 disease types
- [x] Advisory recommendations display properly
- [x] CSS styling responsive on mobile/desktop
- [x] Error handling for missing sensor data
- [x] Reset functionality clears advisory cards
- [x] Sensor data updates every 10 seconds

## Future Enhancements

1. **Historical Severity Tracking**: Store disease severity over time
2. **Predictive Alerts**: Warn when environmental conditions approach HIGH severity
3. **Multi-leaf Analysis**: Compare multiple leaf samples in sequence
4. **Weather Integration**: Factor in weather forecast data
5. **Farmer Feedback**: Collect outcomes to improve severity thresholds
6. **Expert Consultation**: Link to expert for HIGH severity cases

## Files Modified

1. ✅ `frontend/src/utils/severityCalculator.js` - NEW
2. ✅ `frontend/src/components/LeafDisease.jsx` - UPDATED
3. ✅ `frontend/src/components/LeafDisease.css` - UPDATED

No backend changes required - existing API endpoints are sufficient!
