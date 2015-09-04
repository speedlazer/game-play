
# Import
generator = @Game.levelGenerator

generator.defineBlock class extends @Game.LevelBlock
  name: 'City.Intro'
  delta:
    x: 800
    y: 0
  next: ['City.Ocean']

  generate: ->
    super

    shipLength = 700

    #height = 25
    #@add(0, @level.visibleHeight - height, Crafty.e('2D, Canvas, Edge, Color').attr(w: @delta.x, h: height + 80).color('#000080'))
    #@add(0, @level.visibleHeight - height, Crafty.e('2D, Canvas, Edge, Color').attr(w: @delta.x, h: height + 80).color('#000080'))

    height = 85
    @add(0, @level.visibleHeight - 10, Crafty.e('2D, Canvas, Edge, Color').attr(w: @delta.x, h: 90).color('#000080'))
    @add(0, @level.visibleHeight - height, Crafty.e('2D, Canvas, Color').attr(w: @delta.x, h: height + 10, z: -3).color('#000080'))

    height = 25
    @add(0, @level.visibleHeight - 200, Crafty.e('2D, Canvas, Color').color('#202020').attr({ z: -1, w: shipLength, h: 300 }))
    @add(50, @level.visibleHeight - 350, Crafty.e('2D, Canvas, Color').color('#202020').attr({ z: -1, w: 350, h: 150 }))
    @add(0, @level.visibleHeight - height, Crafty.e('2D, Canvas, Color').color('#202020').attr({ z: 3, w: shipLength, h: 70, alpha: 0.3 }))


    @elevator = Crafty.e('2D, Canvas, Color, Tween').color('#707070').attr({ z: 0, w: 100, h: 5 })
    @add(140, @level.visibleHeight - height - 45, @elevator)

    @outside = Crafty.e('2D, Canvas, Color, Tween').color('#303030').attr({ z: 0, w: shipLength + 10, h: 195 - height, alpha: 0 })
    @add(0, @level.visibleHeight - @outside.h - height, @outside)

    @barrel = Crafty.e('2D, Tween, Canvas, Color, Collision, Choreography').color('#606000').attr({ z: 3, w: 10, h: 15 })
    @add(500, @level.visibleHeight - @outside.h - height - @barrel.h, @barrel)

    @splash = Crafty.e('2D, Tween, Canvas, Color').color('#E0E0E0').attr({ z: 3, w: 10, h: 1, alpha: 0 })
    @add(485, @level.visibleHeight - height + 10, @splash)

    @barrelKnock = no
    knockOff = [
        type: 'linear'
        y: 190
        duration: 1500
      ,
        type: 'delay'
        event: 'splash'
        duration: 1
    ]
    @barrel.onHit 'PlayerControlledShip', =>
      return if @barrelKnock
      @barrelKnock = yes
      @barrel.choreography(knockOff).tween(rotation: 90, 1500).one 'splash', =>
        @barrel.attr alpha: 0
        @splash.attr(alpha: 1).tween(alpha: 0, w: 30, x: @splash.x - 10, h: 30, y: @splash.y - 30, 750)


    @addBackground(-600, @level.visibleHeight - 125, Crafty.e('2D, Canvas, Color').color('#3030B0').attr({ z: -5, w: ((@delta.x + 600) * .5) + 1, h: 105 }), .5)
    @addBackground(-300, @level.visibleHeight - 155, Crafty.e('2D, Canvas, Color').color('#6060E0').attr({ z: -6, w: ((@delta.x + 300) * .25) + 1, h: 155 }), .25)

    @addBackground(0, @level.visibleHeight + 40, Crafty.e('2D, Canvas, Color').color('#000040').attr({ z: 3, w: ((@delta.x + 300)) + 1, h: 185 }), 1.25)

    @addBackground(200, 45, Crafty.e('2D, Canvas, Color').color('#FFFFFF').attr({ z: -2, w: 100, h: 25 }), .5)
    @addBackground(200, 55, Crafty.e('2D, Canvas, Color').color('#DDDDDD').attr({ z: -3, w: 75, h: 25 }), .45)

  enter: ->
    super
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
        duration: 1500
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
      newShip.one 'unlock', -> @enableControl()

    @bind 'ShipSpawned', fixOtherShips
    Crafty('PlayerControlledShip').each (index) ->
      return unless index is 0
      leadAnimated = this
      @addComponent 'Choreography'
      @attr x: 360 - (50 * index), y: 380
      @disableControl()
      @choreography c
      @one 'ChoreographyEnd', =>
        @removeComponent 'Choreography', 'no'
        block.unbind 'ShipSpawned'
      @one 'unlock', -> @enableControl()
      @one 'lift', ->
        block.elevator.tween({ y: block.elevator.y - 130 }, 2500)
        Crafty('ScrollWall').each ->
          @addComponent 'Tween'
          @tween { y: 0 }, 5000
          @one 'TweenEnd', -> @removeComponent 'Tween', no
      @one 'shipExterior', ->
        block.outside.tween({ alpha: 1 }, 1500).addComponent('Edge')
      @one 'go', ->
        block.level.setForcedSpeed 1

