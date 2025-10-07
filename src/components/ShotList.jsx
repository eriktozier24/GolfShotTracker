export default function ShotList({ shots, onDeleteLast }) {
  return (
    <div className="mt-4">
      <h3 className="font-semibold mb-2">Shots:</h3>

      {shots.length === 0 ? (
        <p className="text-gray-500">No shots logged yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1 text-left">#</th>
                <th className="border px-2 py-1 text-left">Club</th>
                <th className="border px-2 py-1 text-left">Start Lie</th>
                <th className="border px-2 py-1 text-left">Start Distance to Pin</th>
                <th className="border px-2 py-1 text-left">End Lie</th>
                <th className="border px-2 py-1 text-left">End Distance to Pin</th>
                <th className="border px-2 py-1 text-left">Distance Traveled</th>
              </tr>
            </thead>
            <tbody>
              {shots.map((s, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="border px-2 py-1">{i + 1}</td>
                  <td className="border px-2 py-1">{s.club}</td>
                  <td className="border px-2 py-1">{s.start_lie}</td>
                  <td className="border px-2 py-1">{s.startDistanceToPin} yds</td>
                  <td className="border px-2 py-1">{s.end_lie}</td>
                  <td className="border px-2 py-1">{s.endDistanceToPin} yds</td>
                  <td className="border px-2 py-1">{s.distance} yds</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {shots.length > 0 && (
        <button
          onClick={onDeleteLast}
          className="mt-2 px-3 py-1 bg-red-600 text-white rounded"
        >
          Delete Last Shot
        </button>
      )}
    </div>
  );
}