{ EntityScript } = require('src/lib/LazerScript')
require('src/components/entities/Dinosaur')

class Dinosaur extends EntityScript
  assets: ->
    @loadAssets('dinosaur')

  spawnLocation: (options) ->
    x = Crafty.viewport.width + 40
    x = options.x if options.x
    x = x * Crafty.viewport.width if x < 2 and x > -2
    x = Crafty(options.startAt).get(0).x if options.startAt
    x += options.dx if options.dx

    y = Crafty.viewport.height * .4
    y = options.y if options.y
    y = y * Crafty.viewport.height if y < 2 and y > -2
    y = Crafty(options.startAt).get(0).y if options.startAt
    y += options.dy if options.dy
    return { x, y}

  spawn: (options) ->
    location = @spawnLocation({ x: .9, y: 350 })

    #floor = Crafty.e('2D, WebGL, Color').color('#FFFFFF')
      #.attr(x: 50, y: 502, w: 800, h: 40)

    dino = Crafty.e('Dinosaur, KeepAlive').dinosaur(
      x: location.x
      y: location.y
      defaultSpeed: 80
    )
    #window.dino = dino
    dino

  execute: ->
    @sequence(
      @invincible yes

      @while(
        @moveTo x: -.2
        @action 'run'
      )
    )

module.exports = {
  default: Dinosaur
}
