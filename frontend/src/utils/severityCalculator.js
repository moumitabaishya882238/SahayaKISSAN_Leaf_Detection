/**
 * Calculate disease severity based on sensor readings and disease type
 */
export function calculateSeverity(diseaseLabel, sensorData) {
  if (!sensorData) return "MEDIUM"; // Default if no sensor data

  const { temperature, humidity, soil_moisture } = sensorData;

  // Healthy Leaves - severity is about environmental risk
  if (diseaseLabel === "Healthy_leaves") {
    if (
      temperature >= 20 &&
      temperature <= 30 &&
      humidity >= 60 &&
      humidity <= 75 &&
      soil_moisture >= 40 &&
      soil_moisture <= 70
    ) {
      return "LOW";
    }

    // Check if one parameter is out of range
    const outOfRange =
      (temperature < 20 || temperature > 30) +
      (humidity < 60 || humidity > 75) +
      (soil_moisture < 40 || soil_moisture > 70);

    if (outOfRange === 1) return "MEDIUM";
    if (outOfRange >= 2) return "HIGH";
    return "MEDIUM";
  }

  // Blister Blight - driven by humidity and cool-to-moderate temperature
  if (diseaseLabel === "Blister_Blight") {
    if (
      humidity >= 70 &&
      humidity <= 80 &&
      temperature >= 18 &&
      temperature <= 25 &&
      soil_moisture >= 40 &&
      soil_moisture <= 70
    ) {
      return "LOW";
    }

    if (humidity > 80 && temperature >= 18 && temperature <= 25) {
      if (humidity > 85 && soil_moisture > 70) return "HIGH";
      return "MEDIUM";
    }

    return "MEDIUM";
  }

  // Brown Blight - warm temperature, high humidity, excess moisture
  if (diseaseLabel === "Brown_Blight") {
    if (
      temperature >= 24 &&
      temperature <= 28 &&
      humidity >= 70 &&
      humidity <= 80 &&
      soil_moisture >= 40 &&
      soil_moisture <= 70
    ) {
      return "LOW";
    }

    if (humidity > 80 && temperature >= 28) {
      if (
        humidity > 85 &&
        temperature >= 25 &&
        temperature <= 32 &&
        soil_moisture > 70
      ) {
        return "HIGH";
      }
      return "MEDIUM";
    }

    return "MEDIUM";
  }

  // Leaf Red Rust - high humidity and poor soil conditions
  if (diseaseLabel === "Leaf_Red_Rust") {
    if (
      humidity >= 60 &&
      humidity <= 80 &&
      soil_moisture >= 40 &&
      soil_moisture <= 70 &&
      temperature >= 22 &&
      temperature <= 30
    ) {
      return "LOW";
    }

    if (humidity > 80) {
      if (humidity > 85 && soil_moisture > 70) return "HIGH";
      return "MEDIUM";
    }

    return "MEDIUM";
  }

  // Red Spider Mite - opposite of fungal diseases, thrives in hot dry conditions
  if (diseaseLabel === "Red_Spider_Mite") {
    if (temperature < 30 && humidity >= 60 && soil_moisture >= 30) {
      return "LOW";
    }

    if ((temperature > 30 && humidity < 50) || soil_moisture < 30) {
      if (temperature > 32 && humidity < 45 && soil_moisture < 25) {
        return "HIGH";
      }
      return "MEDIUM";
    }

    return "MEDIUM";
  }

  // Tea Mosquito Bug - warm temperature and moderate humidity
  if (diseaseLabel === "Tea_Mosquito_Bug") {
    if (
      temperature >= 24 &&
      temperature <= 28 &&
      humidity >= 50 &&
      humidity <= 75 &&
      soil_moisture >= 40 &&
      soil_moisture <= 70
    ) {
      return "LOW";
    }

    if (temperature >= 28 && temperature <= 32) {
      if (temperature > 30 && humidity >= 50) return "HIGH";
      return "MEDIUM";
    }

    return "MEDIUM";
  }

  return "MEDIUM"; // Default
}

/**
 * Get advisory recommendations based on disease and severity
 */
