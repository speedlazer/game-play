import { centeredText } from "./text-helpers";
import { togglePause } from "src/lib/core/pauseToggle";
import audio from "src/lib/audio";
import Menu from "./Menu";
import { updateSetting } from "src/lib/settings";

const PauseMenu = "PauseMenu";

const soundLabels = { 0: "Off", 10: "Max" };
const soundLevel = level => soundLabels[level] || level;

const gameVersion = /* eslint-env node */ process.env.VERSION;

const soundOption = {
  getName: () => {
    const soundVolumeLevel = Math.round(audio.getEffectsVolume() * 10);
    return `Sound [${soundLevel(soundVolumeLevel)}]`;
  },
  left: () => {
    let soundVolumeLevel = Math.round(audio.getEffectsVolume() * 10);
    soundVolumeLevel = Math.max(0, soundVolumeLevel - 1);
    audio.setEffectVolume(soundVolumeLevel / 10.0);
    updateSetting("effectsVolume", soundVolumeLevel / 10.0);
  },
  right: () => {
    let soundVolumeLevel = Math.round(audio.getEffectsVolume() * 10);
    soundVolumeLevel = Math.min(10, soundVolumeLevel + 1);
    audio.setEffectVolume(soundVolumeLevel / 10.0);
    updateSetting("effectsVolume", soundVolumeLevel / 10.0);
  },
  select: () => {
    //console.log("Select");
  },
  deselect: () => {
    //console.log("Deselect");
  }
};

const musicOption = {
  getName: () => {
    const musicVolumeLevel = Math.round(audio.getMusicVolume() * 10);
    return `Music [${soundLevel(musicVolumeLevel)}]`;
  },
  left: () => {
    let musicVolumeLevel = Math.round(audio.getMusicVolume() * 10);
    musicVolumeLevel = Math.max(0, musicVolumeLevel - 1);
    audio.setMusicVolume(musicVolumeLevel / 10.0);
    updateSetting("musicVolume", musicVolumeLevel / 10.0);
  },
  right: () => {
    let musicVolumeLevel = Math.round(audio.getMusicVolume() * 10);
    musicVolumeLevel = Math.min(10, musicVolumeLevel + 1);
    audio.setMusicVolume(musicVolumeLevel / 10.0);
    updateSetting("musicVolume", musicVolumeLevel / 10.0);
  },
  select: () => {
    //console.log("Select");
  },
  deselect: () => {
    //console.log("Deselect");
  }
};

const items = [
  //{ name: "Controls" },
  {
    name: "Resume",
    activate: () => {
      setTimeout(() => togglePause());
    }
  },
  soundOption,
  musicOption,
  {
    name: "Restart",
    spaceAbove: true,
    dangerous: true,
    activate: () => {
      setTimeout(() => {
        togglePause();
        Crafty.trigger("EndGame", { mode: "restart" });
        Crafty.enterScene("Game");
      });
    }
  },
  {
    name: "Quit",
    dangerous: true,
    activate: () => {
      setTimeout(() => {
        togglePause();
        Crafty.trigger("EndGame", { mode: "quit" });
        Crafty.enterScene("Intro");
      });
    }
  }
];

Crafty.c(PauseMenu, {
  required: "UILayerDOM, 2D, Color",
  events: {
    Freeze() {
      this._children.forEach(child => child.freeze());
    },
    Unfreeze() {
      this._children.forEach(child => child.unfreeze());
    }
  },

  init() {},

  showMenu(controller) {
    if (this.menu) {
      this.menu.attachController(controller);
    } else {
      this.menuOptions(items, controller);
    }
    return this;
  },

  menuOptions(options, controller) {
    const menuWidth = 400;

    this.attr({
      x: (Crafty.viewport.width - menuWidth) / 2,
      w: menuWidth,
      alpha: 0.8,
      z: 200
    }).color("#222222");

    let menuHeight = 70;
    centeredText("Game paused", this, 20);

    this.menu = Crafty.e(Menu)
      .attr({ x: this.x, w: this.w, y: this.y + 70, z: this.z + 1 })
      .menu(options, controller);
    this.attach(this.menu);
    menuHeight += this.menu.h + 10;

    centeredText(`version: ${gameVersion}`, this, menuHeight, "#eeeeee", "8px");
    menuHeight += 20;

    this.attr({
      y: (Crafty.viewport.height - menuHeight) / 2,
      h: menuHeight
    });

    return this;
  }
});

export default PauseMenu;
