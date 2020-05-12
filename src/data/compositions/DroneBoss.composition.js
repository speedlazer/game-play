export default {
  droneBoss: {
    attributes: {
      width: 90,
      height: 70,
      scale: 1
    },
    hitbox: [0, 20, 50, 0, 60, 40, 0, 50],
    sprites: [
      ["standardLargeDrone", { x: 0, y: 0, key: "main", horizon: [0, 0] }],
      ["sphere2", { z: 1, x: 1, y: 27, crop: [0, 0, 17, 21], key: "eye" }]
    ],
    attachHooks: [
      [
        "trail",
        {
          x: 40,
          y: 18,
          z: -2,
          attachAlign: ["center", "right"],
          attachTo: "main"
        }
      ],
      [
        "explosion",
        {
          x: 22,
          y: 18,
          z: 2,
          attachAlign: ["center", "center"],
          attachTo: "main"
        }
      ],
      [
        "smoke",
        {
          x: 22,
          y: 18,
          z: -5,
          attachAlign: ["center", "center"],
          attachTo: "main"
        }
      ],
      [
        "gun",
        {
          x: 2,
          y: 38,
          z: 2,
          attachAlign: ["center", "left"],
          attachTo: "main"
        }
      ]
    ],
    frames: {
      background: {
        attributes: {
          scale: 0.7
        },
        main: {
          horizon: [0.7, 0.7]
        }
      },
      eyeMove: {
        eye: {
          x: 10,
          y: -6,
          alpha: 0.6
        }
      },
      eyeDisappear: {
        eye: {
          x: 10,
          y: -6,
          alpha: 0.0
        }
      },
      eyeReset: {
        eye: {
          alpha: 0.0
        }
      },
      eyeAppear: {
        eye: {
          alpha: 1.0
        }
      },
      damaged1: {
        main: {
          sprite: "standardLargeDroneDamage1"
        }
      },
      damaged2: {
        main: {
          sprite: "standardLargeDroneDamage2"
        }
      },
      damaged3: {
        main: {
          sprite: "standardLargeDroneDamage3"
        }
      },
      turned: {
        flipX: true
      },
      hidden: {
        main: {
          hidden: true,
          alpha: 0
        },
        eye: {
          hidden: true,
          alpha: 0
        }
      }
    },
    animations: {
      eye: {
        repeat: true,
        easing: "linear",
        duration: 1000,
        timeline: [
          {
            start: 0.0,
            end: 0.7,
            startFrame: "eyeAppear",
            endFrame: "eyeMove"
          },
          {
            start: 0.7,
            end: 0.8,
            startFrame: "eyeMove",
            endFrame: "eyeDisappear"
          },
          {
            start: 0.8,
            end: 0.9,
            startFrame: "eyeDisappear",
            endFrame: "eyeReset"
          },
          {
            start: 0.9,
            end: 1,
            startFrame: "eyeReset",
            endFrame: "eyeAppear"
          }
        ]
      }
    }
  }
};