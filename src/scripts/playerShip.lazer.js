import ShipControls from "src/components/player/ShipControls";
import ShipCollision from "src/components/player/ShipCollision";
import Buffs from "src/components/Buffs";
import ControlScheme from "src/components/player/ControlScheme";

export const playerShip = ({
  existing = false,
  hasLaser = false,
  turned = false
} = {}) => async ({
  spawn,
  exec,
  waitForEvent,
  allowDamage,
  setHealthbar,
  setEnergybar,
  showBuff,
  showState,
  setGameSpeed,
  addScreenTrauma,
  playerHit,
  wait,
  loseLife
}) => {
  const maxHealth = 50;
  const maxEnergy = 100;

  const player = Crafty("Player").get(0);
  const existingShip = existing && Crafty("PlayerShip").get(0);
  const ship =
    existingShip ||
    spawn("PlayerShip", {
      location: {
        rx: turned ? 0.8 : 0.2,
        ry: 0.5
      },
      defaultVelocity: 400
    });

  if (!player.invincible) {
    if (ship === existingShip) {
      await allowDamage(ship, {
        health: ship.health || maxHealth
      });
      ship.energy = ship.energy || 0;
    } else {
      ship.health = ship.health || maxHealth;
      ship.energy = 0;
      wait(2000).then(async () => {
        await allowDamage(ship, {});
      });
    }
  }
  if (hasLaser) ship.hasLaser = true;
  if (ship.health < maxHealth * 0.5) {
    ship.displayFrame("damaged");
  }

  setHealthbar(ship.health / maxHealth);
  setEnergybar(ship.energy / maxEnergy);

  if (turned) {
    await showState(ship, "turned");
  }
  showState(ship, "flying");

  // TODO: Refactor adding these components to the entity definition
  ship.addComponent(ShipControls, ShipCollision, Buffs);

  if (player.has(ControlScheme)) {
    player.assignControls(ship);
  }

  ship.defineBuff("overdrive", {
    cost: { energy: 35 },
    duration: 3, // seconds
    cooldown: 5 // seconds
  });

  showBuff(0, ship, "overdrive", ship.controlName("power1", true));

  ship.uniqueBind("ButtonPressed", name => {
    if (name === "fire") {
      ship.showState("noLaserShooting");
      ship.showState("shooting");
    }
    if (name === "heavy") {
      if (!ship.hasLaser) return;
      ship.showState("noShooting");
      ship.showState("laserShooting");
    }
    if (name === "power1") {
      ship.activateBuff("overdrive");
      ship.trigger("EnergyUpdate");
      setEnergybar(ship.energy / maxEnergy);
    }
  });

  ship.uniqueBind("ButtonReleased", name => {
    if (name === "fire") {
      ship.showState("noShooting");
    }
    if (name === "heavy") {
      ship.showState("noLaserShooting");
    }
  });
  ship.uniqueBind("BuffActivated", name => {
    if (name === "overdrive") {
      ship.mainWeapon.difficulty = 0.5;
      ship.laserWeapon.difficulty = 0.5;
    }
  });
  ship.uniqueBind("BuffEnded", name => {
    if (name === "overdrive") {
      ship.mainWeapon.difficulty = 0.0;
      ship.laserWeapon.difficulty = 0.0;
    }
  });

  ship.uniqueBind("DealtDamage", ({ damage }) => {
    if (damage[0].name === "Bullet" && !ship.buffActive("overdrive")) {
      ship.energy = Math.min(maxEnergy, ship.energy + 1);
      ship.trigger("EnergyUpdate");
      setEnergybar(ship.energy / maxEnergy);
    }
  });
  ship.uniqueBind("HealthChange", newHealth => {
    if (newHealth < ship.health) {
      playerHit(newHealth - ship.health);
    }
    try {
      setHealthbar(newHealth / maxHealth);
    } catch (e) {
      // player could be game over
    }

    if (newHealth < maxHealth * 0.5) {
      if (ship.appliedEntityState !== "dead") {
        ship.displayFrame("damaged");
      }
    }
  });

  ship.uniqueBind("turn", () => {
    if (ship.health < maxHealth * 0.5) {
      showState(ship, "turningDamaged");
    } else {
      showState(ship, "turning");
    }
  });

  waitForEvent(ship, "Dead", async () => {
    ship.attr({ disableControls: true, vx: 0, vy: 0 });
    addScreenTrauma(0.8);
    setGameSpeed(0.4);
    const state = showState(ship, "dead");
    await wait(150);
    setGameSpeed(0.7);
    await wait(600);
    addScreenTrauma(0.5);
    await state;
    const isTurned = !!ship.xFlipped;
    const hasLaser = ship.hasLaser;
    ship.destroy();
    await loseLife();
    setGameSpeed(1.0);
    await wait(1000);
    exec(playerShip({ turned: isTurned, hasLaser }));
  });
};
