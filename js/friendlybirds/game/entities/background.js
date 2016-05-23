define(['augment','phaser'], function(augment, Phaser){
  var ParallaxBackground = augment(Phaser.Group, function(uber){
    this.constructor = function(world, width, height){
      uber.constructor.call(this, world);

      this.backgroundWidth = 700;
      this.fixedToCamera = true;
      this.build();
    }

    this.setWidth = function(width){
      this.width = width
      this.backgroundWidth = width;
      this.skyLayer.width = width;
      this.groundLayer.width = width;
      this.grassLayer.width = width;
    }
    this.update = function(){
      var posx = -this.game.camera.x;
      this.cameraOffset.y = -this.game.camera.y;
      this.skyLayer.tilePosition.x = posx;
      this.groundLayer.tilePosition.x = posx;
      this.grassLayer.tilePosition.x = posx;
    }

    this.build = function(){
      //this.pivot.y = 191 + 51;
      
      this.skyLayer = this.game.make.tileSprite(0,0, this.backgroundWidth, 293, 'theme_01_theme_1', 'BACKGROUND_1_LAYER_1.png');
      this.skyLayer.anchor.set(0,1);
      this.add(this.skyLayer);

      //var bg = this.game.make.sprite(0, 0, 'theme_01_theme_1', 'BACKGROUND_1_LAYER_1.png');      
      //this.add(bg);
      this.groundLayer = this.game.make.tileSprite(0, 0, this.backgroundWidth, 191, 'theme_01_theme_1', 'FOREGROUND_1_LAYER_1.png');
      this.add(this.groundLayer);

      this.grassLayer = this.game.make.tileSprite(0,-51, this.backgroundWidth, 52, 'theme_01_parallax_1', 'BACKGROUND_1_LAYER_3.png');
      this.add(this.grassLayer);

      //this.game.physics.box2d.enable(this.groundLayer);
      //this.groundLayer.body.static = true;
      var rectangle = new Phaser.Physics.Box2D.Body(this.game, null, 0, 0, 0.5);
      console.log(this.game.world.width)
      rectangle.setRectangle(this.game.world.width, 200, this.game.world.width/2, 100, 0);
    }
  });

  return ParallaxBackground;
})