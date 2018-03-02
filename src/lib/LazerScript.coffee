extend = require('lodash/extend')
isObject = require('lodash/isObject')
isEmpty = require('lodash/isEmpty')
Core = require('./script_modules/core').default
Level = require('./script_modules/level').default
Entity = require('./script_modules/entity').default
Colors = require('./script_modules/colors').default
LevelTemplate = require('./script_templates/level').default
Synchronizer = require('src/lib/Synchronizer').default
{ lookup } = require('src/lib/random')

class LazerScript
  constructor: (@level) ->

  run: (args...) ->
    @currentSequence = lookup()
    @options = args[0] ? {}
    @startAtCheckpoint = @options.startAtCheckpoint
    @currentCheckpoint = 0

    loadingAssets = WhenJS(true)
    if @assets?
      loadingAssets = @assets(@options)(@currentSequence)

    loadingAssets.then => @initialize(args...)

  end: ->
    @currentSequence = null

  initialize: (args...) ->
    Crafty('LoadingText').destroy()
    Crafty.bind 'PlayerDied', @_endScriptOnGameOver
    WhenJS(@execute(args...)(@currentSequence)).finally =>
      Crafty.unbind 'PlayerDied', @_endScriptOnGameOver

  execute: ->

  _endScriptOnGameOver: =>
    playersActive = no
    Crafty('Player ControlScheme').each ->
      playersActive = yes if @lives > 0

    unless playersActive
      @currentSequence = null

extend(
  LazerScript::
  Core
  Level
  Colors
  LevelTemplate
)

# Could these be merged? V ^

class EntityScript extends LazerScript

  initialize: (args...) ->
    @boundEvents = []
    args.push {} if isEmpty args

    @entity = @spawn(args...)
    if @options.attach
      attachIndex = (@options.attachOffset || 0) + @options.index
      attachPoint = Crafty(@options.attach).get(attachIndex)
      attachPoint.attach(@entity)
      @entity.attr({
        x: attachPoint.x + (@options.attachDx || 0)
        y: attachPoint.y + (@options.attachDy || 0)
        z: attachPoint.z
      })

    if isObject(args[0]) and args[0].identifier?
      identifier = args[0].identifier# + args[0].index
      @entity.addComponent(identifier)
    @synchronizer = @options.synchronizer ? new Synchronizer
    @synchronizer.registerEntity this

    unless @entity?
      @synchronizer.unregisterEntity this
      return WhenJS({ alive: no, killedAt: (new Date), location: null })

    unless @entity.has('PlayerControlledShip')
      @entity.attr
        x: @entity.x
        y: @entity.y

    @entity.unbind('Cleanup')
    @entity.unbind('Destroyed')
    @entity.bind 'Cleanup', =>
      if @entity.deathDecoy
        @cleanupDecoy(@entity)
      else
        @cleanup(@entity)

    @entity.bind 'Destroyed', =>
      @currentSequence = null
      @synchronizer.unregisterEntity(this)
      @enemy.location.x = @entity.x
      @enemy.location.y = @entity.y
      @enemy.alive = no
      @enemy.killedAt = new Date

    @enemy =
      moveState: 'air'
      alive: yes
      location: {}
      chainable: @entity.chainable
    #else
      #@enemy =
        #moveState: 'air'
        #alive: no
        #location: {}

    super
      .catch (e) =>
        throw e unless e.message is 'sequence mismatch'
        # Only wait for alternate path if still alive
        @alternatePath if @enemy.alive
      .finally =>
        @_unbindSequences()
        if @enemy.alive and !@entity.has('KeepAlive')
          @cleanup(@entity)
      .then =>
        Crafty.trigger('EntityEndState', @enemy)
        @enemy

  spawn: ->
  spawnDecoy: (options) -> @spawn(options)

  cleanup: (entity) ->
    if entity.hasPool
      entity.recycle()
    else
      entity.destroy()

  cleanupDecoy: (entity) ->
    @cleanup(entity)

extend(
  EntityScript::
  Entity
)

module.exports = {
  LazerScript
  EntityScript
}
