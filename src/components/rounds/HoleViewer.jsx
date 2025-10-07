import { useState, useRef, useEffect } from "react";
import ShotList from "../ShotList";
import { calcDistance } from "../../utils/distance";
import { clubs, lies, shot_types } from "../../data/constants";

export default function HoleViewer({ hole, course, holeShots, teePosition, pinPosition, onSetTee, onSetPin, onAddShot, onDeleteLast }) {
  const wrapperRef = useRef();
  const imgRef = useRef();
  const [pendingShot, setPendingShot] = useState(null);
  const [imgRect, setImgRect] = useState({ width: 0, height: 0, offsetX: 0, offsetY: 0 });

  // Hole complete if last shot is in the hole
  const holeComplete = holeShots.length > 0 && holeShots[holeShots.length - 1].end_lie === "Hole";

  // Update visible image rect and offsets
  const updateRect = () => {
    if (imgRef.current && wrapperRef.current) {
      const imgBox = imgRef.current.getBoundingClientRect();
      const wrapperBox = wrapperRef.current.getBoundingClientRect();
      setImgRect({
        width: imgBox.width,
        height: imgBox.height,
        offsetX: imgBox.left - wrapperBox.left,
        offsetY: imgBox.top - wrapperBox.top,
      });
    }
  };

  useEffect(() => {
    updateRect();
    window.addEventListener("resize", updateRect);
    return () => window.removeEventListener("resize", updateRect);
  }, []);

  // Handle clicks on the image
  const handleClick = (e) => {
    if (!imgRef.current) return;

    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * imgRef.current.naturalWidth;
    const y = ((e.clientY - rect.top) / rect.height) * imgRef.current.naturalHeight;

    if (!teePosition) {
      onSetTee({ x, y });
    } else if (!pinPosition) {
      onSetPin({ x, y });
    } else if (teePosition && pinPosition) {
      setPendingShot({ x, y });
    }
  };

  // delete handlers just call parent
  const deleteTee = () => onSetTee(null);
  const deletePin = () => onSetPin(null);
  const cancelPendingShot = () => setPendingShot(null);

  // Compute distances for pending shot
  const lastPosition = holeShots.length > 0 ? holeShots[holeShots.length - 1].end : teePosition;
  const pendingDistance = pendingShot ? calcDistance(hole, lastPosition, pendingShot) : null;
  const pendingDistanceToPin = pendingShot && pinPosition ? calcDistance(hole, pendingShot, pinPosition) : null;

  // Confirm a shot
  const confirmShot = (club, end_lie, shot_type) => {
    if (!pendingShot) return;

    const distance = calcDistance(hole, lastPosition, pendingShot);
    const start_lie = holeShots.length > 0 ? holeShots[holeShots.length - 1].end_lie : "Tee";

    const startDistanceToPin = calcDistance(hole, lastPosition, pinPosition);
    const endDistanceToPin = calcDistance(hole, pendingShot, pinPosition);

    const newShot = {
      club,
      start_lie,
      end_lie,
      shot_type,
      start: lastPosition,
      end: { x: pendingShot.x, y: pendingShot.y },
      distance,
      startDistanceToPin,
      endDistanceToPin,
    };

    onAddShot(newShot); // pass hole number too
    setPendingShot(null);
  };

  return (
    <div className="flex w-full max-w-6xl mx-auto h-[75vh] gap-4">
      {/* Left: Hole image */}
      <div
        ref={wrapperRef}
        className="w-1/2 bg-gray-50 rounded-lg shadow-inner flex justify-center items-center"
      >
        <div
          className="relative h-full w-full cursor-crosshair overflow-hidden"
          onClick={handleClick}
        >
          <img
            ref={imgRef}
            src={`/images/${hole.image}`}
            alt={`Hole ${hole.hole}`}
            className="h-full w-auto block mx-auto"
            onLoad={updateRect}
          />

          {/* Overlay */}
          {imgRect.width > 0 && (
            <>
              {/* SVG shot lines */}
              <svg
                className="absolute top-0 left-0 pointer-events-none"
                width={imgRect.width}
                height={imgRect.height}
                style={{
                  left: imgRect.offsetX,
                  top: imgRect.offsetY,
                }}
              >
                {holeShots.map((s, i) => {
                  const startX = (s.start.x / imgRef.current.naturalWidth) * imgRect.width;
                  const startY = (s.start.y / imgRef.current.naturalHeight) * imgRect.height;
                  const endX = (s.end.x / imgRef.current.naturalWidth) * imgRect.width;
                  const endY = (s.end.y / imgRef.current.naturalHeight) * imgRect.height;
                  return (
                    <line
                      key={i}
                      x1={startX}
                      y1={startY}
                      x2={endX}
                      y2={endY}
                      stroke="red"
                      strokeWidth="2"
                    />
                  );
                })}
              </svg>

              {/* Tee marker */}
              {teePosition && (
                <div
                  className="absolute w-3 h-3 bg-blue-600 rounded-full border border-white"
                  style={{
                    left:
                      imgRect.offsetX +
                      (teePosition.x / imgRef.current.naturalWidth) * imgRect.width -
                      6,
                    top:
                      imgRect.offsetY +
                      (teePosition.y / imgRef.current.naturalHeight) * imgRect.height -
                      6,
                  }}
                />
              )}

              {/* Pin marker */}
              {pinPosition && (
                <div
                  className="absolute w-3 h-3 bg-green-600 rounded-full border border-white"
                  style={{
                    left:
                      imgRect.offsetX +
                      (pinPosition.x / imgRef.current.naturalWidth) * imgRect.width -
                      6,
                    top:
                      imgRect.offsetY +
                      (pinPosition.y / imgRef.current.naturalHeight) * imgRect.height -
                      6,
                  }}
                />
              )}

              {/* Pending shot marker */}
              {pendingShot && (
                <div
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full border border-white"
                  style={{
                    left:
                      imgRect.offsetX +
                      (pendingShot.x / imgRef.current.naturalWidth) * imgRect.width -
                      6,
                    top:
                      imgRect.offsetY +
                      (pendingShot.y / imgRef.current.naturalHeight) * imgRect.height -
                      6,
                  }}
                />
              )}

              {/* Shot end markers */}
              {holeShots.map((s, i) => {
                const endX = (s.end.x / imgRef.current.naturalWidth) * imgRect.width;
                const endY = (s.end.y / imgRef.current.naturalHeight) * imgRect.height;
                return (
                  <div
                    key={`marker-${i}`}
                    className="absolute w-2 h-2 bg-red-600 rounded-full border border-white"
                    style={{
                      left: imgRect.offsetX + endX - 6,
                      top: imgRect.offsetY + endY - 6,
                    }}
                  />
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* Right: Shot info */}
      <div className="w-1/2 p-4 bg-white shadow-inner">
        {holeComplete && <p className="text-green-600 font-bold text-lg">Hole complete!</p>}

        <div className="w-4/5 mx-auto mt-4 p-4 rounded-lg shadow bg-gray-100 text-center space-y-3">
          {!holeComplete && !teePosition && (
            <p className="text-gray-700 font-medium">Click on the map to set your <span className="font-semibold text-blue-600">tee position</span>.</p>
          )}

          {teePosition && !pinPosition && (
            <>
              <p className="text-gray-700 font-medium">✅ Tee position set!</p>
              <button onClick={deleteTee}  className="text-sm bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition">
                Delete Tee
              </button>
              <p className="text-gray-700">Now click on the map to set the <span className="font-semibold text-green-600">pin position</span>.</p>
            </>
          )}

          {pinPosition && holeShots.length === 0 && (
            <>
              <p className="text-gray-700 font-medium">✅ Tee and pin positions set!</p>
              <button onClick={deletePin} disabled={pendingShot} className="text-sm bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition">
                Delete Pin
              </button>
            </>
          )}

          {!holeComplete && teePosition && pinPosition && !pendingShot && (
            <p className="text-gray-700 font-medium">Click on the map to log your next shot.</p>
          )}

          {teePosition && pinPosition && !holeComplete && (
            <div className="flex justify-center items-center gap-4 mt-3">
              {/* Add a new Hole Out button */}
              <button
                onClick={() => setPendingShot({
                                                x: pinPosition.x,
                                                y: pinPosition.y,
                                                club: "Putter",
                                                shot_type: "Full",
                                                end_lie: "Hole"
                                              })}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition">
                Hole Out
              </button>
            </div>
          )}


        </div>

        {!holeComplete && pendingShot && (
          <div className="space-y-2">
            <div className="flex justify-between w-4/5 m-auto mt-5 text-center">
              <div className="px-4 py-2 flex-1 mx-1">
                <p className="text-gray-700 font-bold">Confirm Pending Shot:</p>
              </div>
            </div>
            <div className="flex justify-between w-4/5 m-auto text-center">
              <div className="px-4 py-2 flex-1 mx-1">
                <p className="text-gray-700">Pending Distance:{" "}<span className="font-semibold">{pendingDistance?.toFixed(1)} yds</span></p>
              </div>
              <div className="px-4 py-2 flex-1 mx-1">
                <p className="text-gray-700">Distance to Pin:{" "}<span className="font-semibold">{pendingDistanceToPin?.toFixed(1)} yds</span></p>
              </div>
            </div>

            <label className="block">Club:
              <select className="border rounded p-1 w-full" value={pendingShot.club} onChange={(e) => setPendingShot({ ...pendingShot, club: e.target.value })}>
                <option value="">Select</option>
                {clubs.map((club) => (
                  <option key={club} value={club}>
                    {club}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">Shot Type:
              <select className="border rounded p-1 w-full"  value={pendingShot.shot_type} onChange={(e) => setPendingShot({ ...pendingShot, shot_type: e.target.value })}>
                <option value="">Select</option>
                {shot_types.map((shot_type) => (
                  <option key={shot_type} value={shot_type}>
                    {shot_type}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">Ending Lie:
              <select className="border rounded p-1 w-full"  value={pendingShot.end_lie} onChange={(e) => setPendingShot({ ...pendingShot, end_lie: e.target.value })}>
                <option value="">Select</option>
                {lies.map((lie) => (
                  <option key={lie} value={lie}>
                    {lie}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex justify-between w-4/5 m-auto mt-5">
              <button className="px-4 py-2 bg-green-600 text-white rounded flex-1 mx-1"
                disabled={!teePosition || !pinPosition || !pendingShot.club || !pendingShot.end_lie|| !pendingShot.shot_type}
                onClick={() => confirmShot(pendingShot.club, pendingShot.end_lie, pendingShot.shot_type)}>
                Confirm Shot
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded flex-1 mx-1"
                disabled={!teePosition || !pinPosition}
                onClick={() => cancelPendingShot()}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {holeShots.length > 0 && 
          <div>
            <hr className="my-4 border-gray-300" />
            <ShotList shots={holeShots} onDeleteLast={onDeleteLast} />
          </div>}

      </div>
    </div>
  );
}