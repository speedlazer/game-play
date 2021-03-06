export default {
  mine: {
    attributes: {
      width: 32,
      height: 32,
      ro: [16, 16]
    },
    hitbox: [4, 16, 16, 4, 28, 16, 16, 28],
    sprites: [["standardMine", { key: "main" }]],
    frames: {
      opening: {
        main: { sprite: "mineOpening1" }
      },
      open: {
        main: { sprite: "mineOpening2" }
      },
      blink: {
        main: { sprite: "mineBlink" }
      },
      hidden: {
        main: {
          hidden: true,
          alpha: 0
        }
      }
    },
    animations: {
      opening: {
        easing: "linear",
        duration: 200,
        timeline: [
          {
            start: 0.0,
            end: 0.5,
            startFrame: "default",
            endFrame: "opening"
          },
          {
            start: 0.5,
            end: 1.0,
            startFrame: "opening",
            endFrame: "open"
          }
        ]
      },
      blinking: {
        repeat: true,
        easing: "linear",
        duration: 400,
        timeline: [
          {
            start: 0.0,
            end: 0.5,
            startFrame: "open",
            endFrame: "blink"
          },
          {
            start: 0.5,
            end: 1.0,
            startFrame: "blink",
            endFrame: "open"
          }
        ]
      }
    },
    attachHooks: [
      [
        "explosion",
        {
          x: 16,
          y: 16,
          z: 2,
          attachAlign: ["center", "center"],
          attachTo: "main"
        }
      ],
      [
        "smoke",
        {
          x: 16,
          y: 16,
          z: -5,
          attachAlign: ["center", "center"],
          attachTo: "main"
        }
      ]
    ]
  }
};
