import { compositions, particles } from "data";
import ParticleEmitter from "src/components/ParticleEmitter";
import PausableMotion from "src/components/PausableMotion";
import Composable from "src/components/Composable";
import AngleMotion from "src/components/AngleMotion";
import Beam from "src/components/Beam";
import Steering from "src/components/Steering";
import Flipable from "src/components/utils/flipable";
import { EntityDefinition } from "src/components/EntityDefinition";
import { tweenFn } from "src/components/generic/TweenPromise";
import { easingFunctions } from "src/constants/easing";
import audio from "src/lib/audio";
import { flipRotation, rotX, normVector } from "src/lib/rotation";

/**
 * Fire rhythm:
 *
 * - Initial Delay
 * - Shot
 * - Shot delay / Burst delay
 * - Shot
 * - Shot delay / Burst delay
 * - Shot
 *
 */

const flipAngle = (xFlipped, angle) => (xFlipped ? flipRotation(angle) : angle);

const numArray = e =>
  Array.isArray(e) && e.length === 2 && e.every(i => typeof i === "number");

const adjustForDifficulty = (difficulty, numberOrArray, defaultValue = 0) =>
  numberOrArray === undefined
    ? defaultValue
    : numArray(numberOrArray)
    ? numberOrArray[0] + (numberOrArray[1] - numberOrArray[0]) * difficulty
    : numberOrArray;

const applyDifficultyToObj = (difficulty, obj) =>
  obj &&
  Object.entries(obj).reduce(
    (a, [k, v]) => ({
      ...a,
      [k]: adjustForDifficulty(difficulty, v)
    }),
    {}
  );

const ScreenBound = "ScreenBound";
Crafty.c(ScreenBound, {
  required: "2D",

  init() {
    this.bind("GameLoop", this._checkBounds);
  },

  _checkBounds() {
    const maxX =
      -Crafty.viewport._x +
      Crafty.viewport._width / Crafty.viewport._scale +
      10;
    const minX = -Crafty.viewport._x - 50;

    const maxY =
      -Crafty.viewport._y +
      Crafty.viewport._height / Crafty.viewport._scale +
      10;
    const minY = -Crafty.viewport._y - 50;

    if (this.x > maxX || minX > this.x || minY > this.y || this.y > maxY) {
      this.freeze();
    }
  }
});

const calcHitPosition = (objA, hit) => {
  let x = null;
  let y = null;

  if (hit.type === "SAT") {
    const [rx, ry] = rotX(objA, objA.w);
    const addX = objA.bulletSettings.attached ? rx : -hit.overlap;
    x = objA.x + addX - hit.overlap * hit.nx;
    y = objA.y + ry + objA.h / 2 - hit.overlap * hit.ny;
  } else {
    const objB = hit.obj;
    const xLeftOverlap =
      (objA.x < objB.x && objA.w + objA.x > objB.x) ||
      (objA.vx !== undefined && objA.vx > 0);
    const xRightOverlap =
      (objA.x < objB.x + objB.w && objA.x + objA.w > objB.x) ||
      (objA.vx !== undefined && objA.vx < 0);

    const yTopOverlap = objA.y < objB.y && objA.h + objA.y > objB.y;
    const yBottomOverlap = objA.y < objB.w + objB.h && objA.y + objA.h > objB.y;

    if (xLeftOverlap && !yTopOverlap && !yBottomOverlap) {
      x = objB.x;
      y = objA.y + objA.h / 2;
    } else if (xRightOverlap && !yTopOverlap && !yBottomOverlap) {
      x = objB.x + objB.w;
      y = objA.y + objA.h / 2;
    } else if (yTopOverlap) {
      x = objA.x + objA.w / 2;
      y = objB.y;
    } else if (yBottomOverlap) {
      x = objA.x + objA.w / 2;
      y = objB.y + objB.h;
    }
  }

  return { x, y, angle: objA.angle };
};

const Bullet = "Bullet";

