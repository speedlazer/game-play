CryptoJS = require('crypto-js')

Game =
  paused: no
  firstLevel: 'Game'
  togglePause: ->
    @paused = !@paused
    if @paused
      Crafty('Delay').each -> @pauseDelays()
      Crafty('Tween').each -> @pauseTweens()
      Crafty('Particles').each -> @pauseParticles()
      Crafty('SpriteAnimation').each -> @pauseAnimation()
      Crafty('PlayerControlledShip').each ->
        unless @disableControls
          @disabledThroughPause = yes
          @disableControl()

      Crafty.trigger('GamePause', @paused)
    else
      Crafty('Delay').each -> @resumeDelays()
      Crafty('Tween').each -> @resumeTweens()
      Crafty('Particles').each -> @resumeParticles()
      Crafty('SpriteAnimation').each -> @resumeAnimation()
      Crafty('PlayerControlledShip').each ->
        if @disabledThroughPause
          @disabledThroughPause = null
          @enableControl()
      Crafty.trigger('GamePause', @paused)

  # Initialize and start our game
  start: ->
    @resetCredits()

    settings = @settings()
    if settings.sound is no
      Crafty.audio.mute()

    Crafty.bind 'EnterFrame', ->
      return if Game.paused
      Crafty.trigger 'GameLoop', arguments...

    Crafty.paths(
      audio: '/'
      images: '/'
    )
    # Start crafty and set a background color so that we can see it's working
    stage = document.getElementById('cr-stage')
    Crafty.init(1024, 576, stage) # PAL+
    #Crafty.pixelart(true)
    Crafty.background('#000000')

    Crafty.e('Player, Color')
      .attr(name: 'Player 1', z: 0, playerNumber: 1)
      .setName('Player 1')
      .color('#FF0000')

    Crafty.e('Player, Color')
      .attr(name: 'Player 2', z: 10, playerNumber: 2)
      .setName('Player 2')
      .color('#00FF00')

    Crafty.e('KeyboardControls, PlayerAssignable')
      .controls
        fire: Crafty.keys.SPACE
        switchWeapon: Crafty.keys.PERIOD
        super: Crafty.keys.ENTER
        up: Crafty.keys.UP_ARROW
        down: Crafty.keys.DOWN_ARROW
        left: Crafty.keys.LEFT_ARROW
        right: Crafty.keys.RIGHT_ARROW
        pause: Crafty.keys.P


    Crafty.e('KeyboardControls, PlayerAssignable')
      .controls
        fire: Crafty.keys.G
        switchWeapon: Crafty.keys.H
        up: Crafty.keys.W
        down: Crafty.keys.S
        left: Crafty.keys.A
        right: Crafty.keys.D
        pause: Crafty.keys.Q


    Crafty.e('GamepadControls, PlayerAssignable')
      .controls
        gamepadIndex: 0
        fire: 0
        switchWeapon: 2
        super: 4
        pause: 9
        up: 12
        down: 13
        left: 14
        right: 15

    Crafty.e('GamepadControls, PlayerAssignable')
      .controls
        gamepadIndex: 1
        fire: 0
        switchWeapon: 2
        super: 4
        pause: 9
        up: 12
        down: 13
        left: 14
        right: 15

    # Simply start splashscreen
    handler = (e) =>
      if e.key == Crafty.keys.N
        Crafty.unbind('KeyDown', handler)
        Crafty.enterScene('Game', script: 'Lunch', checkpoint: 0)

    Crafty.bind('KeyDown', handler)
    #Crafty.enterScene('New')
    Crafty.enterScene('Intro')

  resetCredits: ->
    @credits = 2 # This is actually 'Extra' credits, so in total 3

  highscores: ->
    loadList = ->
      data = localStorage.getItem('SPDLZR')
      return [] unless data
      k = data.slice(0,20)
      d = data.slice(20)
      s = CryptoJS.AES.decrypt(d,k)
      v = s.toString(CryptoJS.enc.Utf8)
      return [] unless v.length > 1
      JSON.parse(v)

    loadedList = loadList()

    defInit = 'SPL'
    list = [
      { initials: defInit, score: 30000 }
      { initials: defInit, score: 20000 }
      { initials: defInit, score: 10000 }
      { initials: defInit, score: 5000 }
      { initials: defInit, score: 2500 }
      { initials: defInit, score: 1500 }
      { initials: defInit, score: 1000 }
      { initials: defInit, score: 5000 }
      { initials: defInit, score: 2000 }
      { initials: defInit, score: 1500 }
    ].concat loadedList
    _.sortBy(list, 'score').reverse()

  settings: ->
    data = localStorage.getItem('SPDLZRS')
    settings = {}
    if data
      settings = JSON.parse(data)
    _.defaults(settings,
      sound: on
    )

  changeSettings: (changes = {}) ->
    newSettings = _.defaults(changes,
      @settings()
    )
    str = JSON.stringify(newSettings)
    localStorage.setItem('SPDLZRS', str)

  Scripts: {}

# Export
module.exports = { default: Game }

