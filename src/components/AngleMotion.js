const AngleMotion = "AngleMotion";

Crafty.c(AngleMotion, {
  properties: {
    velocity: {
      set: function(value) {
        this._velocity = value;
        this._setAngleAndSpeed(this._angle, this._velocity);
      },
      get: function() {
        return this._velocity;
      },
      configurable: true,
      enumerable: true
    },
    _velocity: { value: 0, writable: true, enumerable: false },

    angle: {
      set: function(value) {
        this._angle = value;
        this._setAngleAndSpeed(this._angle, this._velocity);
      },
      get: function() {
        return this._angle;
      },
      configurable: true,
      enumerable: true
    },
    _angle: { value: 0, writable: true, enumerable: false }
  },

  _setAngleAndSpeed(angle, speed) {
    if (speed === 0) {
      this.attr({
        vy: 0,
        vx: 0
      });
      return;
    }
    this.attr({
      vy: -Math.sin((angle / 180) * Math.PI) * speed,
      vx: -Math.cos((angle / 180) * Math.PI) * speed
    });
  }
});

export default AngleMotion;
