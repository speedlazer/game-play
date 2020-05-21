import battleship from "./enemies/battleship.lazer";
import { droneWave } from "./enemies/drones.lazer";
import { playerShip } from "../playerShip.lazer";
import { bigText } from "src/components/BigText";
import { playAudio } from "src/lib/audio";

const part = async ({
  setScrollingSpeed,
  setScenery,
  loadSpriteSheets,
  loadAudio,
  setBackground,
  exec,
  showHUD
}) => {
  const text = bigText("Loading...");
  text.fadeIn(2000);

  await loadSpriteSheets(["mega-texture"]);
  await loadAudio(["effects", "interactive"]);
  playAudio("pattern.excitement");

  await setScrollingSpeed(250, 0, { instant: true });
  await setScenery("City.Coast");
  setBackground("City.Sunrise", 2, 2);
  showHUD();
  text.remove();
  exec(playerShip({ existing: true }));

  await exec(droneWave(5, "drone.pattern2"));

  await exec(battleship);
};

export default part;
