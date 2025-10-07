import { courses } from "../../data/courses";
import CourseHeader from "../CourseHeader";
import RoundComplete from "./RoundComplete";
import HoleViewer from "./HoleViewer";


export default function RoundInProgress({ round, setRound, handleFinish }) {
  const course = courses.find((c) => c.id === round.courseId);
  const hole = course.holes.find((h) => h.hole === round.currentHole);

  const setTee = (holeNumber, pos) => {
    setRound(prev => ({
      ...prev,
      holes: prev.holes.map(h =>
        h.hole === holeNumber ? { ...h, tee: pos } : h
      ),
    }));
  };

  const setPin = (holeNumber, pos) => {
    setRound(prev => ({
      ...prev,
      holes: prev.holes.map(h =>
        h.hole === holeNumber ? { ...h, pin: pos } : h
      ),
    }));
  };


  const handleAddShot = (holeNumber, newShot) => {
    setRound(prev => ({
      ...prev,
      holes: prev.holes.map(h =>
        h.hole === holeNumber
          ? { ...h, shots: [...h.shots, newShot] }
          : h
      )
    }));
  };

  const handleDeleteLast = (holeNumber) => {
    setRound(prev => ({
      ...prev,
      holes: prev.holes.map(h =>
        h.hole === holeNumber
          ? { ...h, shots: h.shots.slice(0, -1) }
          : h
      )
    }));
  };


  const isRoundComplete = () => {
    if (!round || round.holes.length === 0) return false;

    return round.holes.length === 18 && round.holes.every(
            (h) => h.shots.length > 0 && h.shots[h.shots.length - 1].end_lie === "Hole"
          );
  };

  return (
    <div className="flex h-screen justify-center bg-gray-50">
      <div className="max-w-7xl w-4/5 mx-auto p-4 flex flex-col gap-6">
        {/* Course header on top */}
        <CourseHeader
          course={course}
          hole={hole}
          round={round}
          setRound={setRound}
        />

        {/* Main content: Hole viewer and shot tracking*/}
        <div className="flex gap-6">
          <div className="w-full mx-auto bg-white rounded-lg shadow-md flex items-center justify-center">
            <HoleViewer
              hole={hole}
              course={course}
              holeShots={round.holes.find((h) => h.hole === hole.hole).shots}
              teePosition={round.holes.find(h => h.hole === hole.hole).tee}
              pinPosition={round.holes.find(h => h.hole === hole.hole).pin}
              onSetTee={(pos) => setTee(hole.hole, pos)}
              onSetPin={(pos) => setPin(hole.hole, pos)}
              onAddShot={(shot) => handleAddShot(hole.hole, shot)}
              onDeleteLast={() => handleDeleteLast(hole.hole)}
            />
          </div>
        </div>
      </div>

      {isRoundComplete() && <RoundComplete round={round} course={course} onFinish={handleFinish} /> }
    </div>
  );
}
