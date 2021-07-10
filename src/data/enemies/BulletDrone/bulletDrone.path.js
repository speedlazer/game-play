export default {
  "bulletDrone.straight": {
    habitat: {
      scenery: "city.Bay",
      scrollSpeed: { vx: -150, vy: 0 },
      background: ["city.Sunrise", 3],
      entity: "BulletDrone"
    },
    path: [
      { x: 1.1, y: 0.5, events: [[0.1, { setState: ["shooting", 500] }]] },
      { x: -0.1, y: 0.5 }
    ]
  },
  "bulletDrone.pattern1": {
    path: [
      { x: 1.1, y: 0.5 },
      { x: 0.9, y: 0.2 },
      { x: 0.7, y: 0.8 },
      { x: 0.5, y: 0.2 },
      { x: 0.3, y: 0.8 },
      { x: 0.1, y: 0.5, events: [[0.2, { setState: ["turned", 500] }]] },
      { x: 0.3, y: 0.2, events: [[0.9, { setState: ["turned", 500] }]] },
      { x: 0.9, y: 0.5 },
      { x: -0.1, y: 0.6 }
    ]
  },
  "bulletDrone.pattern2": {
    path: [
      { x: 1.1, y: 0.5 },
      { x: 0.5, y: 0.7 },
      { x: 0.1, y: 0.5, events: [[0.1, { setState: ["turned", 500] }]] },
      { x: 0.3, y: 0.2 },
      { x: 0.8, y: 0.2, events: [[0.6, { setState: ["turned", 500] }]] },
      { x: 0.9, y: 0.4 },
      { x: 0.4, y: 0.5 },
      { x: -0.1, y: 0.2 }
    ]
  }
};
