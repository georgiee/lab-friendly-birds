define(['augment','underscore','phaser'], function(augment, _, Phaser){
  var map = {
    wood: 'blocks',
    red: 'birds',
    piglette: 'birds',
    immovable: 'blocks',
    light: 'explosions'
  }

  var BlockEntity = augment(Phaser.Sprite, function(uber){
    this.constructor = function(game, name, data, definition, options){
      var options = _.defaults({offsetX:0, offsetY:0 }, options);
      var position = {
        x: data.x * 20.5 + options.offsetX,
        y: data.y * 20.5 + options.offsetY
      }

      uber.constructor.call(this, game, position.x, position.y, map[definition.material], definition.sprite);
      this.initPhysics(data, definition);
    }
    
    this.initPhysics = function(data, definition){
      var body = new Phaser.Physics.Box2D.Body(this.game, null, this.x, this.y);

      switch(definition.type){
        case "box": 
          body.addRectangle(this.width, this.height);
          break;
        case "circle": 
          body.setCircle(definition.radius * 20);
          break;
        case "polygon": 
          body.setPolygon(definition.vertices);
          break;
      }
      body.sprite = this;
      body.rotation = data.angle;
      body.static = definition.material == 'immovable';

      this.body = body;
      this.anchor.set(0.5)
      //this.game.physics.box2d.enable(this);
      
    }

    this.build = function(){
      console.log('oka');
    }
  });

  return BlockEntity;
});