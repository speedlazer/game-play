export default {
  waterSplashes: {
    emitter: {
      w: 1250,
      h: 10,
      amount: 600
    },
    particle: {
      sprite: "explosion7",
      angle: 0,
      angleRandom: 20,
      velocity: 10,
      startSize: 30,
      endSize: 30,
      startColor: [0.8, 0.8, 0.8, 0.8],
      startColorRandom: [0.1, 0.1, 0, 0.2],
      endColor: [0.8, 0.8, 0.8, 0],
      endColorRandom: [0.1, 0.1, 0, 0.2]
    }
  },
  smoke: {
    emitter: {
      w: 160,
      h: 20,
      amount: 300
    },
    gravity: [20, -90],
    particle: {
      sprite: "explosion7",
      angle: 0,
      angleRandom: 20,
      duration: 2500,
      durationRandom: 500,
      velocity: 10,
      startSize: 30,
      endSize: 80,
      startColor: [0.3, 0.3, 0.3, 1],
      startColorRandom: [0, 0, 0, 0.2],
      endColor: [0.1, 0.1, 0.1, 0],
      endColorRandom: [0, 0, 0, 0]
    }
  },
  fountain: {
    emitter: {
      w: 10,
      h: 10,
      amount: 300
    },
    gravity: [0, 90],
    particle: {
      sprite: "explosion7",
      angle: -90,
      angleRandom: 20,
      velocity: 120,
      startSize: 10,
      endSize: 10,
      startColor: [1, 1.0, 1.0, 0.8],
      startColorRandom: [0, 0.1, 0, 0.2],
      endColor: [0.1, 0.1, 0.1, 0],
      endColorRandom: [0, 0, 0, 0.2]
    }
  }
};
