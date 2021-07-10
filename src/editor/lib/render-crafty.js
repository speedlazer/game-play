import spritesheets from "src/images";
import audiosheets from "src/audio";
import { animations } from "data";
import { setupControls } from "src/setup-game";
import { bigText } from "src/components/BigText";
import { fadeOut } from "src/components/generic/ColorFade";
import Composable from "src/components/Composable";
import Weapon from "src/components/Weapon";
import WayPointMotion from "src/components/WayPointMotion";
import ParticleEmitter from "src/components/ParticleEmitter";
import "src/components/LightGlare";
import "src/components/GravitySupport";
import "src/components/SubmergeSupport";
import "src/components/Overlap";
import "src/components/DebugComposable";
import "src/components/SpriteShader";
import "src/components/Rotating";
import "src/components/ViewportLocked";
import "src/lib/GameLoop";
import { playAnimation } from "src/components/Animation";
import {
  setBackground,
  setBackgroundCheckpoint
} from "src/components/Background";
import {
  createEntity,
  EntityDefinition
} from "src/components/EntityDefinition";
import { setScenery, setScrollVelocity } from "src/components/Scenery";
import { getBezierPath } from "src/lib/BezierPath";
import audio from "src/lib/audio";
import gameStructure from "src/scripts";
import { createScriptExecutionSpace } from "src/lib/dsl";
import Player from "src/components/player/Player";

Crafty.paths({
  audio: "",
  images: ""
});

window.Crafty = Crafty;

Crafty.c("TestColor", {
  required: "Color, WebGL",
  init() {
    this.color("#FF0000");
  }
});

const SCREEN_WIDTH = 1024;
const SCREEN_HEIGHT = 576;

const round3 = x => Math.round(x * 1000) / 1000;

export const mount = domElem => {
  if (!domElem) return;
  Crafty.init(SCREEN_WIDTH, SCREEN_HEIGHT, domElem);
  Crafty.background("#000000");
  Crafty.timer.steptype("variable");
  Crafty.timer.FPS(60);

  let waitTime = 0;
  let frameTime = 0;
  let renderTime = 0;
  let extra = "";

  Crafty.bind("MeasureWaitTime", wt => (waitTime = wt));
  Crafty.bind("MeasureFrameTime", ft => (frameTime = ft));
  Crafty.bind("MeasureRenderTime", rt => (renderTime = rt));
  Crafty.bind("MeasureExtra", ex => (extra = ex));

  Crafty.bind("EnterScene", () => {
    Crafty.e("2D, DOM, Text")
      .attr({ x: 20, y: 20, w: 700 })
      .text(() => {
        let counter = 0;
        Crafty("Renderable, WebGL").each(function() {
          if (!this.__frozen) counter++;
        });

        return `Wait: ${waitTime} - Frame: ${frameTime} - Render: ${renderTime} - Entities: ${counter} / 1024 ${extra}`;
      })
      .dynamicTextGeneration(true)
      .textColor("white");
  });
};

Crafty.defineScene(
  "Stop",
  ({ text, color = "#FFFFFF" } = {}) => {
    if (text) {
      const start = bigText(text, { color });
      start.show();
    }
  },
  () => {}
);

export const unmount = () => {
  Crafty.trigger("SceneDestroy");
  Crafty("2D").destroy();
  Crafty.unbind("MeasureWaitTime");
  Crafty.unbind("MeasureFrameTime");
  Crafty.unbind("MeasureRenderTime");

  Crafty.unbind("EnterScene");
  Crafty.enterScene("Stop");
  Crafty.stop();
};

const makePosition = position =>
  Object.entries(position).reduce((acc, [key, value]) => {
    if (key === "rx") {
      return { ...acc, x: Crafty.viewport.width * value };
    }
    if (key === "ry") {
      return { ...acc, y: Crafty.viewport.height * value };
    }
    return { ...acc, [key]: value };
  }, {});

