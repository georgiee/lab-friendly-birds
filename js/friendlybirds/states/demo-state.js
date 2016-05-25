define(['augment','pixi','game/game-session','entities/slingshot','entities/polygon','particle','utils/point','debug/panel','Q', 'particles/container'],
  function(augment, PIXI, gameSession, Slingshot, Polygon, Particle, Point, debugPanel, Q, ParticleContainer){

  var minimap, world, physics, game;
  var birdBoomerang;

  var categorgies = {
    DEFAULT:     0x0001,
    BOUNDARY:          0x8000,
    FRIENDLY_SHIP:     0x0002,
    ENEMY_SHIP:        0x0004,
    FRIENDLY_AIRCRAFT: 0x0008,
    ENEMY_AIRCRAFT:    0x0010
  }
  
  var preload = function(cb){
    var loader = PIXI.loader
    .add('origin',"assets/images/origin.png")
    .add('polygons',"assets/polygon.json")
    .add('kenny',"spritesheets/remake/kenny.json")
    .add('other',"spritesheets/remake/other.json")
    .add('ground','assets/ground.png')
    .add('particle_brush','assets/particles/particle_brush.png')
    .add('theme_01_parallax_1','spritesheets/remake/theme_01_parallax_1.json')
    .add('theme_01_theme_1','spritesheets/remake/theme_01_theme_1.json')
    .load(function(loader){
      cb(loader.resources)
    });
  }

  var update = function(){
    var target = birdBoomerang.body;

    if(debugPanel.params.physics.raycasting){
      raycast(target);
    }
  }


  var createParticle = function(x,y, force){
    var particle = new Particle(x,y,force)
    world.addChild(particle);

    particle.play();
  }

  var cb = function(){
      var contact = arguments[4];
      
      var manifold = contact.m_manifold.localPoint;
      var contactPoint = contact.m_fixtureA.m_body.GetWorldPoint(contact.m_manifold.localPoint, new box2d.b2Vec2())
      var x = game.physics.mpx(-contactPoint.x)
      var y = game.physics.mpx(-contactPoint.y)
      var impulse = arguments[5].normalImpulses;

      impulse = new Point(impulse[0], impulse[1]);
      if(impulse.lengthSq() > 5){
        createParticle(x,y, impulse.length());
      }

    }

  var addWater = function(resources){
    //return;
    var particleContainer = new ParticleContainer(resources.particle_brush.texture);
    particleContainer.test();  
    world.addChild(particleContainer);
  }

  var raycast = function(target){
      var worldCenter = target.getWorldCenter();
      var numRays = 50;
      var center = {x:worldCenter.x, y: worldCenter.y};
      game.physicsDebugDraw.clearLines();
      
      var targetMass = target.mass;
      var targetCenter = target.getWorldCenter();

      for (var i = 0; i < numRays; i++) {
          var angle = (i / numRays) * 2*Math.PI;
          var rayEnd = Point.fromAngle(angle, 500).add(center)
          var result = physics.raycast( center.x, center.y, rayEnd.x,rayEnd.y, true );
          if(result){
            var body = result.body;
            
            if(body && body.dynamic){
              //now pull!
              
              var currentMass = body.mass;
              var currentCenter = body.getWorldCenter();

              var delta = Point.subtract(currentCenter, targetCenter);
              var distance = delta.length();
              
              force = distance/50;
              delta.normalize();

              body.applyForce(  -force * delta.x, -force * delta.y);
              target.applyForce(  force * delta.x, force * delta.y);
              if(debugPanel.params.physics.debug){
                game.physicsDebugDraw.line(center,result.point, 0x00ffff,0.5);
              }
            }else{
              if(debugPanel.params.physics.debug){
                game.physicsDebugDraw.line(center,result.point, 0x0000ff,0.5);
              }
            }
          }
      }
    }

  var run = function(g, resources){
    console.log('run DemoState');
    game = g;
    minimap = game.minimap;
    world = game.world;
    physics = game.physics;

    var slingshot = new Slingshot();
    world.addChild(slingshot);

    var birdRed = PIXI.Sprite.fromFrame('kenny/parrot');
    birdRed.scale.set(0.25)
    birdRed.anchor.set(0.5);
    birdRed.position.set(0,-100)
    world.addChild(birdRed);
    minimap.add(birdRed)

    var birdYellow = PIXI.Sprite.fromFrame('kenny/giraffe');
    birdYellow.scale.set(0.25);
    birdYellow.anchor.set(0.5, 1);
    birdYellow.position.set(100,0);
    world.addChild(birdYellow);
    minimap.add(birdYellow)
    

    birdBoomerang = PIXI.Sprite.fromFrame('kenny/pig');
    birdBoomerang.scale.set(0.4);
    birdBoomerang.anchor.set(0.5, 1);
    birdBoomerang.position.set(350,-1000);
    world.addChild(birdBoomerang);
    minimap.add(birdBoomerang)
    
    for(var i = 0; i < 30;i++){
        var birdBlue = PIXI.Sprite.fromFrame('kenny/penguin');
        birdBlue.anchor.set(0.5);
        birdBlue.scale.set(0.15);
        birdBlue.position.set(400 + i*5,-100*(i%5)-300-100*Math.random())
        world.addChild(birdBlue);
        minimap.add(birdBlue)

        physics.enableBody(birdBlue);
        birdBlue.body.clearFixtures();
        birdBlue.body.addCircle(birdBlue.width/2)
        birdBlue.body.setCollisionCategory(categorgies.ENEMY_SHIP)
        //birdBlue.body.setCollisionMask(categorgies.BOUNDARY | categorgies.DEFAULT | categorgies.FRIENDLY_SHIP)
    }

    var pillar = PIXI.Sprite.fromFrame('kenny/grassBlock_dead');
    pillar.anchor.set(0.5, 1);
    pillar.scale.set(3.0);
    pillar.position.set(1300,-pillar.height/2);
    world.addChild(pillar);
    minimap.add(pillar)
    
    physics.enableBody(pillar);
    pillar.body.static = true;

    var origin = PIXI.Sprite.fromFrame('assets/images/origin.png');
    origin.anchor.set(0.5);
    origin.position.set(0);
    //world.addChild(origin);

    var block = PIXI.Sprite.fromFrame('kenny/mouse_walk');
    block.scale.set(2)
    block.anchor.set(0.5, 0);
    block.position.set(1500,-block.height/2)

    world.addChild(block);
    minimap.add(block)

    var poly = new Polygon(resources.ground.texture, resources.polygons.data.test);
    poly.body.y = -230;
    poly.body.x = 2000;
    world.addChild(poly);
    minimap.add(poly)
    
    var poly3 = new Polygon(resources.ground.texture, resources.polygons.data.eimer);
    poly3.body.y = -330;
    poly3.body.x = 800;
    world.addChild(poly3);
    minimap.add(poly3)

    physics.enableBody(block);
    block.body.static = true;

    addWater(resources)

    //var particleRenderer = new ParticleRenderer(resources.particle_brush.texture);
    //world.addChild(particleRenderer);
    

    physics.enableBody(birdRed);
    physics.enableBody(birdYellow);
    physics.enableBody(birdBoomerang);
    
    birdYellow.body.clearFixtures();
    birdYellow.body.addCircle(birdYellow.width/2)
    
    slingshot.setTarget(birdYellow);

    birdBoomerang.body.clearFixtures();
    birdBoomerang.body.addCircle(birdBoomerang.width/2)

    birdRed.body.applyForce(1000,-100);

    birdBoomerang.body.setCollisionCategory(categorgies.FRIENDLY_SHIP)
    birdBoomerang.body.setCollisionMask(categorgies.BOUNDARY | categorgies.DEFAULT | categorgies.ENEMY_SHIP)
    birdBoomerang.body.setCategoryPostsolveCallback(categorgies.ENEMY_SHIP, cb, this);
    
    birdRed.body.setCollisionCategory(categorgies.ENEMY_SHIP)
    birdRed.body.setCollisionMask(categorgies.BOUNDARY | categorgies.DEFAULT | categorgies.FRIENDLY_SHIP)

    birdYellow.body.setCollisionCategory(categorgies.ENEMY_SHIP)

    return {
     birdYellow: birdYellow,
     birdRed: birdRed,
     slingshot: slingshot,
     birdBoomerang: birdBoomerang,
     pillar: pillar
    }
  }

  return {
    preload: preload,
    update: update,
    run: run
  }
})