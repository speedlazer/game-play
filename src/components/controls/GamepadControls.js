import { togglePause } from "src/lib/core/pauseToggle";
import Listener from "src/components/generic/Listener";
import Gamepad from "./Gamepad";
import ControlScheme from "src/components/player/ControlScheme";

const GamepadControls = "GamepadControls";

Crafty.c(GamepadControls, {
  init() {
    this.requires(Listener);
    this.bind("RemoveComponent", function(componentName) {
      if (componentName === ControlScheme) {
        this.removeComponent(GamepadControls);
      }
    });
    this.emits = {};
  },

  remove() {
    this.unbind("GamepadKeyChange", this._keyHandling);
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
    if (controlMap.gamepadIndex == null) {
      return;
    }

    this.requires(Gamepad);
    this.gamepad(controlMap.gamepadIndex);

    this.bind("GamepadKeyChange", this._keyHandling);
    this.bind("GamepadAxisChange", this._stickHandling);
    return this;
  },

  _stickHandling(e) {
    // TODO: Detect start motion, start emitting 'up / down', 'left / right'
    // Detect end motion
    //
    //   axis: j,
    //   value: gamepad.axes[j]
    let direction;
    if (e.axis === 1) {
      // left stick: up / down
      direction = "vertical";
      if (e.value < -0.5) {
        this._startEmit(direction, "Up");
      } else if (e.value > 0.5) {
        this._startEmit(direction, "Down");
      } else {
        this._stopEmit(direction);
      }
    }

    if (e.axis === 0) {
      // left stick: left / right
      direction = "horizontal";
      if (e.value < -0.5) {
        this._startEmit(direction, "Left");
      } else if (e.value > 0.5) {
        this._startEmit(direction, "Right");
      } else {
        this._stopEmit(direction);
      }
    }
  },

  _startEmit(axis, value) {
    if ((this.emits[axis] && this.emits[axis].value) === value) {
      return;
    }
    this._stopEmit(axis);
    this.trigger(value);
    this._player && this._player.trigger(value);
    this.emits[axis] = {
      interval: setInterval(() => {
        this.trigger(value);
        this._player && this._player.trigger(value);
      }, 200),
      value
    };
  },

  _stopEmit(axis) {
    clearInterval(this.emits[axis] && this.emits[axis].interval);
    return delete this.emits[axis];
  },

  _keyHandling(e) {
    if (
      this.lastPressed &&
      this.lastPressed.getTime() > new Date().getTime() - 200
    ) {
      return;
    }
    this.lastPressed = new Date();
    if (e.button === this.controlMap.pause && e.pressed) {
      togglePause();
    }
    if (e.button === this.controlMap.fire && e.pressed) {
      this.trigger("Fire", e);
      this._player && this._player.trigger("Fire", e);
    }
    if (e.button === this.controlMap.up && e.pressed) {
      this.trigger("Up", e);
      this._player && this._player.trigger("Up", e);
    }
    if (e.button === this.controlMap.down && e.pressed) {
      this.trigger("Down", e);
      this._player && this._player.trigger("Down", e);
    }
    if (e.button === this.controlMap.left && e.pressed) {
      this.trigger("Left", e);
      this._player && this._player.trigger("Left", e);
    }
    if (e.button === this.controlMap.right && e.pressed) {
      this.trigger("Right", e);
      this._player && this._player.trigger("Right", e);
    }
  },

  assignControls(ship) {
    if (ship.hasPlayerControls) return;
    ship.hasPlayerControls = true;
    ship
      .addComponent("GamepadMultiway")
      .gamepadMultiway({
        speed: { y: 550, x: 750 },
        gamepadIndex: this.controlMap.gamepadIndex,
        analog: true
      })
      .bind("GamePause", function(paused) {
        if (paused) {
          this.disabledBeforePause = this.disableControls;
          this.disableControl();
        } else {
          if (!this.disabledBeforePause) {
            this.enableControl();
          }
        }
      });
    const gamepad = this._getGamepad();
    const psController = [
      "sony",
      "dualshock",
      "playstation",
      "sixaxis",
      "ps3",
      "ps3",
      "ps(r)"
    ].some(name => gamepad.id.toLowerCase().indexOf(name) !== -1);
    const xboxController = ["xbox", "x-box"].some(
      name => gamepad.id.toLowerCase().indexOf(name) !== -1
    );

    console.log(
      psController
        ? "Playstation controller"
        : xboxController
        ? "XBox controller"
        : `Generic controller ${gamepad.id}`
    );

    ship.controlName = mapItem => {
      const gamepad = this._getGamepad();
      const button = this.controlMap[mapItem];
      if (gamepad.id) {
        if (psController) {
          const buttons = [
            "✖ button",
            "◯ button",
            "□ button",
            "△ button",
            "Left shoulder button (L1)",
            "Right shoulder button (R1)",
            "Left trigger (L2)",
            "Right trigger (R2)",
            "Share button",
            "Option button",
            "Left stick (L3)",
            "Right stick (R3)",
            "D-pad up button",
            "D-pad down button",
            "D-pad left button",
            "D-pad right button",
            "Playstation button",
            "touchpad"
          ];
          return buttons[button];
        }
        if (xboxController) {
          const buttons = [
            "a button",
            "b button",
            "x button",
            "y button",
            "Left bumper (LB)",
            "Right bumper (RB)",
            "Left trigger (LT)",
            "Right trigger (RT)",
            "Select button",
            "Start button",
            "Left stick (L)",
            "Right stick (R)",
            "D-pad up button",
            "D-pad down button",
            "D-pad left button",
            "D-pad right button"
          ];
          return buttons[button];
        }
      }
      let num = "1st";
      switch (button) {
        case 0:
          num = "1st";
          break;
        case 1:
          num = "2nd";
          break;
        case 2:
          num = "3rd";
          break;
        default:
          num = `${button + 1}th`;
          break;
      }

      return `${num} button`;
    };

    this.listenTo(ship, "GamepadKeyChange", e => {
      Object.entries(this.controlMap).forEach(([action, button]) => {
        if (button === e.button) {
          ship.buttonPressed(action, e.pressed);
        }
      });
    });
  }
});

export default GamepadControls;