export function getAdvisory(diseaseLabel, severity) {
  const advisories = {
    Healthy_leaves: {
      LOW: {
        emoji: "✅",
        title: "Healthy Leaves - Optimal Conditions",
        severity: "🟢 LOW",
        actions: [
          "Maintain current watering schedule",
          "Continue regular monitoring",
          "Keep humidity balanced (60-75%)",
          "Ensure good sunlight exposure",
        ],
      },
      MEDIUM: {
        emoji: "⚠️",
        title: "Healthy Leaves - Environmental Stress",
        severity: "🟡 MEDIUM",
        actions: [
          "Monitor environmental parameters closely",
          "Adjust irrigation to balance soil moisture",
          "Improve air circulation if humidity is high",
          "Increase shade if temperature is high",
          "Check daily for early disease symptoms",
        ],
      },
      HIGH: {
        emoji: "🚨",
        title: "Healthy Leaves - Critical Stress",
        severity: "🔴 HIGH",
        actions: [
          "Immediate environmental correction needed",
          "Adjust irrigation (too wet or too dry)",
          "Increase ventilation to control humidity",
          "Shade management if temperature is extreme",
          "Increase monitoring frequency to twice daily",
          "Be prepared for disease outbreak",
        ],
      },
    },
    Blister_Blight: {
      LOW: {
        emoji: "🦠",
        title: "Blister Blight",
        severity: "🟢 LOW (Early spots detected)",
        actions: [
          "Remove infected young leaves",
          "Avoid night irrigation",
          "Monitor humidity closely",
          "Ensure good air circulation",
        ],
      },
      MEDIUM: {
        emoji: "🦠",
        title: "Blister Blight",
        severity: "🟡 MEDIUM (Spreading on young shoots)",
        actions: [
          "Apply recommended fungicide",
          "Improve airflow by pruning",
          "Reduce shade and leaf wetness",
          "Lower irrigation frequency",
          "Monitor all new shoots carefully",
        ],
      },
      HIGH: {
        emoji: "🦠",
        title: "Blister Blight",
        severity: "🔴 HIGH (Severe outbreak)",
        actions: [
          "Immediate fungicide spraying required",
          "Stop overhead irrigation completely",
          "Restrict plucking until recovery",
          "Increase spray frequency (every 7-10 days)",
          "Remove severely infected branches",
          "Daily inspection of all foliage",
        ],
      },
    },
    Brown_Blight: {
      LOW: {
        emoji: "🍂",
        title: "Brown Blight",
        severity: "🟢 LOW",
        actions: [
          "Remove infected mature leaves",
          "Improve soil drainage",
          "Avoid over-irrigation",
          "Monitor for spread",
        ],
      },
      MEDIUM: {
        emoji: "🍂",
        title: "Brown Blight",
        severity: "🟡 MEDIUM",
        actions: [
          "Apply systemic fungicide",
          "Reduce moisture stress on plants",
          "Increase field sanitation",
          "Improve drainage if water logging",
          "Reduce shade to increase light exposure",
        ],
      },
      HIGH: {
        emoji: "🍂",
        title: "Brown Blight",
        severity: "🔴 HIGH",
        actions: [
          "Emergency fungicide treatment required",
          "Stop irrigation temporarily",
          "Remove severely infected bushes",
          "Improve drainage immediately",
          "Spray every 5-7 days until controlled",
          "Quarantine severely affected areas",
        ],
      },
    },
    Leaf_Red_Rust: {
      LOW: {
        emoji: "🍁",
        title: "Leaf Red Rust",
        severity: "🟢 LOW",
        actions: [
          "Improve sunlight exposure",
          "Balance fertilization (reduce nitrogen)",
          "Monitor humidity trends",
          "Maintain good drainage",
        ],
      },
      MEDIUM: {
        emoji: "🍁",
        title: "Leaf Red Rust",
        severity: "🟡 MEDIUM",
        actions: [
          "Apply copper-based spray",
          "Improve drainage to reduce moisture",
          "Prune shaded branches",
          "Increase air circulation",
          "Reduce leaf wetness duration",
        ],
      },
      HIGH: {
        emoji: "🍁",
        title: "Leaf Red Rust",
        severity: "🔴 HIGH",
        actions: [
          "Repeated copper treatment (every 10-14 days)",
          "Heavy pruning of infected parts",
          "Long-term shade reduction plan",
          "Improve soil drainage urgently",
          "Reduce nitrogen fertilizer",
          "Daily monitoring for disease progression",
        ],
      },
    },
    Red_Spider_Mite: {
      LOW: {
        emoji: "🕷",
        title: "Red Spider Mite",
        severity: "🟢 LOW",
        actions: [
          "Increase irrigation to reduce stress",
          "Reduce dust in plantation",
          "Monitor underside of leaves",
          "Maintain humidity above 60%",
        ],
      },
      MEDIUM: {
        emoji: "🕷",
        title: "Red Spider Mite",
        severity: "🟡 MEDIUM",
        actions: [
          "Spray approved miticide",
          "Increase humidity via misting",
          "Remove heavily infested leaves",
          "Increase irrigation frequency",
          "Monitor every 3-4 days",
        ],
      },
      HIGH: {
        emoji: "🕷",
        title: "Red Spider Mite",
        severity: "🔴 HIGH",
        actions: [
          "Emergency miticide application required",
          "Stop plucking temporarily",
          "Continuous monitoring every 48 hours",
          "Increase irrigation to maximum",
          "Daily misting to increase humidity",
          "Repeat miticide sprays every 5-7 days",
        ],
      },
    },
    Tea_Mosquito_Bug: {
      LOW: {
        emoji: "🦟",
        title: "Tea Mosquito Bug",
        severity: "🟢 LOW",
        actions: [
          "Remove early affected shoots",
          "Maintain balanced shade",
          "Monitor young buds",
          "Maintain good air circulation",
        ],
      },
      MEDIUM: {
        emoji: "🦟",
        title: "Tea Mosquito Bug",
        severity: "🟡 MEDIUM",
        actions: [
          "Apply insecticide spray",
          "Prune infested branches",
          "Reduce alternate host plants",
          "Monitor bud damage closely",
        ],
      },
      HIGH: {
        emoji: "🦟",
        title: "Tea Mosquito Bug",
        severity: "🔴 HIGH",
        actions: [
          "Immediate insecticide treatment required",
          "Stop plucking affected areas",
          "Continuous pest surveillance",
          "Remove heavily infested shoots",
          "Repeat spray every 7-10 days",
          "Remove alternative host plants nearby",
        ],
      },
    },
  };

  return (
    advisories[diseaseLabel]?.[severity] || {
      emoji: "❓",
      title: "Unknown Disease",
      severity: "UNKNOWN",
      actions: ["Contact agricultural extension"],
    }
  );
}
