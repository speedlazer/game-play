import TweenPromise from "src/components/generic/TweenPromise";
import Health from "src/components/Health";
import { scorePoints, playerHit, reset, getMultiplier } from "./bonus";

let pointsPool = [];
Crafty.bind("SceneDestroy", () => (pointsPool = []));

const getAwardText = () => {
  const available = pointsPool.find(e => e.__frozen);
  if (available) {
    available.unfreeze();
    return available.attr({ alpha: 1 });
  }
  const spawn = Crafty.e(`2D, Text, DOM, ${TweenPromise}`)
    .attr({ z: 400, alpha: 1, w: 300 })
    .textColor("#EEEEEE")
    .textAlign("left")
    .textFont({
      size: "12px",
      weight: "bold",
      family: "Press Start 2P"
    });

  pointsPool = pointsPool.concat(spawn);
  return spawn;
};

const stateFunctions = (dsl, state) => {
  const lives = (
    Crafty("HUDLives").get(0) ||
    Crafty.e(`2D, HUDLives, UILayerDOM, Text, HUD, HUDTop, ${TweenPromise}`)
      .attr({ x: 20, y: -10, w: 100, alpha: 0 })
      .textColor("#FFFF00")
      .textAlign("left")
      .textFont({
        size: "8px",
        weight: "bold",
        family: "Press Start 2P"
      })
  ).text(`Lives: ${state.lives}`);

  const health =
    Crafty("HUDHealth").get(0) ||
    Crafty.e(
      `2D, HUDHealth, UILayerWebGL, HUD, HUDTop, ${Health}, ${TweenPromise}`
    ).attr({ x: 150, y: -10, w: 120, h: 5, alpha: 0, maxWidth: 120 });

  Crafty("HUDHealthBar").get(0) ||
    Crafty.e(
      `2D, HUDHealthBar, UILayerWebGL, Color, HUD, HUDTop, ${TweenPromise}`
    )
      .attr({ x: 149, y: -11, w: 122, h: 7, z: -1, alpha: 0, baseAlpha: 0.6 })
      .color("#202020");

  const energy =
    Crafty("HUDEnergy").get(0) ||
    Crafty.e(`2D, HUDEnergy, UILayerWebGL, HUD, HUDTop, Color, ${TweenPromise}`)
      .attr({
        x: 150,
        y: 0,
        w: 0,
        h: 5,
        alpha: 0,
        maxWidth: 120
      })
      .color("#4040dd");

  Crafty("HUDEnergyBar").get(0) ||
    Crafty.e(
      `2D, HUDEnergyBar, UILayerWebGL, Color, HUD, HUDTop, ${TweenPromise}`
    )
      .attr({ x: 149, y: -1, w: 122, h: 7, z: -1, alpha: 0, baseAlpha: 0.6 })
      .color("#202020");

  const score = (
    Crafty("HUDScore").get(0) ||
    Crafty.e(`2D, HUDScore, UILayerDOM, Text, HUD, HUDTop, ${TweenPromise}`)
      .attr({ x: 800, y: -10, w: 220, alpha: 0, score: 0, displayScore: 0 })
      .textColor("#FFFF00")
      .textAlign("left")
      .textFont({
        size: "8px",
        weight: "bold",
        family: "Press Start 2P"
      })
  )
    .text(function() {
      if (this.score > this.displayScore + 200) {
        this.displayScore += 10;
        this.textFont({ size: "9px" }).textColor("#FFFF80");
      } else if (this.score > this.displayScore + 100) {
        this.displayScore += 5;
        this.textFont({ size: "9px" }).textColor("#FFFF40");
      } else if (this.score > this.displayScore) {
        this.displayScore += 1;
        this.textFont({ size: "8px" });
      }
      return `Score: ${this.displayScore}`;
    })
    .dynamicTextGeneration(true, "GameLoop");

  const multiplier = (
    Crafty("HUDMultiplier").get(0) ||
    Crafty.e(
      `2D, HUDMultiplier, UILayerDOM, Text, HUD, HUDTop, ${TweenPromise}`
    )
      .attr({ x: 800, y: 10, w: 220, alpha: 0 })
      .textColor("#FFFF00")
      .textAlign("left")
      .textFont({
        size: "8px",
        weight: "bold",
        family: "Press Start 2P"
      })
  ).text(`Bonus: ${getMultiplier()}x`);
  Crafty.bind("MultiplierChange", () =>
    multiplier.text(`Bonus: ${getMultiplier()}x`)
  );

  const closeScripts = [];

  const onSceneDestroy = () => {
    dsl.closeScript();
    reset();
  };
  Crafty.one("SceneDestroy", onSceneDestroy);

  dsl.closeScript = () => {
    Crafty.unbind("SceneDestroy", onSceneDestroy);
    Crafty.unbind("MultiplierChange");
    closeScripts.forEach(c => c());
  };

  const awardText = async (text, x, y) => {
    const award = getAwardText()
      .attr({ x, y })
      .text(text);
    await award.tweenPromise({ y: y - 40, alpha: 0 }, 1000);
    award.freeze();
  };

  return {
    onScriptClose: callback => {
      closeScripts.push(callback);
    },
    setHealthbar: healthPerc => {
      health.attr({ health: healthPerc });
    },
    setEnergybar: energyPerc => {
      energy.attr({ w: energyPerc * energy.maxWidth });
    },
    showBuff: (slot, entity, buffName, key) => {
      const item = Crafty(`BuffSlot${slot}`);
      if (item.length > 0) {
        item.destroy();
      }

      const icon = Crafty.e(
        `2D, HUD, HUDBottom, WebGL, Color, BuffSlot${slot}, ${TweenPromise}`
      ).attr({
        w: 20,
        h: 20,
        x: 20 + slot * 30,
        y: Crafty.viewport.height - 28,
        z: 900,
        alpha: state.hudShown === true ? 1 : 0
      });

      const updateColor = () => {
        if (entity.canActivateBuff(buffName)) {
          icon.color("#5F5");
          return;
        }
        const status = entity.buffStatus(buffName);
        if (status.activeLeft === 0 && status.cooldown === 0) {
          icon.color("#333");
          return;
        }
        if (status.activeLeft > 0) {
          icon.color("#AA0");
          return;
        }
        if (status.cooldown > 0) {
          icon.color("#A10");
          return;
        }
      };

      updateColor();

      entity.uniqueBind("EnergyUpdate", () => {
        updateColor();
      });
      entity.uniqueBind("BuffActivated", name => {
        if (name === buffName) {
          updateColor();
        }
      });
      entity.uniqueBind("BuffEnded", name => {
        if (name === buffName) {
          updateColor();
        }
      });
      entity.uniqueBind("CooldownEnded", name => {
        if (name === buffName) {
          updateColor();
        }
      });

      Crafty.e(`DOM, HUD, HUDBottom, 2D, Text, ${TweenPromise}`)
        .attr({
          w: 60,
          h: 20,
          x: 1 + 30 * slot,
          y: Crafty.viewport.height - 11,
          alpha: state.hudShown === true ? 1 : 0
        })
        .textColor("#111")
        .textAlign("center")
        .textFont({
          size: "8px",
          family: "Press Start 2P"
        })
        .text(`${key}`);

      Crafty.e(`DOM, HUD, HUDBottom, 2D, Text, ${TweenPromise}`)
        .attr({
          w: 60,
          h: 20,
          x: 30 * slot,
          y: Crafty.viewport.height - 10,
          alpha: state.hudShown === true ? 1 : 0
        })
        .textColor("#eee")
        .textAlign("center")
        .textFont({
          size: "8px",
          family: "Press Start 2P"
        })
        .text(`${key}`);
    },
    loseLife: () => {
      state.lives -= 1;
      if (state.lives < 0) {
        state.gameEnded = true;
        Crafty.trigger("GameOver");
        throw new Error("Game Over");
      }
      lives.text(`Lives: ${state.lives}`);
    },
    gainLife: () => {
      state.lives += 1;
      lives.text(`Lives: ${state.lives}`);
    },
    awardPoints: async (amount, x, y, countToBonus = true) => {
      state.score += amount;
      score.attr({ score: state.score });
      if (countToBonus) {
        scorePoints(amount, x, y, dsl);
      }
      await awardText(`+${amount}`, x, y);
    },
    awardText,
    playerHit: playerHit,
    showHUD: () => {
      if (state.hudShown === true) return;
      state.hudShown = true;
      const results = [];
      Crafty("HUDTop").each(function() {
        if (this.tweenPromise) {
          results.push(
            this.tweenPromise(
              {
                alpha: this.baseAlpha === undefined ? 1 : this.baseAlpha,
                y: this.y + 20
              },
              500
            )
          );
        }
      });
      console.log("show HudBottom");
      Crafty("HUDBottom").each(function() {
        if (this.tweenPromise) {
          results.push(
            this.tweenPromise(
              {
                alpha: this.baseAlpha === undefined ? 1 : this.baseAlpha
              },
              500
            )
          );
        }
      });
      return Promise.all(results);
    },
    hideHUD: () => {
      if (state.hudShown !== true) return;
      state.hudShown = false;
      const results = [];
      Crafty("HUDTop").each(function() {
        if (this.tweenPromise) {
          results.push(this.tweenPromise({ alpha: 0, y: this.y - 20 }, 500));
        }
      });
      Crafty("HUDBottom").each(function() {
        if (this.tweenPromise) {
          results.push(this.tweenPromise({ alpha: 0 }, 500));
        }
      });
      return Promise.all(results);
    }
  };
};

export default stateFunctions;
