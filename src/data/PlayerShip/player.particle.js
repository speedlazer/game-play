export default {
  "player.trail": {
    emitter: {
      w: 2,
      h: 2,
      amount: 200,
      fidelity: "high",
      motionLocked: false
    },
    particle: {
      sprite: "explosion7",
      angle: 180,
      angleRandom: 0,
      duration: 500,
      durationRandom: 0,
      velocity: 200,
      velocityRandom: 10,
      startSize: 12,
      endSize: 1,
      startColor: [1.0, 0.8, 0.5, 0.6],
      startColorRandom: [0, 0.05, 0, 0],
      endColor: [0.9, 0.2, 0.2, 0],
      endColorRandom: [0, 0, 0, 0]
    }
  },
  "player.trail2": {
    emitter: {
      w: 2,
      h: 2,
      amount: 200,
      fidelity: "high",
      motionLocked: false
    },
    particle: {
      sprite: "explosion7",
      angle: 180,
      angleRandom: 0,
      duration: 500,
      durationRandom: 0,
      velocity: 200,
      velocityRandom: 10,
      startSize: 8,
      endSize: 1,
      startColor: [1.0, 0.8, 0.5, 0.6],
      startColorRandom: [0, 0.05, 0, 0],
      endColor: [0.9, 0.2, 0.2, 0],
      endColorRandom: [0, 0, 0, 0]
    }
  },
  "player.reverse": {
    emitter: {
      w: 2,
      h: 2,
      amount: 200,
      fidelity: "high",
      motionLocked: false
    },
    particle: {
      sprite: "explosion7",
      angle: 0,
      angleRandom: 0,
      duration: 500,
      durationRandom: 0,
      velocity: 200,
      velocityRandom: 10,
      startSize: 5,
      endSize: 1,
      startColor: [1.0, 0.8, 0.5, 0.6],
      startColorRandom: [0, 0.05, 0, 0],
      endColor: [0.9, 0.2, 0.2, 0],
      endColorRandom: [0, 0, 0, 0]
    }
  },
  "player.laserCharge": {
    emitter: {
      w: 2,
      h: 2,
      amount: 70,
      reverse: true
    },
    gravity: [0, 10],
    particle: {
      sprite: "explosion7",
      angle: 0,
      angleRandom: 60,
      duration: 500,
      durationRandom: 0,
      velocity: 100,
      velocityRandom: 15,
      startSize: 6,
      startSizeRandom: 1,
      endSize: 1,
      endSizeRandom: 0,
      startColor: [1.0, 0.2, 0.0, 0.8],
      startColorRandom: [0.9, 0, 0, 0],
      endColor: [1.0, 1.0, 0.3, 0.2],
      endColorRandom: [0, 0, 0, 0]
    }
  }
};
