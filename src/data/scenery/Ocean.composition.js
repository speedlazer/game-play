export default {
  "ocean.front": {
    attributes: {
      width: 1024,
      height: 96
    },
    sprites: [
      ["waterFront1", { z: -20, key: "left", horizon: [0.4, 0.0] }],
      ["waterFront2", { x: 512, z: -20, key: "right", horizon: [0.4, 0.0] }]
    ],
    frames: {
      waveR: {
        left: { scaleX: 1.125, x: 32, scaleY: 0.95, y: 5 },
        right: { scaleX: 0.875, x: 32, scaleY: 0.95, y: 5 }
      },
      waveL: {
        left: { scaleX: 0.875, x: -32, scaleY: 1.05, y: -5 },
        right: { scaleX: 1.125, x: -32, scaleY: 1.05, y: -5 }
      }
    },
    animations: {
      default: {
        repeat: true,
        easing: "linear",
        duration: 20000,
        timer: "global",
        timeline: [
          {
            start: 0.0,
            end: 0.2,
            startFrame: "default",
            endFrame: "waveL"
          },
          {
            start: 0.2,
            end: 0.5,
            startFrame: "waveL",
            endFrame: "default"
          },
          {
            start: 0.5,
            end: 0.8,
            startFrame: "default",
            endFrame: "waveR"
          },
          {
            start: 0.8,
            end: 1,
            startFrame: "waveR",
            endFrame: "default"
          }
        ]
      }
    }
  },
  "ocean.middle": {
    attributes: {
      width: 512,
      height: 192
    },
    sprites: [
      ["waterMiddle", { z: -500, w: 513, key: "middle", horizon: [0.8, 0.1] }]
    ],
    frames: {
      wave: {
        middle: { y: 4 }
      }
    },
    animations: {
      default: {
        repeat: true,
        easing: "linear",
        duration: 10000,
        timer: "global",
        timeline: [
          {
            start: 0.0,
            end: 0.5,
            startFrame: "default",
            endFrame: "wave"
          },
          {
            start: 0.5,
            end: 1.0,
            startFrame: "wave",
            endFrame: "default"
          }
        ]
      }
    }
  },
  "ocean.horizon": {
    attributes: {
      width: 260,
      height: 160
    },
    sprites: [["waterHorizon", { z: -600, w: 260, horizon: [1.0, 0.4] }]]
  }
};
