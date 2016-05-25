define(['augment'], function(augment){

  var Vector2 = augment.defclass({
    constructor: function(x, y){
      this.x = x || 0;
      this.y = y || 0;
    },
    set: function ( x, y ) {

      this.x = x;
      this.y = y;

      return this;

    },
    copy: function ( v ) {

      this.x = v.x;
      this.y = v.y;

      return this;

    },
    
    add: function ( v ) {

      this.x += v.x;
      this.y += v.y;

      return this;

    },

    addScalar: function ( s ) {

      this.x += s;
      this.y += s;

      return this;

    },

    sub: function ( v ) {

      this.x -= v.x;
      this.y -= v.y;

      return this;

    },

    multiply: function ( v ) {

      this.x *= v.x;
      this.y *= v.y;

      return this;

    },
    multiplyScalar: function ( s ) {

      this.x *= s;
      this.y *= s;

      return this;

    },
    

    divide: function ( v ) {

      this.x /= v.x;
      this.y /= v.y;

      return this;

    },

    divideScalar: function ( scalar ) {

      if ( scalar !== 0 ) {

        var invScalar = 1 / scalar;

        this.x *= invScalar;
        this.y *= invScalar;

      } else {

        this.x = 0;
        this.y = 0;

      }

      return this;

    },

    angle: function(){

      return Math.atan2(this.y, this.x);
      
    },


    lengthSq: function () {

      return this.x * this.x + this.y * this.y;

    },

    length: function () {

      return Math.sqrt( this.x * this.x + this.y * this.y );

    },
    
    limitLength: function(maxLength){

      if(this.length() > maxLength){
        this.setLength(maxLength);
      }
      
      return this;
    },

    setLength: function ( l ) {

      var oldLength = this.length();

      if ( oldLength !== 0 && l !== oldLength ) {

        this.multiplyScalar( l / oldLength );
      }

      return this;

    },

    normalize: function () {

      return this.divideScalar( this.length() );

    },

    clone: function () {

      return new LENKDENK.Vector2( this.x, this.y );

    }
  });

  return Vector2;
});