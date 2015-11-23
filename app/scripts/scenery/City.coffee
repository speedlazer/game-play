
# Import
generator = @Game.levelGenerator

generator.defineElement 'cloud', ->
  y = (Math.random() * 20) + 40
  @addBackground(200, y, Crafty.e('2D, Canvas, Color').color('#FFFFFF').attr({ z: -200, w: 100, h: 25, alpha: 0.5 }), .5)
  @addBackground(200, y + 10, Crafty.e('2D, Canvas, Color').color('#DDDDDD').attr({ z: -300, w: 75, h: 25, alpha: 0.5 }), .45)

generator.defineElement 'waterHorizon', ->
  @addBackground(0, @level.visibleHeight - 155, Crafty.e('2D, Canvas, Color').color('#6060E0').attr({ z: -600, w: (@delta.x * .25) + 1, h: 155 }), .25)

  goldenStripe = Crafty.e('2D, Canvas, Color, GoldenStripe').color('#DDDD00').attr({ z: -599, w: (@delta.x * .25), h: 1, alpha: 0 })
  @addBackground(0, @level.visibleHeight - 155, goldenStripe, .25)

generator.defineElement 'water', ->
  @addBackground(0, @level.visibleHeight - 125, Crafty.e('2D, Canvas, Color').color('#3030B0').attr({ z: -500, w: (@delta.x * .5) + 1, h: 105 }), .5)
  @addBackground(0, @level.visibleHeight - 90, Crafty.e('2D, Canvas, Color').color('#3030B0').attr({ z: -301, w: (@delta.x * .5) + 1, h: 70 }), .5)

generator.defineElement 'waterFront', ->
  height = 65
  @add(0, @level.visibleHeight - 10, Crafty.e('2D, Solid').attr(w: @delta.x, h: 10))
  @add(0, @level.visibleHeight - height, Crafty.e('2D, Canvas, Color').attr(w: @delta.x, h: height, z: -300).color('#000080'))

generator.defineElement 'cityHorizon', (mode) ->

  # Sky = 8080FF = 128, 128, 255
  #
  #       B4B4B4 * 0.3 = 9A9AD9
  #       909090 * 0.3 = 8888C7
  #       606060 * 0.3 = 7070DF
  #       http://meyerweb.com/eric/tools/color-blend/#606060:8080FF:10:hex
  col1 = '#A6A6C8'
  col2 = '#8C8CAE'
  col3 = '#69698B'

  # This is just for a small impression, this will be replaced by a sprite
  if mode is 'start'
    e = Crafty.e('2D, Canvas, Image').image('images/horizon-city-start.png').attr({ z: -600 })
    @addBackground(0, @level.visibleHeight - 157, e, .25)
    #@addBackground(150, @level.visibleHeight - 150, Crafty.e('2D, Canvas, Color').color(col1).attr({ z: -500, w: (40 * .25) + 1, h: 15 }), .25)
    #@addBackground(120, @level.visibleHeight - 157, Crafty.e('2D, Canvas, Color').color(col2).attr({ z: -501, w: (50 * .25) + 1, h: 15 }), .25)

    #@addBackground(230, @level.visibleHeight - 150, Crafty.e('2D, Canvas, Color').color(col1).attr({ z: -500, w: (40 * .25) + 1, h: 15 }), .25)
    #@addBackground(190, @level.visibleHeight - 157, Crafty.e('2D, Canvas, Color').color(col2).attr({ z: -501, w: (50 * .25) + 1, h: 15 }), .25)
  else
    e = Crafty.e('2D, Canvas, Image').image('images/horizon-city.png').attr({ z: -600 })
    @addBackground(0, @level.visibleHeight - 157, e, .25)
    #@addBackground(0, @level.visibleHeight - 155, Crafty.e('2D, Canvas, Color').color(col3).attr({ z: -600, w: (@delta.x * .25) + 1, h: 30 }), .25)
    ## This is just for a small impression, this will be replaced by a sprite
    #@addBackground(90, @level.visibleHeight - 150, Crafty.e('2D, Canvas, Color').color(col1).attr({ z: -500, w: (40 * .25) + 1, h: 15 }), .25)
    #@addBackground(60, @level.visibleHeight - 162, Crafty.e('2D, Canvas, Color').color(col2).attr({ z: -501, w: (50 * .25) + 1, h: 15 }), .25)

    #@addBackground(170, @level.visibleHeight - 145, Crafty.e('2D, Canvas, Color').color(col1).attr({ z: -500, w: (40 * .25) + 1, h: 15 }), .25)
    #@addBackground(130, @level.visibleHeight - 157, Crafty.e('2D, Canvas, Color').color(col2).attr({ z: -501, w: (50 * .25) + 1, h: 15 }), .25)

    #@addBackground(230, @level.visibleHeight - 145, Crafty.e('2D, Canvas, Color').color(col1).attr({ z: -500, w: (40 * .25) + 1, h: 15 }), .25)
    #@addBackground(330, @level.visibleHeight - 157, Crafty.e('2D, Canvas, Color').color(col2).attr({ z: -501, w: (50 * .25) + 1, h: 15 }), .25)

