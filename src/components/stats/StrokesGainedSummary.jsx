import React, { useEffect, useState } from "react";
import { getAllShots, getAllRounds } from "../../utils/db";

export default function StrokesGainedSummary() {
  const [shots, setShots] = useState([]);
  const [rounds, setRounds] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const allShots = await getAllShots();
      setShots(allShots);

      const allRounds = await getAllRounds();
      setRounds(allRounds);
    };
    fetchData();
  }, []);

  const categories = ["Off the Tee", "Approach", "Around the Green", "Putting"];
  const totalSG = shots.reduce((acc, s) => acc + (s.strokes_gained || 0), 0);

  // Compute "By Round" averages
  const roundCount = rounds.length || 1;
  const sgByRound = shots.reduce((acc, s) => {
    acc[s.sg_category] = (acc[s.sg_category] || 0) + (s.strokes_gained || 0);
    return acc;
  }, {});
  categories.forEach(cat => {
    sgByRound[cat] = sgByRound[cat] / roundCount;
  });
  const totalSGPerRound = totalSG / roundCount;

   // Total SG by club
  const clubs = [...new Set(shots.map((s) => s.club))];
  const sgByClub = clubs.map((club) => {
    const clubShots = shots.filter((s) => s.club === club);
    const total = clubShots.reduce((acc, s) => acc + (s.strokes_gained || 0), 0);
    return { club, total, perRound: total / roundCount };
  });

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Strokes Gained Summary</h2>

      <div className="grid grid-cols-5 gap-4">
        {categories.map((cat) => {
          const catShots = shots.filter((s) => s.sg_category === cat);

          return (
            <div key={cat} className="p-4 rounded-lg shadow bg-white flex flex-col">
              <h3 className="font-semibold mb-2">{cat}</h3>
              <p className={`text-lg font-bold ${sgByRound[cat] < 0 ? "text-red-600" : "text-green-600"}`}>
                Total: {sgByRound[cat].toFixed(2)}
              </p>

              <hr className="my-4 border-gray-300" />

              <h4 className="font-semibold mt-2 mb-1">By Club</h4>
              <ul className="text-sm">
                {[...new Set(catShots.map((s) => s.club))].map((club) => {
                  const clubShots = catShots.filter((s) => s.club === club);
                  const clubSG = clubShots.reduce((acc, s) => acc + (s.strokes_gained || 0), 0);
                  return (
                    <li key={club} className={`${clubSG < 0 ? "text-red-600" : "text-green-600"}`}>
                      {club}: {clubSG.toFixed(2)}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}

        {/* Total Column */}
        <div className="p-4 rounded-lg shadow bg-white flex flex-col">
          <h3 className="font-semibold mb-2">Total</h3>
          <p className={`text-lg font-bold ${totalSGPerRound < 0 ? "text-red-600" : "text-green-600"}`}>
            Total: {totalSGPerRound.toFixed(2)}
          </p>

          <hr className="my-4 border-gray-300" />
          <h4 className="font-semibold mt-2 mb-1">By Club</h4>
          <ul className="text-sm">
            {[...new Set(shots.map((s) => s.club))].map((club) => {
              const clubShots = shots.filter((s) => s.club === club);
              const clubSG = clubShots.reduce((acc, s) => acc + (s.strokes_gained || 0), 0);
              return (
                <li key={club} className={`${clubSG < 0 ? "text-red-600" : "text-green-600"}`}>
                  {club}: {clubSG.toFixed(2)}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Best Clubs Section */}
        <div className="p-4 rounded-lg shadow bg-white flex flex-col col-span-5">
          <h3 className="text-lg font-bold mb-2">Strokes Gained Average for Clubs</h3>
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-1 px-2">Club</th>
                <th className="py-1 px-2">Total SG</th>
                <th className="py-1 px-2">SG per Round</th>
              </tr>
            </thead>
            <tbody>
              {sgByClub
                .sort((a, b) => b.perRound - a.perRound) // rank by round average
                .map(({ club, total, perRound }) => (
                  <tr key={club} className="border-b">
                    <td className="py-1 px-2 font-medium">{club}</td>
                    <td className={`py-1 px-2 ${total < 0 ? "text-red-600" : "text-green-600"}`}>
                      {total.toFixed(2)}
                    </td>
                    <td className={`py-1 px-2 ${perRound < 0 ? "text-red-600" : "text-green-600"}`}>
                      {perRound.toFixed(2)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}