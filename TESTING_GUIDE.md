# Testing & Validation Guide

## Pre-requisites

1. ✅ Backend running on `http://localhost:5000`
2. ✅ Frontend running on `http://localhost:5173`
3. ✅ IoT system sending sensor data to `/api-sensor/sensor-data`
4. ✅ ML model files present in `Training/` directory

## Unit Testing Guide

### 1. Test Sensor Data Fetching

```javascript
// In browser console (on http://localhost:5173)
fetch("http://localhost:5000/api-sensor/sensor-data")
  .then((res) => res.json())
  .then((data) => console.log("Sensor Data:", data))
  .catch((err) => console.error("Error:", err));

// Expected output:
// {
//   _id: "...",
//   temperature: 28.5,
//   humidity: 75.2,
//   soil_moisture: 55.3,
//   timestamp: "2025-02-03T14:30:45.123Z"
// }
```

### 2. Test Severity Calculation

```javascript
// Import in React DevTools or test file
import { calculateSeverity } from "./utils/severityCalculator.js";

// Test Case 1: Blister Blight - Low Severity
const sensorData1 = {
  temperature: 20,
  humidity: 75,
  soil_moisture: 55,
};
console.log(calculateSeverity("Blister_Blight", sensorData1));
// Expected: "LOW"

// Test Case 2: Blister Blight - High Severity
const sensorData2 = {
  temperature: 22,
  humidity: 88,
  soil_moisture: 75,
};
console.log(calculateSeverity("Blister_Blight", sensorData2));
// Expected: "HIGH"

// Test Case 3: Red Spider Mite - High Severity
const sensorData3 = {
  temperature: 35,
  humidity: 40,
  soil_moisture: 20,
};
console.log(calculateSeverity("Red_Spider_Mite", sensorData3));
// Expected: "HIGH"
```

### 3. Test Advisory Generation

```javascript
// Import in React DevTools or test file
import { getAdvisory } from "./utils/severityCalculator.js";

// Test Case 1: Blister Blight - Medium Severity
const advisory1 = getAdvisory("Blister_Blight", "MEDIUM");
console.log(advisory1);
// Expected: {
//   emoji: "🦠",
//   title: "Blister Blight",
//   severity: "🟡 MEDIUM (Spreading on young shoots)",
//   actions: [...]
// }

// Test Case 2: Brown Blight - High Severity
const advisory2 = getAdvisory("Brown_Blight", "HIGH");
console.log(advisory2);
// Should contain emergency actions
```

## Integration Testing Scenarios

### Scenario 1: Healthy Leaves in Optimal Conditions

**Sensor Data:**

- Temperature: 25°C
- Humidity: 68%
- Soil Moisture: 55%

**ML Prediction:** Healthy_leaves

**Expected Result:**

- Severity: LOW
- Advisory: ✅ Healthy Leaves - Optimal Conditions
- Actions: Maintain current watering, continue monitoring, etc.

**How to Test:**

1. Use a healthy leaf image
2. Observe sensor data at top of screen
3. Verify prediction is "Healthy_leaves"
4. Confirm severity is "🟢 LOW"

---

### Scenario 2: Blister Blight in Outbreak Conditions

**Sensor Data:**

- Temperature: 20°C
- Humidity: 87%
- Soil Moisture: 72%

**ML Prediction:** Blister_Blight

**Expected Result:**

- Severity: HIGH
- Advisory: 🔴 HIGH (Severe outbreak)
- Actions: Immediate fungicide spraying, stop irrigation, etc.

**How to Test:**

1. Use blister blight leaf image
2. Wait for sensor data to update
3. Click "Scan & Predict"
4. Verify HIGH severity badge
5. Check advisory includes emergency measures

---

### Scenario 3: Red Spider Mite in Dry Stress

**Sensor Data:**

- Temperature: 34°C
- Humidity: 42%
- Soil Moisture: 22%

**ML Prediction:** Red_Spider_Mite

**Expected Result:**

- Severity: HIGH
- Advisory: 🔴 HIGH (Emergency miticide)
- Actions: Emergency spray, increase irrigation, monitor every 48 hrs

