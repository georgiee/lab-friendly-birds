define(['augment','box2d'], function(augment, box2d){
  var ParticleBuffer = augment.defclass({
    
    constructor: function(gl, size){
      this.gl = gl;
      this.size = size;

      this.dynamicStride = 0;
      this.dynamicBuffer = null;
      this.dynamicData = null;

      this.byteSize = 4;
      this.initBuffers();
    },

    initBuffers: function(){
      var gl = this.gl;
      var dynamicOffset = 0;
      
      this.dynamicStride += 2; //position
      this.dynamicStride += 4; //color
      this.dynamicStride += 1; //weight
      
      this.dynamicData = new Float32Array( this.size * this.dynamicStride);
      this.dynamicBuffer = gl.createBuffer();

      gl.bindBuffer(gl.ARRAY_BUFFER, this.dynamicBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, this.dynamicData, gl.DYNAMIC_DRAW);
    },
    
    bind: function(shader){
      var gl = this.gl;

      gl.bindBuffer(gl.ARRAY_BUFFER, this.dynamicBuffer);
      gl.vertexAttribPointer(shader.attributes.aPosition, 2, gl.FLOAT, false, this.dynamicStride * this.byteSize, 0 * this.byteSize);
      gl.vertexAttribPointer(shader.attributes.aColor, 4, gl.FLOAT, false, this.dynamicStride * this.byteSize, 2 * this.byteSize);
      gl.vertexAttribPointer(shader.attributes.aWeight, 1, gl.FLOAT, false, this.dynamicStride * this.byteSize, 6 * this.byteSize);
    },

    flush: function(){
      var gl = this.gl;
      gl.bindBuffer(gl.ARRAY_BUFFER, this.dynamicBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.dynamicData);
    },

    setPositions: function(data, index, count){
      var position;
      var offset = 0;

      for(var i = 0; i < count; i++){
        position = data[i];

        this.dynamicData[ offset] = position.x * -50
        this.dynamicData[ offset + 1] = position.y * -50
        
        offset += this.dynamicStride;
      }
    },

    setColors: function(data, index, count){
      var color = new box2d.b2ParticleColor();
      var offset = 2;

      for(var i = 0; i < count; i++){
        color = data[i].GetColor(color);
        
        this.dynamicData[offset] = color.r;
        this.dynamicData[offset + 1] = color.g;
        this.dynamicData[offset + 2] = color.b;
        this.dynamicData[offset + 3] = color.a;

        offset += this.dynamicStride;
      }
    },

    setWeights: function(data, index, count){
      var position;
      var offset = 6;

      for(var i = 0; i < count; i++){
        this.dynamicData[ offset] = data[i];
        offset += this.dynamicStride;
      }
    }
  });

  return ParticleBuffer;
})