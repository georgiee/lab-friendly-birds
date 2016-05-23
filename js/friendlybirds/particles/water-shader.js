define(['augment','pixi',
  "text!particles/shaders/water_particle.glslv",
  "text!particles/shaders/particle.glslf"],
  function(augment, PIXI, vertexSrc, fragmentSrc){

  var TextureShader = augment(PIXI.Shader, function(uber){
    
    this.constructor = function(shaderManager, customUniforms, customAttributes){
      var uniforms = {
          uWeightParams: { type: '3fv', value: 0 },
          uPointSize: { type: '1f', value: 0 },
          uDiffuseTexture:           { type: 'sampler2D', value: 0 },
          projectionMatrix:   { type: 'mat3', value: new Float32Array([1, 0, 0,
                                                                       0, 1, 0,
                                                                       0, 0, 1]) }
      };

      var attributes = {
          aWeight: 0,
          aPosition: 0,
          aColor:    0
      };

      uber.constructor.call(this, shaderManager, vertexSrc, fragmentSrc, uniforms, attributes);
    }

  })
  
  return TextureShader;
})