import particleVertexShader from "./shaders/particle.vert";
import particleFragmentShader from "./shaders/particle.frag";
import WebGLParticles from "src/components/WebGLParticles";

const randM1to1 = () => Math.random() * 2 - 1;

const spriteMap = {};
const PARTICLES_ENABLED = true;

const setParticleSprite = (entity, spriteName) => {
  const map = spriteMap[spriteName];
  if (map) {
    entity.__image = map.image;
    if (entity.program && entity._drawLayer) {
      entity.program.setTexture(
        entity._drawLayer.makeTexture(entity.__image, entity.img, false)
      );
    }
    return;
  }

  const sprite = Crafty.e(`WebGL, ${spriteName}`).attr({
    x: 5000,
    y: 5000
  });
  entity.__image = sprite.__image;
  if (entity.program && entity._drawLayer) {
    entity.program.setTexture(
      entity._drawLayer.makeTexture(entity.__image, entity.img, false)
    );
  }
  spriteMap[spriteName] = {
    index: Object.keys(spriteMap).length,
    coords: sprite.__coord,
    image: sprite.__image
  };
  sprite.destroy();
};

const getSpriteCoords = spriteName => spriteMap[spriteName].coords;

const spawnParticle = (entity, settings) => {
  const source = entity.attachTo || entity;
  const locked = entity.particleSettings.motionLocked;

  const x = (locked ? 0 : source.x) + Math.random() * entity.w;
  const y = (locked ? 0 : source.y) + Math.random() * entity.h;
  const speed = settings.velocity + randM1to1() * settings.velocityRandom;
  const angle = settings.currentAngle + randM1to1() * settings.angleRandom;
  const life = settings.duration + randM1to1() * settings.durationRandom;
  const startSize = settings.startSize + randM1to1() * settings.startSizeRandom;
  const endSize = settings.endSize + randM1to1() * settings.endSizeRandom;

  const startColor = settings.startColor.map(
    (a, i) => a + randM1to1() * settings.startColorRandom[i]
  );
  const endColor = settings.endColor.map(
    (a, i) => a + randM1to1() * settings.endColorRandom[i]
  );

  const start = entity.timeFrame - (settings.expired || 0.0) * life;

  return {
    aPosition: [x, y],
    aVelocity: [
      speed,
      (angle * Math.PI) / 180,
      settings.emitterReverse ? -1 : 1
    ],
    aOrientation: [x, y, 0],
    aSize: [startSize, endSize],
    aLife: [start, life, settings.gravity[0], settings.gravity[1]],
    expire: start + life,
    aLayer: [entity._globalZ, entity._alpha],
    aColor1: startColor,
    aColor2: endColor
  };
};

let startRender = null;

Crafty.defaultShader(
  "Particle",
  new Crafty.WebGLShader(
    particleVertexShader,
    particleFragmentShader,
    [
      { name: "aPosition", width: 2 },
      { name: "aVelocity", width: 3 },
      { name: "aOrientation", width: 3 },
      { name: "aLayer", width: 2 },
      { name: "aSize", width: 2 },
      { name: "aLife", width: 4 },
      { name: "aColor1", width: 4 },
      { name: "aColor2", width: 4 }
    ],
    function(e, entity) {
      const gl = e.program.context;

      if (entity.particleSettings.motionLocked) {
        gl.uniform2f(
          e.program.shader.coordOffset,
          entity._deltaX,
          entity._deltaY
        );
      }

      if (startRender && !e.program.hasTime) {
        gl.uniform4f(e.program.shader.time, entity.timeFrame, 0, 0, 0);
        e.program.hasTime = entity.timeFrame;
        gl.uniform4f(
          e.program.shader.spriteCoords,
          ...getSpriteCoords(entity.particleSettings.sprite)
        );
        if (!entity.particleSettings.motionLocked) {
          gl.uniform2f(e.program.shader.coordOffset, 0, 0);
        }
      }
    }
  )
);

