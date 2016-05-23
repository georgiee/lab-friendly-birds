define(['phaser','debugPanel'], function(Phaser, debugPanel){
  return {
    initialize: function(game){
      var physics = game.physics;

      physics.startSystem(Phaser.Physics.BOX2D);
      //physics.box2d.setBoundsToWorld();
      physics.box2d.gravity.y = 1000;
      
      physics.box2d.debugDraw.shapes = true;
      physics.box2d.debugDraw.aabbs = true;
      physics.box2d.debugDraw.centerOfMass = true;

      if(debugPanel.params.physics.paused){
        game.physics.box2d.pause();
      }

      debugPanel.listeners.controlPhysicsPausedToggle.onChange(function(value){
        if(value) {
          game.physics.box2d.pause();
        }else{
          game.physics.box2d.resume();
        }
      })

      debugPanel.listeners.controlSlowMotion.onChange(function(value){
        game.time.slowMotion = value;
      })
      
    }
  }
})