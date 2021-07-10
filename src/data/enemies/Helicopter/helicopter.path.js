export default {
  "heli.pattern1": {
    habitat: {
      scenery: "city.Ocean",
      scrollSpeed: { vx: -100, vy: 0 },
      background: ["city.Sunrise", 2],
      entity: "Helicopter",
      entityState: "flying"
    },
    path: [
      { x: 1.1, y: 0.5 },
      { x: 0.9, y: 0.4 },
      { x: 0.8, y: 0.2 },
      { x: 0.9, y: 0.1 },
      { x: 0.9, y: 0.3 },
      { x: 0.5, y: 0.3 },
      { x: 0.5, y: 0.1 },
      { x: 0.6, y: 0.3 },
      { x: 0.7, y: 0.7 },
      { x: 0.8, y: 0.5 }
    ]
  },
  "heli.repeat1": {
    path: [
      { x: 0.8, y: 0.5 },
      { x: 0.9, y: 0.3 },
      { x: 0.8, y: 0.2 },
      { x: 0.7, y: 0.4 },
      { x: 0.8, y: 0.5 }
    ]
  },
  "heli.repeat2": {
    path: [
      { x: 0.8, y: 0.5 },
      { x: 0.9, y: 0.4 },
      { x: 0.8, y: 0.3 },
      { x: 0.7, y: 0.4 },
      { x: 0.9, y: 0.6 },
      { x: 0.7, y: 0.7 },
      { x: 0.8, y: 0.5 }
    ]
  },
  "heli.battleship1": {
    path: [
      {
        x: 0.38,
        y: 0.73,
        events: [
          [0.5, { event: "detach" }],
          [0.8, { setState: ["leveled", 1000] }]
        ]
      },
      { x: 0.38, y: 0.5 },
      { x: 0.2, y: 0.4, events: [[0.1, { setState: ["turning", 1000] }]] },
      { x: 0.3, y: 0.3 },
      { x: 0.7, y: 0.4, events: [[0, { setState: ["turning", 1000] }]] },
      {
        x: 0.7,
        y: 0.2,
        events: [
          [0, { setState: ["toForeground", 1000] }],
          [0.1, { setState: ["foreground", 1000] }],
          [0.8, { setState: ["flying", 1000] }],
          [0.8, { setState: ["shooting", 1000] }],
          [0.8, { event: "active" }]
        ]
      },
      { x: 0.6, y: 0.4 },
      { x: 0.7, y: 0.4 },
      { x: 0.6, y: 0.2 }
    ]
  },
  "heli.battleship2a": {
    path: [
      {
        x: 0.38,
        y: 0.73,
        events: [
          [0.5, { event: "detach" }],
          [0.8, { setState: ["leveled", 1000] }]
        ]
      },
      { x: 0.38, y: 0.5 },
      {
        x: 0.2,
        y: 0.4,
        events: [
          [0.1, { setState: ["turning", 1000] }],
          [0.7, { event: "moveShip" }]
        ]
      },
      { x: 0.3, y: 0.3 },
      { x: 0.6, y: 0.2 }
    ]
  },
  "heli.battleship2b": {
    path: [
      { x: 0.6, y: 0.2 },
      { x: 0.7, y: 0.4, events: [[0, { setState: ["turning", 1000] }]] },
      {
        x: 0.7,
        y: 0.2,
        events: [
          [0, { setState: ["toForeground", 1000] }],
          [0.1, { setState: ["foreground", 1000] }],
          [0.8, { setState: ["flying", 1000] }],
          [0.8, { setState: ["shooting", 1000] }],
          [0.8, { event: "active" }]
        ]
      },
      { x: 0.6, y: 0.4 },
      { x: 0.65, y: 0.4 },
      { x: 0.7, y: 0.3 }
    ]
  },
  "heli.battleship2c": {
    path: [
      { x: 0.8, y: 0.3 },
      { x: 0.7, y: 0.4 },
      { x: 0.8, y: 0.5 },
      { x: 0.85, y: 0.4 },
      { x: 0.8, y: 0.3 }
    ]
  }
};
