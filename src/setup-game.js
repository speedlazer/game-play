import AnalogKeyboardControls from "src/components/controls/AnalogKeyboardControls";
import GamepadControls from "src/components/controls/GamepadControls";
import PlayerAssignable from "src/components/player/PlayerAssignable";
import Player from "src/components/player/Player";

export const setupControls = () => {
  const player = Crafty.e([Player, "Color"].join(", "))
    .attr({ name: "Player 1", z: 0, playerNumber: 1 })
    .setName("Player 1")
    .color("#FF0000");

  Crafty.e([AnalogKeyboardControls, PlayerAssignable].join(", ")).controls({
    fire: [Crafty.keys.SPACE],
    heavy: [Crafty.keys.C, Crafty.keys.SHIFT],
    switchWeapon: [Crafty.keys.Z],
    shield: [Crafty.keys.X],
    up: [Crafty.keys.UP_ARROW, Crafty.keys.W],
    down: [Crafty.keys.DOWN_ARROW, Crafty.keys.S],
    left: [Crafty.keys.LEFT_ARROW, Crafty.keys.A],
    right: [Crafty.keys.RIGHT_ARROW, Crafty.keys.D],
    power1: [Crafty.keys["1"]],
    pause: [Crafty.keys.P]
  });

  Crafty.e([GamepadControls, PlayerAssignable].join(", ")).controls({
    gamepadIndex: 0,
    fire: 0,
    heavy: 1,
    switchWeapon: 2,
    power1: 4,
    pause: 9,
    up: 12,
    down: 13,
    left: 14,
    right: 15
  });

  return player;
};
