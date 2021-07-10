import { compositions } from "data";
import Composable from "src/components/Composable";

const CHAR_WIDTH = 10;
const CHAR_HEIGHT = 16;

export const say = (speaker, text, { portrait = null } = {}) =>
  new Promise(resolve => {
    Crafty("Dialog").each(function() {
      this.trigger("Abort");
      this.destroy();
    });

    const x = Crafty.viewport.width * 0.15;
    const w = Crafty.viewport.width * 0.7;
    const bottom = Crafty.viewport.height - 20;

    const back = Crafty.e("UILayerWebGL, 2D, Color, Tween, Dialog")
      .attr({ w, h: 15, alpha: 0 })
      .color("#000000")
      .attr({
        x: x - 10,
        y: bottom + 50,
        z: 100
      });
    back.bind("Abort", resolve);

    let avatarOffset = 0;

    const portraitDef = portrait && compositions(portrait);
    let portraitEntity = null;
    if (portraitDef) {
      portraitEntity = Crafty.e(
        ["UILayerWebGL", "2D", Composable, "Dialog"].join(", ")
      )
        .attr({ x: 0, y: 0, w: 40, h: 40 })
        .compose(portraitDef, { autoStartAnimation: false });
      avatarOffset = portraitEntity.w + 10;

      portraitEntity.attr({
        x: back.x + 5,
        y: back.y + back.h - portraitEntity.h,
        z: back.z + 1
      });
    }

    const words = text.split(/\s+/g);
    const lineWidth = w - 10 - avatarOffset;

    const charLimit = Math.floor(lineWidth / CHAR_WIDTH);

    const lines = words
      .reduce(
        ([current, ...lines], word) => {
          const fitsOnLine = current.endsWith(".")
            ? false
            : word.length + 1 + current.length < charLimit;

          return fitsOnLine
            ? [`${current} ${word}`.trim(), ...lines]
            : [word, current, ...lines];
        },
        [""]
      )
      .reverse();

    const h = Math.max(4, lines.length + 1 + (speaker ? 2 : 0));

    back.attr({ h: h * CHAR_HEIGHT });

    if (portraitEntity) {
      portraitEntity.attr({
        y: back.y + back.h - portraitEntity.h
      });
      back.attach(portraitEntity);
    }

    back.tween(
      {
        y: bottom - h * CHAR_HEIGHT,
        alpha: 0.8
      },
      200
    );

    let offset = 15;
    if (speaker) {
      const speakerText = Crafty.e("UILayerDOM, 2D, Text")
        .attr({
          w: w - 20,
          x: back.x + 10 + avatarOffset,
          y: back.y + 10,
          z: 101,
          alpha: 1
        })
        .text(speaker)
        .textColor("#707070")
        .textFont({
          size: `${CHAR_WIDTH}px`,
          weight: "bold",
          family: "Press Start 2P"
        });
      back.attach(speakerText);
      offset = 30;
    }

    lines.forEach((line, i) => {
      back.attach(
        Crafty.e("UILayerDOM, 2D, Text")
          .attr({
            w: w - 20,
            x: back.x + 10 + avatarOffset,
            y: back.y + offset + i * 20,
            z: 101
          })
          .text(line)
          .textColor("#909090")
          .textFont({
            size: `${CHAR_WIDTH}px`,
            weight: "bold",
            family: "Press Start 2P"
          })
      );
    });

    const wordCount = lines.join(" ").split(" ").length;
    const repeats = lines.length + Math.ceil(wordCount / 4);
    let i = 0;

    Crafty.e("Dialog, Delay").delay(
      function() {
        i++;
        if (portraitEntity) {
          if (i === repeats) {
            portraitEntity.stopAnimation();
            portraitEntity.displayFrame("idle");
          } else {
            portraitEntity.playAnimation("talking");
          }
        }
      },
      1000,
      repeats,
      function() {
        back.one("TweenEnd", () => {
          Crafty("Dialog").each(function() {
            this.destroy();
          });
          resolve();
        });
        back.tween(
          {
            y: bottom + 50,
            alpha: 0
          },
          200
        );
      }
    );
  });
