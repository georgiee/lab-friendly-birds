define(['augment','pixi'], function(augment, PIXI){


  var shaderData = {
    defaultVertexSrc: [
      'attribute vec2 aVertexPosition;',
      'attribute vec2 aTextureCoord;',

      'attribute vec2 aPositionCoord;',
      'attribute vec2 aScale;',

      'uniform mat3 projectionMatrix;',

      'varying vec2 vTextureCoord;',

      'void main(void){',
      '   vec2 v = aVertexPosition;',
      '   v = v + aPositionCoord;',

      '   gl_Position = vec4((projectionMatrix * vec3(v, 1.0)).xy, 0.0, 1.0);',

      '   vTextureCoord = aTextureCoord;',
      '}'
    ].join('\n'),

    defaultFragmentSrc: [
      'precision lowp float;',

      'varying vec2 vTextureCoord;',

      'uniform sampler2D uSampler;',

      'void main(void){',
      '   gl_FragColor = texture2D(uSampler, vTextureCoord) ;',
      '}'
    ].join('\n')
  }


  var TextureShader = augment(PIXI.Shader, function(uber){
    
    this.constructor = function(shaderManager, vertexSrc, fragmentSrc, customUniforms, customAttributes){
      var uniforms = {

          uSampler:           { type: 'sampler2D', value: 0 },
          projectionMatrix:   { type: 'mat3', value: new Float32Array([1, 0, 0,
                                                                       0, 1, 0,
                                                                       0, 0, 1]) }
      };

      var attributes = {
          aPositionCoord: 0,
          aVertexPosition:    0,
          aTextureCoord:      0
      };

      /**
       * The vertex shader.
       * @member {Array}
       */
      vertexSrc = vertexSrc || shaderData.defaultVertexSrc;

      /**
       * The fragment shader.
       * @member {Array}
       */
      fragmentSrc = fragmentSrc || shaderData.defaultFragmentSrc;

      uber.constructor.call(this, shaderManager, vertexSrc, fragmentSrc, uniforms, attributes);
    }

  })
  
  return TextureShader;
})