Crafty.c(Bullet, {
  required: `2D, Motion, WebGL, ${AngleMotion}, ${Beam}, ${Flipable}, ${PausableMotion}`,
  events: {
    Freeze() {
      this.cooldowns = {};
      if (this._parent) {
        this._parent.detach(this);
      }
    }
  },

  init() {
    this.cooldowns = {};
  },

  _targetHit(obj, position, collisionType) {
    const collisionConfig = this.bulletSettings.collisions[collisionType];
    this.cooldowns[collisionType] = 30;
    if (
      obj &&
      obj.processDamage &&
      this.bulletSettings.damage &&
      Crafty.rectManager.overlap(obj, Crafty.viewport.rect())
    ) {
      obj.processDamage(this.bulletSettings.damage);
      this.spawner.mainEntity.trigger("DealtDamage", {
        damage: this.bulletSettings.damage,
        target: obj
      });
    }
    if (collisionConfig.state) {
      this.showState(collisionConfig.state);
    }

    (collisionConfig.spawns || []).forEach(([name, settings]) => {
      spawnItem(
        this.weaponDefinition,
        name,
        settings,
        this,
        position,
        this.target
      );
    });

    if (collisionConfig.remove !== false) {
      this.unbind("GameLoop", this._updateBullet);
      this.bulletTime = 0;
      this.freeze();
    }
  },

  _bulletHitOn(collisionType, hitData) {
    const firstObj = hitData[0].obj;
    const position = calcHitPosition(this, hitData[0]);

    this._targetHit(firstObj, position, collisionType);
  },

  bullet(weaponDefinition, settings, target) {
    this.weaponDefinition = weaponDefinition;
    this.bulletSettings = { ...settings };
    this.bulletSettings.queue = (this.bulletSettings.queue || []).map(
      event => ({
        duration: 0,
        delay: 0,
        ...applyDifficultyToObj(this.difficulty, event)
      })
    );
    this.bulletSettings.damage =
      settings.damage &&
      settings.damage.map(damage =>
        applyDifficultyToObj(this.difficulty, damage)
      );

    const initialVelocity = adjustForDifficulty(
      this.difficulty,
      settings.velocity
    );

    this.attr({
      angle: settings.angle,
      velocity: this.bulletSettings.attached ? 0 : initialVelocity,
      beamVelocity: this.bulletSettings.attached ? initialVelocity : 0,
      target
    });

    // add lifecycle stuff, bullet entity pools, etc.
    this.bulletTime = 0;
    this.maxBulletTime = this.bulletSettings.queue.reduce(
      (max, item) => max + adjustForDifficulty(this.difficulty, item.duration),
      0
    );

    this.uniqueBind("GameLoop", this._updateBullet);
  },

  _updateBullet({ dt }) {
    this.bulletTime += dt;
    if (this.bulletSettings.collisions) {
      Object.keys(this.bulletSettings.collisions).forEach(c => {
        const v = this.cooldowns[c];
        if (v !== undefined && v > 0) {
          this.cooldowns[c] = v - dt;
        }
      });

      if (this.bulletSettings.beam) {
        let beamDistance = Infinity;
        let beamCollide = null;
        let collisionType = null;
        const nVec = normVector(this.angle);

        Object.keys(this.bulletSettings.collisions).forEach(c => {
          const results = Crafty.raycast(this, nVec, -1, c);
          if (results[0] && results[0].distance < beamDistance) {
            beamDistance = results[0].distance;
            beamCollide = results[0];
            collisionType = c;
          }
        });
        if (beamCollide) {
          this.beamBlocked = true;
          this.sw = beamCollide.distance + 6;
          this._targetHit(
            beamCollide.obj,
            { x: beamCollide.x, y: beamCollide.y },
            collisionType
          );
        } else {
          this.beamBlocked = false;
          this.sw = this.beamLength;
        }
      }
    }
    const upcoming = this.bulletSettings.queue[0];
    if (upcoming) {
      upcoming.delay = (upcoming.delay || 0) - dt;
      const localV =
        upcoming.duration === 0
          ? 1
          : (upcoming.duration - (upcoming.duration + upcoming.delay)) /
            upcoming.duration;

      if (upcoming.delay <= 0 && upcoming.duration === 0) {
        if (upcoming.velocity !== undefined) {
          this.bulletSettings.attached
            ? this.attr({ beamVelocity: upcoming.velocity })
            : this.attr({ velocity: upcoming.velocity });
        }
        if (upcoming.angle !== undefined) {
          this.attr({ angle: flipAngle(this.xFlipped, upcoming.angle) });
        }
        if (upcoming.cleanOutOfScreen !== undefined) {
          this.addComponent(ScreenBound);
        }
        if (upcoming.collide !== undefined) {
          this._targetHit(
            undefined,
            {
              x: this.ox,
              y: this.oy
            },
            upcoming.collide
          );
          upcoming.collide = undefined;
        }
        if (upcoming.steering !== undefined) {
          this.addComponent(Steering).attr({
            steering: upcoming.steering,
            sight: upcoming.sight
          });
        }
        if (upcoming.aimOnTarget !== undefined) {
          const potentialTargets = Crafty(this.target);
          if (potentialTargets.length > 0) {
            const target = Crafty(
              potentialTargets[
                Math.floor(Math.random() * potentialTargets.length)
              ]
            );
            const targetLocation = {
              x: target.x + target.w / 2,
              y: target.y + target.h / 2
            };

            const aimVector = {
              x: this.x - targetLocation.x,
              y: this.y - targetLocation.y
            };
            const radians = Math.atan2(aimVector.y, aimVector.x);
            const angle = (radians / Math.PI) * 180;

            this.attr({ angle, rotation: angle });
          }
        }
      }
      if (upcoming.duration > 0) {
        if (upcoming.audio) {
          const [sample, settings] = [].concat(upcoming.audio);
          audio.playAudio(sample, settings);
          upcoming.audio = null;
        }
        if (upcoming.frame !== undefined) {
          this.displayFrame(upcoming.frame, upcoming.duration);
          upcoming.frame = null;
        }
        if (!upcoming.animateFn && upcoming.velocity !== undefined) {
          const animateFn = tweenFn(
            this,
            this.bulletSettings.attached
              ? { beamVelocity: upcoming.velocity }
              : {
                  velocity: upcoming.velocity
                }
          );
          const easing = easingFunctions[upcoming.easing || "linear"];
          upcoming.animateFn = t => animateFn(easing(t));
        }
        if (upcoming.animateFn) {
          upcoming.animateFn(localV);
        }
      }
      if (localV >= 1) {
        this.bulletSettings.queue.shift();
      }
    }

    if (
      this.bulletTime > this.maxBulletTime &&
      this.bulletSettings.queue.length === 0
    ) {
      this.unbind("GameLoop", this._updateBullet);
      if (this._parent) {
        this._parent.detach(this);
      }
      this.bulletTime = 0;
      this.freeze();
    }
  }
});

