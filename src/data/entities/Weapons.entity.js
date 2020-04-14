export default {
  HeliRocket: {
    structure: {
      composition: "weapons.rocket",
      frame: "small",
      attachments: {
        trail: {
          particles: "missile.trail"
        },
        tip: null
      }
    },
    states: {
      hide: {
        attachments: {
          trail: null,
          tip: null
        }
      },
      waterHit: {
        attachments: {
          trail: null,
          tip: {
            particles: ["fountain", { emitter: { w: 60, duration: 1000 } }]
          }
        }
      }
    },
    habitats: [
      {
        name: "Ocean",
        scenery: "City.Ocean",
        scrollSpeed: { vx: -100, vy: 0 },
        background: ["City.Sunrise", 2]
      }
    ]
  }
};