const updateActualSize = (actualSize, entity) => {
  actualSize.minX = Math.min(actualSize.minX, entity.x);
  actualSize.maxX = Math.max(actualSize.maxX, entity.x + entity.w);
  actualSize.minY = Math.min(actualSize.minY, entity.y);
  actualSize.maxY = Math.max(actualSize.maxY, entity.y + entity.h);
};

const createComposable = composition =>
  Crafty.e(["2D", "WebGL", Composable, "DebugComposable"].join(", "))
    .attr({ x: 0, y: 0, w: 40, h: 40 })
    .compose(composition, { autoStartAnimation: false });

const addColor = (entity, color) =>
  entity.attach(
    Crafty.e("2D, WebGL, Color, SizeBox")
      .attr({
        x: entity.x,
        y: entity.y,
        w: entity.w,
        h: entity.h,
        z: -5000,
        rotation: entity.rotation
      })
      .color(color)
  );

const determineEntitySize = (sizeModel, entity) => {
  updateActualSize(sizeModel, entity);
  if (entity.has(Composable)) {
    Object.values(entity.currentAttachHooks).forEach(hook => {
      updateActualSize(sizeModel, hook);
      if (hook.currentAttachment) {
        determineEntitySize(sizeModel, hook.currentAttachment);
      }
    });
    entity.forEachPart(entity => updateActualSize(sizeModel, entity));
  }
};

const scaleScreenForEntity = entity => {
  const actualSize = {
    minX: entity.x,
    maxX: entity.x + entity.w,
    minY: entity.y,
    maxY: entity.y + entity.h
  };
  determineEntitySize(actualSize, entity);

  const width = actualSize.maxX - actualSize.minX;
  const height = actualSize.maxY - actualSize.minY;
  const offset = {
    x: entity.x - actualSize.minX,
    y: entity.y - actualSize.minY
  };
  const scale = Math.min(SCREEN_WIDTH / width, SCREEN_HEIGHT / height, 1);
  const maxWidth = Math.max(width, SCREEN_WIDTH / scale);
  const maxHeight = Math.max(height, SCREEN_HEIGHT / scale);
  if (!entity.preScalePos) {
    entity.preScalePos = { x: entity.x, y: entity.y };
  }

  entity.attr({
    x: (maxWidth - width) / 2 + offset.x,
    y: (maxHeight - height) / 2 + offset.y
  });

  Crafty.viewport.scale(scale);
};

const resetScreenScaling = entity => {
  if (entity.preScalePos) {
    entity.attr({ x: entity.preScalePos.x, y: entity.preScalePos.y });
  }
  Crafty.viewport.scale(1.0);
};

const applyDisplayOptions = (entity, options) => {
  Object.values(entity.currentAttachHooks).forEach(hook => {
    options.showAttachPoints
      ? hook.addComponent("SolidHitBox").attr({ w: 10, h: 10 })
      : hook
          .removeComponent("SolidHitBox")
          .removeComponent("DebugPolygon")
          .removeComponent("DebugCanvas")
          .attr({ w: 1, h: 1 });
  });

  if (options.showSize) {
    addColor(entity, "#FF0000");
  } else {
    Crafty("SizeBox").destroy();
  }

  entity.displayHitBoxes(options.showHitBox);
  entity.displayRotationPoints(options.showRotationPoints);
};

Crafty.defineScene("ComposablePreview", ({ composition, options }) => {
  Crafty.trigger("EnterScene");
  const composable = createComposable(composition);
  applyDisplayOptions(composable, options);
  if (options.frame) {
    composable.displayFrame(options.frame, 0);
  }
  if (options.scaleViewport) {
    scaleScreenForEntity(composable);
  } else {
    resetScreenScaling(composable);
  }
});

