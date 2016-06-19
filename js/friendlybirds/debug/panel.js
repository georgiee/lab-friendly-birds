define(["vendor/dat.gui"], function(gui) {
  var game, gui;
  var listeners = {}, folder;

  gui = new dat.GUI();
  gui.closed = true;
  
  //dat.GUI.toggleHide();
  
  var params = {
    physics:{
      debug: false,
      paused: false,
      slingshot: true,
      raycasting: true,
      particles: true
    },
    fluid: {
      run: false,
    },
    minimap: true,
    camera: {
      alwaysPan: false,
      zoom: 1,
      x:0,
      y:0
    }
  }
  
  
  
  return{
    gui: gui,
    params: params,
    listeners: listeners,
    
    initialize: function(){
      listeners.controlMinimap = gui.add(params, 'minimap').name('Show Minimap');

      folder = gui.addFolder('Physics');
      folder.closed = false;
      folder.add(params.physics, 'debug').name('Debug');
      folder.add(params.physics, 'slingshot').name('Slingshot Active');
      folder.add(params.physics, 'paused').name('Paused');
      folder.add(params.physics, 'raycasting').name('Raycasting?');

      listeners.controlFluid = folder.add(params.physics, 'particles').name('Fluids?');
      
      folder = gui.addFolder('Camera');
      //folder.closed = false;
      folder.add(params.camera, 'alwaysPan').name('Always Pan');
      listeners.controlCameraZoom = folder.add(params.camera, 'zoom', 0.1, 10.0, 0.01).name('Zoom').listen();
      listeners.controlCameraX = folder.add(params.camera, 'x', -1000, 5000).step(10).name('X').listen();
      listeners.controlCameraY = folder.add(params.camera, 'y', -1000, 5000).step(10).name('Y').listen();

      folder = gui.addFolder('Notes');
      var notes = {
        raycast: 'Drag the pig. Raycast & Gravity',
        slingshot: 'Try mousedown/drag around the slingshot',
        water: 'Try to smash sth. in the water.',
        zoom: 'Mousewheel activ for zoom'
      }
      folder.add(notes, 'raycast');
      folder.add(notes, 'slingshot');
      folder.add(notes, 'water');
      folder.add(notes, 'zoom');
    }
  }
});