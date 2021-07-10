const Component = "Buffs";

Crafty.c(Component, {
  init() {
    this.buffs = {};
  },

  /*
   * {
   *   cost: { energy: 100 },
   *   duration: 1, // seconds
   *   cooldown: 0.8 // seconds
   * }
   */
  defineBuff(name, settings) {
    const existingBuff = this.buffs[name];
    this.buffs[name] = {
      activeLeft: 0,
      cooldown: 0,
      ...existingBuff,
      settings
    };
  },

  buffStatus(name) {
    return this.buffs[name];
  },

  buffActive(name) {
    return this.buffs[name].activeLeft > 0;
  },

  canActivateBuff(name) {
    const buff = this.buffs[name];
    if (!buff) return false;
    if (buff.cooldown > 0) return false;
    if (buff.activeLeft > 0) return false;
    const cost = buff.settings.cost;
    const canPay = Object.entries(cost).every(
      ([key, amount]) => this[key] >= amount
    );
    if (!canPay) return false;
    return true;
  },

  activateBuff(name) {
    const buff = this.buffs[name];
    if (!this.canActivateBuff(name)) return false;
    const cost = buff.settings.cost;

    // Pay costs
    Object.entries(cost).every(([key, amount]) => (this[key] -= amount));
    this.buffs[name].activeLeft = buff.settings.duration * 1000;
    this.trigger("BuffActivated", name);

    this.uniqueBind("GameLoop", this._handleBuffs);
  },

  _handleBuffs({ dt }) {
    let buffsHandled = 0;

    Object.entries(this.buffs).every(([name, data]) => {
      if (data.activeLeft > 0) {
        buffsHandled++;
        data.activeLeft = Math.max(data.activeLeft - dt, 0);
        if (data.activeLeft === 0) {
          data.cooldown = data.settings.cooldown * 1000;
          this.trigger("BuffEnded", name);
        }
      } else if (data.cooldown > 0) {
        buffsHandled++;
        data.cooldown = Math.max(data.cooldown - dt, 0);
        if (data.cooldown === 0) {
          this.trigger("CooldownEnded", name);
        }
      }
    });
    if (buffsHandled === 0) {
      this.unbind("GameLoop", this._handleBuffs);
    }
  }
});

export default Component;
