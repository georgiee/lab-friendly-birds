define(['augment','box2d','game/game-session','physics/body','physics/point-proxy','physics/debug-draw','debug/panel','physics/contact-listener','physics/callbacks/raycast-callback','physics/particle-emitter'],
  function(augment, box2d, gameSession, Body, PointProxy, DebugDrawer, debugPanel, DefaultContactListener, RayCastCallback, ParticleEmitter){

  var Box2D = augment.defclass({
    constructor: function(){
      this.frameRate = 1 / 60;
      this.velocityIterations = 8;
      this.positionIterations = 3;
      this.ptmRatio = 50;

      this.world = new box2d.b2World(new box2d.b2Vec2(0, -10));
      this.debugDraw = new DebugDrawer(this.mpx(1));
      this.debugDraw.centerOfMass = true;
      this.debugDraw.particles = false;
      //this.debugDraw.shapes = true;
      this.debugDraw.joints = true;
      //this.debugDraw.aabbs = true;
      //this.debugDraw.pairs = true;
      this.world.SetDebugDraw(this.debugDraw);

      this.nextFixtureId = 0;
      this.nextBodyId = 0;

      this.friction = 0.8;
      this.restitution = 0.5;
      this.density = 1.0;

      this.gravity = new PointProxy(this, this.world, this.world.GetGravity, this.world.SetGravity);

      this.contactListener = new DefaultContactListener();
      this.world.SetContactListener(this.contactListener);

      var bd = new box2d.b2BodyDef();
      this.mouseJointBody = this.world.CreateBody(bd);

      this._toRemove = [];

      this.createParticleSystem();
    },
    
    createParticleSystem: function(){
      var particleSystemDef = new box2d.b2ParticleSystemDef();
      particleSystemDef.maxCount = 500;
      particleSystemDef.density = 1.2;
      particleSystemDef.radius = 0.1;
      particleSystemDef.gravityScale = 1;
      particleSystemDef.dampingStrength = 1;

      this.m_particleSystem = this.world.CreateParticleSystem(particleSystemDef);
      this.m_particleSystem.SetDestructionByAge(true);
    },

    removeBodyNextStep: function (body) {
      this._toRemove.push(body);
    },
    
    preUpdate: function () {
        var i = this._toRemove.length;

        while (i--)
        {
            this.removeBody(this._toRemove[i]);
        }

        this._toRemove.length = 0;

    },
    removeBody: function (body) {
        if (body.data.world == this.world)
        {
            this.world.DestroyBody(body.data);

        }

        return body;

    },
    enableBody: function (object) {
      object.body = new Body(object, object.x, object.y, 2, this);
      object.anchor.set(0.5);
      this.last = object;
    },
    test: function(){
      for (var b = this.world.GetBodyList(); b; b = b.GetNext())
        {
            console.log(b)
        }
    },
    
    update: function () {
      if(debugPanel.params.physics.paused) return;
      
      this.world.Step(this.frameRate, this.velocityIterations, this.positionIterations);
    },

    renderDebugDraw: function(context, mat) {
        var world = this.world;
        this.debugDraw.start(context, mat);
        world.DrawDebugData();
        this.debugDraw.stop();
    },

    mpx: function (v) {

        return v *= this.ptmRatio;

    },

    pxm: function (v) {

        return v / this.ptmRatio;

    },
    
    createBody: function (x, y, density) {

        var body = new Body(null, x, y, density, this);

        return body;

    },
    getNextBodyId: function () {

      var id = this.nextBodyId;
      this.nextBodyId += 1;
      return id;

    },
    getNextFixtureId: function () {

        var id = this.nextFixtureId;
        this.nextFixtureId += 1;
        return id;

    },

    raycast: function (x1, y1, x2, y2, closestHitOnly, filterFunction) {
        
        if ( typeof closestHitOnly === 'undefined' ) { closestHitOnly = true; }
        if ( typeof filterFunction === 'undefined' ) { filterFunction = null; }
        
        x1 = this.pxm(-x1);
        y1 = this.pxm(-y1);
        x2 = this.pxm(-x2);
        y2 = this.pxm(-y2);

        var point1 = new box2d.b2Vec2(x1, y1);
        var point2 = new box2d.b2Vec2(x2, y2);
        
        var output = [];

        var callback = new RayCastCallback(this, closestHitOnly, filterFunction);

        this.world.RayCast(callback, point1, point2);

        // Need to convert coordinates of hit points to pixels before returning
        for (var i = 0; i < callback.hits.length; i++ )
        {
            var hit = callback.hits[i];
            hit.point = { x: this.mpx(-hit.point.x), y: this.mpx(-hit.point.y) };
            hit.normal = { x: -hit.normal.x, y: -hit.normal.y };
            output.push(hit);
        } 
        
        if(closestHitOnly){
          if(output.length < 1) return undefined;
          return output[0];
        }
        
        return output;
    },

    mouseDragStart: function (point) {
        
        this.mouseDragEnd();
        
        var fixturesAtPoint = this.getFixturesAtPoint(point.x, point.y, true, true);
        
        console.log(fixturesAtPoint);

        if ( fixturesAtPoint.length < 1 ) {
            return;
        }
        
        var worldx = this.pxm(-point.x);
        var worldy = this.pxm(-point.y);
        var worldPoint = new box2d.b2Vec2(worldx, worldy);
        
        var jd = new box2d.b2MouseJointDef();
        jd.bodyA = this.mouseJointBody;
        jd.bodyB = fixturesAtPoint[0].GetBody();
        jd.target.Copy(worldPoint);
        jd.maxForce = 1000 * jd.bodyB.GetMass();
        this.mouseJoint = this.world.CreateJoint(jd);
        jd.bodyB.SetAwake(true);
    },
    
    /**
    * Updates the target location of the active mouse joint, if there is one. If there
    * is no mouse joint active, this does nothing.
    *
    * @method Phaser.Physics.Box2D#mouseDragMove
    * @param {Phaser.Point} point - The location for the drag move (pixel coordinates)
    */
    mouseDragMove: function (point) {

        if (!this.mouseJoint)
        {
            return;
        }
        
        var worldx = this.pxm(-point.x);
        var worldy = this.pxm(-point.y);
        var worldPoint = new box2d.b2Vec2(worldx, worldy);
    
        this.mouseJoint.SetTarget(worldPoint);
    
    },
    
    /**
    * Ends the active mouse joint if there is one. If there is no mouse joint active, does nothing.
    *
    * @method Phaser.Physics.Box2D#mouseDragEnd
    */
    mouseDragEnd: function () {

        if (this.mouseJoint)
        {
            this.world.DestroyJoint(this.mouseJoint);
            this.mouseJoint = null;
        }
    
    },

    getFixturesAtPoint: function (x, y, onlyOne, onlyDynamic) {
        
        if (typeof onlyOne === 'undefined') { onlyOne = false; }
        if (typeof onlyDynamic === 'undefined') { onlyDynamic = false; }
        
        var worldx = this.pxm(-x);
        var worldy = this.pxm(-y);
        var worldPoint = new box2d.b2Vec2(worldx, worldy);
        
        // Make a small box.
        var aabb = new box2d.b2AABB();
        var d = new box2d.b2Vec2();

        d.x = 0.001;
        d.y = 0.001;

        box2d.b2Sub_V2_V2(worldPoint, d, aabb.lowerBound);
        box2d.b2Add_V2_V2(worldPoint, d, aabb.upperBound);

        var hitFixtures = [];

        // Query the world for overlapping shapes.
        // Here we return true to keep checking, or false to quit.
        var callback = function (fixture)
        {
            if (onlyDynamic && fixture.GetBody().GetType() !== box2d.b2BodyType.b2_dynamicBody)
            {
                return true;
            }
         
            if (fixture.TestPoint(worldPoint))
            {
                hitFixtures.push(fixture);
                return !onlyOne;
            }
         
            return true;
        };

        this.world.QueryAABB(callback, aabb);
        
        return hitFixtures;

    },

    createWalls: function(bounds){
      // Prepare shape and fixture definitions for use below
        var polygonShape = new box2d.b2PolygonShape();
        var fixtureDef = new box2d.b2FixtureDef();
        fixtureDef.shape = polygonShape;


        fixtureDef.filter.categoryBits = 0x8000;
        fixtureDef.filter.maskBits = 0xFFFF;

        var boundThickness = this.pxm(100);

        var walls = {}

        //bottom
        if (true)
        {
            var h = this.pxm(bounds.height/2) + boundThickness
            walls.bottom = this.createBody(0, 0, 0);
            var w = this.pxm(bounds.width/2)
            var h = boundThickness
            var x = -this.pxm(bounds.x + bounds.width/2)
            var y = -this.pxm(bounds.y + bounds.height) - h
            polygonShape.SetAsBox(w, h, new box2d.b2Vec2( x, y),0);
    
            var f = walls.bottom.data.CreateFixture(fixtureDef);
            f.id = this.getNextFixtureId();
        }

        //top
        if (true)
        {
            var h = this.pxm(bounds.height/2) + boundThickness
            walls.top = this.createBody(0, 0, 0);
            var w = this.pxm(bounds.width/2)
            var h = boundThickness
            var x = this.pxm(-bounds.x - bounds.width/2)
            var y = this.pxm(-bounds.y) + h
            polygonShape.SetAsBox(w, h, new box2d.b2Vec2( x, y),0);
    
            var f = walls.top.data.CreateFixture(fixtureDef);
            f.id = this.getNextFixtureId();
        }
        //left
        if (true)
        {
           
            walls.left = this.createBody(0, 0, 0);
            var w = boundThickness;
            var h = this.pxm(bounds.height/2) + boundThickness*2

            var x = -this.pxm(bounds.x) + boundThickness
            var y = -this.pxm(bounds.y) - h + boundThickness*2
            polygonShape.SetAsBox(w, h, new box2d.b2Vec2( x, y),0);
    
            var f = walls.left.data.CreateFixture(fixtureDef);
            f.id = this.getNextFixtureId();
        }
        //rgith
        if (true)
        {
           
            walls.right = this.createBody(0, 0, 0);
            var w = boundThickness;
            var h = this.pxm(bounds.height/2) + boundThickness*2

            var x = -this.pxm(bounds.x + bounds.width) - boundThickness
            var y = -this.pxm(bounds.y) - h + boundThickness*2
            polygonShape.SetAsBox(w, h, new box2d.b2Vec2( x, y),0);
    
            var f = walls.right.data.CreateFixture(fixtureDef);
            f.id = this.getNextFixtureId();
        }

    }
  });
  

  

  return Box2D;
});