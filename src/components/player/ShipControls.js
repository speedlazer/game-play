const ShipControls = "ShipControls";

Crafty.c(ShipControls, {
  controlPrimary(onOff) {
    onOff ? this.showState("shooting") : this.showState("noShooting");
  },

  controlSecondary() {},
  controlSwitch() {},
  controlBlock() {}
});

export default ShipControls;
