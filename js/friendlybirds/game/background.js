define(['augment','pixi','underscore','utils/point','utils/rectangle','game/game-session','game/background-layer','physics/body','box2d'],
  function(augment, PIXI, _, Point, Rectangle, GameSession, BackgroundLayer, Body, box2d){
  var Background = augment(PIXI.Container, function(uber){
    this.constructor = function(width, worldBounds){
      uber.constructor.apply(this, arguments);
      this.worldBounds = worldBounds;
      this.screenWidth = width;
      this.layers = []
      this.build();
    }
    
    this.build = function(){
      var layer;

      //sky
      this.addLayer("BACKGROUND_1_LAYER_1",{
        anchor: [0,1],
        z: 500,
        height: -this.worldBounds.y,
        fillColor: 0x92ccde
      });

      //middle
      this.addLayer("BACKGROUND_1_LAYER_2",{
        anchor: [0,1],
        z: 250,
        height: -this.worldBounds.y
      });

      //grass
      this.addLayer("FOREGROUND_1_LAYER_1", {
        height: this.worldBounds.height + this.worldBounds.y,
        fillColor: 0xc58f5c
      });
      
      this.addLayer("BACKGROUND_1_LAYER_3",{
        anchor: [0,1]
      });
      
      this.addLayer("FOREGROUND_1_LAYER_2",{
        anchor: [0,1]
      });

      this.createBody();  
    }
    
    this.createBody = function(){
      var world = GameSession.physicsWorld;

      var platformBody = new Body(undefined,0,0,0, world);
      var polygonShape = new box2d.b2PolygonShape();
      
      var boundThickness = world.pxm(200);

      var w = world.pxm(this.worldBounds.width/2)
      var h = boundThickness
      var x = world.pxm(-this.worldBounds.x - this.worldBounds.width/2)
      var y = -h;
      polygonShape.SetAsBox(w, h, new box2d.b2Vec2( x, y),0);

      var fixtureDef = new box2d.b2FixtureDef();
      fixtureDef.shape = polygonShape;
      fixtureDef.friction = world.friction;
      fixtureDef.restitution = world.restitution;
      fixtureDef.density = world.density;
      
      fixtureDef.filter.categoryBits = 0x8000;
      fixtureDef.filter.maskBits = 0xFFFF;
      var f = platformBody.data.CreateFixture(fixtureDef);
      f.id = world.getNextFixtureId();
    }

    this.addLayer = function(frame, options){
      var layer = new BackgroundLayer(frame, _.extend(options, {width: this.screenWidth}) );
      this.addChild(layer);
      this.layers.push(layer);

      return layer;
    }

    this.update = function(){
      var layer, camera = GameSession.game.camera;

      for(var i = 0, l = this.layers.length; i < l; i++){
        layer = this.layers[i];
        layer.update(camera);
      }
    }
  });

  return Background;
})