let pool = [];
Crafty.bind("SceneDestroy", () => (pool = []));

const getItemFromPool = itemDefinition => {
  const available = pool.find(
    e => e.__frozen && e.bulletDefinition === itemDefinition
  );
  if (available) {
    if (itemDefinition.entity) {
      available.showState("default");
    }
    available.unfreeze();
    available.attr({
      x: 3000,
      y: 3000,
      angle: 0,
      rotation: 0
    });
    return available;
  }

  const spawn = Crafty.e(Bullet).attr({
    x: 3000,
    y: 3000,
    angle: 0,
    rotation: 0
  });
  spawn.bulletDefinition = itemDefinition;
  if (itemDefinition.sprite) {
    spawn.addComponent(itemDefinition.sprite);
  }
  if (itemDefinition.composition) {
    const composeData = compositions(itemDefinition.composition);
    spawn.addComponent(Composable).compose(composeData);
  }
  if (itemDefinition.particles) {
    const particleData = particles(itemDefinition.particles);
    spawn.addComponent(ParticleEmitter).particles(particleData);
  }
  if (itemDefinition.entity) {
    spawn.addComponent(EntityDefinition).applyDefinition(itemDefinition.entity);
  }
  const projectile = itemDefinition.beam ? false : true;
  if (projectile) {
    const collisionChecks = Object.keys(itemDefinition.collisions || {});
    if (collisionChecks.length > 0) {
      if (!spawn.has("Collision")) {
        spawn.addComponent("Collision");
      }

      collisionChecks.forEach(collisionType => {
        spawn.onHit(collisionType, hitDatas =>
          spawn._bulletHitOn(collisionType, hitDatas)
        );
      });
    }
  }

  pool = pool.concat(spawn);
  return spawn;
};

const generator = (itemDef, itemSettings, position, difficulty, f) => {
  const settings = { ...itemDef, ...itemSettings };
  if (settings.angleRange) {
    for (
      let spawnAngle = adjustForDifficulty(
        difficulty,
        settings.angleRange.from
      );
      spawnAngle <= adjustForDifficulty(difficulty, settings.angleRange.to);
      spawnAngle += adjustForDifficulty(difficulty, settings.angleRange.step)
    ) {
      const angle = position.angle + spawnAngle;
      f({ ...settings, angle });
    }
  } else {
    const angle =
      (position.angle || 0) + ({ ...settings, ...itemSettings }.angle || 0);
    f({ ...settings, angle });
  }
};

