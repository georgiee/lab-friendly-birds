define(['augment','physics/point-proxy','utils/point'], function(augment, PointProxy, Point){
  var Body = augment.defclass({
    constructor: function(sprite, x, y, density, world){
      this.world = world;
      this.sprite = sprite;

      this.id = this.world.getNextBodyId();
      
      this.bodyDef = new box2d.b2BodyDef();
      this.bodyDef.position.x = -this.world.pxm(x)
      this.bodyDef.position.y = -this.world.pxm(y);
      this.bodyDef.type = this.getBodyType(density);

      this.data = this.world.world.CreateBody(this.bodyDef);
      this.data.world = this.world.world;
      this.data.parent = this;

      this.velocity = new PointProxy(this.world, this.data, this.data.GetLinearVelocity, this.data.SetLinearVelocity);
      
      if(this.sprite){
        this.addRectangle(this.sprite.width,this.sprite.height);
      }

      this.collideWorldBounds = true;
      

      this._fixtureContactCallbacks = {};
      this._fixtureContactCallbackContext = {};
      this._bodyContactCallbacks = {};
      this._bodyContactCallbackContext = {};
      this._categoryContactCallbacks = {};
      this._categoryContactCallbackContext = {};
      
      this._fixturePresolveCallbacks = {};
      this._fixturePresolveCallbackContext = {};
      this._bodyPresolveCallbacks = {};
      this._bodyPresolveCallbackContext = {};
      this._categoryPresolveCallbacks = {};
      this._categoryPresolveCallbackContext = {};
      
      this._fixturePostsolveCallbacks = {};
      this._fixturePostsolveCallbackContext = {};
      this._bodyPostsolveCallbacks = {};
      this._bodyPostsolveCallbackContext = {};
      this._categoryPostsolveCallbacks = {};
      this._categoryPostsolveCallbackContext = {};
    },

    getBodyType: function(density){
      if (density === 1)
      {
          return box2d.b2BodyType.b2_kinematicBody;
      }
      else if (density === 2)
      {
          return box2d.b2BodyType.b2_dynamicBody;
      }
      else if (density === 3)
      {
          return box2d.b2BodyType.b2_bulletBody;
      }

      return box2d.b2BodyType.b2_staticBody;
    },

    setCategoryPostsolveCallback: function (category, callback, callbackContext) {

        if (callback === null)
        {
            delete (this._categoryPostsolveCallbacks[category]);
            delete (this._categoryPostsolveCallbacksContext[category]);
        }
        else
        {
            this._categoryPostsolveCallbacks[category] = callback;
            this._categoryPostsolveCallbackContext[category] = callbackContext;
        }

    },


    setCollisionCategory: function (category, fixture) {

        if (typeof fixture === 'undefined')
        {
            for (var f = this.data.GetFixtureList(); f; f = f.GetNext())
            {
                var filter = f.GetFilterData();
                filter.categoryBits = category;
            }
        }
        else
        {
            var filter = fixture.GetFilterData();
            filter.categoryBits = category;
        }

    },

    setCollisionMask: function (mask, fixture) {

        if (typeof fixture === 'undefined')
        {
            for (var f = this.data.GetFixtureList(); f; f = f.GetNext())
            {
                var filter = f.GetFilterData();
                filter.maskBits = mask;
            }
        }
        else
        {
            var filter = fixture.GetFilterData();
            filter.maskBits = mask;
        }

    },

    postUpdate: function () {

        if (this.sprite) {
            this.sprite.x = this.world.mpx(-this.data.GetPosition().x);
            this.sprite.y = this.world.mpx(-this.data.GetPosition().y);        
            this.sprite.rotation = this.data.GetAngle();
        }

    },
    getWorldCenter: function(){
      var x = this.world.mpx(-this.data.GetWorldCenter().x);
      var y = this.world.mpx(-this.data.GetWorldCenter().y);
      
      return new Point(x, y);
    },

    applyImpulse: function (x, y) {
        this.data.ApplyLinearImpulse(new box2d.b2Vec2(-x,-y), this.data.GetWorldCenter(), true);
    },
    
    applyForce: function (x, y) {
        this.data.ApplyForce(new box2d.b2Vec2(-x,-y), this.data.GetWorldCenter(), true);
    },
    addCircle: function (radius, offsetX, offsetY) {
        var offsetX = offsetX || 0;
        var offsetY = offsetY || 0;

        var circleShape = new box2d.b2CircleShape(this.world.pxm(radius));
        circleShape.m_p.x = this.world.pxm(-offsetX)
        circleShape.m_p.y = this.world.pxm(-offsetY)

        var fixtureDef = new box2d.b2FixtureDef();
        fixtureDef.shape = circleShape;
        fixtureDef.friction = this.world.friction;
        fixtureDef.restitution = this.world.restitution;
        fixtureDef.density = this.world.density;

        var f = this.data.CreateFixture(fixtureDef);
        f.id = this.world.getNextFixtureId();

        return f;

    },
    addRectangle: function (width, height, offsetX, offsetY, rotation) {

        if (typeof width === 'undefined') { width = 16; }
        if (typeof height === 'undefined') { height = 16; }
        if (typeof offsetX === 'undefined') { offsetX = 0; }
        if (typeof offsetY === 'undefined') { offsetY = 0; }
        if (typeof rotation === 'undefined') { rotation = 0; }   
    
        width = this.world.pxm(width);
        height = this.world.pxm(height);

        var polygonShape = new box2d.b2PolygonShape();
        polygonShape.SetAsBox(0.5 * width, 0.5 * height, new box2d.b2Vec2(this.world.pxm(-offsetX), this.world.pxm(-offsetY)), rotation);

        var fixtureDef = new box2d.b2FixtureDef();
        fixtureDef.shape = polygonShape;
        fixtureDef.friction = this.world.friction;
        fixtureDef.restitution = this.world.restitution;
        fixtureDef.density = this.world.density;

        var f = this.data.CreateFixture(fixtureDef);
        f.id = this.world.getNextFixtureId();

        return f;

    },
    removeFromWorld: function () {
      this.world.removeBodyNextStep(this);
    },

    polygonFromJSON: function (data, sprite) {
        this.clearFixtures();
        
        for(var j=0; j < data.length; j++){

          var fixtureData = data[j]
          for (var i = 0; i < fixtureData.length; i++)
          {
              var vertices = [];

              for (var s = 0; s < fixtureData[i].shape.length; s += 2)
              {
                  vertices.push( new box2d.b2Vec2( this.world.pxm(-fixtureData[i].shape[s]), this.world.pxm(-fixtureData[i].shape[s + 1]) ) );
              }

              if (sprite) {
                  var offsetx = this.world.pxm(-0.5 * sprite.width);
                  var offsety = this.world.pxm(-0.5 * sprite.height);
                  for (var k = 0; k < vertices.length; k++) {
                      vertices[k].x -= offsetx;
                      vertices[k].y -= offsety;
                  }
              }

              var polygonShape = new box2d.b2PolygonShape();
              polygonShape.Set(vertices, vertices.length);
      
              var fixtureDef = new box2d.b2FixtureDef();
              fixtureDef.shape = polygonShape;
              fixtureDef.friction = fixtureData[i].friction;
              fixtureDef.restitution = fixtureData[i].bounce;
              fixtureDef.density = fixtureData[i].density;
              fixtureDef.filter.categoryBits = fixtureData[i].filter.categoryBits;
              fixtureDef.filter.maskBits = fixtureData[i].filter.maskBits;

              var f = this.data.CreateFixture(fixtureDef);
              f.id = this.world.getNextFixtureId();
          }
        }
        


        return polygonShape;
    },
    clearFixtures: function () {

        var fixtures = [];
        for (var f = this.data.GetFixtureList(); f; f = f.GetNext()) {
            fixtures.push(f);
        }

        var i = fixtures.length;

        while (i--)
        {
            this.data.DestroyFixture(fixtures[i]);
        }

    },
    getFixtures: function () {

        var fixtures = [];
        for (var f = this.data.GetFixtureList(); f; f = f.GetNext()) {
            fixtures.push(f);
        }

        return fixtures;

    },

    resetForces: function(){
      this.setZeroRotation();
      this.setZeroVelocity();
    },

    setZeroRotation: function () {

        this.data.SetAngularVelocity(0);

    },
    setZeroVelocity: function () {

        this.data.SetLinearVelocity(box2d.b2Vec2.ZERO);

    },
    getVertices: function(){
      var fixtures = [];
      var vertices = [];
      var ccc = 0;
        for (var f = this.data.GetFixtureList(); f; f = f.GetNext()) {
          var shape = f.m_shape;
          var vertexCount = shape.m_count;
          for (var i = 0; i < vertexCount; ++i)
          {
            var vec = shape.m_vertices[i]
            vertices.push({x:this.world.mpx(-vec.x) - 0.5 * this.sprite.width, y:  this.world.mpx(-vec.y) - 0.5 * this.sprite.height });
          }

        }
      

      return vertices;
    }
  });
  

  Object.defineProperty(Body.prototype, "collideWorldBounds", {

    get: function () {

        for (var f = this.data.GetFixtureList(); f; f = f.GetNext())
        {
            var filter = f.GetFilterData();

            if (filter.maskBits & 0x8000)
            {
                return true;
            }
        }
        
        return false;

    },

    set: function (value) {
        for (var f = this.data.GetFixtureList(); f; f = f.GetNext())
        {
            var filter = f.GetFilterData();

            if (value)
            {
                filter.maskBits |=  0x8000;
            }
            else
            {
                filter.maskBits &= ~0x8000;
            }
        }
    }
  });

  Object.defineProperty(Body.prototype, "dynamic", {

    get: function () {

        return (this.data.GetType() === box2d.b2BodyType.b2_dynamicBody);

    },

    set: function (value) {

        if (value && this.data.GetType() !== box2d.b2BodyType.b2_dynamicBody)
        {
            this.data.SetType(box2d.b2BodyType.b2_dynamicBody);
        }
        else if (!value && this.data.GetType() === box2d.b2BodyType.b2_dynamicBody)
        {
            this.data.SetType(box2d.b2BodyType.b2_staticBody);
        }

    }

});

  Object.defineProperty(Body.prototype, "static", {

    get: function () {

        return (this.data.GetType() === box2d.b2BodyType.b2_staticBody);

    },

    set: function (value) {

        if (value && this.data.GetType() !== box2d.b2BodyType.b2_staticBody)
        {
            this.data.SetType(box2d.b2BodyType.b2_staticBody);
        }
        else if (!value && this.data.GetType() === box2d.b2BodyType.b2_staticBody)
        {
            this.data.SetType(box2d.b2BodyType.b2_dynamicBody);
        }

    }

});

  Object.defineProperty(Body.prototype, "x", {

      get: function () {

          return this.world.mpx(-this.data.GetPosition().x);

      },

      set: function (value) {

          this.data.SetPositionXY(this.world.pxm(-value), this.data.GetPosition().y);

      }

  });

  Object.defineProperty(Body.prototype, "y", {

      get: function () {

          return this.world.mpx(-this.data.GetPosition().y);

      },

      set: function (value) {

          this.data.SetPositionXY(this.data.GetPosition().x, this.world.pxm(-value));

      }

  });


  Object.defineProperty(Body.prototype, "mass", {

        get: function () {

            return this.data.GetMass();

        },

        set: function (value) {
            
            if (value === 0) {
                this.data.SetType(box2d.b2BodyType.b2_staticBody);
            }
            else {
                
                // Make sure the body is dynamic, before giving it a non-zero mass.
                if (this.data.GetType() !== box2d.b2BodyType.b2_dynamicBody) {
                    
                    this.data.SetType(box2d.b2BodyType.b2_dynamicBody);
                    
                }
            
                // Mass is determined by (area * density) of attached fixtures.
                // We need to find the current mass and scale the density of all
                // fixtures so that the overall mass matches the desired mass.
                
                var oldMass = this.data.GetMass();
                var scaleby = value / oldMass;
        
                for (var f = this.data.GetFixtureList(); f; f = f.GetNext()) {
                    var oldDensity = f.GetDensity();
                    f.SetDensity(oldDensity * scaleby);
                }
                
                // Make sure the new fixture densities take effect in the body
                this.data.ResetMassData();
            
            }

        }
      });




/**
* @name Body#angularVelocity
* @property {number} angularVelocity - The angular velocity of the body.
*/
Object.defineProperty(Body.prototype, "angularVelocity", {

    get: function () {

        return this.data.GetAngularVelocity();

    },

    set: function (value) {

        this.data.SetAngularVelocity(value);

    }

});

/**
* @name Body#fixedRotation
* @property {boolean} fixedRotation - If true, the body will not rotate.
*/
Object.defineProperty(Body.prototype, "fixedRotation", {

    get: function () {

        return this.data.IsFixedRotation();

    },

    set: function (value) {

        this.data.SetFixedRotation(value);

    }

});

/**
* @name Body#gravityScale
* @property {boolean} gravityScale - Set to zero to completely ignore gravity, or negative values to reverse gravity for this body.
*/
Object.defineProperty(Body.prototype, "gravityScale", {

    get: function () {

        return this.data.GetGravityScale();

    },

    set: function (value) {

        this.data.SetGravityScale(value);

    }

});

/**
* @name Body#friction
* @property {number} friction - When setting, all fixtures on the body will be set to the given friction. When getting, the friction of the first fixture will be returned, or zero if no fixtures are present.
*/
Object.defineProperty(Body.prototype, "friction", {

    get: function () {

        var fixture = this.data.GetFixtureList();
        
        if (fixture) {
            return fixture.GetFriction();
        }

        return 0;

    },

    set: function (value) {

        for (var f = this.data.GetFixtureList(); f; f = f.GetNext()) {

            f.SetFriction(value);
            f.Refilter();

        }

    }

});

/**
* @name Body#restitution
* @property {number} restitution - When setting, all fixtures on the body will be set to the given restitution. When getting, the restitution of the first fixture will be returned, or zero if no fixtures are present.
*/
Object.defineProperty(Body.prototype, "restitution", {

    get: function () {

        var fixture = this.data.GetFixtureList();
        
        if (fixture) {
            return fixture.GetRestitution();
        }

        return 0;

    },

    set: function (value) {

        for (var f = this.data.GetFixtureList(); f; f = f.GetNext()) {

            f.SetRestitution(value);
            f.Refilter();

        }

    }

});

/**
* @name Body#sensor
* @property {boolean} sensor - When setting, all fixtures on the body will be set to the given sensor status. When getting, the sensor status of the first fixture will be returned, or false if no fixtures are present.
*/
Object.defineProperty(Body.prototype, "sensor", {

    get: function () {

        var fixture = this.data.GetFixtureList();
        
        if (fixture) {
            return fixture.IsSensor();
        }

        return 0;

    },

    set: function (value) {

        for (var f = this.data.GetFixtureList(); f; f = f.GetNext()) {

            f.SetSensor(value);
            f.Refilter();

        }

    }

});

/**
* @name Body#bullet
* @property {boolean} bullet - Set to true to give the body 'bullet' status, and use continous collision detection when moving it.
*/
Object.defineProperty(Body.prototype, "bullet", {

    get: function () {

        return this.data.IsBullet();

    },

    set: function (value) {

        this.data.SetBullet(value);

    }

});

Object.defineProperty(Body.prototype, "rotation", {

    get: function() {

        return this.data.GetAngle();

    },

    set: function(value) {

        this.data.SetAngle(value);

    }

});

  return Body;
});