let activeHabitat = null;
const setHabitat = habitat => {
  if (!habitat || !habitat.scenery || habitat.scenery !== activeHabitat) {
    Crafty("Scenery").destroy();
  }
  habitat &&
    habitat.scenery &&
    habitat.scenery !== activeHabitat &&
    setScenery(habitat.scenery);

  if (habitat && habitat.background) {
    setBackground(animations(habitat.background[0]));
    setBackgroundCheckpoint(habitat.background[1]);
  } else {
    Crafty("Background").destroy();
  }

  habitat &&
    habitat.scrollSpeed &&
    (habitat.scenery
      ? setScrollVelocity(habitat.scrollSpeed)
      : setScrollVelocity({ vx: 0, vy: 0 }));
};

Crafty.defineScene("EntityPreview", ({ entityName, habitat }) => {
  Crafty.trigger("EnterScene");
  const entity = createEntity(entityName);
  setHabitat(habitat);

  const dummyPlayer = Crafty.e("2D, PlayerShip, Collision").attr({
    x: 0,
    y: 0,
    w: 8,
    h: 8
  });
  Crafty.s("Mouse").bind("MouseMove", function(e) {
    const rect = Crafty.stage.elem.getBoundingClientRect();
    const x = e.realX - rect.x;
    const y = e.realY - rect.y;
    dummyPlayer.attr({ x, y });
    Crafty.trigger(
      "MeasureExtra",
      `- ${round3(x / Crafty.viewport.width)} / ${round3(
        y / Crafty.viewport.height
      )}`
    );
  });

  if (habitat && habitat.position) {
    const position = makePosition(habitat.position);
    entity.attr(position);
    Crafty.viewport.scale(1.0);
  } else {
    scaleScreenForEntity(entity);
  }
});

Crafty.defineScene(
  "SceneryPreview",
  async ({ scenery, background, checkpoint }) => {
    Crafty.trigger("EnterScene");
    if (background) {
      setBackground(background);
      setBackgroundCheckpoint(checkpoint);
    }
    setScenery(scenery);
  },
  () => {
    Crafty("Scenery").destroy();
  }
);

const inScene = sceneName => Crafty._current === sceneName;

const loadSpriteSheets = async () =>
  new Promise(resolve => {
    // load sprites
    const loader = {
      sprites: {}
    };
    spritesheets.forEach(sheet => {
      loader.sprites[sheet.image] = sheet.map;
    });

    Crafty.load(loader, resolve);
  });

const loadAllAudio = () => {
  const loadingPromises = audiosheets.map(map => audio.loadAudio(map));
  return Promise.all(loadingPromises);
};

const loadAssets = () => Promise.all([loadAllAudio(), loadSpriteSheets()]);

let scaleViewport = true;
export const showComposition = async (composition, options = {}) => {
  if (inScene("ComposablePreview") && options.frame) {
    const currentComposable = Crafty(Composable).get(0);
    if (currentComposable.appliedDefinition === composition) {
      currentComposable.animationPlaying() && currentComposable.stopAnimation();
      currentComposable.displayFrame(options.frame, options.tweenDuration);
      applyDisplayOptions(currentComposable, options);
      if (options.scaleViewport !== scaleViewport) {
        scaleViewport = options.scaleViewport;
        if (options.scaleViewport) {
          scaleScreenForEntity(currentComposable);
        } else {
          resetScreenScaling(currentComposable);
        }
      }
      return;
    }
  }

  if (inScene("ComposablePreview") && options.animation) {
    const currentComposable = Crafty(Composable).get(0);
    if (currentComposable.appliedDefinition === composition) {
      currentComposable.playAnimation(options.animation);
      applyDisplayOptions(currentComposable, options);
      if (options.scaleViewport !== scaleViewport) {
        scaleViewport = options.scaleViewport;
        if (options.scaleViewport) {
          scaleScreenForEntity(currentComposable);
        } else {
          resetScreenScaling(currentComposable);
        }
      }
      return;
    }
  }

  await loadAssets();
  Crafty.enterScene("ComposablePreview", { composition, options });
};

