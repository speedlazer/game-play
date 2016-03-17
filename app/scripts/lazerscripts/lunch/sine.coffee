Game = @Game
Game.Scripts ||= {}

class Game.Scripts.Sine extends Game.EntityScript

  spawn: ->
    Crafty.e('OldDrone').drone(
      health: 200
      x: Crafty.viewport.width + 40
      y: 200
      speed: 250
    )

  execute: ->
    @movePath [
      [.78,  .315]
      [.625, .468]
      [.468, .625]
      [.312, .468]
      [.156, .315]
      [0,    .468]
      [-.3,  .625]
    ], rotate: no

