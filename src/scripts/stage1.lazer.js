import battleship from "./stage1/battleship.lazer";

const stage1 = async ({
  //setScrollingSpeed,
  setScenery,
  loadSpriteSheets,
  spawnShip,
  //setWeapons,
  exec,
  wait
}) => {
  await loadSpriteSheets(["city-enemies", "city-scenery"]);

  //await setScrollingSpeed({ x: 300 });
  await setScenery("City.Ocean");
  await spawnShip();
  //await setWeapons(["lasers"]);
  await wait(30000);
  await exec(battleship);
};

export default stage1;