generator.defineElement 'city', (offset = 0) ->
  # Coastline

  # Sky = 8080FF = 128, 128, 255
  #
  #       B4B4B4 * 0.2 = 9A9AD9
  #       909090 * 0.2 = 8888C7
  #       606060 * 0.2 = 7070DF
  #       http://meyerweb.com/eric/tools/color-blend/#606060:8080FF:10:hex
  col1 = '#A6A6C8'
  col2 = '#8C8CAE'
  col3 = '#66667D'
  @addBackground(0, @level.visibleHeight - 140, Crafty.e('2D, Canvas, Color').color(col3).attr({ z: -400, w: (@delta.x * .37) + 1, h: 83 }), .37)

  e = Crafty.e('2D, Canvas, Image, Collision').image('images/city.png').attr({ z: -305 })
  e.collision([20, 155, 20, 20, 70, 20, 70, 0, 130, 0, 130, 155])
  @addBackground(offset, @level.visibleHeight - 290, e, .5)

generator.defineBlock class extends @Game.LevelScenery
  name: 'City.Intro'
  delta:
    x: 800
    y: 0
  autoNext: 'Ocean'

  generate: ->
    super

    shipLength = 700

    height = 65
    @add(0, @level.visibleHeight - 10, Crafty.e('2D, Canvas, Solid, Color').attr(w: @delta.x, h: 90).color('#000080'))
    @add(0, @level.visibleHeight - height, Crafty.e('2D, Canvas, Color').attr(w: @delta.x, h: height + 10, z: -300).color('#000080'))

    height = 45
    shipHeight = 155
    cabinHeight = 150

    @add(0, @level.visibleHeight - height - shipHeight, Crafty.e('2D, Canvas, Color').color('#202020').attr({ z: -1, w: shipLength, h: shipHeight }))
    @add(50, @level.visibleHeight - height - shipHeight - cabinHeight, Crafty.e('2D, Canvas, Color').color('#202020').attr({ z: -1, w: 350, h: cabinHeight }))

    # Shadow on the water
    @add(0, @level.visibleHeight - height, Crafty.e('2D, Canvas, Color').color('#202020').attr({ z: 3, w: shipLength, h: 70, alpha: 0.3 }))


    @elevator = Crafty.e('2D, Canvas, Color, Tween').color('#707070').attr({ z: 0, w: 100, h: 5 })
    @add(140, @level.visibleHeight - 70, @elevator)

    @outside = Crafty.e('2D, Canvas, Color, Tween').color('#303030').attr({ z: 0, w: shipLength + 10, h: shipHeight - 5, alpha: 0 })
    @add(0, @level.visibleHeight - @outside.h - height, @outside)

    barrelLocator = Crafty.e('2D, BarrelLocation')
    @add(500, @level.visibleHeight - @outside.h - height, barrelLocator)

    @addElement 'water'
    @addElement 'waterHorizon'

    @addBackground(0, @level.visibleHeight + 40, Crafty.e('2D, Canvas, Color').color('#000040').attr({ z: 3, w: ((@delta.x + 300)) + 1, h: 185 }), 1.25)

    @addElement 'cloud'

  enter: ->
    super
    @speed = @level._forcedSpeed
    Crafty('ScrollWall').attr y: 120
    @level.setForcedSpeed 0
    c = [
        type: 'linear'
        x: -160
        duration: 2500
      ,
        type: 'linear'
        y: -130
        duration: 2500
        event: 'lift'
      ,
        type: 'linear'
        x: 70
        y: -10
        duration: 2500
        event: 'shipExterior'
      ,
        type: 'delay'
        duration: 500
        event: 'unlock'
      ,
        type: 'delay'
        duration: 1
        event: 'go'
    ]
    block = this
    leadAnimated = null

    fixOtherShips = (newShip) ->
      return unless leadAnimated
      return unless leadAnimated.has 'Choreography'
      newShip.attr(x: leadAnimated.x - 50, y: leadAnimated.y)
      newShip.disableControl() if leadAnimated.disableControls
      newShip.addComponent 'Choreography'
      newShip.synchChoreography leadAnimated
      newShip.one 'ChoreographyEnd', ->
        @removeComponent 'Choreography', no
      newShip.one 'unlock', ->
        @enableControl()
        @weaponsEnabled = yes
      newShip.weaponsEnabled = leadAnimated.weaponsEnabled

    @bind 'ShipSpawned', fixOtherShips
    Crafty('PlayerControlledShip').each (index) ->
      return unless index is 0
      leadAnimated = this
      @addComponent 'Choreography'
      @attr x: 360 - (50 * index), y: 380
      @disableControl()
      @weaponsEnabled = no
      @choreography c
      @one 'ChoreographyEnd', =>
        @removeComponent 'Choreography', 'no'
        block.unbind 'ShipSpawned'
      @one 'unlock', ->
        @enableControl()
        @weaponsEnabled = yes
      @one 'lift', ->
        block.elevator.tween({ y: block.elevator.y - 130 }, 2500)
        Crafty('ScrollWall').each ->
          @addComponent 'Tween'
          @tween { y: 0 }, 5000
          @one 'TweenEnd', -> @removeComponent 'Tween', no
      @one 'shipExterior', ->
        block.outside.tween({ alpha: 1 }, 1500).addComponent('Solid')
      @one 'go', ->
        block.level.setForcedSpeed block.speed

