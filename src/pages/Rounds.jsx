import { useState } from "react";
import RoundInProgress from "../components/Rounds/RoundInProgress";
import { courses } from "../data/courses";
import { saveRound } from "../utils/db";

export default function Rounds() {
  const [round, setRound] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [roundDate, setRoundDate] = useState(() => new Date().toISOString().split("T")[0]);

  const startRound = (courseId, playerName, roundDate) => {
    setRound({
      courseId,
      currentHole: 1,
      holes: selectedCourse.holes.map(h => ({
        hole: h.hole,
        par: h.par,
        tee: null,
        pin: null,
        shots: [],
      })),
      startedAt: new Date(roundDate),
    });
  };

  const handleFinish = async (updatedRound) => {
    try {
      const savedId = await saveRound({
        courseId: updatedRound.courseId,
        startedAt: updatedRound.startedAt,
        holes: updatedRound.holes,
        score: updatedRound.holes.reduce((acc, h) => acc + (h.shots?.length || 0), 0)
      });

      console.log("Saved round id:", savedId);
      setRound(null);
    } catch (err) {
      console.error("Failed to save round:", err);
    }
  };

  if (!round) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Start a Round</h1>
        <p className="mb-4">Click on a course to start a round</p>
        {courses.map((course) => (
          <button
            key={course.id}
            onClick={() => {
              setSelectedCourse(course);
              setShowModal(true);
            }}
            className="bg-white rounded-lg shadow p-6 m-4 cursor-pointer hover:bg-gray-50"
          >
            {course.name} ({course.city}, {course.state})
          </button>
        ))}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">
                Start Round – {selectedCourse?.name}
              </h2>

              <label className="block mb-3">
                <span className="text-gray-700">Round Date</span>
                <input
                  type="date"
                  className="mt-1 block w-full border rounded p-2"
                  value={roundDate}
                  onChange={(e) => setRoundDate(e.target.value)}
                />
              </label>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (selectedCourse && playerName) {
                      startRound(selectedCourse.id, playerName, roundDate);
                      setShowModal(false);
                    }
                  }}
                  disabled={!playerName}
                  className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400"
                >
                  Start Round
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  } else {
    return (
      <RoundInProgress
        round={round}
        setRound={setRound}
        handleFinish={handleFinish}
      />
    );
  }
}