export default {
  DroneShip: {
    structure: {
      composition: "droneShip.main",
      components: ["ShipSolid", ["HideBelow", { hideBelow: 540, z: -12 }]],
      attachments: {
        bottom: {
          particles: {
            emitter: [
              "waterSplashes",
              { emitter: { w: 550, amount: 300, warmed: true } }
            ]
          }
        },
        hatch1: {
          composition: "shipHatch"
        },
        gun: {
          entity: "BulletCannon"
        },
        boxLocation1: {
          entity: "ShipBoxes"
        },
        radar: { entity: "Radar", state: "stopPulse" }
      }
    },
    states: {
      t1o: {
        attachments: { hatch1: { frame: "open" } }
      },
      t1r: {
        attachments: { hatch1: { frame: "risen" } }
      },
      activateGun: {
        attachments: {
          gun: { state: "shooting" }
        }
      },
      deactivateGun: {
        attachments: {
          gun: { state: "default" }
        }
      },
      gunDestroyed: {
        attachments: {
          gun: { state: "dead" }
        }
      },
      radarPulse: {
        attachments: { radar: { state: "pulse" } }
      },
      radarStopPulse: {
        attachments: { radar: { state: "stopPulse" } }
      },
      radarDestroyed: {
        attachments: { radar: { state: "dead" } }
      }
    },
    habitats: [
      {
        name: "Ocean",
        scenery: "city.Ocean",
        position: {
          rx: 0.3,
          ry: 0.7
        },
        scrollSpeed: { vx: -40, vy: 0 },
        background: ["city.Sunrise", 1]
      }
    ]
  }
};