**How to Test:**

1. Use Red Spider Mite image
2. Simulate dry, hot conditions
3. Verify HIGH severity (opposite of fungal diseases)
4. Check advisory focuses on increasing humidity/moisture

---

### Scenario 4: Multiple Sensors Out of Range

**Sensor Data:**

- Temperature: 32°C (too high)
- Humidity: 45% (too low)
- Soil Moisture: 68% (acceptable)

**ML Prediction:** Healthy_leaves

**Expected Result:**

- Severity: HIGH (multiple stress factors)
- Advisory: Critical Stress
- Actions: Immediate environmental correction needed

**How to Test:**

1. Use healthy leaf image
2. Set temperature high and humidity low
3. Verify severity jumps to HIGH despite healthy leaves
4. Check advisory warns about critical stress

---

## API Testing with cURL / Postman

### Test Sensor Endpoint

```bash
# Get latest sensor data
curl -X GET http://localhost:5000/api-sensor/sensor-data \
  -H "Content-Type: application/json"

# Expected Response:
# {
#   "_id": "...",
#   "temperature": 28.5,
#   "humidity": 75.2,
#   "soil_moisture": 55.3,
#   "timestamp": "2025-02-03T14:30:45.123Z"
# }
```

### Test Prediction Endpoint

```bash
# Post leaf image for prediction
curl -X POST http://localhost:5000/api/leaf/predict \
  -F "image=@path/to/leaf/image.jpg"

# Expected Response:
# {
#   "label": "Blister_Blight",
#   "confidence": 0.9432
# }
```

### Test with Postman

1. **Create Request:**
   - Method: POST
   - URL: http://localhost:5000/api/leaf/predict
   - Body: form-data
   - Key: "image" (type: File)
   - Value: Select a leaf image

2. **Send & Verify:**
   - Status: 200
   - Body: Contains "label" and "confidence"

---

## Performance Testing

### Load Testing - Sensor Data

```javascript
// Test rapid sensor data fetching
async function testSensorPerformance() {
  const start = performance.now();

  for (let i = 0; i < 10; i++) {
    await fetch("http://localhost:5000/api-sensor/sensor-data").then((r) =>
      r.json(),
    );
  }

  const duration = performance.now() - start;
  console.log(`10 requests took ${duration.toFixed(2)}ms`);
  console.log(`Average: ${(duration / 10).toFixed(2)}ms per request`);
}

testSensorPerformance();
// Expected: <100ms per request
```

### Load Testing - Severity Calculation

```javascript
// Test severity calculation performance
import { calculateSeverity } from "./utils/severityCalculator.js";

function testSeverityPerformance() {
  const sensorData = {
    temperature: 28.5,
    humidity: 75.2,
    soil_moisture: 55.3,
  };

  const start = performance.now();

  for (let i = 0; i < 1000; i++) {
    calculateSeverity("Blister_Blight", sensorData);
  }

  const duration = performance.now() - start;
  console.log(`1000 calculations took ${duration.toFixed(2)}ms`);
  console.log(`Average: ${(duration / 1000).toFixed(3)}ms per calculation`);
}

testSeverityPerformance();
// Expected: <1ms per calculation
```

---

## Browser DevTools Testing

### Check Network Requests

1. Open DevTools (F12)
2. Go to Network tab
3. Upload/capture leaf image
4. Watch requests:
   - POST `/api/leaf/predict` (ML prediction)
   - GET `/api-sensor/sensor-data` (Sensor data)
5. Verify response times and status codes

### Check Component State

1. Open DevTools → Console
2. Install React DevTools extension
3. Select LeafDisease component
4. Watch state updates:
   - `result` changes when ML completes
   - `severity` updates after prediction
   - `advisory` generates from severity
   - `sensorData` refreshes every 10 seconds

### Check CSS Rendering

1. Open DevTools → Elements
2. Inspect sensor panel, severity badge, advisory card
3. Verify:
   - Sensor panel gradient displays correctly
   - Severity badge shows correct colors (🟢/🟡/🔴)
   - Advisory card renders all actions
   - Mobile responsive layout works

