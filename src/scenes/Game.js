import { createScriptExecutionSpace } from "src/lib/dsl";
import gameStructure from "src/scripts";
import PauseMenu from "src/components/ui/PauseMenu";
import Animation from "src/components/Animation";
import audio from "src/lib/audio";
import { fadeOut } from "src/components/generic/ColorFade";
import { setGameSpeed } from "src/lib/core/gameSpeed";

import Player from "src/components/player/Player";
const DEFAULT_TAGS = ["campaign"];

Crafty.defineScene(
  "Game",
  async function({ start = null, tags = DEFAULT_TAGS } = {}) {
    let pauseMenu = null;
    setGameSpeed(1.0);

    Crafty.bind("GamePause", paused => {
      if (paused) {
        const player = Crafty("Player").get(0);
        if (pauseMenu === null) {
          pauseMenu = Crafty.e(PauseMenu).showMenu(player);
        } else {
          pauseMenu.unfreeze();
          pauseMenu.showMenu(player);
        }
      } else {
        pauseMenu && pauseMenu.freeze();
      }
    });

    let endMode = null;
    Crafty.one("EndGame", event => {
      endMode = event.mode;
    });

    Crafty.viewport.x = 0;
    Crafty.viewport.y = 0;
    this.state = { lives: 2, score: 0 };
    const runner = createScriptExecutionSpace(this.state);
    let checkpoint = null;
    try {
      let started = false;
      for (const item of gameStructure) {
        if (!started && start !== null && start !== item.name) {
          continue;
        }
        if (!tags.every(tag => item.tags[tag] === true)) {
          continue;
        }
        /* eslint-env node */
        if (item.tags.wip === true && process.env.APP_ENV !== "development") {
          continue;
        }
        started = true;
        checkpoint = item.name;
        await runner(item.script);
      }
      const fade = fadeOut();
      audio.fadeMusicVolume(0, 2000);
      await fade.start(2000);
      Crafty.enterScene("GameOver", {
        gameCompleted: !this.state.gameEnded,
        score: this.state.score
      });
    } catch (e) {
      if (endMode !== null) return;
      if (e.message !== "Game Over") {
        console.error(e);
      }
      const fade = fadeOut();
      audio.fadeMusicVolume(0, 2000);
      await fade.start(2000);
      Crafty.enterScene("GameOver", {
        score: this.state.score,
        checkpoint
      });
    }
  },
  function() {
    this.state.gameEnded = true;
    audio.stopMusic();
    // destructor
    Crafty(Player).each(function() {
      this.removeComponent("ShipSpawnable");
    });
    Crafty(Animation).each(function() {
      this.destroy();
    });
    Crafty.unbind("GameOver");
    Crafty.unbind("ScriptFinished");
    Crafty.unbind("GamePause");
  }
);
