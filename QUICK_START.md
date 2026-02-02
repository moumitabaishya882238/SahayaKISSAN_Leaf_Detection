# Quick Start: IoT-ML Integration

## What Was Added

### 1️⃣ Severity Calculator (`frontend/src/utils/severityCalculator.js`)

Calculates disease severity (LOW/MEDIUM/HIGH) based on:

- Disease type (detected by ML model)
- Real-time environmental conditions (from IoT sensors)

### 2️⃣ Enhanced LeafDisease Component

The component now:

1. Fetches live sensor data every 10 seconds
2. Displays real-time temperature, humidity, and soil moisture
3. After ML prediction, automatically calculates severity
4. Shows context-aware advisory with actionable recommendations

### 3️⃣ New UI Elements

- **Sensor Panel**: Shows live readings at the top
- **Severity Badge**: 🟢 LOW / 🟡 MEDIUM / 🔴 HIGH
- **Advisory Card**: Disease-specific recommendations based on severity

## How It Works

```
1. User uploads/captures leaf image
   ↓
2. ML model predicts disease type
   ↓
3. Component fetches live sensor data
   ↓
4. calculateSeverity() determines severity level
   ↓
5. getAdvisory() retrieves recommendations
   ↓
6. UI displays prediction + severity + advisories
```

## Environment Requirements

No additional dependencies needed! Uses existing:

- React hooks (useState, useEffect, useRef)
- Fetch API
- CSS Grid/Flexbox

## Running the System

### Backend (already running)

```bash
cd backend
npm start
# Server running on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm run dev
# Frontend running on http://localhost:5173
```

### IoT System

- ESP32 sends sensor data to: `POST http://localhost:5000/api-sensor/sensor-data`
- Data structure:

```json
{
  "temperature": 28.5,
  "humidity": 75.2,
  "soil_moisture": 55.3
}
```

## Key Features

✅ **Real-time Sensor Integration**: Fetches live data every 10 seconds  
✅ **Disease-Specific Logic**: Custom thresholds for each disease type  
✅ **Actionable Recommendations**: 3-6 specific actions per disease & severity  
✅ **Responsive Design**: Works on mobile and desktop  
✅ **Error Handling**: Gracefully handles missing sensor data  
✅ **Zero Backend Changes**: Uses existing API endpoints

## Example Scenarios

### Scenario 1: Brown Blight with High Humidity

```
Disease: Brown Blight
Temperature: 28°C, Humidity: 85%, Soil: 70%
↓
Severity: HIGH (warm + very humid + wet)
Recommendation: Emergency fungicide treatment required
```

### Scenario 2: Blister Blight Early Detection

```
Disease: Blister Blight
Temperature: 20°C, Humidity: 75%, Soil: 50%
↓
Severity: LOW (cool + moderate humidity + balanced soil)
Recommendation: Remove infected young leaves, avoid night irrigation
```

### Scenario 3: Healthy Leaves with Stress

```
Disease: Healthy_leaves
Temperature: 35°C, Humidity: 40%, Soil: 20%
↓
Severity: HIGH (too hot + too dry + drought stress)
Recommendation: Immediate irrigation, increase shade, monitor closely
```

## Severity Thresholds at a Glance

| Disease     | LOW                    | MEDIUM                 | HIGH                      |
| ----------- | ---------------------- | ---------------------- | ------------------------- |
| **Healthy** | Optimal conditions     | 1 stress factor        | Multiple stress factors   |
| **Blister** | Humid 70-80%, Cool     | Humid >80%, Cool       | Humid >85%, Cool, Wet     |
| **Brown**   | Warm, Moderate humid   | Warm, Humid >80%       | Hot, Very humid >85%, Wet |
| **Rust**    | Moderate humid, Stable | Humid >80%, Poor drain | Humid >85%, Very wet      |
| **Mite**    | Cool <30°C, Humid >60% | Hot >30°C, Low humid   | Hot >32°C, Very dry       |
| **Bug**     | Temp 24-28°C, Balanced | Temp 28-32°C           | Temp >30°C, Humid ok      |

## Troubleshooting

**Q: Sensor data not showing?**  
A: Check if IoT system is sending data to `/api-sensor/sensor-data`

**Q: Advisory not appearing?**  
A: Ensure prediction is completed first, then advisory will auto-generate

**Q: Wrong severity calculation?**  
A: Check disease label matches exactly (with underscores: `Blister_Blight`)

## Files Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── LeafDisease.jsx (UPDATED)
│   │   └── LeafDisease.css (UPDATED)
│   └── utils/
│       └── severityCalculator.js (NEW)
```

## Next Steps

1. **Test with real IoT data**: Ensure sensor readings flow correctly
2. **Validate severity thresholds**: Adjust based on field conditions
3. **Monitor accuracy**: Track if recommendations help farmers
4. **Add history tracking**: Store predictions and outcomes
5. **Farmer feedback loop**: Refine thresholds based on results

---

**Status**: ✅ Integration Complete  
**Testing**: Ready for QA  
**Deployment**: Ready for production (no backend changes needed)
