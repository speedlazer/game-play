export default {
  BattleShip: {
    structure: {
      composition: "battleship.deck",
      components: [
        "ShipSolid",
        "GravitySolid",
        ["HideBelow", { hideBelow: 570, z: -12 }]
      ],
      attachments: {
        bottom: {
          particles: ["waterSplashes", { emitter: { warmed: true } }]
        },
        cabin1: {
          composition: "battleship.firstCabin"
        },
        cabin1burn: null,
        cabin2burn: null,
        cabin2: {
          composition: "battleship.secondCabin",
          components: ["DamageSupport"]
        },
        hatch1: {
          composition: "shipHatch",
          attachments: {
            payload: {
              name: "turret",
              composition: "bulletCannon",
              components: [
                "DamageSupport",
                ["Aimable", { aimParts: ["barrel"] }]
              ]
            }
          }
        },
        hatch2: {
          composition: "shipHatch",
          attachments: {
            payload: {
              name: "turret",
              composition: "bulletCannon",
              components: [
                "DamageSupport",
                ["Aimable", { aimParts: ["barrel"] }]
              ]
            }
          }
        },
        hatch3: {
          composition: "shipHatch",
          attachments: {
            payload: {
              name: "turret",
              composition: "bulletCannon",
              components: [
                "DamageSupport",
                ["Aimable", { aimParts: ["barrel"] }]
              ]
            }
          }
        },
        heliPlace1: {
          composition: "helicopter",
          attributes: { scale: 0.8 }
        },
        heliPlace2: {
          composition: "helicopter",
          attributes: { scale: 0.8 }
        }
      }
    },
    states: {
      t1o: {
        attachments: { hatch1: { frame: "open" } }
      },
      t1r: {
        attachments: { hatch1: { frame: "risen" } }
      },
      t2o: {
        attachments: { hatch2: { frame: "open" } }
      },
      t2r: {
        attachments: { hatch2: { frame: "risen" } }
      },
      t3o: {
        attachments: { hatch3: { frame: "open" } }
      },
      t3r: {
        attachments: { hatch3: { frame: "risen" } }
      },
      fase3: {
        attachments: {
          cabin1: { composition: "battleship.firstCabin" },
          cabin1burn: null,
          cabin2burn: null,
          cabin2: { composition: "battleship.secondCabinOpen" },
          engineCore: { composition: "battleship.engine" }
        }
      },
      fase4: {
        attachments: {
          cabin1: { composition: "battleship.firstCabinDestroyed" },
          cabin1burn: { particles: ["smoke", { emitter: { w: 160 } }] },
          cabin2burn: null,
          cabin2: { composition: "battleship.secondCabinOpen" },
          engineCore: { composition: "battleship.engine" }
        }
      },
      fase5: {
        attachments: {
          cabin1: { composition: "battleship.firstCabinDestroyed" },
          cabin2: { composition: "battleship.secondCabinDestroyed" },
          cabin1burn: { particles: ["smoke", { emitter: { w: 160 } }] },
          cabin2burn: { particles: ["smoke", { emitter: { w: 220 } }] },
          engineCore: null
        }
      }
    },
    habitats: [
      {
        name: "Ocean",
        scenery: "City.Ocean",
        position: {
          x: 0,
          ry: 0.7
        },
        scrollSpeed: { vx: -100, vy: 0 },
        background: ["City.Sunrise", 3]
      }
    ]
  }
};
