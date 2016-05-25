requirejs.config({
    baseUrl: 'js/friendlybirds',
    deps: ['core/pixi-extensions'],
    paths: {
        augment: '../vendor/augment',
        postal: '../vendor/postal',
        debugPanel : "debug/panel",
        vendor: '../vendor',
        backbone: '../vendor/backbone',
        phaser: '../vendor/phaser/phaser-no-physics',
        pixi: '../vendor/pixi',
        lodash: '../vendor/lodash',
        Q: '../vendor/q',
        jquery: '../vendor/jquery-1.11.2.min',
        stats:'../vendor/stats',
        text : "../vendor/require-text",
        domReady : "../vendor/require-domReady",
        async : "../vendor/require-async",
        box2dPlugin : "../vendor/phaser/box2d-plugin",
        box2d : "../vendor/box2d-html5-232",

        noext : "../vendor/require-noext",
        'gsap': '../vendor/TweenMax'
    },
    
    map: {
      "*": {
        underscore: 'lodash'  
      }
    },

    shim: {
      pixipatch: {
        deps: ['pixi']
      },

      box2dPlugin: {
        deps: ['box2d','phaser']
      },
      box2d: {
        exports: 'box2d'
      },

      phaser: {
        exports: 'Phaser'
      },

      'gsap': {
        init: function() {
          return {
              TweenMax: TweenMax,
              TimelineMax: TimelineMax
          };
        }
      },

      stats: {
        exports: 'Stats'
      }

    }
});