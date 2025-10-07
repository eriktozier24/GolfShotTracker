// ClubAnalysis.jsx
import { useEffect, useState } from "react";
import { getAllShots } from "../../utils/db";

export default function ClubAnalysis() {
  const [shots, setShots] = useState([]);
  const [club, setClub] = useState("");

  useEffect(() => {
    getAllShots().then(setShots);
  }, []);

  const clubs = [...new Set(shots.map((s) => s.club))];
  const clubShots = shots.filter((s) => s.club === club);

  // Aggregate by round
  const rounds = [...new Set(clubShots.map((s) => s.round_id))];
  const shotsPerRound = clubShots.length / (rounds.length || 1);

  // Distance stats
  const distances = clubShots.map((s) => s.distance).sort((a, b) => a - b);
  const avg = distances.reduce((a, b) => a + b, 0) / (distances.length || 1);
  const min = distances[0] || 0;
  const max = distances[distances.length - 1] || 0;
  const median = distances[Math.floor(distances.length / 2)] || 0;

  // Strokes gained
  const totalSG = clubShots.reduce((a, s) => a + (s.strokes_gained || 0), 0);
  const avgSG = totalSG / (clubShots.length || 1);

  const sgByCategory = ["Off the Tee", "Approach", "Around the Green", "Putting"].map((cat) => {
    const sg = clubShots
      .filter((s) => s.sg_category === cat)
      .reduce((a, s) => a + (s.strokes_gained || 0), 0);
    return { cat, sg };
  });

  const sgByLie = [...new Set(clubShots.map((s) => s.start_lie))].map((lie) => {
    const sg = clubShots
      .filter((s) => s.start_lie === lie)
      .reduce((a, s) => a + (s.strokes_gained || 0), 0);
    return { lie, sg };
  });

  return (
    <div className="p-6">
      <h3 className="text-xl font-bold mb-4">Club Analysis</h3>

      {/* Club selector always visible */}
      <div className="mb-6">
        <label className="block mb-2 font-semibold">Select Club:</label>
        <select
          value={club}
          onChange={(e) => setClub(e.target.value)}
          className="border p-2 rounded w-64 bg-white"
        >
          <option value="">-- Choose a Club --</option>
          {clubs.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {club && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Usage */}
          <div className="p-4 rounded-lg shadow bg-white flex flex-col">
            <h4 className="font-semibold mb-2">Usage</h4>
            <p>Total Shots: {clubShots.length}</p>
            <p>Rounds Used: {rounds.length}</p>
            <p>Shots per Round: {shotsPerRound.toFixed(1)}</p>
          </div>

          {/* Distance */}
        <div className="p-4 rounded-lg shadow bg-white flex flex-col">
            <h4 className="font-semibold mb-2">Distance (yds)</h4>
            <table className="min-w-full border border-gray-200 rounded">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-3 py-2 text-sm font-medium text-gray-700">Min</th>
                        <th className="px-3 py-2 text-sm font-medium text-gray-700">Average</th>
                        <th className="px-3 py-2 text-sm font-medium text-gray-700">Median</th>
                        <th className="px-3 py-2 text-sm font-medium text-gray-700">Max</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                    <td className="px-3 py-2 text-sm font-medium text-center">{min}</td>
                    <td className="px-3 py-2 text-sm font-medium text-center">{avg.toFixed(1)}</td>
                    <td className="px-3 py-2 text-sm font-medium text-center">{median}</td>
                    <td className="px-3 py-2 text-sm font-medium text-center">{max}</td>
                    </tr>
                </tbody>
            </table>
        </div>

          {/* Strokes Gained */}
          <div className="p-4 rounded-lg shadow bg-white flex flex-col col-span-2">
            <h4 className="font-semibold mb-2">Strokes Gained</h4>
            <p>
              Total SG:{" "}
              <span className={totalSG < 0 ? "text-red-600" : "text-green-600"}>
                {totalSG.toFixed(2)}
              </span>
            </p>
            <p>
              Avg SG per Shot:{" "}
              <span className={avgSG < 0 ? "text-red-600" : "text-green-600"}>
                {avgSG.toFixed(2)}
              </span>
            </p>

            {/* SG by Category */}
            <div className="mt-4">
              <h5 className="font-semibold mb-1">By Category</h5>
              <ul className="grid grid-cols-2 gap-2">
                {sgByCategory.map(({ cat, sg }) => (
                  <li
                    key={cat}
                    className={`${sg < 0 ? "text-red-600" : "text-green-600"}`}
                  >
                    {cat}: {sg.toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>

            {/* SG by Lie */}
            <div className="mt-4">
              <h5 className="font-semibold mb-1">By Lie</h5>
              <ul className="grid grid-cols-2 gap-2">
                {sgByLie.map(({ lie, sg }) => (
                  <li
                    key={lie}
                    className={`${sg < 0 ? "text-red-600" : "text-green-600"}`}
                  >
                    {lie}: {sg.toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
