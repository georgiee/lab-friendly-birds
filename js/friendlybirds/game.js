define(['augment', 'underscore', 'pixi','camera/camera','camera/controls/camera-control','world','views/minimap','game/game-session','physics/box2d-world','camera/controls/camera-focus','physics/debug-draw-container', 'debug/panel', 'input-manager'],
  function(augment, _, PIXI, Camera, CameraControl, World, Minimap, gameSession, Box2dWorld, CameraFocus, DebugDraw, debugPanel, InputManager){
  
  var Game = augment.defclass({
    constructor: function(width, height, options){
      this.worldBounds = options.worldBounds;
      this.width = width;
      this.height = height;

      _.bindAll(this);
      
      this.build();
      this.init();

      this.resize();
    },
    
    resize: function(){
      var deviceWidth = window.screen.width;
      var deviceHeight = window.screen.height;  
      
      if(deviceHeight > deviceWidth){
        deviceWidth = window.screen.height;
        deviceHeight = window.screen.width;  
      }
      var width = deviceWidth;
      var height = deviceHeight;
      width = Math.min(this.width, deviceWidth);
      height = Math.min(this.height, deviceHeight);
      var canvas = this.renderer.view;

      canvas.width = width;
      canvas.height = height;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      
      this.renderer.resize(width, height);
    },

    init: function(){
      this.physics = new Box2dWorld();
      this.physics.createWalls(this.worldBounds);
      this.input = new InputManager(this.renderer.view, this.renderer.plugins.interaction);
      this.initPhysicsDragDrop();

      gameSession.physicsWorld = this.physics
    },
    initPhysicsDragDrop: function(){
      var camera = this.camera;
      var physics = this.physics;

      this.input.onDown.add(function(point){
        physics.mouseDragStart(camera.cameraToWorldPoint(point));
      });
      
      this.input.onUp.add(function(point){
        physics.mouseDragEnd();
      });

      this.input.onMove.add(function(point){
        physics.mouseDragMove(camera.cameraToWorldPoint(point));
      });

    },

    updateCallback: function(){

    },

    build: function(){
      this.renderer = PIXI.autoDetectRenderer(this.width, this.height, { transparent : false, backgroundColor:0xaaaaaa }, false);
      this.stage = new PIXI.Container();
      
      gameSession.init(this);
      gameSession.renderer = this.renderer;
      gameSession.interactive = this.renderer.plugins.interaction;

      this.addCamera();
      this.addWorld();
      this.physicsDebugDraw = new DebugDraw(this.width, this.height);
      this.stage.addChild(this.physicsDebugDraw);
      
      this.addMinimap();

      this.cameraControl = new CameraControl(this.camera, this.renderer.view, this.worldBounds);
      this.cameraFocus = new CameraFocus(this.camera);
    },
    
    getView: function(){
      return this.renderer.view;
    },

    start: function(){
      this.update();
    },
    
    addWorld: function(){
      this.world = new World(this.camera);
      this.stage.addChild(this.world);
    },

    addMinimap: function(){
      var minimap = new Minimap(300,150, this.camera);
      this.stage.addChild(minimap);
      
      debugPanel.listeners.controlMinimap.onChange(function(value){
        minimap.visible = value;
      });
      minimap.visible = debugPanel.params.minimap;
      this.minimap = minimap;

      minimap.position.set(this.width - minimap.width, this.height-minimap.height)
      minimap.setWorldBounds(this.worldBounds);


    },

    addCamera: function(){
      var camera = new Camera(this.width, this.height);
      camera.viewCenterX = camera.zoomPivotX = this.width/2;
      camera.viewCenterY = camera.zoomPivotY = this.height/2;
      this.camera = camera;
    },

    update: function(){

      //pre updates
      this.stage.preUpdate();
      this.physics.preUpdate();
      
      //updates
      this.physics.update();
      
      /*var p1 = {x:0, y:0};
      var p2 = {x: gameSession.interactive.mouse.global.x, y: gameSession.interactive.mouse.global.y};
      
      var raycastOutput = this.physics.raycast( p1.x, p1.y, p2.x, p2.y, false, null );
   
      if(raycastOutput.length > 0){
        console.log('raycastOutput', raycastOutput)
      }*/

      this.minimap.update();
      this.cameraControl.update();
      this.camera.update();
      this.world.update();
      
      if(debugPanel.params.physics.debug){
        this.physicsDebugDraw.render(this.physics, this.camera, !debugPanel.params.physics.debug);
      }
      //this.physicsDebugDraw.line(p1,p2);

      this.updateCallback.call();
      
      this.stage.postUpdate();
      
      gameSession.stats.update();
      this.renderer.render(this.stage);
      
      requestAnimationFrame(this.update);
    }

  });

  return Game;
});