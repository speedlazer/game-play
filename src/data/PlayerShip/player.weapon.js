export default {
  "player.bullets": {
    spawnRhythm: {
      initialDelay: 1,
      burst: 1,
      shotDelay: [120, 60],
      burstDelay: 1,
      spawns: [
        ["bullet", { angleRange: { from: [0, -5], to: [1, 5], step: 3 } }],
        ["muzzleFlash", {}]
      ]
    },
    spawnables: {
      bullet: {
        spawnPosition: [0, 0.5],
        velocity: [1050, 1200],
        composition: "weapons.lightBullet",
        damage: [
          {
            velocity: [-20e3, -30e3],
            affects: "health",
            duration: [2, 4],
            name: "Bullet"
          }
        ],
        queue: [{ cleanOutOfScreen: true }, { duration: 4000 }],
        collisions: {
          SolidCollision: {
            spawns: [
              ["sparkHit", {}],
              ["sparks", { emitter: { duration: 100 } }]
            ]
          },
          WaterCollision: {
            spawns: [["splash", {}]]
          }
        }
      },
      muzzleFlash: {
        spawnPosition: [0, 0.5],
        attached: true,
        velocity: 0,
        composition: "weapons.muzzleFlash",
        queue: [{ duration: 120, audio: "laser-shot" }]
      },
      sparkHit: {
        spawnPosition: "outside",
        velocity: 0,
        composition: "weapons.solidHit",
        queue: [{ duration: 100, audio: "laser-hit" }]
      },
      sparks: {
        spawnPosition: "outside",
        velocity: 0,
        particles: "sparks",
        queue: [{ duration: 500 }]
      },
      splash: {
        spawnPosition: "outside",
        velocity: 0,
        composition: "weapons.waterHit",
        queue: [{ duration: 305 }]
      }
    }
  },
  "player.laser": {
    spawnRhythm: {
      initialDelay: 1,
      burst: 1,
      shotDelay: 3000,
      burstDelay: 1,
      shot: [
        { state: "laserCharge", audio: "laser-charge", duration: [1500, 750] },
        { state: "stopLaserCharge", duration: 300 },
        { spawn: true, duration: 100, audio: "laser-fire" }
      ],
      spawns: [
        ["laser", { angleRange: { from: [180, 175], to: [181, 186], step: 3 } }]
      ]
    },
    spawnables: {
      laser: {
        spawnPosition: [0, 0.5],
        attached: true,
        beam: true,
        velocity: 2800,
        composition: "weapons.laser",
        queue: [
          {
            duration: 340
          },
          { velocity: 0 },
          { duration: 300 },
          { duration: 300, frame: "disappear" }
        ],
        damage: [
          {
            velocity: [-500, -1000],
            affects: "health",
            duration: [80, 160],
            name: "Laser"
          }
        ],
        collisions: {
          SolidCollision: {
            cooldown: 10,
            spawns: [["sparks", { angle: 180 }]],
            remove: false
          }
        }
      },
      splash: {
        spawnPosition: "outside",
        velocity: 0,
        composition: "weapons.waterHit",
        queue: [{ duration: 305 }]
      },
      sparks: {
        attached: true,
        spawnPosition: "outside",
        velocity: 0,
        particles: "laserHit",
        queue: [{ duration: 150 }]
      }
    }
  }
};
