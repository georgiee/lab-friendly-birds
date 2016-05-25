define(['augment','pixi', 'utils/point'], function(augment, PIXI, Point){
  
  var BackgroundLayer = augment(PIXI.Container, function(uber){
    this.constructor = function(frameID, options){
      uber.constructor.apply(this);
      var options = options || {};
      this.z = options.z || 0;
      this.screenDimensions = {width: options.width, height: options.height};
      this.filled = false;
      this.options = options;

      if(options.fillColor){
        this.filled = true;
        this.fillColor = options.fillColor;
      }
      
      this.build(frameID);
    }
    
    this.buildFilling = function(){
      var bgFilled = new PIXI.Graphics();
      bgFilled.beginFill(this.fillColor);
      bgFilled.drawRect(0,0,100,100);
      this.addChild(bgFilled);
      this.bgFilled = bgFilled
    }

    this.build = function(frameID){
      if(this.filled){
        this.buildFilling();
      }

      var frame = PIXI.Texture.fromFrame(frameID);
      this.tilingSprite = new PIXI.extras.TilingSprite(frame, this.screenDimensions.width, frame.height);
      this.addChild(this.tilingSprite);

      if(this.options.anchor){ 
        this.tilingSprite.anchor.set(this.options.anchor[0], this.options.anchor[1]);
      }
    }
    
    this.update = function(camera){
      var cameraTopLeft = camera.worldToScreen(Point.ZERO);
      var viewport = camera.getViewport();
      var depthRatio =  (1000 - this.z)/1000;
      this.tilingSprite.width = this.screenDimensions.width / camera.zoom;
      this.tilingSprite.x = cameraTopLeft.x;
      this.tilingSprite.tilePosition.set(-viewport.x * depthRatio, 0);

      if(this.filled){
        this.bgFilled.width = this.screenDimensions.width / camera.zoom;
        this.bgFilled.height = this.screenDimensions.height;
        
        this.bgFilled.pivot.set(0, 100*this.tilingSprite.anchor.y)
        this.bgFilled.position.set(cameraTopLeft.x, 0)

      }
    }

  });

  return BackgroundLayer;
})