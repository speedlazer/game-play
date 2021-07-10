const ShipControls = "ShipControls";

Crafty.c(ShipControls, {
  init() {
    this.bind("NewDirection", direction => {
      if (this.disableControls) return;
      if (
        (direction.x === -1 && !this.xFlipped) ||
        (direction.x === 1 && this.xFlipped)
      ) {
        if (this.appliedEntityState === "dead") return;
        if (this.appliedEntityState !== "reverse") {
          this.showState("reverse");
        }
      } else {
        if (this.appliedEntityState !== "flying") {
          this.showState("flying");
        }
      }
    });
  },

  buttonPressed(name, onOff) {
    if (this.disableControls) return;
    if (this.appliedEntityState === "dead") return;
    this.trigger(onOff ? "ButtonPressed" : "ButtonReleased", name);
  }
});

export default ShipControls;
