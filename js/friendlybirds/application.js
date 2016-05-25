define(['backbone', 'views/game-view','debug/stats-instance','game/game-session'], 
  function(Backbone, GameView, Stats, gameSession){
  gameSession.stats = Stats;
  
  var Application = Backbone.Router.extend({
    routes: {
      "": "index"
    },
    
    initialize: function(){
      //console.log('register')
    },

    index: function(){
      GameView.run();
    }

    
  })
  
  return {
    run: function(){
      var application = new Application();
      Backbone.history.start();
    }
  };
})