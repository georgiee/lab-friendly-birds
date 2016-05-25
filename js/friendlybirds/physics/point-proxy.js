define(['augment'], function(augment){
  var Proxy = augment.defclass({
    constructor: function(world, object, gettor, settor){
      this.world = world;
      this.object = object;
      this.gettor = gettor;
      this.settor = settor;
    }
  });

  Object.defineProperty(Proxy.prototype, "x", {

      get: function () {

          return this.world.mpx(-this.gettor.call(this.object).x);

      },

      set: function (value) {
          
          var v = this.gettor.call(this.object);
          v.x = this.world.pxm(-value);
          this.settor.call(this.object, v);

      }

  });

  /**
  * @name Proxy#y
  * @property {number} y - The y property of this PointProxy.
  */
  Object.defineProperty(Proxy.prototype, "y", {

      get: function () {

          return this.world.mpx(-this.gettor.call(this.object).y);

      },

      set: function (value) {

          var v = this.gettor.call(this.object);
          v.y = this.world.pxm(-value);
          this.settor.call(this.object, v);

      }

  });

  return Proxy;
});