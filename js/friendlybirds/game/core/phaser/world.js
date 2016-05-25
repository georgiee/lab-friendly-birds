define(['augment','phaser','game/core/phaser/camera','debugPanel'], function(augment, Phaser, BetterCamera, debugPanel){
  var BetterWorld = augment(Phaser.World, function(uber){
    this.constructor = function(){
      uber.constructor.apply(this, arguments);
    }

    this.boot = function () {
      this.camera = new BetterCamera(this.game, 0, 0, 0, this.game.width, this.game.height);
      this.camera.displayObject = this;
      this.camera.scale = this.scale;
      this.game.camera = this.camera;
      this.game.stage.addChild(this);
    };


    this.add = function (child, silent) {
      //console.log('----add', arguments)
      uber.add.apply(this, arguments);
    }

    this.addChild = function (child, silent) {
      //console.log('----addChild', arguments)
      uber.addChild.apply(this, arguments);
    }
  });

  return BetterWorld;
});