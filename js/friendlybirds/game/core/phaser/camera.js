define(['augment','phaser'], function(augment, Phaser){
  var BetterCamera = augment(Phaser.Camera, function(uber){
    this.constructor = function(game, id, x, y, width, height){
      uber.constructor.apply(this, arguments);
    }

    this.zoom = function(value){
      this.scale.set(value);
    }
  });

  return BetterCamera;
});