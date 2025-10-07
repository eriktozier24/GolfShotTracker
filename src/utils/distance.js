export function calcDistance(hole, shotA, shotB) {
  const yardsPerPixelY = hole.height / hole.image_height;
  const yardsPerPixelX = hole.width / hole.image_width;
  const dx = (shotB.x - shotA.x) * yardsPerPixelX;
  const dy = (shotB.y - shotA.y) * yardsPerPixelY;
  return Math.round(Math.sqrt(dx * dx + dy * dy));
}