let currentEntity = null;
let currentHabitat = null;
export const showEntity = async (entityName, options = {}) => {
  const strHabitat = JSON.stringify(options.habitat);
  if (
    inScene("EntityPreview") &&
    options.state &&
    currentEntity === entityName
  ) {
    const existingEntity = Crafty("EntityDefinition").get(0);
    existingEntity.showState(options.state, 1000);

    if (strHabitat !== currentHabitat) {
      currentHabitat = strHabitat;
      if (options.habitat && options.habitat.position) {
        const position = makePosition(options.habitat.position);
        existingEntity.attr(position);
        Crafty.viewport.scale(1.0);
      } else {
        scaleScreenForEntity(existingEntity);
      }
      setHabitat(options.habitat);
    }
    return;
  }
  currentEntity = entityName;
  currentHabitat = strHabitat;

  await loadAssets();
  Crafty.enterScene("EntityPreview", { entityName, habitat: options.habitat });
};

export const showScenery = async (scenery, backgroundSettings = {}) => {
  await loadAssets();
  Crafty.enterScene("SceneryPreview", { scenery, ...backgroundSettings });
};

const showBezier = pattern => {
  const vpw = Crafty.viewport.width;
  const vph = Crafty.viewport.height;
  const normalizedPath = pattern.map(({ x, y }) => ({
    x: x * vpw,
    y: y * vph
  }));
  const bezierPath = getBezierPath(normalizedPath);
  const stepSize = 1 / (bezierPath.length / 10);

  pattern.forEach(({ events = [] }, index) => {
    const part = bezierPath.curves[index];
    events.forEach(([perc]) => {
      const p = part.curve.get(perc);
      Crafty.e("2D, WebGL, Color, BezierPath")
        .attr({ x: p.x, y: p.y, w: 4, h: 4 })
        .color("#FFFF00");
    });
  });

  for (let t = 0.0; t < 1.0; t += stepSize) {
    const p = bezierPath.get(t);
    Crafty.e("2D, WebGL, Color, BezierPath")
      .attr({ x: p.x, y: p.y, w: 3, h: 3 })
      .color("#00FFFF");
  }
};

Crafty.defineScene(
  "FlyPatternPreview",
  ({ pattern, showPath, showPoints, habitat, showHabitat }) => {
    Crafty.trigger("EnterScene");
    const vpw = Crafty.viewport.width;
    const vph = Crafty.viewport.height;
    showPoints &&
      pattern.forEach(({ x, y }) => {
        Crafty.e("2D, WebGL, Color, Waypoint")
          .attr({ x: x * vpw, y: y * vph, w: 6, h: 6 })
          .color("#FF0000");
      });

    showPath && showBezier(pattern);

    const entity =
      habitat && habitat.entity && showHabitat
        ? createEntity(habitat.entity)
        : Crafty.e("2D, WebGL, Color")
            .attr({ w: 20, h: 20 })
            .color("#0000FF");
    if (entity.has(EntityDefinition) && habitat.entityState) {
      entity.showState(habitat.entityState);
    }

    entity
      .addComponent("WayPointMotion")
      .attr({ x: pattern[0].x * vpw, y: pattern[0].y * vph })
      .flyPattern(pattern, { velocity: 75, easing: "easeInOutQuad" });

    showHabitat && setHabitat(habitat);
  }
);

let currentPattern = null;
let currentlyShowingHabitat = true;
export const showFlyPattern = async (
  pattern,
  { showPoints, showPath, habitat, showHabitat }
) => {
  await loadAssets();
  if (
    pattern === currentPattern &&
    inScene("FlyPatternPreview") &&
    showHabitat === currentlyShowingHabitat
  ) {
    Crafty("Waypoint").destroy();
    Crafty("BezierPath").destroy();

    const vpw = Crafty.viewport.width;
    const vph = Crafty.viewport.height;

    showPoints &&
      pattern.forEach(({ x, y }) => {
        Crafty.e("2D, WebGL, Color, Waypoint")
          .attr({ x: x * vpw, y: y * vph, w: 6, h: 6 })
          .color("#FF0000");
      });

    showPath && showBezier(pattern);
    return;
  }
  currentPattern = pattern;
  currentlyShowingHabitat = showHabitat;

  Crafty.enterScene("FlyPatternPreview", {
    pattern,
    showPoints,
    showPath,
    showHabitat,
    habitat
  });
};

