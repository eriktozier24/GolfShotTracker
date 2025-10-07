import { useState, useEffect } from "react";
import { loadBaselineCsvs, calculateStrokesGained } from "../../utils/shots_gained";

export default function RoundComplete({ round, course, onFinish }) {
  if (!round) return null;

  const [puttBaseline, setPuttBaseline] = useState([]);
  const [shotBaseline, setShotBaseline] = useState([]);

  useEffect(() => {
    loadBaselineCsvs().then(({ puttBaseline, shotBaseline }) => {
      setPuttBaseline(puttBaseline);
      setShotBaseline(shotBaseline);
    });
  }, []);

  // --- Build scorecard
  const holes = round.holes;
  const allShots = round.holes.flatMap((h) => h.shots.map((s) => ({ ...s, hole: h.hole })));

  // Compute strokes gained and club stats
  const strokesGained = calculateStrokesGained(allShots,puttBaseline,shotBaseline);

  // --- Strokes gained by category 
  const categories = ["Off the Tee", "Approach", "Around the Green", "Putting"];
  const sgByCat = categories.reduce((acc, cat) => {
    acc[cat] = strokesGained
      .filter((s) => s.sg_category === cat)
      .reduce((sum, s) => sum + s.strokes_gained, 0);
    return acc;
  }, {});
  const totalSG = Object.values(sgByCat).reduce((a, b) => a + b, 0);

    // Map SG to shots
  const enrichedShots = allShots.map((s) => {
    const sg = strokesGained.find((sg) => sg.start.x === s.start.x && sg.start.y === s.start.y);
    return {
      ...s,
      strokes_gained: sg?.strokes_gained ?? 0,
      sg_category: sg?.sg_category ?? null,
    };
  });

  const updatedHoles = holes.map((h) => ({
    ...h,
    shots: enrichedShots.filter((s) => s.hole === h.hole),
  }));

  const updatedRound = {
    ...round,
    holes: updatedHoles,
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Round Summary</h2>

        {/* Scorecard */}
        <h3 className="font-semibold mb-2">Scorecard</h3>

        {/* Front 9 */}
        <table className="w-full text-sm border mb-4">
        <thead>
            <tr className="bg-gray-100">
            <th className="p-2 text-left">Hole</th>
            {holes.slice(0, 9).map((h) => (
                <th key={h.hole} className="p-2 text-center">
                {h.hole}
                </th>
            ))}
            <th className="p-2 text-center">Front</th>
            </tr>
        </thead>
        <tbody>
            <tr>
            <td className="p-2 font-semibold">Par</td>
            {holes.slice(0, 9).map((h) => (
                <td key={h.hole} className="p-2 text-center">
                {h.par || "-"}
                </td>
            ))}
            <td className="p-2 text-center font-bold">
                {holes.slice(0, 9).reduce((sum, h) => sum + (h.par || 0), 0)}
            </td>
            </tr>
            <tr>
            <td className="p-2 font-semibold">Shots</td>
            {holes.slice(0, 9).map((h) => (
                <td key={h.hole} className="p-2 text-center">
                {h.shots.length}
                </td>
            ))}
            <td className="p-2 text-center font-bold">
                {holes.slice(0, 9).reduce((sum, h) => sum + h.shots.length, 0)}
            </td>
            </tr>
        </tbody>
        </table>

        {/* Back 9 */}
        <table className="w-full text-sm border mb-6">
        <thead>
            <tr className="bg-gray-100">
            <th className="p-2 text-left">Hole</th>
            {holes.slice(9, 18).map((h) => (
                <th key={h.hole} className="p-2 text-center">
                {h.hole}
                </th>
            ))}
            <th className="p-2 text-center">Back</th>
            <th className="p-2 text-center">Total</th>
            </tr>
        </thead>
        <tbody>
            <tr>
            <td className="p-2 font-semibold">Par</td>
            {holes.slice(9, 18).map((h) => (
                <td key={h.hole} className="p-2 text-center">
                {h.par || "-"}
                </td>
            ))}
            <td className="p-2 text-center font-bold">
                {holes.slice(9, 18).reduce((sum, h) => sum + (h.par || 0), 0)}
            </td>
            <td className="p-2 text-center font-bold">
                {holes.reduce((sum, h) => sum + (h.par || 0), 0)}
            </td>
            </tr>
            <tr>
            <td className="p-2 font-semibold">Shots</td>
            {holes.slice(9, 18).map((h) => (
                <td key={h.hole} className="p-2 text-center">
                {h.shots.length}
                </td>
            ))}
            <td className="p-2 text-center font-bold">
                {holes.slice(9, 18).reduce((sum, h) => sum + h.shots.length, 0)}
            </td>
            <td className="p-2 text-center font-bold">
                {holes.reduce((sum, h) => sum + h.shots.length, 0)}
            </td>
            </tr>
        </tbody>
        </table>


        {/* Strokes Gained by Category */}
        <h3 className="font-semibold mb-2">Strokes Gained by Category</h3>
        <table className="w-full text-sm border mb-6">
          <thead>
            <tr className="bg-gray-100">
              {categories.map((cat) => (
                <th key={cat} className="p-2 text-center">{cat}</th>
              ))}
              <th className="p-2 text-center">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              {categories.map((cat) => (
                <td
                  key={cat}
                  className={`p-2 text-center ${
                    sgByCat[cat] < 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {sgByCat[cat]?.toFixed(2) || "0.00"}
                </td>
              ))}
              <td
                className={`p-2 text-center font-bold ${
                  totalSG < 0 ? "text-red-600" : "text-green-600"
                }`}
              >
                {totalSG.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => onFinish(updatedRound)}
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
          >
            Finish Round
          </button>
        </div>
      </div>
    </div>
  );
}