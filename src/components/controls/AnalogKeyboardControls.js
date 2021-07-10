import { togglePause } from "src/lib/core/pauseToggle";
import Listener from "src/components/generic/Listener";
import ControlScheme from "src/components/player/ControlScheme";

const AnalogKeyboardControls = "AnalogKeyboardControls";

Crafty.c(AnalogKeyboardControls, {
  init() {
    this._player = null;
    this.requires(Listener);
    this.bind("RemoveComponent", componentName => {
      if (componentName === ControlScheme) {
        this.removeComponent(AnalogKeyboardControls);
      }
    });
  },

  remove() {
    this.unbind("KeyDown", this._keyHandling);
  },

  setupControls(player) {
    this._player = player;
    player.addComponent(ControlScheme);
    player.assignControls = ship => {
      this.assignControls(ship);
    };
  },

  controls(controlMap) {
    this.controlMap = controlMap;
    this.uniqueBind("KeyDown", this._keyHandling);
    return this;
  },

  _keyHandling(e) {
    if (this.controlMap.pause.some(key => key === e.key)) {
      togglePause();
    }
    if (this.controlMap.fire.some(key => key === e.key)) {
      this.trigger("Fire", e);
      this._player && this._player.trigger("Fire", e);
    }
    if (this.controlMap.up.some(key => key === e.key)) {
      this.trigger("Up", e);
      this._player && this._player.trigger("Up", e);
    }
    if (this.controlMap.down.some(key => key === e.key)) {
      this.trigger("Down", e);
      this._player && this._player.trigger("Down", e);
    }
    if (this.controlMap.left.some(key => key === e.key)) {
      this.trigger("Left", e);
      this._player && this._player.trigger("Left", e);
    }
    if (this.controlMap.right.some(key => key === e.key)) {
      this.trigger("Right", e);
      this._player && this._player.trigger("Right", e);
    }
  },

  assignControls(ship) {
    if (ship.hasPlayerControls) return;
    const { controlMap } = this;

    const MAX_X_SPEED = 700;
    const MAX_Y_SPEED = 500;
    const ACCELLERATE_Y = MAX_Y_SPEED * 6;
    const ACCELLERATE_X = MAX_X_SPEED * 6;

    let yDir = 0;
    let xDir = 0;
    let pressed = {
      up: false,
      down: false,
      left: false,
      right: false
    };

    ship.hasPlayerControls = true;
    ship
      .addComponent("Motion")
      .bind("GamePause", function(paused) {
        if (paused) {
          pressed = {
            up: false,
            down: false,
            left: false,
            right: false
          };
          this.disabledBeforePause = this.disableControls;
          this.disableControl();
        } else {
          if (!this.disabledBeforePause) {
            this.enableControl();
          }
        }
      })
      .bind("Move", function() {
        const yLimit = MAX_Y_SPEED * yDir;
        if (
          (this.vy < yLimit && yLimit <= 0 && this.ay < 0) ||
          (this.vy > yLimit && yLimit >= 0 && this.ay > 0)
        ) {
          this.vy = yLimit;
          this.ay = 0;
        }

        const xLimit = MAX_X_SPEED * xDir;
        if (
          (this.vx < xLimit && xLimit <= 0 && this.ax < 0) ||
          (this.vx > xLimit && xLimit >= 0 && this.ax > 0)
        ) {
          this.vx = xLimit;
          this.ax = 0;
        }
      });

    ship.controlName = (mapItem, firstOnly = false) => {
      const keys = this.controlMap[mapItem];
      const names = keys.map(key => {
        switch (key) {
          case Crafty.keys.SPACE:
            return "spacebar";
          case Crafty.keys.SHIFT:
            return "shift";
        }
        if (key >= Crafty.keys["0"] && key <= Crafty.keys["9"]) {
          return `${String.fromCharCode(key)}`;
        }

        return `${String.fromCharCode(key)}`;
      });

      return firstOnly ? names[0] : names.join(" or ");
    };

    ship.disableControls = false;
    ship.prevSets = {
      ax: ship.ax,
      ay: ship.ay,
      vx: ship.vx,
      vy: ship.vy
    };
    ship.disableControl = function() {
      if (this.disableControls === true) {
        return;
      }
      this.disableControls = true;
      this.prevSets = {
        ax: this.ax,
        ay: this.ay,
        vx: this.vx,
        vy: this.vy
      };
      this.ax = 0;
      this.ay = 0;
      this.vx = 0;
      this.vy = 0;
      xDir = 0;
      yDir = 0;
    };

    ship.enableControl = function() {
      if (this.disableControls === false) {
        return;
      }
      this.disableControls = false;
      this.ax = this.prevSets.ax;
      this.ay = this.prevSets.ay;
      this.vx = this.prevSets.vx;
      this.vy = this.prevSets.vy;
    };

    const updateAcceleration = () => {
      yDir = 0;
      if (pressed.up) {
        yDir -= 1;
      }
      if (pressed.down) {
        yDir += 1;
      }
      yDir = Math.min(1, Math.max(-1, yDir));

      ship.ay += ACCELLERATE_Y * yDir;
      if (ship.vy > 0 && ship.ay === 0) {
        // decellerate
        ship.ay -= ACCELLERATE_Y * 2;
      }
      if (ship.vy < 0 && ship.ay === 0) {
        // decellerate
        ship.ay += ACCELLERATE_Y * 2;
      }

      xDir = 0;
      if (pressed.left) {
        xDir -= 1;
      }
      if (pressed.right) {
        xDir += 1;
      }
      xDir = Math.min(1, Math.max(-1, xDir));
      ship.ax += ACCELLERATE_X * xDir;
      if (ship.vx > 0 && ship.ax === 0) {
        // decellerate
        ship.ax -= ACCELLERATE_X * 2;
      }
      if (ship.vx < 0 && ship.ax === 0) {
        // decellerate
        ship.ax += ACCELLERATE_X * 2;
      }
    };

    this.listenTo(ship, "KeyDown", function(e) {
      if (ship.disableControls) {
        return;
      }

      Object.entries(controlMap).forEach(([action, buttons]) => {
        if (buttons.some(key => key === e.key)) {
          ship.buttonPressed(action, true);
        }
      });

      if (controlMap.up.some(key => key === e.key)) {
        pressed.up = true;
      }
      if (controlMap.down.some(key => key === e.key)) {
        pressed.down = true;
      }
      if (controlMap.left.some(key => key === e.key)) {
        pressed.left = true;
      }
      if (controlMap.right.some(key => key === e.key)) {
        pressed.right = true;
      }

      updateAcceleration();
    });

    this.listenTo(ship, "KeyUp", function(e) {
      if (ship.disableControls) {
        return;
      }

      Object.entries(controlMap).forEach(([action, buttons]) => {
        if (buttons.some(key => key === e.key)) {
          ship.buttonPressed(action, false);
        }
      });

      if (controlMap.up.some(key => key === e.key)) {
        pressed.up = false;
      }
      if (controlMap.down.some(key => key === e.key)) {
        pressed.down = false;
      }
      if (controlMap.left.some(key => key === e.key)) {
        pressed.left = false;
      }
      if (controlMap.right.some(key => key === e.key)) {
        pressed.right = false;
      }

      updateAcceleration();
    });
  }
});

export default AnalogKeyboardControls;
