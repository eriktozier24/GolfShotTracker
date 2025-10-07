import puttCsv from "../data/putt_baseline.csv?raw";
import shotCsv from "../data/shot_baseline.csv?raw";
import Papa from "papaparse";

export async function loadBaselineCsvs() {
  const puttBaseline = Papa.parse(puttCsv, { header: true, dynamicTyping: true }).data;
  const shotBaseline = Papa.parse(shotCsv, { header: true, dynamicTyping: true }).data;

  return { puttBaseline, shotBaseline };
}

// -----------------------------
// Expected strokes function
// -----------------------------
export function getExpectedStrokes(distance, lie, puttBaseline, shotBaseline) {
  if (lie === "Green") {
    return interpolate(distance * 3, puttBaseline, "Green"); // yards to feet
  } else {
    return interpolate(distance, shotBaseline, lie);
  }
}

function interpolate(distance, baselineData, column) {
  const distances = baselineData.map((d) => d.Distance);
  const values = baselineData.map((d) => d[column]);

  // simple linear interpolation
  for (let i = 0; i < distances.length - 1; i++) {
    if (distance >= distances[i] && distance <= distances[i + 1]) {
      const t = (distance - distances[i]) / (distances[i + 1] - distances[i]);
      return values[i] + t * (values[i + 1] - values[i]);
    }
  }
  // fallback
  return values[values.length - 1];
}

// -----------------------------
// Strokes gained calculation
// -----------------------------
export function calculateStrokesGained(shots, puttBaseline, shotBaseline) {
  return shots.map((s) => {
    let sg = 0;

    const beforeExp = getExpectedStrokes(s.startDistanceToPin,s.start_lie,puttBaseline,shotBaseline);
    const afterExp = s.end_lie == "Hole" ? 0 : getExpectedStrokes(s.endDistanceToPin,s.end_lie,puttBaseline,shotBaseline);

    sg = beforeExp - afterExp - 1;

    let sg_category;
    if (s.start_lie === "Tee") {
      sg_category = "Off the Tee";
    } else if (["Green"].includes(s.start_lie)) {
      sg_category = "Putting";
    } else if (["Fairway", "Rough", "Sand"].includes(s.start_lie) & s.startDistanceToPin < 50) {
      sg_category = "Around the Green";
    } else {
      sg_category = "Approach";
    }

    return { ...s, strokes_gained: sg, sg_category: sg_category  };
  });
}

