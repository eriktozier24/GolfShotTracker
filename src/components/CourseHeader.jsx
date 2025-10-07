export default function CourseHeader({ course, hole, round, setRound }) {
  const goToHole = (num) => {
    if (num >= 1 && num <= course.holes.length) {
      setRound((prev) => ({ ...prev, currentHole: num }));
    }
  };

  return (
    <div className="grid grid-cols-3 items-center mb-4 border-b pb-2">
      {/* Left: Course Info */}
      <div>
        <h2 className="text-xl font-bold">{course.name}</h2>
        <p className="text-sm text-gray-600">
          {course.city}, {course.state}
        </p>
      </div>

      {/* Center: Hole Info */}
      <div className="text-center">
        <h3 className="text-lg font-semibold">
          Hole {hole.hole} – Par {hole.par}
        </h3>
      </div>

      {/* Right: Navigation */}
      <div className="flex justify-end gap-2">
        <button
          onClick={() => goToHole(round.currentHole - 1)}
          disabled={round.currentHole === 1}
          className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => goToHole(round.currentHole + 1)}
          disabled={round.currentHole === course.holes.length}
          className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}