const spawnItem = (
  definition,
  itemName,
  itemSettings,
  spawner,
  position,
  target
) => {
  const itemDef = definition.spawnables[itemName];
  if (!itemDef) {
    throw new Error(`Spawn ${itemName} not defined`);
  }
  generator(itemDef, itemSettings, position, spawner.difficulty, settings => {
    const spawn = getItemFromPool(itemDef);
    const autoRotate = settings.autoRotate !== false;
    const angle = flipAngle(spawner.xFlipped, settings.angle || 0);

    const rotValue = autoRotate ? angle : 0;
    const rotation = flipAngle(spawner.xFlipped, rotValue);

    spawn.attr({
      itemName,
      spawner,
      difficulty: spawner.difficulty,
      x: position.x - spawn.w / 2,
      y: position.y - spawn.h / 2,
      z: spawner.z,
      autoRotate,
      angle,
      steering: 0,
      rotation
    });

    if (typeof settings.spawnPosition === "object") {
      const { w = 0, h = 0 } = settings.spawnBox || {};
      const randX = -(w / 2) + Math.random() * w;
      const randY = -(h / 2) + Math.random() * h;

      spawn.attr({
        x: position.x - spawn._origin.x + randX,
        y: position.y - spawn._origin.y + randY
      });
    }

    if (itemDef.attached) {
      spawner.attach(spawn);
    }

    if (itemDef.emitDamage) {
      itemDef.emitDamage.forEach(damage => {
        const damageObj = {
          ...applyDifficultyToObj(spawner.difficulty, damage),
          origin: { ...position }
        };
        const ownId = spawner.sourceEntity && spawner.sourceEntity[0];
        const result = damage.targets
          .reduce((a, t) => a.concat(Array.from(Crafty(t))), [])
          .filter((id, i, l) => l.indexOf(id) === i && id !== ownId);
        result.forEach(id => {
          const ent = Crafty(id);
          if (ent.processDamage) ent.processDamage(damageObj);
        });
      });
    }
    spawn.bullet(definition, settings, target);
  });
};

const Weapon = "Weapon";

