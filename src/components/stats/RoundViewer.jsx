// RoundViewer.jsx
import { useState, useEffect, useMemo } from "react";
import { getAllRounds, getRoundWithShots } from "../../utils/db";
import { courses } from "../../data/courses";

export default function RoundViewer() {
  const [rounds, setRounds] = useState([]);
  const [selectedRound, setSelectedRound] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  useEffect(() => {
    getAllRounds().then(setRounds);
  }, []);

  const loadRound = async (id) => {
    const round = await getRoundWithShots(id);
    setSelectedRound(round);
  };

  function getCourseName(courseId) {
    return courses.find((c) => c.id === courseId).name;
  }

  const allShots = useMemo(() => {
    if (!selectedRound) return [];

    return selectedRound.holes
      .flatMap((h) =>
        h.shots.map((s) => ({
          ...s,
          hole_number: h.hole,
        }))
      )
      .sort((a, b) => {
        if (a.hole_number !== b.hole_number)
          return a.hole_number - b.hole_number;
        return a.shot_number - b.shot_number;
      });
  }, [selectedRound]);


    const sortedShots = useMemo(() => {
      if (!sortConfig.key) return allShots;
      return [...allShots].sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }, [allShots, sortConfig]);

    const requestSort = (key) => {
      let direction = "asc";
      if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
      setSortConfig({ key, direction });
  };


  if (!rounds.length) {
    return <p>No rounds recorded yet</p>;
  } else {
    return (
        <div className="p-6">
            {/* Round list */}
            <h2 className="text-xl font-bold mb-4">Rounds</h2>
            <div className="rounded-lg shadow bg-white overflow-hidden">
              <table className="min-w-full border-collapse">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left text-sm font-semibold text-gray-700 p-3">Player</th>
                    <th className="text-left text-sm font-semibold text-gray-700 p-3">Date</th>
                    <th className="text-left text-sm font-semibold text-gray-700 p-3">Course</th>
                    <th className="text-right text-sm font-semibold text-gray-700 p-3">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {rounds.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => loadRound(r.id)}
                      className="cursor-pointer hover:bg-blue-50 border-b transition"
                    >
                      <td className="p-3 text-sm text-gray-800">{r.playerName || "—"}</td>
                      <td className="p-3 text-sm text-gray-800">{r.date_played}
                      </td>
                      <td className="p-3 text-sm text-gray-800">{getCourseName(r.course_id)}</td>
                      <td className="p-3 text-sm text-gray-800 text-right">{r.score ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>


        {/* Round summary modal */}
        {selectedRound && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full relative">
                <button
                className="absolute top-2 right-2 text-gray-500 hover:text-black cursor-pointer"
                onClick={() => setSelectedRound(null)}
                >
                ✕
                </button>

                <h2 className="text-2xl font-bold mb-4 text-center">
                Round Summary – {getCourseName(selectedRound.course_id)} (
                {selectedRound.date_played})
                </h2>

                {renderRoundSummary(selectedRound, sortedShots, sortConfig, requestSort)}
            </div>
            </div>
        )}
        </div>);
    }
}

// helper
function renderRoundSummary(round, sortedShots, sortConfig, requestSort) {  
  const holes = round.holes;
  const allShots = holes.flatMap((h) => h.shots);

  // Strokes gained by category
  const categories = ["Off the Tee", "Approach", "Around the Green", "Putting"];

  const sgByCat = {};
  categories.forEach((cat) => {
    sgByCat[cat] = allShots
      .filter((s) => s.sg_category === cat)
      .reduce((sum, s) => sum + (s.strokes_gained || 0), 0);
  });
  const totalSG = allShots.reduce(
    (sum, s) => sum + (s.strokes_gained || 0),
    0
  );

  return (
    <div>
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
              <th key={cat} className="p-2 text-center">
                {cat}
              </th>
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

      <h3 className="font-semibold mb-2">All Shots</h3>
      <div className="h-[300px] bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-gray-100 text-left">
            <tr>
              {[
                { key: "hole_number", label: "Hole" },
                { key: "shot_number", label: "Shot #" },
                { key: "start_lie", label: "Start Lie" },
                { key: "startDistanceToPin", label: "Start Dist (yd)" },
                { key: "end_lie", label: "End Lie" },
                { key: "endDistanceToPin", label: "End Dist (yd)" },
                { key: "distance", label: "Dist Traveled (yd)"},
                { key: "strokes_gained", label: "SG" },
                { key: "sg_category", label: "SG Category" },
              ].map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => requestSort(key)}
                  className="px-4 py-2 font-medium cursor-pointer hover:text-blue-600"
                >
                  {label}
                  {sortConfig.key === key && (
                    <span className="ml-1 text-xs">
                      {sortConfig.direction === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedShots.map((s) => (
              <tr key={s.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{s.hole_number}</td>
                <td className="px-4 py-2">{s.shot_number}</td>
                <td className="px-4 py-2">{s.start_lie}</td>
                <td className="px-4 py-2">{s.startDistanceToPin}</td>
                <td className="px-4 py-2">{s.end_lie}</td>
                <td className="px-4 py-2">{s.endDistanceToPin}</td>
                <td className="px-4 py-2">{s.distance}</td>
                <td className={`px-4 py-2 font-medium ${s.strokes_gained > 0 ? "text-green-600" : s.strokes_gained < 0 ? "text-red-600" : "text-gray-700"}`}>{s.strokes_gained?.toFixed(2)}</td>
                <td className="px-4 py-2">{s.sg_category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}