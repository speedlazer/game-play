const component = "Overlap";

export default component;

Crafty.c(component, {
  required: "2D,  Collision",

  events: {
    UpdateFrame() {
      const covered = [0];
      const sunArea = this.area();

      const collisions = this.hit(this.checkCollission);
      if (collisions) {
        collisions.forEach(o => {
          const e = o.obj;
          const xMin = Math.max(this.x, e.x);
          const xMax = Math.min(this.x + this.w, e.x + e.w);
          const w = xMax - xMin;
          const yMin = Math.max(this.y, e.y);
          const yMax = Math.min(this.y + this.h, e.y + e.h);
          const h = yMax - yMin;
          covered.push(w * h * 1.7);
        });
      }

      const maxCoverage = Math.max(...covered) * 1.7;

      const perc = maxCoverage > sunArea ? 1 : maxCoverage / sunArea;
      const glareLink =
        this.glareLink || this.getElementByKey(this.applyAlphaTo);

      glareLink.alpha = (1 - perc) * glareLink.maxAlpha;
    }
  }
});