---

## Error Handling Testing

### Test 1: Missing Sensor Data

**Scenario:** IoT system offline, `/api-sensor/sensor-data` returns error

**Expected Behavior:**

- Severity calculation uses "MEDIUM" as default
- Advisory still displays
- No crash or console errors

**Test:**

```javascript
// Mock sensor data as null
setSensorData(null);
// Trigger prediction
// Verify UI handles gracefully
```

### Test 2: Invalid Image

**Scenario:** Non-tea leaf image uploaded

**Expected Behavior:**

- Backend returns error
- Error message displays: "Please enter a valid leaf image"
- Advisory not shown
- Can retry with different image

**Test:**

1. Upload a non-leaf image
2. Click "Scan & Predict"
3. Verify error message appears
4. Verify no advisory card shown

### Test 3: Unknown Disease Label

**Scenario:** ML returns unknown disease label

**Expected Behavior:**

- getAdvisory() returns default response
- Component doesn't crash
- Generic advisory shows

**Test:**

```javascript
// Manually set unknown disease
setResult({ label: "Unknown_Disease", confidence: 0.5 });
// Verify advisory appears with default values
```

### Test 4: Network Timeout

**Scenario:** Slow/no internet connection

**Expected Behavior:**

- Loading state shows "Analyzing..."
- Timeout after ~30 seconds
- Error message displays
- Can retry

**Test:**

1. Throttle network (DevTools)
2. Upload image
3. Observe loading behavior
4. Verify timeout and error handling

---

## Validation Checklist

### Frontend

- [ ] Sensor data panel displays live values
- [ ] Sensor data updates every 10 seconds
- [ ] Prediction loads and displays correctly
- [ ] Severity badge shows correct emoji (🟢/🟡/🔴)
- [ ] Advisory card displays all actions
- [ ] Mobile layout is responsive
- [ ] No console errors

### Backend

- [ ] Sensor endpoint returns valid data
- [ ] Prediction endpoint accepts image
- [ ] Prediction endpoint returns label + confidence
- [ ] Error responses are well-formatted
- [ ] Response times are acceptable (<5s)

### Integration

- [ ] ML prediction + Sensor data arrives together
- [ ] Severity calculated correctly for all disease types
- [ ] Advisory recommendations match disease + severity
- [ ] All 6 diseases have proper thresholds
- [ ] All 3 severity levels work for all diseases

### User Experience

- [ ] User can see live sensor data
- [ ] Disease prediction is clear and visible
- [ ] Severity level is prominently displayed
- [ ] Recommendations are easy to read and actionable
- [ ] Error messages are helpful

---

## Quick Test Commands

```bash
# Test API endpoints from terminal
# Get sensor data
curl http://localhost:5000/api-sensor/sensor-data

# Test ML prediction with sample image
curl -F "image=@sample_leaf.jpg" \
  http://localhost:5000/api/leaf/predict

# Check frontend is running
curl http://localhost:5173

# Check backend health
curl http://localhost:5000/
```

---

## Debugging Tips

### If sensor data is not showing:

1. Check if IoT system is running
2. Verify sensor data is being saved to MongoDB
3. Test `/api-sensor/sensor-data` endpoint directly
4. Check browser console for fetch errors

### If advisory is not showing:

1. Verify prediction completed successfully
2. Check if `result` state has `label` field
3. Verify disease label matches exactly (case-sensitive)
4. Look for errors in browser console

### If severity is wrong:

1. Check sensor data values in browser DevTools
2. Test `calculateSeverity()` directly in console
3. Verify disease-specific thresholds match your conditions
4. Check for edge case bugs in severity logic

### If styling looks wrong:

1. Clear browser cache (Ctrl+Shift+Delete)
2. Restart frontend dev server
3. Check LeafDisease.css for syntax errors
4. Verify CSS classes match JSX classNames

---

**Status**: ✅ Ready for Testing  
**Test Coverage**: Comprehensive  
**Expected Duration**: 2-3 hours for full testing
