define(['augment','pixi'], function(augment, PIXI){
  var Particle = augment(PIXI.Sprite, function(uber){
    this.constructor = function(x,y, force){
      var frame = PIXI.Texture.fromFrame('RUBY_PARTICLE_1');

      uber.constructor.call(this, frame);
      this.position.set(x,y);
      var scale = force/10;

      this.scale.set(Math.min(4, scale))
      this.anchor.set(0.5)
    }
    
    this.play = function(){
      //console.log('play');
    }

    this.update = function(){
      this.alpha = this.alpha*0.98;

      if(this.alpha <=0.05){
        this.parent.removeChild(this);
      }
    }
  });

  return Particle;
});