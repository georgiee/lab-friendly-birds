define(['augment','phaser','game/data/blocks'], function(augment, Phaser, entitiesData){
  var Bird = augment(Phaser.Sprite, function(uber){
    this.constructor = function(game){
      uber.constructor.call(this, game, 100, -100, 'birds', 'BIRD_RED');
      this.build()
    }
    
    this.build = function(){
      var definition = entitiesData['RedBird'];
      var body = new Phaser.Physics.Box2D.Body(this.game, null, this.x, this.y);
      body.setCircle(definition.radius * 20);
      body.mass = 1;
      body.restitution = 0.5;
      body.gravityScale = 0;
      body.bullet = true;
      body.sprite = this;
      this.body = body;
      this.anchor.set(0.5)
    }
    
    this.disableGravity = function(){
      this.body.gravityScale = 0;
    }
    this.enableGravity = function(){
      this.body.gravityScale = 1;
    }

    this.resetForces = function(){
      this.disableGravity();
      this.body.setZeroRotation();
      this.body.setZeroVelocity();
    }
    
    this.shoot = function(power, rotation){
      this.game.camera.follow(this);
      
      this.resetForces();
      this.enableGravity();
      
      this.body.applyForce(Math.cos(rotation) * power, Math.sin(rotation) * power);
      /*
        var forcex = Math.cos(rotation) * power;
        var forcey = Math.sin(rotation) * power;
        this.body.data.ApplyLinearImpulse(new box2d.b2Vec2(-forcex,-forcey), this.body.data.GetWorldCenter(), true)
      */
    }
  });

  return Bird;
});