generator.defineBlock class extends @Game.LevelBlock
  name: 'City.Ocean'
  delta:
    x: 400
    y: 0
  next: ['City.Ocean']

  generate: ->
    super
    height = 85
    @add(0, @level.visibleHeight - 10, Crafty.e('2D, Canvas, Edge, Color').attr(w: @delta.x, h: 10).color('#000080'))
    @add(0, @level.visibleHeight - height, Crafty.e('2D, Canvas, Color').attr(w: @delta.x, h: height - 10, z: -3).color('#000080'))
    @addBackground(0, @level.visibleHeight - 125, Crafty.e('2D, Canvas, Color').color('#3030B0').attr({ z: -5, w: (@delta.x * .5) + 1, h: 105 }), .5)
    @addBackground(0, @level.visibleHeight - 155, Crafty.e('2D, Canvas, Color').color('#6060E0').attr({ z: -6, w: (@delta.x * .25) + 1, h: 155 }), .25)

    y = (Math.random() * 20) + 40
    @addBackground(200, y, Crafty.e('2D, Canvas, Color').color('#FFFFFF').attr({ z: -2, w: 100, h: 25 }), .5)
    @addBackground(200, y + 10, Crafty.e('2D, Canvas, Color').color('#DDDDDD').attr({ z: -3, w: 75, h: 25 }), .45)

generator.defineBlock class extends @Game.LevelBlock
  name: 'City.CoastStart'
  delta:
    x: 400
    y: 0
  next: ['City.Coast']

  generate: ->
    super
    height = 85
    @add(0, @level.visibleHeight - 10, Crafty.e('2D, Canvas, Edge, Color').attr(w: @delta.x, h: 10).color('#000080'))
    @add(0, @level.visibleHeight - height, Crafty.e('2D, Canvas, Color').attr(w: @delta.x, h: height - 10, z: -3).color('#000080'))
    @addBackground(0, @level.visibleHeight - 125, Crafty.e('2D, Canvas, Color').color('#3030B0').attr({ z: -5, w: (@delta.x * .5) + 1, h: 105 }), .5)
    @addBackground(0, @level.visibleHeight - 155, Crafty.e('2D, Canvas, Color').color('#606060').attr({ z: -6, w: (@delta.x * .25) + 1, h: 155 }), .25)

    # This is just for a small impression, this will be replaced by a sprite
    @addBackground(150, @level.visibleHeight - 150, Crafty.e('2D, Canvas, Color').color('#B5B5B5').attr({ z: -5, w: (40 * .25) + 1, h: 15 }), .25)
    @addBackground(120, @level.visibleHeight - 157, Crafty.e('2D, Canvas, Color').color('#909090').attr({ z: -5, w: (50 * .25) + 1, h: 15 }), .25)

    @addBackground(230, @level.visibleHeight - 150, Crafty.e('2D, Canvas, Color').color('#B5B5B5').attr({ z: -5, w: (40 * .25) + 1, h: 15 }), .25)
    @addBackground(190, @level.visibleHeight - 157, Crafty.e('2D, Canvas, Color').color('#909090').attr({ z: -5, w: (50 * .25) + 1, h: 15 }), .25)

    #y = (Math.random() * 20) + 40
    #@addBackground(200, y, Crafty.e('2D, Canvas, Color').color('#FFFFFF').attr({ z: -2, w: 100, h: 25 }), .5)
    #@addBackground(200, y + 10, Crafty.e('2D, Canvas, Color').color('#DDDDDD').attr({ z: -3, w: 75, h: 25 }), .45)
    #

