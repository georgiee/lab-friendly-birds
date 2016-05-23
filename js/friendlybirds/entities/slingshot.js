define(['augment','underscore','pixi','utils/point','game/game-session','entities/slingshot-rubber','debug/panel'],
  function(augment, _, pixi, Point, gameSession, Rubber, debugPanel){

  var Slingshot = augment(PIXI.Container, function(uber){
    
    this.constructor = function(){
      uber.constructor.call(this);
      _.bindAll(this);

      this.pivot.x = 37;
      this.pivot.y = 189;

      this.state = 'none';
      this.dragStart = new Point();
      this.dragCurrent = new Point();

      this.debugGraphics = new PIXI.Graphics();
      this.debugGraphics.position.set(0,0)
      this.addChild(this.debugGraphics);

      this.build();
      this.init();
    }
    
    this.setTarget = function(target){
      this.target = target;
    }

    this.init = function(){
      this.hitAreaShape.on('mousedown', this.handleMouseDown);
    }
    
    this.renderTrajectory = function(launchVelocity){
      var launchX = 0;
      var launchY = 0;

      var lastPos = null;    
      
      this.debugGraphics.clear();
      this.debugGraphics.lineStyle(5,0x333333,0.5);

      for (var i = 0; i < 180; i += 6){
        var trajectoryPoint = this.getTrajectoryPoint(launchX, launchY, launchVelocity.x, launchVelocity.y, i);

        if (lastPos && i % 12 == 0){
          this.debugGraphics.moveTo(lastPos.x, lastPos.y)
          this.debugGraphics.lineTo(trajectoryPoint.x, trajectoryPoint.y)
        }

        lastPos = trajectoryPoint;
      }
    }

    this.shoot = function(force){
      //this.debugGraphics.clear();

      var position = this.debugGraphics.position
      this.target.body.gravityScale = 1;
      this.target.body.x = -37
      this.target.body.y = -189

      this.target.body.velocity.x = force.x
      this.target.body.velocity.y = force.y
      this.target.body.rotation = this.rubber.bulletDirection;

      gameSession.game.camera.follow(this.target);
    }

    this.getTrajectoryPoint = function(startX, startY, velocityX, velocityY, n) {
      var physics = gameSession.physicsWorld;
        //velocity and gravity are given per second but we want time step values here
        var t = 1 / 60.0; // seconds per time step (at 60fps)
        
        var stepVelocityX = t * physics.pxm( -velocityX ); // m/s
        var stepVelocityY = t * physics.pxm( -velocityY );
        
        var stepGravityX = t * t * physics.pxm( -physics.gravity.x ); // m/s/s
        var stepGravityY = t * t * physics.pxm( -physics.gravity.y );

        startX = physics.pxm(-startX);
        startY = physics.pxm(-startY);
        
        var tpx = startX + n * stepVelocityX + 0.5 * (n*n+n) * stepGravityX;
        var tpy = startY + n * stepVelocityY + 0.5 * (n*n+n) * stepGravityY;
        
        tpx = physics.mpx(-tpx);
        tpy = physics.mpx(-tpy);
        
        return { x: tpx, y: tpy };

    }
    
    this.handleMouseDown = function(eventData){
      if(!debugPanel.params.physics.slingshot) return;

      gameSession.hammer.stop();
      this.target.body.resetForces();
      this.target.body.gravityScale = 0;

      this.dragStart.x = gameSession.interactive.mouse.global.x;
      this.dragStart.y = gameSession.interactive.mouse.global.y;
      window.document.addEventListener('mousemove', this.onMouseMove, true);
      window.addEventListener('mouseup',  this.onMouseUp, true);
    }

    this.mouseToGlobal = function(global){
      var position = this.toLocal( global);
      position = new Point(position.x, position.y);

      return position;
    }

    this.onMouseUp = function(){
      if(!debugPanel.params.physics.slingshot) return;

      window.document.removeEventListener('mousemove', this.onMouseMove, true);
      window.removeEventListener('mouseup',  this.onMouseUp, true);

      var power = this.rubber.getStrength()
      var rotation = this.rubber.bulletDirection;
      var force = {x: Math.cos(rotation) * power, y: Math.sin(rotation) * power};
      this.shoot(force);
    }

    this.onMouseMove = function(){
      if(!debugPanel.params.physics.slingshot) return;

      gameSession.hammer.stop();

      this.dragCurrent.x = gameSession.interactive.mouse.global.x;
      this.dragCurrent.y = gameSession.interactive.mouse.global.y;

      var dx = this.dragCurrent.x - this.dragStart.x;
      var dy = this.dragCurrent.y - this.dragStart.y;

      var length = Math.sqrt( dx*dx + dy*dy );
      var angle = Math.atan2( -dy, -dx );

      this.rubber.setTension(length, angle, dx, dy);
      
      var power = this.rubber.getStrength()
      var rotation = angle
      var force = {x: Math.cos(rotation) * power, y: Math.sin(rotation) * power};
      
      this.renderTrajectory(force);
      this.updateTarget();
    }
    
    this.updateTarget = function(){
      var s = this.rubber.getStrength();
      var pos = this.rubber.getBulletPosition();

      this.target.body.x = -this.pivot.x;
      this.target.body.y = -this.pivot.y;
      this.target.body.rotation = this.rubber.bulletDirection;
    }

    this.build = function(){
      this.hitAreaShape = this.buildHitShape();

      this.slingBack = PIXI.Sprite.fromFrame('other/sling-back');
      this.slingBack.x = 30;
      this.addChild(this.slingBack);
      
      this.slingFront = PIXI.Sprite.fromFrame('other/sling-front');
      this.addChild(this.slingFront);
      
      this.rubber = new Rubber();
      this.addChild(this.rubber);
    }

    this.buildHitShape = function(){
      this.hitAreaRadius = 100;
      var hitAreaShape = new PIXI.Graphics();
      hitAreaShape.interactive = hitAreaShape.buttonMode = true;
      hitAreaShape.alpha = 0.25;
      hitAreaShape.alpha = 0;
      hitAreaShape.beginFill(0xff0000);
      
      var w = 500, h = 300
      hitAreaShape.drawRect(-150,-this.pivot.y,w, h);
      this.addChild(hitAreaShape);

      this.hitArea = new PIXI.Circle(0, 0, this.hitAreaRadius);

      return hitAreaShape;
    }

  });

  return Slingshot;
})