define(['augment', 'pixi'], function(augment, PIXI){


  var shaderData = {
    defaultVertexSrc: [
      'attribute vec2 aPosition;',
      'uniform mat3 projectionMatrix;',

      'void main(void){',
      '   gl_Position = vec4((projectionMatrix * vec3(aPosition, 1.0)).xy, 0.0, 1.0);',
      '}'
    ].join('\n'),

    defaultFragmentSrc: [
      'void main(void){',
      '   gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0) ;',
      '}'
    ].join('\n')
  }


  var ColorShader = augment(PIXI.Shader, function(uber){
    
    this.constructor = function(shaderManager, vertexSrc, fragmentSrc, customUniforms, customAttributes){
      var uniforms = {
          projectionMatrix:   { type: 'mat3', value: new Float32Array([1, 0, 0,
                                                                       0, 1, 0,
                                                                       0, 0, 1]) }
      };

      var attributes = {
          aPosition: 0,
      };
      
      vertexSrc = shaderData.defaultVertexSrc;
      fragmentSrc = shaderData.defaultFragmentSrc;

      uber.constructor.call(this, shaderManager, vertexSrc, fragmentSrc, uniforms, attributes);
    }

  })


  var Renderer = augment(PIXI.ObjectRenderer, function(uber){
    
    this.constructor = function(renderer){
      uber.constructor.call(this, renderer);
      this.size = 3;

      this.tempMatrix = new PIXI.Matrix();
    }
    
    this.onContextChange = function (){
      var gl = this.renderer.gl;
      this.positionData = new Float32Array([
        0, 0,
        100, 100,
        0, 100
      ]);

      this.positionBuffer = gl.createBuffer();
     
      this.shader = new ColorShader(this.renderer.shaderManager);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, this.positionData, gl.DYNAMIC_DRAW);
    }
    
    this.start = function(){
      var shader = this.shader;
      var renderer = this.renderer;
      var gl = renderer.gl;

      this.renderer.shaderManager.setShader(shader);
    }
    
    this.render = function(container){
      var shader = this.shader;
      var gl = this.renderer.gl;

        var m =  container.worldTransform.copy( this.tempMatrix );
      m.prepend( this.renderer.currentRenderTarget.projectionMatrix );
      gl.uniformMatrix3fv(shader.uniforms.projectionMatrix._location, false, m.toArray(true));

      gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
      gl.vertexAttribPointer(shader.attributes.aPosition, 2, gl.FLOAT, false, 0, 0);
      
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

  });
  
  PIXI.WebGLRenderer.registerPlugin('tempRenderer', Renderer);

  var RenderTester = augment(PIXI.Container, function(uber){
    
    this.constructor = function(texture){
      uber.constructor.call(this);
      this._texture = texture;
      this.x = 200;
      this.y = 200;

      this.blurFilter = new PIXI.filters.BlurFilter();
      this.greyFilter = new PIXI.filters.GrayFilter();
      this.filters = [this.blurFilter, this.greyFilter]
    }

    this._renderWebGL = function(renderer){
      renderer.setObjectRenderer( renderer.plugins.tempRenderer );
      renderer.plugins.tempRenderer.render( this );
    }

  });

  return RenderTester;
});