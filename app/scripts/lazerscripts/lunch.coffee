Game = @Game
Game.Scripts ||= {}

class Game.Scripts.Lunch extends Game.LazerScript
  assets: ->
    @loadAssets('shadow', 'explosion', 'playerShip')

  execute: ->
    @inventoryAdd 'item', 'lasers', ->
      Crafty.e('PowerUp').powerUp(contains: 'lasers', marking: 'L')
    @inventoryAdd 'item', 'xp', ->
      Crafty.e('PowerUp').powerUp(contains: 'xp', marking: 'X')

    Game.explosionMode = 'block'

    @sequence(
      @setShipType('PlayerControlledCube')
      @setScenery('Blackness')
      @hideHud(duration: 0)
      @setWeapons([])
      @enableWeapons()
      @nextSlide()
      @setWeapons(['oldlasers'])
      @nextSlide()
      @updateTitle 'First enemy'

      @placeSquad Game.Scripts.Slider,
        options:
          grid: new Game.LocationGrid
            x:
              start: 1.1
            y:
              start: .5
      @showHud()

      @nextSlide()
      @updateTitle 'More enemies'
      @setScenery('OpenSpace')
      @setSpeed 150
      @parallel(
        @placeSquad Game.Scripts.Slider,
          amount: 15
          options:
            grid: new Game.LocationGrid
              x:
                start: 1.2
                steps: 4
                stepSize: .2
              y:
                start: .2
                steps: 5
                stepSize: .1
        @sequence(
          @waitForScenery 'OpenSpace'
          @setSpeed 0
        )
      )

      @nextSlide()
      @updateTitle 'Level geometry'
      @setSpeed 50

      @nextSlide()
      @updateTitle 'Speed and collision'
      @setSpeed 250

      @nextSlide()
      @updateTitle 'Backgrounds'
      @checkpoint @setScenery 'OpenSpace'
      @setScenery('TunnelStart')
      @waitForScenery 'TunnelStart'
      @setSpeed 50
      @nextSlide()

      @updateTitle 'Dialog'
      @say 'SpeedLazer', 'Hello World!'
      @say 'SpeedLazer', 'Flavor text can add to story telling'
      @nextSlide()
      @parallel(
        @sequence(
          @wait 3000
          @say 'Enemies', 'Get them!'
        )
        @nextSlide @sequence(
          @placeSquad Game.Scripts.Slider,
            amount: 5
            options:
              grid: new Game.LocationGrid
                x:
                  start: 1.2
                  steps: 4
                  stepSize: .2
                y:
                  start: .3
                  steps: 5
                  stepSize: .1
          @wait 3000
        )
      )

      @updateTitle 'Enemy choreo start'
      @nextSlide @sequence(
        @placeSquad Game.Scripts.Sine,
          amount: 5
          delay: 1000
        @wait 3000
      )

      @updateTitle 'Start stage 1'
      @setScenery('TunnelEnd')
      @setSpeed 350

      @waitForScenery 'OceanOld', event: 'inScreen'
      @setSpeed 50
      @checkpoint @setScenery 'OceanOld'
      @nextSlide()
      @updateTitle 'Vertical motion'
      @parallel(
        @gainHeight 800, duration: 10000
        @placeSquad Game.Scripts.Sine,
          amount: 8
          delay: 1000
      )
      @nextSlide()
      @updateTitle 'Bezier, powerups'
      @parallel(
        @gainHeight -800, duration: 10000
        @nextSlide @sequence(
          @placeSquad Game.Scripts.PresentationSwirler,
            drop: 'xp'
            amount: 4
            delay: 500
          @waitForScenery 'OceanOld'
        )
      )

      @updateTitle 'Lazerscript environment'
      @nextSlide(
        @placeSquad Game.Scripts.PresentationSwirler,
          drop: 'xp'
          amount: 3
          delay: 500
      )
      @nextSlide(
        @parallel(
          @placeSquad Game.Scripts.PresentationShooter,
            drop: 'xp'
            amount: 3
            delay: 600
          @placeSquad Game.Scripts.PresentationSwirler,
            amount: 3
            delay: 500
        )
      )
      @checkpoint @setScenery 'OceanOld'
      @updateTitle 'Lazerscript enemies'
      @disableWeapons()

      @placeSquad Game.Scripts.LittleDancer,
        amount: 5
        delay: 2000
        options:
          grid: new Game.LocationGrid
            x:
              start: .25
              steps: 5
              stepSize: .1

      @enableWeapons()

      @updateTitle 'Particle effects'
      => Game.explosionMode = 'particles'
      => Game.webGLMode = off

      @checkpoint @setScenery('OceanOld')
      @setScenery('OceanToNew')
      @async @runScript(Game.Scripts.PresentationSunRise, skipTo: 0, speed: 10)
      @repeat 4, @sequence(
        @placeSquad Game.Scripts.PresentationSwirler,
          drop: 'xp'
          amount: 6
          delay: 700
      )
      => Game.explosionMode = null
      @updateTitle 'Graphics!'
      @swirlAttacks()
      @swirlAttacks()
      @setScenery('CoastStart')

      @setWeapons(['lasers'])
      @setShipType('PlayerSpaceship')

      @nextSlide @sequence(
        @mineSwarm()
        @mineSwarm(direction: 'left')
      )
      @setScenery('BayStart')
      @async @runScript(Game.Scripts.PresentationSunSet, skipTo: 0, speed: 50)

      @nextSlide @sequence(
        @swirlAttacks()
      )
      @checkpoint @setScenery('BayStart')
      =>
        Game.webGLMode = on
        Crafty('GoldenStripe').each -> @bottomColor('#DDDD00', 0)
      @async @runScript(Game.Scripts.SunRise, skipTo: 0, speed: 5)
      @wait 20000

      @placeSquad Game.Scripts.Stage1BossStage1
      @gainHeight 200, duration: 5000
      @showScore(1, 'Lunch and learn')
      @repeat @sequence(
        @placeSquad Game.Scripts.Stage1BossPopup
        @wait 2000
      )
    )


  nextSlide: (task) ->
    @sequence(
      # While now works with 2 promises.
      @while(
        @_waitForKeyPress(Crafty.keys.N)
        @sequence(
          task ? @wait(1000)
          @_addVisibleMarker()
        )
      )
    )

  _addVisibleMarker: ->
    =>
      text = ''
      Crafty('LevelTitle').each ->
        text = @_text
      if text[text.length - 1] is '-'
        text = text.slice(0, text.length - 2)
      unless text[text.length - 1] is '*'
        Crafty('LevelTitle').text text + ' *'

  _clearVisibleMarker: ->
    text = ''
    Crafty('LevelTitle').each ->
      text = @_text
    if text[text.length - 1] is '*'
      Crafty('LevelTitle').text(text.slice(0, text.length - 2) + ' -')

  _waitForKeyPress: (key) ->
    =>
      d = WhenJS.defer()
      handler = (e) =>
        if e.key == key
          @_clearVisibleMarker()
          Crafty.unbind('KeyDown', handler)
          d.resolve()

      Crafty.bind('KeyDown', handler)
      d.promise

  mineSwarm: (options = { direction: 'right' })->
    @placeSquad Game.Scripts.JumpMine,
      amount: 8
      delay: 300
      options:
        grid: new Game.LocationGrid
          x:
            start: 200
            steps: 10
            stepSize: 40
          y:
            start: 60
            steps: 8
            stepSize: 40

        direction: options.direction

  swirlAttacks: ->
    @parallel(
      @repeat 2, @placeSquad Game.Scripts.PresentationSwirler,
        amount: 4
        delay: 500
        drop: 'xp'
        options:
          shootOnSight: yes
      @repeat 2, @placeSquad Game.Scripts.PresentationShooter,
        amount: 4
        delay: 500
        drop: 'xp'
        options:
          shootOnSight: yes
    )