generator.defineBlock class extends @Game.LevelScenery
  name: 'City.Ocean'
  delta:
    x: 800
    y: 0

  generate: ->
    super

    @addElement 'waterFront'
    @addElement 'waterHorizon'
    @addElement 'cloud'
    @addElement 'water'

generator.defineBlock class extends @Game.LevelScenery
  name: 'City.CoastStart'
  delta:
    x: 800
    y: 0
  autoNext: 'Coast'

  generate: ->
    super
    @addElement 'waterFront'
    @addElement 'water'
    @addElement 'cityHorizon', 'start'
    @addElement 'cloud'

generator.defineBlock class extends @Game.LevelScenery
  name: 'City.Coast'
  delta:
    x: 800
    y: 0

  generate: ->
    super
    @addElement 'waterFront'
    @addElement 'water'
    @addElement 'cityHorizon'
    @addElement 'cloud'

generator.defineBlock class extends @Game.LevelScenery
  name: 'City.Bay'
  delta:
    x: 800
    y: 0

  generate: ->
    super
    @addElement 'waterFront'
    @addElement 'water'
    @addElement 'cityHorizon'
    @addElement 'city'
    @addElement 'city', 400

generator.defineBlock class extends @Game.LevelScenery
  name: 'City.UnderBridge'
  delta:
    x: 800
    y: 0
  autoNext: 'Bay'

  generate: ->
    super
    @addElement 'waterFront'
    @addElement 'water'
    @addElement 'cityHorizon'
    @addElement 'city'
    @addElement 'city', 400

    # Pillars
    pillarWidth = 80
    @addBackground(0, @level.visibleHeight - 480, Crafty.e('2D, Canvas, Color').color('#000000').attr({ z: 3, w: pillarWidth * 1.5, h: 480, alpha: 0.7 }), 1.5)
    @addBackground(@delta.x - pillarWidth, @level.visibleHeight - 480, Crafty.e('2D, Canvas, Color').color('#000000').attr({ z: 3, w: pillarWidth * 1.5, h: 480, alpha: 0.7 }), 1.5)

    # Deck
    for i in [0..11]
      c = ['#101010', '#181818', '#202020', '#282828', '#303030',
           '#383838', '#404040', '#484848', '#505050', '#585858', '#606060', '#686868'][11 - (i // 2)]
      h = 120 - (8 * i)
      y = @level.visibleHeight - (480 - (i * 30))
      z = -3 - (1 * i)
      sp = 1.2 - (0.05 * i)
      hp = (420 - (6 * i)) - (h + y)
      @addBackground(0, y, Crafty.e('2D, Canvas, Color').color(c).attr({ z: z, w: @delta.x * sp, h: h }), sp)
      if i % 5 is 0
        @addBackground(0, h + y, Crafty.e('2D, Canvas, Color').color(c).attr({ z: z, w: pillarWidth * sp, h: hp }), sp)
        @addBackground(@delta.x - pillarWidth, h + y, Crafty.e('2D, Canvas, Color').color(c).attr({ z: z, w: pillarWidth * sp, h: hp }), sp)


generator.defineBlock class extends @Game.LevelScenery
  name: 'City.Skyline'
  delta:
    x: 800
    y: 0
  next: ['City.Skyline']

  generate: ->
    super
    h = 400 + 200
    @add(0, @level.visibleHeight - h, Crafty.e('2D, Canvas, Color').attr(w: 300, h: h, z: -1).color('#909090'))

    h = 300 + 200
    @addBackground(200, @level.visibleHeight - h, Crafty.e('2D, Canvas, Color').attr(w: 400, h: h, z: 5).color('#000000'), 1.5)

    @addElement 'water'

    @addElement 'cityHorizon'
    @addElement 'city'
    @addElement 'city', 400
