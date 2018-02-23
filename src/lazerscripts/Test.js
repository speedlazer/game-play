import { LazerScript } from "src/lib/LazerScript";
import { Morning } from "./stage1/sunrise";
import { DroneFlyer } from "./stage1/army_drone";

class Test extends LazerScript {
  assets() {
    return this.loadAssets("playerShip");
  }

  execute() {
    this.inventoryAdd("weapon", "lasers", { marking: "L" });
    this.inventoryAdd("ship", "points", { marking: "P", icon: "star" });
    Crafty.e("DebugInfo");

    return this.sequence(
      //@setShipType('PlayerControlledCube')

      this.setWeapons(["lasers"]),
      this.setSpeed(0),
      this.setScenery("Ocean"),
      //this.async(this.runScript(Morning, { speed: 1 })),

      this.repeat(
        this.placeSquad(DroneFlyer, {
          amount: 4,
          delay: 500,
          options: {
            speed: 200,
            //debug: true,
            path: [[0.8, 0.6], [0.25, 0.4], [0.16, -0.1]]
          }
        })
      )
    );
  }
}

export default Test;
