define(['augment','underscore','phaser','game/entities/slingshot-rubber','game/game-session'], function(augment, _, Phaser, SlingshotRubber, gameSession){
  var Slingshot = augment(Phaser.Group, function(uber){
    this.constructor = function(){
      uber.constructor.apply(this, arguments);
      _.bindAll(this);
      
      this.pivot.x = 37;
      this.pivot.y = 189;

      this.state = 'none';
      this.dragStart = new Phaser.Point();
      this.game.input.onUp.add(this.onDragEnd);
      
      this.build();
    };
    
    this.lockAndLoad = function(bullet){
      this.targetBullet = bullet;
    },

    this.buildHitShape = function(){
      this.hitAreaRadius = 100;
      
      var hitAreaShape = this.game.add.graphics(40, 100, this);
      hitAreaShape.alpha = 0.25;
      hitAreaShape.inputEnabled = true;
      hitAreaShape.input.useHandCursor = true;
      
      hitAreaShape.events.onInputDown.add(function(e){
        this.game.input.mouse.event.stopPropagation();//stop hammer
        this.onDragStart();
      }, this);
      
      hitAreaShape.beginFill(0xff0000);
      var w = 500, h = 300
      hitAreaShape.drawRect(-150,-this.pivot.y,w, h);
      this.addChild(hitAreaShape);

      this.hitArea = new Phaser.Circle(0, 0, this.hitAreaRadius);
    }

    this.build = function(){
      this.buildHitShape();

      this.slingBack = this.game.make.sprite(30, 0, 'birds', 'SLING_SHOT_01_BACK');
      this.add(this.slingBack);
      
      this.slingFront = this.game.make.sprite(0, 0, 'birds', 'SLING_SHOT_01_FRONT');
      this.add(this.slingFront);
      
      this.rubber = new SlingshotRubber(this.game);
      this.add(this.rubber);
    }
    
    this.updateTarget = function(){
      var s = this.rubber.getStrength();
      var pos = this.rubber.getBulletPosition();

      this.targetBullet.body.x = pos.x;
      this.targetBullet.body.y = pos.y;
      this.targetBullet.body.rotation = this.rubber.bulletDirection;
    }

    this.onDragStart = function(){
      this.state = 'pan';
      this.targetBullet.resetForces();
      this.moveCallbackID = this.game.input.addMoveCallback(this.onDragMove);

      this.dragStart.x = this.game.input.mousePointer.position.x;
      this.dragStart.y = this.game.input.mousePointer.position.y;

      this.onDragMove();
    }

    this.onDragMove = function(){
      var currentPosition = this.game.input.mousePointer.position;
      var dx = currentPosition.x - this.dragStart.x;
      var dy = currentPosition.y - this.dragStart.y;

      var length = Math.sqrt( dx*dx + dy*dy );
      var angle = Math.atan2( -dy, -dx );
      
      this.rubber.setTension(length, angle, dx, dy);
      this.updateTarget()
    }

    this.onDragEnd = function(){
      if(this.state != 'pan') return;
      this.updateTarget();

      this.game.input.deleteMoveCallback(this.moveCallbackID);
      if(this.rubber.getStrength() > 30){
        this.targetBullet.shoot(this.rubber.getStrength()*10, this.rubber.bulletDirection);
      }
      this.state = 'none';
    }


  });

  return Slingshot;
});