export default {
  "bulletDrone.gun": {
    aiming: {
      offsetAimAngle: -5,
      sight: 25,
      resetOnDeactivation: true,
      rotateSpeed: 60,
      range: [10, -50]
    },
    spawnRhythm: {
      initialDelay: [1500, 150],
      burst: [3, 6],
      shotDelay: [200, 160],
      burstDelay: [2000, 400],
      spawns: [
        ["bullet", {}],
        ["muzzleFlash", {}]
      ]
    },
    spawnables: {
      bullet: {
        spawnPosition: [0, 0.5],
        velocity: [250, 300],
        composition: "weapons.bullet",
        queue: [{ duration: 4000, audio: ["gun-shot", { volume: 0.8 }] }],
        damage: [
          {
            velocity: [-2e3, -15e3],
            affects: "health",
            duration: [2, 4],
            name: "Laser"
          }
        ],
        collisions: {
          PlayerShip: {
            spawns: [["spark", {}]]
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
        queue: [{ duration: 400 }]
      },
      spark: {
        spawnPosition: "outside",
        velocity: 0,
        composition: "weapons.solidHit",
        queue: [{ duration: 100, audio: "laser-hit" }]
      },
      splash: {
        spawnPosition: "outside",
        velocity: 0,
        composition: "weapons.waterHit",
        queue: [{ duration: 305 }]
      }
    }
  }
};
