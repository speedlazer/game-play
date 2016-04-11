Game = @Game
Game.Scripts ||= {}

class Game.Scripts.LunchBoss extends Game.EntityScript
  assets: ->
    @loadAssets('largeDrone')

  smoke: (version = 'heavy') ->
    options = {
      heavy:
        alpha: .8
        wait: 40
      medium:
        alpha: .6
        wait: 80
      light:
        alpha: .4
        wait: 140
    }[version]
    @sequence(
      @blast(@location(),
        =>
          radius: 10
          duration: 480
          z: @entity.z - 3
          alpha: options.alpha
          lightness: 1.0
        ->
          rotation: @rotation + 1
          alpha: Math.max(0, @alpha - .003)
          lightness: -> Math.max(.2, @lightness - .05)
          y: @y - (Math.random() * 2)
      )
      @wait -> options.wait + (Math.random() * 50)
    )

class Game.Scripts.LunchBossStage1 extends Game.Scripts.LunchBoss
  spawn: ->
    Crafty.e('LargeDrone, Horizon').drone(
      x: Crafty.viewport.width + 40
      y: Crafty.viewport.height * .35
      defaultSpeed: 100
      #defaultSpeed: 50
      pointsOnHit: 10
    )

  execute: ->
    @inventoryAdd 'item', 'lasers', ->
      Crafty.e('PowerUp').powerUp(contains: 'lasers', marking: 'L').color('#8080FF')
    @inventoryAdd 'item', 'diagonals', ->
      Crafty.e('PowerUp').powerUp(contains: 'diagonals', marking: 'D').color('#8080FF')
    @bindSequence 'Hit', @fase2, => @entity.health < 345000

    @sequence(
      @setScenery('UnderBridge')
      => @entity.invincible = yes
      @animate 'slow', -1, 'eye'
      @disableWeapons()
      @parallel(
        @moveTo(x: .85, y: .41)
        @sequence(
          @say('Drone Commander', 'We have control now! You will suffer!')
          @say('Drone Commander', 'Earths defences are in our hands!')
          @wait 500
        )
      )
      @laugh()
      => @entity.invincible = no
      @enableWeapons()
      @setSpeed 100
      @async @placeSquad(Game.Scripts.Stage1BossRocket,
        options:
          location: @location()
          pointsOnDestroy: 0
          pointsOnHit: 0
      )
      @animate 'emptyWing', 0, 'wing'
      @animate 'reload', 0, 'wing'
      @moveTo(y: .43, speed: 5)
      @repeat @attackCycle(7)
    )

  laugh: ->
    @sequence(
      => Crafty.audio.play('laugh')
      => @entity.invincible = yes
      @repeat 5, @sequence(
        @rotate(10, 200)
        @rotate(-10, 200)
      )
      @rotate(0, 200)
      => @entity.invincible = no
    )

  attackCycle: (speed) ->
    @sequence(
      @async @runScript(Game.Scripts.Stage1BossMine, @location())
      @moveTo(y: .41, speed: speed)
      @wait 200
      @async @placeSquad(Game.Scripts.Stage1BossRocket,
        options:
          location: @location()
          pointsOnDestroy: 0
          pointsOnHit: 0
      )
      @animate 'emptyWing', 0, 'wing'
      @animate 'reload', 0, 'wing'
      @async @runScript(Game.Scripts.Stage1BossMine, @location())
      @moveTo(y: .43, speed: speed)
      @async @placeSquad(Game.Scripts.Stage1BossRocket,
        options:
          location: @location()
          pointsOnDestroy: 0
          pointsOnHit: 0
      )
      @animate 'emptyWing', 0, 'wing'
      @wait 200
      @animate 'reload', 0, 'wing'
    )

  attackCycle3: (speed) ->
    @repeat @sequence(
      @repeat 5, @sequence(
        @pickTarget('PlayerControlledShip')
        @while(
          @moveTo(@targetLocation(offsetY: -20, x: .85))
          @sequence(
            @async @runScript(Game.Scripts.Stage1BossMine, @location())
            @wait 800
            @async @placeSquad(Game.Scripts.Stage1BossHomingRocket,
              options:
                location: @location()
                pointsOnDestroy: 100
                pointsOnHit: 10
            )
            @animate 'emptyWing', 0, 'wing'
            @animate 'reload', 0, 'wing'
            @async @runScript(Game.Scripts.Stage1BossMine, @location())
            @wait 800
            @async @placeSquad(Game.Scripts.Stage1BossHomingRocket,
              options:
                location: @location()
                pointsOnDestroy: 100
                pointsOnHit: 10
            )
            @animate 'emptyWing', 0, 'wing'
            @wait 800
            @animate 'reload', 0, 'wing'
          )
        )
        @wait(1000)
      )
      @rocketRaid()
    )

  rocketRaid: ->
    @sequence(
      => @entity.invincible = yes
      @moveTo(y: .1)
      @repeat 10, @sequence(
        @async @placeSquad(Game.Scripts.Stage1BossHomingRocket,
          options:
            location: @location()
            pointsOnDestroy: 100
            pointsOnHit: 10
        )
        @animate 'emptyWing', 0, 'wing'
        @animate 'reload', 0, 'wing'
        @wait 500
      )

      @pickTarget('PlayerControlledShip')
      @moveTo(@targetLocation(offsetY: -20), x: .85)
      => @entity.invincible = no
    )

  bombRaid: (armed = no) ->
    @sequence(
      => @entity.invincible = yes
      @moveTo(y: .1)
      @while(
        @moveTo(x: -100, speed: 200)
        @sequence(
          @async @placeSquad(Game.Scripts.Stage1BossBombRaid,
            options:
              location: @location()
              armed: no
          )
          @wait 500
        )
      )
      => @entity.flipX()
      @while(
        @moveTo(x: 1.0, speed: 200)
        @sequence(
          @async @placeSquad(Game.Scripts.Stage1BossBombRaid,
            options:
              location: @location()
              armed: armed
          )
          @wait 500
        )
      )
      @moveTo(x: 1.2, speed: 200)
      => @entity.unflipX()
      @moveTo(x: .85, y: .41, speed: 200)
      => @entity.invincible = no
    )

  fase2: ->
    # start at 345000
    @bindSequence 'Hit', @fase3, => @entity.health < 330000

    @sequence(
      @setSpeed 150
      @bombRaid(yes)
      @parallel(
        @sequence(
          @gainHeight(300, duration: 4000)
          @setScenery 'Skyline'
        )
        @repeat @sequence(
          @repeat 2, @attackCycleAir()
          @airBashAttack()
        )
      )
    )

  airBashAttack: ->
    @sequence(
      @moveTo(y: .5, x: 0.95, speed: 100, 'easeInOutQuad')

      @async @placeSquad(Game.Scripts.LunchBossMineField,
        amount: 20
        delay: 50
        options:
          location: @location()
          gridConfig:
            x:
              start: 0.1
              steps: 12
              stepSize: 0.075
            y:
              start: 0.1
              steps: 5
              stepSize: 0.075
      )
      @async @placeSquad(Game.Scripts.LunchBossMineField,
        amount: 20
        delay: 50
        options:
          location: @location()
          gridConfig:
            x:
              start: 0.1
              steps: 12
              stepSize: 0.075
            y:
              start: 0.7
              steps: 5
              stepSize: 0.075
      )
      @wait(3000)
      @moveTo(x: -.15, speed: 500, easing: 'easeInQuad')
      => @entity.flipX()
      @sendToBackground(0.7, -150)
      @moveTo(x: 1.1, speed: 500)
      => @entity.unflipX()
      @scale(1.0, duration: 0)
      @reveal()
      @moveTo(x: .85, y: .41, speed: 200)
    )

  attackCycleAir: ->
    @repeat 5, @sequence(
      @async @placeSquad(Game.Scripts.Stage1BossHomingRocket,
        options:
          z: 5
          offsetY: 100
          location: @location()
      )
      @animate 'emptyWing', 0, 'wing'
      @async @placeSquad(Game.Scripts.Stage1BossHomingRocket,
        options:
          z: -5
          offsetY: -100
          location: @location()
      )
      @parallel(
        @moveTo(@targetLocation(offsetY: -20), x: .845)
        @sequence(
          @animate 'reload', 0, 'wing'
          @wait 1000
        )
      )
    )

class Game.Scripts.LunchBossMineField extends Game.EntityScript
  assets: ->
    @loadAssets('mine')

  spawn: (options) ->
    location = options.location()
    @target = options.grid.getLocation()
    @index = options.index

    Crafty.e('Mine').mine(
      health: 700
      x: location.x
      y: location.y + 10
      z: -4
      defaultSpeed: options.speed ? 300
      pointsOnHit: if options.points then 10 else 0
      pointsOnDestroy: if options.points then 50 else 0
    )

  execute: ->
    @bindSequence 'Destroyed', @onKilled
    @sequence(
      @moveTo(x: @target.x, y: @target.y, easing: 'easeOutQuad')
      @synchronizeOn 'placed'
      @sequence(
        @wait (1 - @target.xPerc) * 1000
        @animate('blink', -1)
        @wait 1000
        @onKilled()
        =>
          Crafty('bigBuilding').trigger('BigExplosion') if @index == 0
        @endSequence()
      )
    )

  onKilled: ->
    @bigExplosion(juice: @juice)