Crafty.c(Weapon, {
  init() {
    this.xFlipped = false;
    this.spawnQueue = [];
    this.burstsFired = 0;
  },

  weapon(definition) {
    this.definition = definition;
    this.active = false;
    this.aimingEnabled = true;
    return this;
  },

  flip(axis) {
    if (axis !== "X") return;
    this.xFlipped = !this.xFlipped;
    if (this.definition.angle !== undefined) {
      this.definition.angle = flipRotation(this.definition.angle || 0);
    }
  },

  unflip(axis) {
    if (axis !== "X") return;
    this.xFlipped = !this.xFlipped;
    if (this.definition.angle !== undefined) {
      this.definition.angle = flipRotation(this.definition.angle || 0);
    }
  },

  async activate(bursts = undefined) {
    if (!this.definition.pattern) return;
    this.active = true;
    this.burstsFired = 0;
    this.activatedAt = new Date() * 1;
    const spawnRhythm = this.definition.pattern.spawnRhythm;
    this.maxBursts = bursts || spawnRhythm.maxBursts || Infinity;

    this.initialDelay = adjustForDifficulty(
      this.difficulty,
      spawnRhythm.initialDelay
    );
    this._makeQueue();

    this.uniqueBind("GameLoop", this._updateSpawnFrame);

    return new Promise(resolve => {
      this.one("WeaponFireComplete", () => resolve(this));
    });
  },

  _makeQueue() {
    const spawnRhythm = this.definition.pattern.spawnRhythm;
    this.shotQueue = (spawnRhythm.shot || [{ spawn: true, duration: 0 }]).map(
      qItem => ({
        ...qItem,
        duration: adjustForDifficulty(this.difficulty, qItem.duration || 0)
      })
    );
    this.shotQueueLength = this.shotQueue.reduce(
      (acc, i) => acc + i.duration,
      0
    );
  },

  async deactivate() {
    this.active = false;
    this.unbind("GameLoop", this._updateSpawnFrame);
    this.trigger("WeaponFireComplete");
    return this;
  },

  _weaponSpawn(spawnRhythm, angle = 0) {
    spawnRhythm.spawns.forEach(([name, overrideSettings]) => {
      spawnItem(
        this.definition.pattern,
        name,
        overrideSettings,
        this,
        {
          x: this.x + (this.definition.x || 0),
          y: this.y + (this.definition.y || 0),
          angle: this.definition.angle + angle
        },
        this.definition.target
      );
    });
  },

  _aimBarrel({ dt }) {
    const aimSettings = this.definition.pattern.aiming;
    let angle = 0;
    if (aimSettings && this.barrel) {
      if (!this.aimingEnabled) {
        return this.barrel.rotation;
      }
      const potentialTargets = Crafty(this.definition.target);
      if (potentialTargets.length > 0) {
        const target = Crafty(
          potentialTargets[Math.floor(Math.random() * potentialTargets.length)]
        );
        const targetLocation = {
          x: target.x + target.w / 2,
          y: target.y + target.h / 2
        };

        const aimVector = {
          x: this.barrel.ox - targetLocation.x,
          y: this.barrel.oy - targetLocation.y
        };
        const radians = Math.atan2(aimVector.y, aimVector.x);

        if (this.barrel.root.xFlipped) {
          const targetAngle = (radians / Math.PI) * 180 - 180;
          const possibleRotation = flipRotation(
            Crafty.math.clamp(
              flipRotation(targetAngle < 0 ? targetAngle + 180 : targetAngle),
              aimSettings.range[1],
              aimSettings.range[0]
            )
          );
          const corrected =
            (possibleRotation < 0 ? possibleRotation + 360 : possibleRotation) -
            180;
          const maxRotate = aimSettings.rotateSpeed * 0.001 * dt;
          const delta = Crafty.math.clamp(
            corrected - this.barrel.rotation,
            -maxRotate,
            maxRotate
          );
          const rotation = this.barrel.rotation + delta;
          angle = rotation + (aimSettings.offsetAimAngle || 0);

          this.barrel.attr({ rotation });
        } else {
          const targetAngle = (radians / Math.PI) * 180;
          const possibleRotation = Crafty.math.clamp(
            targetAngle,
            aimSettings.range[1],
            aimSettings.range[0]
          );

          const maxRotate = aimSettings.rotateSpeed * 0.001 * dt;
          const delta = Crafty.math.clamp(
            possibleRotation - this.barrel.rotation,
            -maxRotate,
            maxRotate
          );
          const rotation = this.barrel.rotation + delta;
          angle = rotation - (aimSettings.offsetAimAngle || 0);

          this.barrel.attr({ rotation });
        }
      }
    }
    return angle;
  },

  _updateSpawnFrame({ dt }) {
    const spawnRhythm = this.definition.pattern.spawnRhythm;
    const angle = this._aimBarrel({ dt });

    if (this.initialDelay > 0) {
      this.initialDelay -= dt;
      if (this.initialDelay <= 0) {
        this.shotIndex = 0;
        this.shotDelay = 0;
      } else {
        return;
      }
    }

    if (this.shotDelay <= 0) {
      const qPos = 0 - this.shotDelay;
      const entity = this.mainEntity;

      const upcoming = this.shotQueue[0];
      if (upcoming) {
        upcoming.delay = (upcoming.delay || 0) - dt;
        const localV =
          upcoming.duration === 0
            ? 1
            : (upcoming.duration - (upcoming.duration + upcoming.delay)) /
              upcoming.duration;
        if (upcoming.state && entity) {
          entity.showState(upcoming.state, upcoming.duration);
          upcoming.state = undefined;
        }
        if (upcoming.stopAiming === true) {
          this.aimingEnabled = false;
          upcoming.stopAiming = undefined;
        }
        if (upcoming.audio) {
          audio.playAudio(upcoming.audio);
          upcoming.audio = undefined;
        }
        if (upcoming.stopAiming === false) {
          this.aimingEnabled = true;
          upcoming.stopAiming = undefined;
        }
        if (upcoming.spawn) {
          this._weaponSpawn(spawnRhythm, angle);
          upcoming.spawn = false;
        }
        if (localV >= 1) {
          this.shotQueue.shift();
        }
      }

      if (qPos > this.shotQueueLength && this.shotQueue.length === 0) {
        this.shotIndex++;

        if (
          this.shotIndex >=
          adjustForDifficulty(this.difficulty, spawnRhythm.burst)
        ) {
          const burstDelay = adjustForDifficulty(
            this.difficulty,
            spawnRhythm.burstDelay
          );
          this.burstsFired += 1;
          this.initialDelay =
            burstDelay +
            adjustForDifficulty(this.difficulty, spawnRhythm.shotDelay);
          const maxBursts = adjustForDifficulty(
            this.difficulty,
            this.maxBursts
          );
          if (maxBursts <= this.burstsFired) {
            this.deactivate();
          } else {
            this._makeQueue();
          }
          return;
        } else {
          this.shotDelay = adjustForDifficulty(
            this.difficulty,
            spawnRhythm.shotDelay
          );
          if (this.shotDelay > 0) {
            this._makeQueue();
          }
        }
      }
    }

    this.shotDelay -= dt;
  }
});

export default Weapon;
