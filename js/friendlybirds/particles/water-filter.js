define(['augment', 'pixi'], function(augment, PIXI){

  var BloomFilter = augment(PIXI.AbstractFilter, function(uber){
    this.constructor = function(){
      uber.constructor.call(this);
      this.blurXFilter = new PIXI.filters.BlurXFilter();
      this.blurYFilter = new PIXI.filters.BlurYFilter();

      this.defaultFilter = new PIXI.AbstractFilter();    
    }

    //adapt
    //liquidfunpaint/ParticleRenderer.java
    // liquidfunpaint/ScreenRenderer.java
    
    this.applyFilter = function (renderer, input, output){
        var renderTarget = renderer.filterManager.getRenderTarget(true);

        //TODO - copyTexSubImage2D could be used here?
        this.defaultFilter.applyFilter(renderer, input, output);

        this.blurXFilter.applyFilter(renderer, input, renderTarget);

        renderer.blendModeManager.setBlendMode(PIXI.BLEND_MODES.SCREEN);

        this.blurYFilter.applyFilter(renderer, renderTarget, output);

        renderer.blendModeManager.setBlendMode(PIXI.BLEND_MODES.NORMAL);

        renderer.filterManager.returnRenderTarget(renderTarget);
    }
  });
  
  return BloomFilter;

});