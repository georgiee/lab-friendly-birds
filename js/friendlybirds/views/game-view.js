define(['underscore','jquery','pixi','game/background','utils/rectangle','game','states/demo-state','camera-tests','debug/panel'], 
  function(_, $, PIXI, Background, Rectangle, Game, DemoState, CameraTests, debugPanel){
  
  PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST
  var game;

  var build = function(resources){
    var minimap = game.minimap;
    var world = game.world;
    var physics = game.physics;

    game.start();
    
    game.camera.zoom = 0.5
    game.camera.x=750;
    game.camera.y=-100;
    
    background = new Background(game.width, game.worldBounds);
    world.addChild(background);
    
    var state = DemoState.run(game, resources);
    game.updateCallback = DemoState.update;

    //soemthign is wrong with the dropdowns at the moment. skip.
    //CameraTests.run(game, DemoState);

    debugPanel.listeners.controlFluid.onChange(function(){
      physics.m_particleSystem.SetPaused(!debugPanel.params.physics.particles);
    });
    physics.m_particleSystem.SetPaused(!debugPanel.params.physics.particles);
      

  }
  
  return {
    run: function(){
      game = new Game(900, 500, {
        worldBounds: new Rectangle(-500, -1200, 3500, 1500)
      });

      $('#stage').append(game.getView());

      DemoState.preload(build);
    }
  };
});