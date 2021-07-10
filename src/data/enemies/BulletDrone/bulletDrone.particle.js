export default {
  "bulletDrone.trail": {
    emitter: {
      w: 2,
      h: 2,
      amount: 50,
      fidelity: "high",
      motionLocked: false
    },
    gravity: [0, 0],
    particle: {
      sprite: "explosion7",
      angle: 0,
      angleRandom: 0,
      duration: 250,
      durationRandom: 0,
      velocity: 0,
      velocityRandom: 10,
      startSize: 10,
      endSize: 1,
      startColor: [0.5, 0.9, 0.5, 0.6],
      startColorRandom: [0, 0, 0, 0],
      endColor: [0.2, 0.9, 0.2, 0],
      endColorRandom: [0, 0, 0, 0]
    }
  },
  "drone.smoke": {
    emitter: {
      w: 2,
      h: 2,
      amount: 400,
      duration: 300
    },
    gravity: [-100, 0],
    particle: {
      sprite: "explosion7",
      angle: 0,
      angleRandom: 360,
      duration: 1800,
      durationRandom: 0,
      velocity: 10,
      velocityRandom: 5,
      startSize: 15,
      endSize: 5,
      startColor: [0.05, 0.05, 0.05, 0.6],
      startColorRandom: [0, 0, 0, 0],
      endColor: [0.05, 0.05, 0.05, 0],
      endColorRandom: [0, 0, 0, 0]
    }
  }
};