const ParticleEmitter = "ParticleEmitter";

Crafty.c(ParticleEmitter, {
  required: `2D, ${WebGLParticles}`,
  ready: true,
  __image: "",
  img: null,

  events: {
    LayerAttached: "_setupParticles",
    GameLoop: "_renderParticles",
    Move: function({ _x: prevX, _y: prevY }) {
      if (this.particleSettings && this.particleSettings.motionLocked) {
        this._deltaX += this._x - prevX;
        this._deltaY += this._y - prevY;
      }
    }
  },

  init: function() {
    this._particlesPaused = false;
    this._deltaX = this.x;
    this._deltaY = this.y;
    // Necessary for some rendering layers
    this.bind("Draw", this._drawParticles);
    if (this._drawLayer) {
      this._setupParticles(this._drawLayer);
    }
    this.initialDraw = true;
    // Fake large collission shape, to allow rendering when emitter is offscreen
    this._mbr = {
      _x: 0,
      _y: 0,
      _w: Crafty.viewport.width,
      _h: Crafty.viewport.height
    };
    this.trigger("Invalidate");
    this.bind("Freeze", () => {
      this.stopEmission();
    });
    this.bind("Unfreeze", () => {
      this.startEmission();
    });
    this.bind("Change", changes => {
      if (Object.prototype.hasOwnProperty.call(changes, "angle")) {
        this.particleSettings.currentAngle =
          this.particleSettings.angle + changes.angle;
      }
    });
  },

  remove() {
    this.initialDraw = true;
    this.unbind("Draw", this._drawParticles);
    this.trigger("Invalidate");
  },

  pauseParticles() {
    this._particlesPaused = true;
  },

  resumeParticles() {
    this._particlesPaused = false;
  },

  _setupParticles(layer) {
    if (layer.type === "WebGL") {
      this._establishShader("Particle", Crafty.defaultShader("Particle"));
      if (this.__image !== "") {
        this.program.setTexture(
          layer.makeTexture(this.__image, this.img, false)
        );
      }
    }
  },

  _drawParticles(e) {
    // The expensive draw
    if (this.initialDraw === true) {
      this.particleBuffer.growArrays(this._particles.length);

      for (let pi = 0; pi < this._particles.length; pi++) {
        this._writeParticle(pi, this._particles[pi]);
      }
      this.initialDraw = false;
    }

    e.program.draw(e, this);
  },

  _writeParticle(pi, particle) {
    this.particleBuffer.writeParticle(pi, particle);
  },

  attachToEntity(entity) {
    this.attachedTo = entity;
    this.z = entity.z;
    entity.bind("Reorder", () => {
      this.z = entity.z;
    });
    entity.bind("Change", changes => {
      if (Object.prototype.hasOwnProperty.call(changes, "angle")) {
        this.particleSettings.currentAngle =
          this.particleSettings.angle + changes.angle;
      }
    });
    this.particleSettings.currentAngle =
      this.particleSettings.angle + (entity.angle || 0);

    this.x = entity.x;
    this.y = entity.y;

    entity.bind("Move", () => {
      this.x = entity.x;
      this.y = entity.y;
      // Keep mbr static
      this._mbr = {
        _x: 0,
        _y: 0,
        _w: Crafty.viewport.width,
        _h: Crafty.viewport.height
      };
    });
    entity.bind("Freeze", () => {
      this.stopEmission();
    });
    entity.bind("Unfreeze", () => {
      this.startEmission();
    });
    entity.bind("Remove", () => {
      this.stopEmission();
      this.attachedTo = null;
      this.autoDestruct = true;
    });
  },

  particles(
    {
      emitter: {
        amount = 150,
        w = 10,
        h = 10,
        duration: emitterDuration = Infinity,
        warmed = false,
        reverse: emitterReverse = false,
        fidelity = "low",
        motionLocked = true
      } = {},
      gravity = [0, 0],
      particle: {
        velocity = 80,
        velocityRandom = 20,
        angle = 0,
        angleRandom = 360,
        duration = 2000,
        durationRandom = 500,
        startSize = 12,
        startSizeRandom = 2,
        endSize = 24,
        endSizeRandom = 8,
        sprite = null,
        startColor = [1, 1, 1, 1],
        startColorRandom = [0, 0, 0, 0],
        endColor = [0, 0, 0, 1],
        endColorRandom = [0, 0, 0, 0]
      } = {}
    } = {},
    attachTo = null
  ) {
    if (!PARTICLES_ENABLED) amount = 1;
    if (motionLocked) {
      this._deltaX = this._x;
      this._deltaY = this._y;
    }

    this.particleSettings = {
      amount,
      gravity,
      velocity,
      velocityRandom,
      angle,
      currentAngle: angle,
      angleRandom,
      duration,
      durationRandom,
      startSize,
      startSizeRandom,
      endSize,
      endSizeRandom,
      sprite,
      startColor,
      startColorRandom,
      endColor,
      endColorRandom,
      emitterDuration,
      emitterReverse,
      emitterFidelity: fidelity,
      motionLocked
    };
    if (attachTo) {
      this.attachToEntity(attachTo);
    }

    this.attr({ w, h });

    this.timeFrame = 0;
    this.startEmission({ warmed });

    if (this.particleSettings.sprite) {
      setParticleSprite(this, this.particleSettings.sprite);
    }

    this._particles = Array(amount)
      .fill(0)
      .map(() =>
        spawnParticle(this, {
          ...this.particleSettings,
          duration: 0,
          durationRandom: 0
        })
      );

    this.lastExpired = this._particles.reduce(
      (a, p) => (p.expire > a ? p.expire : a),
      0
    );
    this.nextExpireRatio = fidelity === "low" ? 140 : duration / amount;
    this.nextExpireCheck = duration / amount;

    this.trigger("Invalidate");
    return this;
  },

  stopEmission() {
    this.emissionRate = 0;
    this.shouldHaveEmitted = 0;
  },

  startEmission({ warmed = false } = {}) {
    this.emissionRate =
      this.particleSettings.amount / this.particleSettings.duration;
    this.startTime = warmed ? -1 : 0;

    this.shouldHaveEmitted = warmed
      ? this.particleSettings.amount
      : Math.min((this.startTime / 1000.0) * this.emissionRate, 1) *
        this.particleSettings.amount;
  },

  _renderParticles({ dt, inGameTime }) {
    if (!this.particleSettings) return;
    if (this._particlesPaused) return;
    startRender = startRender || inGameTime;
    this.timeFrame = inGameTime - startRender;

    if (this.startTime !== -1) {
      this.startTime += dt;
      this.shouldHaveEmitted =
        Math.min((this.startTime / 1000.0) * this.emissionRate, 1) *
        this.particleSettings.amount;
    }

    if (
      this.timeFrame >= this.nextExpireCheck &&
      this.startTime < this.particleSettings.emitterDuration &&
      PARTICLES_ENABLED
    ) {
      this.nextExpireCheck = this.timeFrame + this.nextExpireRatio;
      const warmingUp = this.startTime === -1;

      for (let i = 0; i < this.shouldHaveEmitted; i++) {
        if (this._particles[i].expire < this.timeFrame + 20) {
          const p = spawnParticle(
            this,
            warmingUp
              ? { ...this.particleSettings, expired: Math.random() * 0.9 }
              : this.particleSettings
          );
          if (p.expire > this.lastExpired) {
            this.lastExpired = p.expire;
          }
          this._particles[i] = p;
          this._writeParticle(i, p);
        }
      }
      if (warmingUp) {
        this.startTime = 0;
      }
    }
    if (this.autoDestruct && this.timeFrame > this.lastExpired) {
      this.destroy();
    }
  }
});

export default ParticleEmitter;
