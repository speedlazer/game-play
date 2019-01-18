import battleShip from "./BattleShip.composition.json";
import droneShip from "./DroneShip.composition.json";
import introShip from "./IntroShip.composition.json";
import shipHatch from "./ShipHatch.composition.json";
import bulletCannon from "./BulletCannon.composition.json";
import dino from "./Dino.composition.json";

const compositions = {
  ...battleShip,
  ...droneShip,
  ...introShip,
  ...shipHatch,
  ...bulletCannon,
  ...dino
};

export default compositions;