Crafty.defineScene("AnimationPreview", ({ animation }) => {
  Crafty.trigger("EnterScene");
  setHabitat(animation.habitat);
});

let currentAnimation = null;
let currentAnimationState = null;
let animationStartCheckpoint = null;

export const showAnimation = async (
  animation,
  animationLimit,
  activeCheckpoint,
  { onCheckpointChange } = {}
) => {
  await loadAssets();
  if (
    inScene("AnimationPreview") &&
    animation === currentAnimation &&
    activeCheckpoint === animationStartCheckpoint
  ) {
    // take direct control over running animation
    currentAnimationState.updateCheckpointLimit(animationLimit);
    return;
  }
  currentAnimation = animation;
  animationStartCheckpoint = activeCheckpoint;
  Crafty.enterScene("AnimationPreview", {
    animation
  });
  const isBackground = animation.habitat && animation.habitat.isBackground;
  currentAnimationState = playAnimation(animation, {
    max: animationLimit,
    start: activeCheckpoint,
    z: isBackground ? -1000 : 0
  });

  onCheckpointChange &&
    currentAnimationState.onCheckpointChange(onCheckpointChange);
};

Crafty.defineScene(
  "BulletPatternPreview",
  ({ pattern, difficulty, collisionType, swapped }) => {
    Crafty.trigger("EnterScene");
    const red = Crafty.e(`2D, WebGL, Color, Red, ${WayPointMotion}, Collision`)
      .attr({
        x: 800,
        y: 240,
        w: 40,
        h: 40,
        difficulty
      })
      .color("#FF0000");

    const blue = Crafty.e(
      `2D, WebGL, Color, Blue, ${WayPointMotion}, Collision`
    )
      .attr({
        x: 200,
        y: 240,
        w: 40,
        h: 40,
        difficulty
      })
      .color("#0000FF");

    if (collisionType) {
      (swapped ? red : blue).addComponent(collisionType);
    }

    swapped
      ? blue
          .addComponent(Weapon)
          .weapon({ pattern, target: "Red", x: 40, y: 20, angle: 180 })
      : red
          .addComponent(Weapon)
          .weapon({ pattern, target: "Blue", x: 0, y: 20, angle: 0 });

    Crafty(Weapon).activate();
  }
);

export const showBulletPattern = async (
  pattern,
  { difficulty, collisionType, swapped, firing }
) => {
  if (inScene("BulletPatternPreview") && Crafty(Weapon).active !== firing) {
    firing ? Crafty(Weapon).activate() : Crafty(Weapon).deactivate();
    return;
  }
  await loadAssets();
  Crafty.enterScene("BulletPatternPreview", {
    pattern,
    difficulty,
    collisionType,
    swapped,
    firing
  });
};

Crafty.defineScene("ParticleEmitterPreview", ({ emitter }) => {
  Crafty.trigger("EnterScene");
  //Crafty.background("#FFFFFF");
  //Crafty.e("2D, We00bGL, Color")
  //.attr({
  //x: (Crafty.viewport.width - emitter.emitter.w) / 2,
  //y: (Crafty.viewport.height - emitter.emitter.h) / 2,
  //w: emitter.emitter.w,
  //h: emitter.emitter.h,
  //z: 50
  //})
  //.color("#FF0000");
  const emitterSource = Crafty.e(`2D, Emitter, ${WayPointMotion}`).attr({
    x: (Crafty.viewport.width - emitter.emitter.w) / 2,
    y: (Crafty.viewport.height - emitter.emitter.h) / 2,
    z: 20
  });

  Crafty.e(`2D, ${ParticleEmitter}`).particles(emitter, emitterSource);
});

