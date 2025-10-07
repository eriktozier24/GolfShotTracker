// src/pages/Courses.jsx
import { useState } from "react";
import { courses } from "../data/courses";

export default function Courses() {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedHole, setSelectedHole] = useState(null);

  if (selectedCourse) {
    return (
    <div className="p-4">
      <button
        onClick={() => setSelectedCourse(null)}
        className="text-sm text-green-600 underline mb-4"
      >
        ← Back to Courses
      </button>
      <h1 className="text-2xl font-bold mb-2">{selectedCourse.name}</h1>
      <p className="text-gray-600 mb-4">
        {selectedCourse.city}, {selectedCourse.state}
      </p>

      {/* Holes grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-9 gap-4">
        {selectedCourse.holes.map((hole) => (
          <div
            key={hole.hole}
            className="bg-white rounded-lg shadow p-2 flex flex-col cursor-pointer hover:shadow-lg transition"
            onClick={() => setSelectedHole(hole)}
          >
            <span className="font-medium text-sm text-center">
              Hole {hole.hole} • Par {hole.par}
            </span>
            <img
              src={`/images/${hole.image}`}
              alt={`Hole ${hole.hole}`}
              className="mt-2 rounded border object-contain h-80"
            />
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedHole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full relative">
            <button
              onClick={() => setSelectedHole(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-2">
              Hole {selectedHole.hole} • Par {selectedHole.par}
            </h2>
            <img
              src={`/images/${selectedHole.image}`}
              alt={`Hole ${selectedHole.hole}`}
              className="mt-2 rounded border object-contain max-h-[70vh] mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Courses</h1>
      <div className="grid gap-4">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-lg shadow p-4 cursor-pointer hover:bg-gray-50"
            onClick={() => setSelectedCourse(course)}
          >
            <h2 className="text-lg font-semibold">{course.name}</h2>
            <p className="text-gray-600">
              {course.city}, {course.state}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
