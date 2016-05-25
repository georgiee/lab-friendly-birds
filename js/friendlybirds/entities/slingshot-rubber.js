define(['augment','pixi','utils/point','box2d'], function(augment, PIXI, Point, box2d){
  var SlingShotRubber = augment(PIXI.Container, function(uber){
    
    this.constructor = function(){
      uber.constructor.call(this);

      this.bulletPosition = new Point(0, 0);
      this.bulletDirection = 0;
      
      this.maxLength = 120;
      this.strength = 0;

      this.build();
    }

    this.build = function(){

      var positionFrontRubber = new Point(22, 43);
      this.frontRubber = new PIXI.Graphics();
      this.frontRubber.beginFill(0xFF3300);
      this.frontRubber.drawRect(0, 0, 1, 1);

      var positionBackRubber = new Point(64, 32);
      this.backRubber =  new PIXI.Graphics();
      this.backRubber.beginFill(0x00ff00);
      this.backRubber.drawRect(0, 0, 1, 1);
      
      this.p1 = this.createTestDot();
      this.p1.x = positionFrontRubber.x;
      this.p1.y = positionFrontRubber.y;
      
      this.p2 = this.createTestDot();
      this.p2.x = positionBackRubber.x;
      this.p2.y = positionBackRubber.y;

      this.tester = this.createTestDot();
      this.tester2 = this.createTestDot(0xff0000);
      this.tester3 = this.createTestDot(0xffff00);
      this.tester3.visible = false;
      this.mountPosition = new Point(40, 40);
      this.tester3.x = this.mountPosition.x
      this.tester3.y = this.mountPosition.y

      this.frontRubberContainer = new PIXI.Container();
      this.frontRubberContainer.addChild(this.frontRubber);
      this.frontRubberContainer.innerRubber = this.frontRubber;
      this.frontRubberContainer.x = positionFrontRubber.x;
      this.frontRubberContainer.y = positionFrontRubber.y;
      
      this.backRubberContainer = new PIXI.Container();
      this.backRubberContainer.addChild(this.backRubber);
      this.backRubberContainer.innerRubber = this.backRubber;
      this.backRubberContainer.x = positionBackRubber.x;
      this.backRubberContainer.y = positionBackRubber.y;

      this.frontRubberContainer.alpha = 0.2
      this.backRubberContainer.alpha = 0.2
      
      this.addChild(this.frontRubberContainer);
      this.addChild(this.backRubberContainer);

    }

    this.createTestDot = function(color){
      var dot = new PIXI.Graphics();
      this.addChild(dot);
      dot.beginFill(color || 0x0000ff);
      dot.drawRect(-5, -5, 10, 10);
      return dot;
    }

    this.setTension = function(magnitude, angle, dx, dy){
      magnitude = Math.min(magnitude, this.maxLength);

      //circle around center
      var position = new box2d.b2Vec2(dx, dy);
      position.SelfNormalize().SelfMul(magnitude);
      
      var vPosition = new box2d.b2Vec2(this.mountPosition.x, this.mountPosition.y);
      vPosition.SelfAdd(position)
      
      this.tester.x = this.mountPosition.x;
      this.tester.y = this.mountPosition.y;
      this.tester2.x = this.mountPosition.x + position.x;
      this.tester2.y = this.mountPosition.y + position.y;

      var strength = position.Length(); //shoudl be the same for both
      var direction = Math.atan2(position.y, position.x)

      this.calculateRubber(this.frontRubberContainer, vPosition, strength);
      this.calculateRubber(this.backRubberContainer, vPosition, strength);
      
      //this.bulletPosition.set(this.tester2.world.x, this.tester2.world.y);
      this.bulletDirection = direction + Math.PI;
      this.strength = strength;
    }
    
    this.getStrength = function(){
      return this.strength*10;
    }
    
    this.getBulletPosition = function(){
      return this.bulletPosition;
    }

    this.calculateRubber = function(rubber, position, strength){
      var minThickness = 5;
      var maxThickness = 30;

      var ruberDirection = new box2d.b2Vec2(rubber.x, rubber.y);
      ruberDirection.SelfSub(position);
      
      var magnitude = ruberDirection.Length();

      var angle = Math.atan2(ruberDirection.y, ruberDirection.x)
      
      rubber.innerRubber.width = magnitude;      
      rubber.innerRubber.height = (minThickness + maxThickness) - maxThickness * strength/this.maxLength;
      rubber.pivot.y = rubber.innerRubber.height/2;
      rubber.rotation = angle + Math.PI;
    }

  });
  return SlingShotRubber;
})