let currentEmitter = null;
export const showParticleEmitter = async (emitter, { active, warmed }) => {
  await loadAssets();
  if (inScene("ParticleEmitterPreview") && emitter === currentEmitter) {
    if (!active) {
      Crafty(ParticleEmitter).stopEmission();
    } else {
      Crafty(ParticleEmitter).startEmission({ warmed });
    }
    return;
  }
  currentEmitter = emitter;

  Crafty.enterScene("ParticleEmitterPreview", {
    emitter,
    active
  });
};

let activeStage = null;
const appliedGameOptions = {};

Crafty.defineScene(
  "GamePreview",
  async function({ stage, invincible, autoContinue, extraLifes }) {
    const thisStage = Math.random();
    activeStage = thisStage;
    Crafty.createLayer("UILayerDOM", "DOM", {
      scaleResponse: 0,
      yResponse: 0,
      xResponse: 0,
      z: 40
    });
    Crafty.createLayer("UILayerWebGL", "WebGL", {
      scaleResponse: 0,
      yResponse: 0,
      xResponse: 0,
      z: 35
    });
    const start = bigText("Use controller to start", { sup: stage });
    start.show();
    const player = setupControls();
    player.attr({ invincible });

    Crafty.viewport.x = 0;
    Crafty.viewport.y = 0;
    this.state = { lives: extraLifes, score: 0 };
    const runner = createScriptExecutionSpace(this.state);

    Crafty.one("SceneDestroy", () => {
      this.state.gameEnded = true;
    });
    const p = new Promise(resolve =>
      Crafty(Player).each(function() {
        this.one("Activated", resolve);
      })
    );
    await p;
    start.remove();
    if (activeStage !== thisStage) return;

    let gameOver = false;
    try {
      Crafty.trigger("EnterScene");
      appliedGameOptions &&
        appliedGameOptions.start &&
        appliedGameOptions.start();

      let started = false;
      for (const item of gameStructure) {
        if (!started && stage !== item.name) {
          continue;
        }

        started = true;
        await runner(item.script);
        if (!autoContinue) break;
      }
      gameOver = this.state.gameEnded;

      const fade = fadeOut();
      const start = bigText(gameOver ? "Game Over" : "Congratulations!", {
        color: gameOver ? "#FF0000" : "#FFFFFF"
      });
      await start.fadeIn(4000);
      await fade.start(4000);
    } catch (e) {
      if (e.message === "Game Over") {
        gameOver = true;
        const fade = fadeOut();
        const start = bigText("Game Over", { color: "#FF0000" });
        await start.fadeIn(4000);
        await fade.start(4000);
      } else {
        console.error(e);
      }
    }
    appliedGameOptions && appliedGameOptions.stop && appliedGameOptions.stop();

    if (activeStage !== thisStage) return;
    Crafty.enterScene("Stop", {
      text: gameOver ? "Game Over" : "Congratulations!",
      color: gameOver ? "#FF0000" : "#FFFFFF"
    });
  },
  function() {
    this.state.gameEnded = true;
    audio.stopMusic();
    Crafty(Player).each(function() {
      this.removeComponent("ShipSpawnable");
    });
  }
);

let activeGamePart = null;

export const showGame = (stage, options) => {
  appliedGameOptions.start = options.onStart;
  appliedGameOptions.stop = options.onStop;

  if (inScene("GamePreview") && stage === activeGamePart) {
    if (options.invincible !== appliedGameOptions.invincible) {
      const player = Crafty(Player).get(0);
      if (player) {
        player.attr({ invincible: options.invincible });
      }
      appliedGameOptions.invincible = options.invincible;
    }
  } else {
    activeGamePart = stage;
    Crafty.enterScene("GamePreview", {
      stage,
      ...options
    });
  }
};
