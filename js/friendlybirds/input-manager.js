define(['augment','underscore','vendor/signals','vendor/keyboard','game/game-session'], function(augment, _, signals, Keyboard, gameSession){
  var InputManager = augment.defclass({
    constructor: function(domElement, gameInteractive){
      _.bindAll(this);

      this.interactive = gameInteractive;
      //this.interactive.mouse.global.x;

      this.onDown = new signals.Signal();
      this.onMove = new signals.Signal();
      this.onUp = new signals.Signal();

      this.domElement = domElement;

      window.document.addEventListener('mousemove',    this.onMouseMove, true);
      this.domElement.addEventListener('mousedown',    this.onMouseDown, true);
      this.domElement.addEventListener('mouseout',     this.onMouseOut, true);

      this.domElement.addEventListener('touchstart',   this.onTouchStart, true);
      this.domElement.addEventListener('touchend',     this.onTouchEnd, true);
      this.domElement.addEventListener('touchmove',    this.onTouchMove, true);


      window.addEventListener('mouseup',  this.onMouseUp, true);
      Keyboard.on('space', function(event){
        event.preventDefault();
      });


    },
    getKeys: function(){
      return Keyboard.activeKeys();
    },
    
    isDown: function(key){
      var keys = this.getKeys();
      if(keys.length == 0) return false;

      return keys.indexOf(key) != -1;
    },

    onMouseMove: function(){
      this.onMove.dispatch(this.interactive.mouse.global);
    },

    onMouseDown: function(){
      gameSession.game.camera.unfollow();
      this.onDown.dispatch(this.interactive.mouse.global);
    },

    onMouseOut: function(){

    },

    onMouseUp: function(){
      this.onUp.dispatch(this.interactive.mouse.global);
    },

    onTouchStart: function(){

    },

    onTouchEnd: function(){

    },

    onTouchMove: function(){

    }
  });

  return InputManager;
})