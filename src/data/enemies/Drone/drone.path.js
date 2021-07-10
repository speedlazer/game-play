export default {
  "drone.straight": {
    habitat: {
      scenery: "city.Ocean",
      scrollSpeed: { vx: -100, vy: 0 },
      background: ["city.Sunrise", 2],
      entity: "WarDrone"
    },
    path: [
      { x: 1.1, y: 0.5 },
      { x: -0.1, y: 0.5 }
    ]
  },
  "drone.pattern1": {
    habitat: {
      scenery: "city.Ocean",
      scrollSpeed: { vx: -100, vy: 0 },
      background: ["city.Sunrise", 2],
      entity: "WarDrone"
    },
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
  "drone.pattern2": {
    habitat: {
      scenery: "city.Ocean",
      scrollSpeed: { vx: -100, vy: 0 },
      background: ["city.Sunrise", 2],
      entity: "WarDrone"
    },
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
  },
  "drone.pattern3": {
    habitat: {
      scenery: "city.Ocean",
      scrollSpeed: { vx: -100, vy: 0 },
      background: ["city.Sunrise", 2],
      entity: "WarDrone"
    },
    path: [
      { x: 0.5, y: -0.1 },
      { x: 0.5, y: 0.2 },
      { x: 0.7, y: 0.31 },
      { x: 0.8, y: 0.5 },
      { x: 0.5, y: 0.5 },
      { x: -0.1, y: 0.3 }
    ]
  },
  "drone.pattern4": {
    habitat: {
      scenery: "city.Ocean",
      scrollSpeed: { vx: -100, vy: 0 },
      background: ["city.Sunrise", 2],
      entity: "WarDrone"
    },
    path: [
      { x: 0.5, y: 1.11 },
      { x: 0.5, y: 0.8 },
      { x: 0.7, y: 0.8 },
      { x: 0.93, y: 0.69 },
      { x: 0.8, y: 0.5 },
      { x: 0.5, y: 0.5 },
      { x: -0.1, y: 0.7 }
    ]
  },
  "drone.pattern5": {
    habitat: {
      scenery: "city.Ocean",
      scrollSpeed: { vx: -100, vy: 0 },
      background: ["city.Sunrise", 2],
      entity: "WarDrone"
    },
    path: [
      { x: -0.2, y: 0.5, events: [[0.0, { setState: ["turned", 0] }]] },
      { x: 0.5, y: 0.8 },
      { x: 0.93, y: 0.69, events: [[0.0, { setState: ["turned", 0] }]] },
      { x: 0.8, y: 0.5 },
      { x: 0.5, y: 0.5 },
      { x: -0.1, y: 0.7 }
    ]
  },
  "drone.pattern6": {
    habitat: {
      scenery: "city.Ocean",
      scrollSpeed: { vx: -100, vy: 0 },
      background: ["city.Sunrise", 2],
      entity: "WarDrone"
    },
    path: [
      { x: 1.1, y: 0.2 },
      { x: 0.2, y: 0.4, events: [[0.0, { setState: ["turned", 0] }]] },
      { x: 0.6, y: 0.2 },
      { x: 1.1, y: 0.2 }
    ]
  }
};
