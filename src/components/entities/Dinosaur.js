Crafty.c("Dinosaur", {
  required: "2D, WebGL, Choreography, Delta2D, TweenPromise",

  init() {
    this.attr({
      w: 200,
      h: 153
    });
  },

  dinosaur(props) {
    this.attr(props);

    this.body = Crafty.e("2D, WebGL, dinoBody, TweenPromise").attr({
      x: this.x,
      y: this.y,
      z: this.z + 2
    }).origin(132, 64)
    this.attach(this.body);

    this.arm = Crafty.e("2D, WebGL, dinoArm, TweenPromise").attr({
      x: this.x + 16,
      y: this.y + 82,
      z: this.z + 3
    }).origin(34, 16)
    this.body.attach(this.arm);

    this.neck = Crafty.e("2D, WebGL, dinoNeck, TweenPromise").attr({
      x: this.x - 32,
      y: this.y + 42,
      z: this.z + 1
    }).origin(50, 16)
    this.body.attach(this.neck);

    this.jaw = Crafty.e("2D, WebGL, dinoJaw, TweenPromise").attr({
      x: this.x - 89,
      y: this.y + 52,
      z: this.z + 1
    }).origin(70, 16)
    this.neck.attach(this.jaw);

    this.head = Crafty.e("2D, WebGL, dinoHead, TweenPromise").attr({
      x: this.x - 94,
      y: this.y + 26,
      z: this.z + 2
    }).origin(70, 40)
    this.neck.attach(this.head);

    this.tail = Crafty.e("2D, WebGL, dinoTail, TweenPromise").attr({
      x: this.x + 124,
      y: this.y + 24,
      z: this.z + 1,
    }).origin(10, 22)
    this.body.attach(this.tail);

    this.topLeg = Crafty.e("2D, WebGL, dinoUpperLeg, TweenPromise").attr({
      x: this.x + 116,
      y: this.y + 46,
      z: this.z + 3
    }).origin(32, 16)
    this.body.attach(this.topLeg);

    this.bottomLeg = Crafty.e("2D, WebGL, dinoLowerLeg, TweenPromise").attr({
      x: this.topLeg.x + 28,
      y: this.topLeg.y + 40,
      z: this.topLeg.z + 2,
      rotation: -55
    }).origin(16, 16)
    this.topLeg.attach(this.bottomLeg);

    this.feet = Crafty.e("2D, WebGL, dinoFeet, TweenPromise").attr({
      x: this.bottomLeg.x + 28,
      y: this.bottomLeg.y + 24,
      z: this.bottomLeg.z + 1,
      rotation: 0
    }).origin(26, 8)
    this.bottomLeg.attach(this.feet);

    this.toes = Crafty.e("2D, WebGL, dinoToes, TweenPromise").attr({
      x: this.feet.x - 22,
      y: this.feet.y + 2,
      z: this.feet.z + 1,
      rotation: 0
    }).origin(22, 20)
    this.feet.attach(this.toes);

    this.upperLegBack = Crafty.e("2D, WebGL, dinoBackUpperLeg, TweenPromise").attr({
      x: this.body.x + 92,
      y: this.body.y + 60,
      z: this.body.z - 5,
      rotation: 0
    }).origin(22, 20)
    this.body.attach(this.upperLegBack);

    this.lowerLegBack = Crafty.e("2D, WebGL, dinoBackLowerLeg, TweenPromise").attr({
      x: this.upperLegBack.x - 4,
      y: this.upperLegBack.y + 32,
      z: this.upperLegBack.z + 1,
      rotation: 0
    }).origin(16, 20)
    this.upperLegBack.attach(this.lowerLegBack);

    this.feetBack = Crafty.e("2D, WebGL, dinoBackFeet, TweenPromise").attr({
      x: this.lowerLegBack.x - 16,
      y: this.lowerLegBack.y + 32,
      z: this.lowerLegBack.z + 1,
      rotation: 0
    }).origin(24, 16)
    this.lowerLegBack.attach(this.feetBack);

    this.toesBack = Crafty.e("2D, WebGL, dinoBackToes, TweenPromise").attr({
      x: this.feetBack.x - 16,
      y: this.feetBack.y,
      z: this.feetBack.z + 1,
      rotation: 0
    }).origin(26, 11)
    this.feetBack.attach(this.toesBack);

    return this
  },

  execute(pose) {
    switch(pose) {
      //case "stand": return this.poseStand()
      case "run": return this.run()
    }
  },

  async setPose(rotations, overall, duration) {
    const elements = Object.keys(rotations).map(element =>
      this[element].tweenPromise({ rotation: rotations[element] }, duration)
    )
    await Promise.all([
      ...elements,
      this.tweenPromise(overall, duration)
    ])
  },

  async run() {
    const FRAMESPEED = 200;
    // 1
    await this.setPose({
      head: 0,
      jaw: 0,
      body: 20,
      neck: 0,
      tail: 20,
      arm: 20,
      topLeg: 90,
      bottomLeg: 20,
      feet: 20,
      toes: 0,
      upperLegBack: -90,
      lowerLegBack: -90,
      feetBack: -120
    }, { dy: -20, dx: -10 }, FRAMESPEED)

    // 2
    await this.setPose({
      head: 0,
      jaw: -5,
      body: 20,
      neck: 5,
      tail: 10,
      arm: 0,
      topLeg: 70,
      bottomLeg: 10,
      feet: 0,
      toes: -10,
      upperLegBack: -50,
      lowerLegBack: -110,
      feetBack: -140
    }, { dy: 0, dx: 0 }, FRAMESPEED)

    // 3
    await this.setPose({
      head: 0,
      jaw: -10,
      body: 20,
      neck: 15,
      tail: 0,
      arm: -30,
      topLeg: 40,
      bottomLeg: -10,
      feet: -10,
      toes: -20,
      upperLegBack: -20,
      lowerLegBack: -100,
      feetBack: -120
    }, { dy: -15, dx: -25 }, FRAMESPEED)

    // 4
    await this.setPose({
      head: 0,
      jaw: -5,
      body: 20,
      neck: 5,
      tail: 10,
      arm: -50,
      topLeg: 0,
      bottomLeg: -60,
      feet: -50,
      toes: -20,
      upperLegBack: 10,
      lowerLegBack: -20,
      feetBack: 0
    }, { dy: -20, dx: -10 }, FRAMESPEED)

    // 5 (flip back / front leg)
    await this.setPose({
      head: 0,
      jaw: -5,
      body: 20,
      neck: 5,
      tail: 20,
      arm: -30,
      topLeg: -20,
      bottomLeg: -80,
      feet: -80,
      toes: -100,
      upperLegBack: 0,
      lowerLegBack: -20,
      feetBack: -50,
      toesBack: 10
    }, { dy: -10, dx: 0 }, FRAMESPEED)

    // 6
    await this.setPose({
      head: 0,
      jaw: -10,
      body: 20,
      neck: 15,
      tail: 10,
      arm: 0,
      topLeg: 10,
      bottomLeg: -90,
      feet: -100,
      toes: -140,
      upperLegBack: -10,
      lowerLegBack: -20,
      feetBack: -70,
      toesBack: 20
    }, { dy: 0, dx: 0 }, FRAMESPEED)

    // 7
    await this.setPose({
      head: 0,
      jaw: -5,
      body: 20,
      neck: 5,
      tail: 0,
      arm: -10,
      topLeg: 50,
      bottomLeg: -80,
      feet: -80,
      toes: -140,
      upperLegBack: -30,
      lowerLegBack: -40,
      feetBack: -90,
      toesBack: -10
    }, { dy: -3, dx: -25 }, FRAMESPEED)


  },

  async poseStand() {
    await this.setPose({
      body: 60,
      arm: -25,
      neck: 40,
      jaw: 1,
      head: 1,
      topLeg: 50,
      tail: 20,
      bottomLeg: -60,
      lowerLegBack: 10,
      feet: -10,
      toes: 10
    }, 2000)

    await this.setPose({
      jaw: -30,
      head: 20,
    }, 1000)
  }

});
