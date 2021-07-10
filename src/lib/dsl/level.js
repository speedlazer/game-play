import { Noise } from "noisejs";
import { getOne } from "src/lib/utils";
import { fadeIn, fadeOut } from "src/components/generic/ColorFade";
import {
  setScenery,
  getNotificationInScreen,
  getScrollVelocity,
  setAltitude,
  getAltitude
} from "src/components/Scenery";
import { animations } from "data";
import { setGameSpeed } from "src/lib/core/gameSpeed";
import {
  setBackground,
  setBackgroundCheckpoint,
  getBackgroundCheckpoint,
  setBackgroundCheckpointLimit
} from "src/components/Background";
import { lookup } from "src/lib/random";
import { playAnimation } from "src/components/Animation";
import { EASE_IN_OUT } from "src/constants/easing";

const noise = new Noise(lookup());
const MAX_X_OFFSET = 30;
const MAX_Y_OFFSET = 15;

const SCENERY_ACTIVE = true;

const levelFunctions = state => ({
  trauma: { value: 0, time: 0, handler: null },

  addScreenTrauma: value => {
    state.trauma.value += value;

    if (state.trauma.value > 0 && state.trauma.handler === null) {
      state.trauma.handler = ({ dt }) => {
        const screenshake = state.trauma.value * state.trauma.value;

        state.trauma.value = Math.max(0, state.trauma.value - 0.001 * dt);
        let x = 0;
        let y = 0;
        if (screenshake > 0) {
          state.trauma.time += dt;

          const xn = noise.perlin2(
            0.1,
            state.trauma.time / ((3 - state.trauma.value) * 360)
          );
          const yn = noise.perlin2(
            state.trauma.time / ((3 - state.trauma.value) * 360),
            0.3
          );
          x = 0 + Math.round(MAX_X_OFFSET * screenshake * xn);
          y = 0 + Math.round(MAX_Y_OFFSET * screenshake * yn);
        }

        Crafty.viewport.x = x;
        Crafty.viewport.y = y;

        if (screenshake === 0) {
          Crafty.unbind("GameLoop", state.trauma.handler);
          state.trauma.handler = null;
        }
      };

      Crafty.bind("GameLoop", state.trauma.handler);
    }
  },
  setScrollingSpeed: async (x, y, { speed = 50, instant = false } = {}) => {
    if (!SCENERY_ACTIVE) return;
    const scenery = getOne("Scenery") || Crafty.e("Scenery, 2D");
    return instant
      ? scenery.setScrollVelocity({ vx: -x, vy: y })
      : new Promise(resolve => {
          const vPSec = speed / 1000;
          const { vx: startX, vy: startY } = getScrollVelocity();
          const deltaY = Math.abs(y - startY);
          const deltaX = Math.abs(x - -startX);
          const delta = Math.max(deltaX, deltaY);

          const ease = new Crafty.easing(delta / vPSec, EASE_IN_OUT);
          const f = ({ dt }) => {
            ease.tick(dt);
            const v = ease.value();
            if (v >= 1.0) {
              Crafty.unbind("GameLoop", f);
              resolve();
            }
            const vy = startY * (1 - v) + y * v;
            const vx = -startX * (1 - v) + x * v;
            scenery.setScrollVelocity({ vx: -vx, vy });
          };

          Crafty.bind("GameLoop", f);
        });
  },
  setAltitude: async (y, { speed = 50, instant = false } = {}) => {
    if (!SCENERY_ACTIVE) return;
    return instant
      ? setAltitude(y)
      : new Promise(resolve => {
          const altPSec = speed / 1000;
          const startAlt = getAltitude();
          const delta = Math.abs(y - startAlt);

          const ease = new Crafty.easing(delta / altPSec, EASE_IN_OUT);
          const f = ({ dt }) => {
            ease.tick(dt);
            const v = ease.value();
            if (v >= 1.0) {
              Crafty.unbind("GameLoop", f);
              resolve();
            }
            const alt = startAlt * (1 - v) + y * v;
            setAltitude(alt);
          };

          Crafty.bind("GameLoop", f);
        });
  },
  setScenery: async sceneryName => {
    if (!SCENERY_ACTIVE) return;
    return setScenery(sceneryName);
  },
  waitTillInScreen: (sceneryName, offset) =>
    getNotificationInScreen(sceneryName, offset),
  setBackground: async (backgroundName, checkpoint, limit) => {
    if (!SCENERY_ACTIVE) return;
    setBackground(animations(backgroundName));
    if (limit !== undefined) {
      setBackgroundCheckpointLimit(limit);
    }
    if (checkpoint !== undefined) {
      if (getBackgroundCheckpoint() === 0) {
        setBackgroundCheckpoint(checkpoint);
      }
    }
  },
  setGameSpeed: setGameSpeed,
  fadeIn: fadeIn,
  fadeOut: fadeOut,
  setBackgroundCheckpointLimit: async limit => {
    setBackgroundCheckpointLimit(limit);
  },
  setBackgroundCheckpoint: async checkpoint => {
    if (getBackgroundCheckpoint() < checkpoint) {
      setBackgroundCheckpoint(checkpoint);
    }
  },
  playAnimation: (animation, options) =>
    playAnimation(animations(animation), options)
});

export default levelFunctions;
