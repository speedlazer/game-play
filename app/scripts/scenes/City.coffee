Crafty.defineScene 'City', (data) ->

  # import from globals
  Game = window.Game

  # constructor
  Crafty.background('#602020')

  level = Game.levelGenerator.createLevel
    stage: data.stage
    title: 'City'

  building = no

  unless building
    level.addBlock 'City.Intro',
      enter: ->
        text = "Stage #{@level.data.stage}: #{@level.data.title}"
        Crafty.e('StageTitle').stageTitle(text)

        @level.showDialog([
          'p1,p2:john:Too bad we have to bring these ships to the museum!'
          'p1,!p2:john:Too bad we have to bring this ship to the museum!'
          ':general:Just give her a good last flight,\nwe document some moves on the way!'
        ])

    level.addBlock 'City.Ocean'

    level.addBlock 'City.Ocean',
      enter: ->
        @level.showDialog([
          ':general:Evade the upcoming drones!'
        ]).on 'Finished', =>
          @level.spawnEnemies(
            'FlyOver'
            -> Crafty.e('Drone').drone()
          )

    level.addBlock 'City.Ocean',
      generate: ->
      enter: ->
        @level.showDialog([
          ':General:We dropped an upgrade to show the weapon systems'
        ]).on 'Finished', =>
          @level.addComponent Crafty.e('PowerUp').powerUp(contains: 'lasers', marking: 'L'), x: 640, y: 300
          if Crafty('PlayerControlledShip').length > 1
            @level.addComponent Crafty.e('PowerUp').powerUp(contains: 'lasers', marking: 'L'), x: 640, y: 100

    level.generateBlocks
      amount: 2
      enter: ->
        @level.spawnEnemies(
          'FlyOver'
          -> Crafty.e('Drone').drone()
        ).on 'LastDestroyed', (last) ->
          Crafty.e('PowerUp').powerUp(contains: 'lasers', marking: 'L').attr(
            x: last.x
            y: last.y
            z: -1
          )

  level.addBlock 'City.Ocean',
    enter: ->
      @level.spawnEnemies(
        'Splash'
        -> Crafty.e('BackgroundDrone').drone()
      ).on 'LastDestroyed', (last) =>
        @level.showDialog([
          ':General:Wtf is happening with our drones?'
        ]).on 'Finished', =>
          @level.spawnEnemies(
            'FlyOver'
            -> Crafty.e('Drone,Weaponized').drone()
          )




  level.generateBlocks amount: 2

  level.addBlock 'GameplayDemo.End'


  if building
    level.start
      armedPlayers: yes
      speed: 1
  else
    level.start
      armedPlayers: no
      speed: 0
      viewport:
        x: 0
        y: 120

  v = 0
  co =
    r: 0x60
    g: 0x20
    b: 0x20
  cd =
    r: 0x80
    g: 0x80
    b: 0xFF

  steps = 320
  delay = 1000
  Crafty.e('Delay').delay(
    =>
      v += 1
      p = v * 1.0 / steps
      c =
        r: co.r * (1 - p) + cd.r * p
        b: co.b * (1 - p) + cd.g * p
        g: co.g * (1 - p) + cd.b * p
      cs = (i.toString(16).slice(0, 2) for k, i of c)

      Crafty.background("##{cs.join('')}")
  , delay, steps - 1)

  duration = steps * delay * 2

  Crafty.e('Sun')
    .sun(
      x: 620
      y: 410
    )
    .tween({ dy: -340, dx: 120 }, duration)

  Crafty.bind 'EndOfLevel', ->
    level.stop()
    Crafty.enterScene('GameplayDemo', { stage: data.stage + 1 })

  Crafty.bind 'PlayerDied', ->
    playersActive = no
    Crafty('Player ControlScheme').each ->
      playersActive = yes if @lives > 0

    unless playersActive
      level.stop()
      Crafty.enterScene('GameOver')

, ->
  # destructor
  Crafty('Delay').each -> @destroy()
  Crafty.unbind('PlayerDied')
  Crafty.unbind('EndOfLevel')
  Crafty('Player').each -> @removeComponent('ShipSpawnable')
