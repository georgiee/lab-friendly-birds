define(['augment', 'box2d', 'pixi','game/game-session','particles/renderer','debug/panel','particles/water-filter'], function(augment, box2d, PIXI, gameSession, Renderer, debugPanel, WaterFilter){
  
  Renderer.register();

  var pxm = function(value){
    return value/50;
  }

  var mpx = function(value){
    return value*50;
  }

  var ParticleContainer = augment(PIXI.Container, function(uber){
    
    this.constructor = function(texture){
      uber.constructor.call(this);
      
      this._texture = texture;
      this._particleSystem = gameSession.game.physics.m_particleSystem;
      this.filterArea = new PIXI.Rectangle(0,0,900,500)
      //this.size = new math.Rectangle( 0, 0, renderer.width, renderer.height );
      debugPanel.gui.add(this,'test').name('Reset Water')
      
      //postprocesing
      this.waterFilter = new WaterFilter();
      this.filters = [this.waterFilter];
    }

    this.test = function(){
      var physics = gameSession.game.physics;
      var mColor = new box2d.b2ParticleColor(30, 50, 255, 0x55);

      var pgd = new box2d.b2ParticleGroupDef();
      pgd.position.x = pxm(-900);
      pgd.position.y = pxm(200);

      //glibber: box2d.b2ParticleFlag.b2_viscousParticle
      //pudding: box2d.b2ParticleFlag.b2_waterParticle | box2d.b2ParticleFlag.b2_elasticParticle
      box2d.b2ParticleFlag.b2_waterParticle;

      pgd.color.Copy(mColor);

      var shape = new box2d.b2PolygonShape();
      var width = pxm(200);
      var height = pxm(200);

      shape.SetAsBox(width/2,height/2, new box2d.b2Vec2(0, height/2), 0.0);
      pgd.shape = shape;

      this.addParticles(pgd);
    }

    this.addParticles = function(pgd){
      this._particleSystem.CreateParticleGroup(pgd);
      console.log('total particle count', this._particleSystem.GetParticleCount() )
    }
    
    this._renderWebGL = function(renderer){
      renderer.setObjectRenderer( renderer.plugins.box2dParticleRenderer );
      renderer.plugins.box2dParticleRenderer.render( this );
    }

    this.renderWebGL = function (renderer){

        var i, j;

        renderer.currentRenderer.flush();
        
        // push filter first as we need to ensure the stencil buffer is correct for any masking
        if (this._filters)
        {
            renderer.filterManager.pushFilter(this, this._filters);
        }

        renderer.currentRenderer.start();

        // add this object to the batch, only rendered if it has a texture.
        this._renderWebGL(renderer);

        // now loop through the children and make sure they get rendered
        for (i = 0, j = this.children.length; i < j; i++)
        {
            //this.children[i].renderWebGL(renderer);
        }
        renderer.currentRenderer.flush();


        if (this._filters)
        {
            renderer.filterManager.popFilter();

        }
        renderer.currentRenderer.start();
    };

  });

  return ParticleContainer;
});