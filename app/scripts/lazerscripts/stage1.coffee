
Game = @Game
Game.Scripts ||= {}

class Game.Scripts.Stage1 extends Game.LazerScript
  metadata:
    namespace: 'City'
    startScenery: 'Ocean'
    #startScenery: 'Intro'
    #armedPlayers: no
    speed: 50

  execute: ->
    @inventoryAdd 'item', 'lasers', ->
      Crafty.e('PowerUp').powerUp(contains: 'lasers', marking: 'L')

    @sequence(
      @async @sunRise()
      @introText()
      @tutorial()
      @droneTakeover()
      @parallel(
        @sequence(
          @wait 2000
          @say 'General', 'We\'re under attack!'
        )
        @swirlAttacks()
      )
      @setScenery('CoastStart')
      @swirlAttacks()
      @underWaterAttacks()
      @mineSwarm()

      @setScenery('Bay')
      @underWaterAttacks()
      @parallel(
        @swirlAttacks()
        @mineSwarm()
      )

      @setScenery('UnderBridge')
      @waitForScenery('UnderBridge', event: 'leave')
      @setScenery('UnderBridge')
      @waitForScenery('UnderBridge', event: 'leave')
      @gainHeight(250, duration: 4000)
      @setScenery('Skyline')
      @waitForScenery('Skyline', event: 'leave')
      @disableWeapons()
      @showScore(1, 'City')
      @enableWeapons()
    )

  introText: ->
    @sequence(
      @wait 2000 # Time for more players to activate
      @if((-> @player(1).active and @player(2).active)
        @say 'John', 'Too bad we have to bring these ships to the museum!'
      # else
        @say 'John', 'Too bad we have to bring this ship to the museum!'
      )
      @say 'General', 'Just give her a good last flight,\nwe document some moves on the way!'
      @wait 10000 # Maybe more/better script text here?
    )

  tutorial: ->
    @sequence(
      @say('General', 'We send some drones for target practice')
      #@placeSquad Game.Scripts.Swirler,
        #amount: 4
        #delay: 500
        #drop: 'lasers'
      #@say('General', 'We dropped a weapon system for you,\nTest it on those drones if you like')
      @repeat(2, @sequence(
        @dropWeaponsForEachPlayer()
        @wait(2000)
        @placeSquad Game.Scripts.Swirler,
          amount: 4
          delay: 500
          drop: 'lasers'
      ))
    )

  dropWeaponsForEachPlayer: ->
    @parallel(
      @if((-> @player(1).active and !@player(1).has('lasers')), @drop(item: 'lasers', inFrontOf: @player(1)))
      @if((-> @player(2).active and !@player(2).has('lasers')), @drop(item: 'lasers', inFrontOf: @player(2)))
    )

  droneTakeover: ->
    @sequence(
      @placeSquad Game.Scripts.Splasher,
        amount: 4
        delay: 750
      @say('General', 'Wtf is happening with our drones?')

      # TODO: Add shooting enemies

      @say('General', 'They do not respond to our commands anymore!\nThey have been taken over!')
    )

  swirlAttacks: ->
    @parallel(
      @repeat 2, @placeSquad Game.Scripts.Swirler,
        amount: 4
        delay: 500
        drop: 'lasers'
        options:
          shootOnSight: yes
      @repeat 2, @placeSquad Game.Scripts.Shooter,
        amount: 4
        delay: 500
        drop: 'lasers'
        options:
          shootOnSight: yes
    )

  underWaterAttacks: ->
    @sequence(
      @placeSquad Game.Scripts.Stalker
      @repeat 2, @parallel(
        @placeSquad Game.Scripts.Stalker
        @placeSquad Game.Scripts.Shooter,
          amount: 4
          delay: 1000
          drop: 'lasers'
          options:
            shootOnSight: yes
        @placeSquad Game.Scripts.Swirler,
          amount: 4
          delay: 1000
          drop: 'lasers'
          options:
            shootOnSight: yes
      )
    )

  sunRise: ->
    @runScript(Game.Scripts.SunRise)

  mineSwarm: ->
    @placeSquad Game.Scripts.JumpMine,
      amount: 8
      delay: 300
      options:
        x: -> (Math.round(Math.random() * 5) * 60) + 200
        y: -> (Math.round(Math.random() * 5) * 40) + 60

