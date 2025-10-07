import Dexie from "dexie";

const db = new Dexie("GolfDB");

// Schema: rounds and shots
// primary key is `id` (string). shots has an index on round_id, hole_number, shot_number
db.version(1).stores({
  rounds: "id,course_id,date_played",
  shots: "id,round_id,hole_number,shot_number,club,sg_category"
});

// open DB (optional safety)
db.open().catch((err) => {
  console.error("Failed to open db:", err);
});

// simple UUID helper (uses crypto if available)
function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/**
 * createRound - add a minimal round row and return id
 * Accepts: { course_id, date_played } -> date_played ISO string or Date
 */
export async function createRound({ course_id, date_played = new Date().toISOString() }) {
  const id = uid();
  await db.rounds.add({ id, course_id, date_played });
  return id;
}

/**
 * saveRound - atomic save of a full round (round object from app)
 * roundObj expected shape:
 * {
 *   courseId,
 *   startedAt,
 *   shots: [ { hole: number, shots: [ shot, shot, ... ] }, ... ]
 * }
 *
 * Each shot should already include the fields you specified:
 * club, start_lie, end_lie, start: {x,y}, end:{x,y}, distance,
 * startDistanceToPin, endDistanceToPin, strokes_gained, sg_category
 */
export async function saveRound(roundObj) {
  const roundId = uid();
  const date_played = roundObj.startedAt?.toISOString ? roundObj.startedAt.toISOString().split("T")[0] : roundObj.startedAt;

  const flattenedShots = [];
  roundObj.holes.forEach((holeEntry) => {
    const holeNumber = holeEntry.hole;
    const tee = holeEntry.tee || null;
    const pin = holeEntry.pin || null;
    (holeEntry.shots || []).forEach((shot, idx) => {
      flattenedShots.push({
        id: shot.id || uid(),
        round_id: roundId,
        hole_number: holeNumber,
        hole_par: holeEntry.par ?? null,
        shot_number: shot.shot_number ?? idx + 1,
        club: shot.club ?? null,
        start_lie: shot.start_lie ?? null,
        end_lie: shot.end_lie ?? null,
        start: shot.start ?? null,
        end: shot.end ?? null,
        shot_type : shot.shot_type ?? null,
        tee,
        pin,
        distance: shot.distance ?? null,
        start_distance_to_pin: shot.startDistanceToPin ?? null,
        end_distance_to_pin: shot.endDistanceToPin ?? null,
        strokes_gained: shot.strokes_gained ?? null,
        sg_category: shot.sg_category ?? null,
      });
    });
  });

  // Transactional write
  await db.transaction("rw", db.rounds, db.shots, async () => {
    await db.rounds.add({
      id: roundId,
      course_id: roundObj.courseId,
      date_played,
      playerName: roundObj.playerName,
      score: roundObj.score
    });

    if (flattenedShots.length > 0) {
      await db.shots.bulkAdd(flattenedShots);
    }
  });

  return roundId;
}

/**
 * getRoundWithShots(roundId) - returns { id, course_id, date_played, shots: [ ...sorted shots... ] }
 */
export async function getRoundWithShots(roundId) {
  const round = await db.rounds.get(roundId);
  if (!round) return null;

  const shots = await db.shots.where("round_id").equals(roundId).toArray();

  // Group shots by hole
  const holeMap = new Map();
  shots.forEach((s) => {
    if (!holeMap.has(s.hole_number)) {
      holeMap.set(s.hole_number, {
        hole: s.hole_number,
        par: s.hole_par ?? null,
        tee: s.tee ?? null,
        pin: s.pin ?? null,
        shots: [],
      });
    }
    const holeEntry = holeMap.get(s.hole_number);
    holeEntry.shots.push({
      id: s.id,
      shot_number: s.shot_number,
      club: s.club,
      start_lie: s.start_lie,
      end_lie: s.end_lie,
      start: s.start,
      end: s.end,
      shot_type: s.shot_type,
      distance: s.distance,
      startDistanceToPin: s.start_distance_to_pin,
      endDistanceToPin: s.end_distance_to_pin,
      strokes_gained: s.strokes_gained,
      sg_category: s.sg_category,
    });
  });

  const holes = Array.from(holeMap.values()).sort((a, b) => a.hole - b.hole);

  return { ...round, holes };
}


/**
 * getAllRounds() - returns all rounds (no shots)
 */
export async function getAllRounds() {
  return db.rounds.toArray();
}

/**
 * deleteRound(roundId) - deletes round and its shots in a transaction
 */
export async function deleteRound(roundId) {
  return db.transaction("rw", db.rounds, db.shots, async () => {
    await db.shots.where("round_id").equals(roundId).delete();
    await db.rounds.delete(roundId);
  });
}

/**
 * getAllShots() - returns all shots across all rounds
 */

export async function getAllShots() {
  return db.shots.toArray();
}

// export Dexie db if you want to run manual queries
export default db;