generator.defineBlock class extends @Game.LevelBlock
  name: 'City.Coast'
  delta:
    x: 400
    y: 0
  next: ['City.Coast']

  generate: ->
    super
    height = 85
    @add(0, @level.visibleHeight - 10, Crafty.e('2D, Canvas, Edge, Color').attr(w: @delta.x, h: 10).color('#000080'))
    @add(0, @level.visibleHeight - height, Crafty.e('2D, Canvas, Color').attr(w: @delta.x, h: height - 10, z: -3).color('#000080'))
    @addBackground(0, @level.visibleHeight - 125, Crafty.e('2D, Canvas, Color').color('#3030B0').attr({ z: -5, w: (@delta.x * .5) + 1, h: 105 }), .5)
    @addBackground(0, @level.visibleHeight - 155, Crafty.e('2D, Canvas, Color').color('#606060').attr({ z: -6, w: (@delta.x * .25) + 1, h: 155 }), .25)

    # This is just for a small impression, this will be replaced by a sprite
    @addBackground(90, @level.visibleHeight - 150, Crafty.e('2D, Canvas, Color').color('#B5B5B5').attr({ z: -5, w: (40 * .25) + 1, h: 15 }), .25)
    @addBackground(60, @level.visibleHeight - 162, Crafty.e('2D, Canvas, Color').color('#909090').attr({ z: -5, w: (50 * .25) + 1, h: 15 }), .25)

    @addBackground(170, @level.visibleHeight - 145, Crafty.e('2D, Canvas, Color').color('#B5B5B5').attr({ z: -5, w: (40 * .25) + 1, h: 15 }), .25)
    @addBackground(130, @level.visibleHeight - 157, Crafty.e('2D, Canvas, Color').color('#909090').attr({ z: -5, w: (50 * .25) + 1, h: 15 }), .25)

    @addBackground(230, @level.visibleHeight - 145, Crafty.e('2D, Canvas, Color').color('#B5B5B5').attr({ z: -5, w: (40 * .25) + 1, h: 15 }), .25)
    @addBackground(330, @level.visibleHeight - 157, Crafty.e('2D, Canvas, Color').color('#909090').attr({ z: -5, w: (50 * .25) + 1, h: 15 }), .25)

    y = (Math.random() * 20) + 40
    @addBackground(200, y, Crafty.e('2D, Canvas, Color').color('#FFFFFF').attr({ z: -2, w: 100, h: 25 }), .5)
    @addBackground(200, y + 10, Crafty.e('2D, Canvas, Color').color('#DDDDDD').attr({ z: -3, w: 75, h: 25 }), .45)


generator.defineBlock class extends @Game.LevelBlock
  name: 'City.Bay'
  delta:
    x: 400
    y: 0
  next: ['City.Bay']

  generate: ->
    super
    height = 85
    @add(0, @level.visibleHeight - 10, Crafty.e('2D, Canvas, Edge, Color').attr(w: @delta.x, h: 10).color('#000080'))
    @add(0, @level.visibleHeight - height, Crafty.e('2D, Canvas, Color').attr(w: @delta.x, h: height - 10, z: -3).color('#000080'))
    @addBackground(0, @level.visibleHeight - 125, Crafty.e('2D, Canvas, Color').color('#3030B0').attr({ z: -5, w: (@delta.x * .5) + 1, h: 105 }), .5)
    @addBackground(0, @level.visibleHeight - 155, Crafty.e('2D, Canvas, Color').color('#606060').attr({ z: -6, w: (@delta.x * .25) + 1, h: 155 }), .25)

    # This is just for a small impression, this will be replaced by a sprite
    @addBackground(90, @level.visibleHeight - 150, Crafty.e('2D, Canvas, Color').color('#B5B5B5').attr({ z: -5, w: (40 * .25) + 1, h: 15 }), .25)
    @addBackground(60, @level.visibleHeight - 162, Crafty.e('2D, Canvas, Color').color('#909090').attr({ z: -5, w: (50 * .25) + 1, h: 15 }), .25)

    @addBackground(170, @level.visibleHeight - 145, Crafty.e('2D, Canvas, Color').color('#B5B5B5').attr({ z: -5, w: (40 * .25) + 1, h: 15 }), .25)
    @addBackground(130, @level.visibleHeight - 157, Crafty.e('2D, Canvas, Color').color('#909090').attr({ z: -5, w: (50 * .25) + 1, h: 15 }), .25)

    @addBackground(230, @level.visibleHeight - 145, Crafty.e('2D, Canvas, Color').color('#B5B5B5').attr({ z: -5, w: (40 * .25) + 1, h: 15 }), .25)
    @addBackground(330, @level.visibleHeight - 157, Crafty.e('2D, Canvas, Color').color('#909090').attr({ z: -5, w: (50 * .25) + 1, h: 15 }), .25)

    @addBackground(0, @level.visibleHeight - 135, Crafty.e('2D, Canvas, Color').color('#C0C0C0').attr({ z: -4, w: (@delta.x * .5) + 1, h: 30 }), .5)


    #y = (Math.random() * 20) + 40
    #@addBackground(200, y, Crafty.e('2D, Canvas, Color').color('#FFFFFF').attr({ z: -2, w: 100, h: 25 }), .5)
    #@addBackground(200, y + 10, Crafty.e('2D, Canvas, Color').color('#DDDDDD').attr({ z: -3, w: 75, h: 25 }), .45)
