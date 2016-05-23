define(['augment', 'pixi'], function(augment, PIXI){
  var DebugSprite = augment(PIXI.Sprite, function(uber){
    this.constructor = function(width, height){
      this.buffer = new PIXI.CanvasBuffer(width, height);
      this.ttexture = PIXI.Texture.fromCanvas(this.buffer.canvas);
      this.autoUpdate = true;
      uber.constructor.call(this, this.ttexture);

      this.overlay = new PIXI.Graphics();
      this.addChild(this.overlay);
    }
    this.clearLines = function(){
      this.overlay.clear();
    }

    this.line = function(p1,p2, color, alpha){
      var color = color || 0xff0000;
      var alpha = alpha || 1;
      this.overlay.lineStyle(1, color, alpha);
      this.overlay.moveTo(p1.x,p1.y);
      this.overlay.lineTo(p2.x,p2.y);
    }
    
    this.dot = function(p, size){
      var size = size || 10;
      this.overlay.beginFill(0xff0000)
      this.overlay.moveTo(p.x,p.y);
      this.overlay.arc(p.x,p.y, size, 0, Math.PI*2);
    }

    this.render = function(physics, camera, disabled){
      this.overlay.x = camera.transform.tx;
      this.overlay.y = camera.transform.ty;
      this.overlay.scale.set(camera.zoom)
      //this.overlay.transform = camera.
      //force update for webgl
      if(this.autoUpdate){
        this.ttexture.update();
      }
      
      this.buffer.clear();
      
      if(!disabled){
        physics.renderDebugDraw(this.buffer.context, camera.getMatrix());
      }
    }

  });

  return DebugSprite;
})