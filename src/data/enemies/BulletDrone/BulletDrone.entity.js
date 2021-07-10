export default {
  BulletDrone: {
    structure: {
      composition: "bulletDrone",
      components: [
        "DamageSupport",
        "SolidCollision",
        "PlayerEnemy",
        "PlayerHit"
      ],
      attachments: {
        gun: {
          weapon: {
            pattern: "bulletDrone.gun",
            target: "PlayerShip",
            angle: -5,
            barrel: "barrel"
          }
        },
        trail: {
          particles: { emitter: "bulletDrone.trail" }
        }
      }
    },
    states: {
      turned: {
        frame: "turned"
      },
      dead: {
        frame: "hidden",
        audio: "explosion",
        removeComponents: ["SolidCollision", "PlayerEnemy"],
        attachments: {
          trail: null,
          explosion: {
            composition: "explosion",
            animation: "default"
          },
          smoke: {
            particles: { emitter: "drone.smoke" }
          }
        }
      },
      shooting: {
        attachments: {
          gun: {
            weapon: {
              active: true
            }
          }
        }
      }
    },
    habitats: [
      {
        name: "Bay",
        scenery: "city.Bay",
        scrollSpeed: { vx: -100, vy: 0 },
        background: ["city.Sunrise", 3]
      }
    ]
  }
};
