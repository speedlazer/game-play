export default {
  "test.dino": {
    attributes: {
      width: 200,
      height: 153
    },
    sprites: [
      ["dinoBody", { z: 2, ro: [82, 24], key: "body" }],
      ["dinoTentacles", { x: 26, y: 37, z: 2, ro: [16, 16], attachTo: "body" }],
      [
        "dinoArm",
        {
          x: 16,
          y: 82,
          z: 3,
          ro: [34, 16],
          key: "arm",
          attachTo: "body"
        }
      ],
      [
        "dinoNeck",
        {
          x: -32,
          y: 42,
          z: 1,
          ro: [50, 16],
          key: "neck",
          attachTo: "body"
        }
      ],
      [
        "dinoJaw",
        {
          x: -89,
          y: 52,
          z: 1,
          ro: [70, 16],
          key: "jaw",
          attachTo: "neck"
        }
      ],
      [
        "dinoTongue",
        {
          x: -39,
          y: 52,
          z: -1,
          ro: [70, 16],
          attachTo: "neck",
          key: "tongue"
        }
      ],
      [
        "dinoHead",
        {
          x: -94,
          y: 23,
          z: 2,
          ro: [70, 37],
          key: "head",
          attachTo: "neck"
        }
      ],
      ["dinoTail", { x: 124, y: 24, z: 1, ro: [10, 22], attachTo: "body" }],
      [
        "dinoUpperLeg",
        {
          x: 116,
          y: 46,
          z: 3,
          ro: [32, 16],
          key: "upperLeg",
          attachTo: "body"
        }
      ],
      [
        "dinoLowerLeg",
        {
          x: 144,
          y: 86,
          z: 5,
          rotation: -55,
          ro: [16, 16],
          key: "lowerLeg",
          attachTo: "upperLeg"
        }
      ],
      [
        "dinoFeet",
        {
          x: 172,
          y: 114,
          z: 6,
          ro: [26, 8],
          key: "feet",
          attachTo: "lowerLeg"
        }
      ],
      ["dinoToes", { x: 157, y: 118, z: 7, ro: [22, 20], attachTo: "feet" }],
      [
        "dinoBackUpperLeg",
        {
          x: 114,
          y: 36,
          z: -3,
          ro: [22, 20],
          key: "backUpperLeg",
          attachTo: "body"
        }
      ],
      [
        "dinoBackLowerLeg",
        {
          x: 114,
          y: 63,
          z: -2,
          ro: [16, 20],
          key: "backLowerLeg",
          attachTo: "backUpperLeg"
        }
      ],
      [
        "dinoBackFeet",
        {
          x: 98,
          y: 95,
          z: -1,
          ro: [24, 16],
          key: "backFeet",
          attachTo: "backLowerLeg"
        }
      ],
      [
        "dinoBackToes",
        {
          x: 82,
          y: 95,
          z: 0,
          ro: [26, 11],
          key: "backToes",
          attachTo: "backFeet"
        }
      ]
    ],
    frames: {
      roar1: {
        head: { rotation: 40 },
        jaw: { rotation: -42, x: -8 },
        tongue: { x: -20 },
        neck: { rotation: 0 },
        body: { rotation: 20 },
        arm: { rotation: -40 },
        tail: { rotation: -10 },
        topLeg: { rotation: 25 },
        bottomLeg: { rotation: -50 },
        feet: { rotation: -10 },
        toes: { rotation: -10 },
        upperLegBack: { rotation: 10 },
        lowerLegBack: { rotation: -60 },
        feetBack: { rotation: -80 },
        toesBack: { rotation: 0 }
      }
    }
  }
};
