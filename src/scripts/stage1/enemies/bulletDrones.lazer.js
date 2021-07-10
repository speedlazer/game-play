import { paths } from "data";

const droneFlight = (pattern, yOffset = 0, points = 0, speed = null) => async ({
  spawn,
  showState,
  waitForEvent,
  allowDamage,
  awardPoints,
  moveWithPattern
}) => {
  const flyPattern = paths(pattern).path;
  const drone = spawn("BulletDrone", {
    location: {
      rx: flyPattern[0].x,
      ry: flyPattern[0].y + yOffset
    },
    defaultVelocity: speed || 400
  });

  await allowDamage(drone, { health: 30 });
  const movement = moveWithPattern(drone, pattern);

  waitForEvent(drone, "Dead", async () => {
    movement.abort();
    if (points > 0) {
      awardPoints(points, drone.x, drone.y);
    }
    await showState(drone, "dead");
    drone.destroy();
  });

  await movement.process;
  if (movement.wasCompleted()) {
    drone.destroy();
  }
};

export const droneWave = (
  amount,
  pattern,
  { points = 10, delay = 500, yOffset = 0, speed = null } = {}
) => async ({ exec, wait }) => {
  const items = Array(amount)
    .fill()
    .map(async (e, index) => {
      await wait(index * delay);
      await exec(droneFlight(pattern, yOffset, points, speed));
    });
  await Promise.all(items);
};
