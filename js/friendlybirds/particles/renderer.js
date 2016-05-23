define(['augment','pixi','particles/water-shader','box2d','particles/particle-buffer'], function(augment, PIXI, Shader, box2d, ParticleBuffer){
  var ParticleRenderer = augment(PIXI.ObjectRenderer, function(uber){
    
    this.constructor = function(renderer){
      uber.constructor.call(this, renderer);
      
      this.size = 3000;
      this.tempMatrix = new PIXI.Matrix();
    }
    
    this.onContextChange = function (){
      var gl = this.renderer.gl;
        
      this.shader = new Shader(this.renderer.shaderManager);
      this.particleBuffer = new ParticleBuffer(gl, this.size);
    }
    
    this.start = function(){
      var shader = this.shader;
      var renderer = this.renderer;
      var gl = renderer.gl;

      // bind the main texture
      gl.activeTexture(gl.TEXTURE0);
      this.renderer.shaderManager.setShader(shader);
    }
    
    this.render = function(container){
      var renderer = this.renderer;
      var gl = renderer.gl;
      var texture = container._texture.baseTexture;
      var shader = this.shader;

      var m =  container.worldTransform.copy( this.tempMatrix );
      m.prepend( this.renderer.currentRenderTarget.projectionMatrix );
      gl.uniformMatrix3fv(shader.uniforms.projectionMatrix._location, false, m.toArray(true));

      var particleSystem = container._particleSystem;
      var count = particleSystem.GetParticleCount();
      var radius = particleSystem.GetRadius();
      var mParticleSizeScale = 2.5;
      var particleRadius = radius;
      var size = Math.max(1, mParticleSizeScale * 128 * particleRadius);
      size = size * container.worldTransform.a;
      gl.uniform1f(shader.uniforms.uPointSize._location, size);

      
      var mWeightParams = [1,0,1]
      mWeightParams = [0.05,0.8,0.7]
      gl.uniform3fv(shader.uniforms.uWeightParams._location, mWeightParams);

      if (!texture._glTextures[gl.id]){
          renderer.updateTexture(texture);
      }else{
          gl.bindTexture(gl.TEXTURE_2D, texture._glTextures[gl.id]);
      }
      
      var count = particleSystem.GetParticleCount();

      this.uploadSystem(particleSystem);
      this.particleBuffer.bind(this.shader);
      
      gl.drawArrays(gl.POINTS, 0, count);
    }

    this.uploadSystem = function(system){
      var renderer = this.renderer;
      var gl = renderer.gl;

      var count = system.GetParticleCount();
      var particleBuffer = system.GetPositionBuffer();
      var m_colorBuffer = system.GetColorBuffer();
      var m_weightBuffer = system.GetWeightBuffer();
      
      this.particleBuffer.setPositions(particleBuffer, 0 , count);
      this.particleBuffer.setColors(m_colorBuffer, 0, count);
      this.particleBuffer.setWeights(m_weightBuffer, 0, count);
      
      this.particleBuffer.flush();
    }

  });
  
  return{
    register: function(){
      PIXI.WebGLRenderer.registerPlugin('box2dParticleRenderer', ParticleRenderer);
    }
  }
});