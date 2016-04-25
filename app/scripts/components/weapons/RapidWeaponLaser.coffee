Crafty.c 'RapidWeaponLaser',
  init: ->
    @requires '2D,WebGL,Color'
    @color '#808080'
    @attr
      w: 30
      h: 5

    @stats =
      rapid: 0
      damage: 0
      aim: 0
      speed: 0

    @lastShot = 0
    @shotsFired = 0
    @burstCount = Infinity
    @frontFire = yes

  remove: ->
    @unbind 'GameLoop', @_autoFire

  install: (@ship) ->
    @attr
      x: @ship.x + 15
      y: @ship.y + 26
      z: @ship.z + 1
      alpha: 0
    @ship.attach this

    @shooting = no
    @_determineWeaponSettings()

    @bind 'GameLoop', @_autoFire

  uninstall: ->
    @attr alpha: 0
    @unbind 'GameLoop', @_autoFire

  upgrade: (aspect) ->
    @stats[aspect] += 1

    @_determineWeaponSettings()
    @trigger('levelUp', aspect: aspect, level: @stats[aspect])

  _determineWeaponSettings: ->
    @cooldown = 200 - (@stats.rapid * 10)
    @damage = 100 + (@stats.damage * 25)
    @aimAngle = 0 + (@stats.aim * 3)
    @aimDistance = Math.min(40 + (@stats.aim * 20), 500)
    @speed = 650 + (@stats.speed * 25)

    levels = (value for k, value of @stats)
    @overallLevel = Math.min(levels...)

  shoot: (onOff) ->
    if onOff
      @shooting = yes
    else
      @shooting = no
      @shotsFired = 0
      @lastShot = 500

  _autoFire: (fd) ->
    @lastShot += fd.dt
    return unless @shooting
    allowBullet = (@shotsFired < @burstCount)
    return unless @ship.weaponsEnabled
    return unless allowBullet
    if @lastShot > @cooldown
      if @frontFire
        @_createFrontBullet()
      else
        @_createBackBullet()
      Crafty.audio.play('shoot', 1, .05)
      @frontFire = !@frontFire
      @lastShot = 0
      @shotsFired += 1

  _createFrontBullet: ->
    settings =
      w: 6, speed: @speed, h: 3 + @overallLevel, o: @overallLevel

    start =
      x: @x + @w
      y: @y + (@h / 2) - (settings.h / 2) + 1 + settings.o
    Crafty.e('Bullet')
      .attr
        w: settings.w
        h: settings.h
        x: start.x
        y: start.y
        z: 1
      .fire
        origin: this
        damage: @damage
        speed: @ship._currentSpeed.x + settings.speed
        direction: @_bulletDirection(start)
      .bind 'HitTarget', (target) =>
        @ship.trigger('BulletHit', target)
      .bind 'DestroyTarget', (target) =>
        @ship.trigger('BulletDestroyedTarget', target)

  _createBackBullet: ->
    settings =
      w: 5, speed: @speed, h: 2 + @overallLevel, o: @overallLevel

    start =
      x: @x + @w
      y: @y + (@h / 2) - (settings.h / 2) - 2 - settings.o
    Crafty.e('Bullet')
      .attr
        w: settings.w
        h: settings.h
        x: start.x
        y: start.y
        z: -1
      .fire
        origin: this
        damage: @damage
        speed: @ship._currentSpeed.x + settings.speed
        direction: @_bulletDirection(start)
      .bind 'HitTarget', (target) =>
        @ship.trigger('BulletHit', target)
      .bind 'DestroyTarget', (target) =>
        @ship.trigger('BulletDestroyedTarget', target)

  _bulletDirection: (start) ->
    list = []
    Crafty('Enemy').each ->
      list.push({ x: @x, y: @y + (@h / 2) }) unless @has('Projectile') or @hidden

    pickedAngle = 0
    pickedDistance = Infinity
    for item in list
      angle = Math.atan2(item.y - start.y, item.x - start.x)
      angle *= 180 / Math.PI
      item.angle = angle
      item.distance = Math.abs(start.x - item.x) + Math.abs(start.y - item.y)
      if -@aimAngle < angle < @aimAngle
        if item.distance < pickedDistance
          pickedDistance = item.distance
          pickedAngle = angle

    pickedAngle

