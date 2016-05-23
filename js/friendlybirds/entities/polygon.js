define(['augment','pixi','vendor/poly2tri','underscore','game/game-session','physics/body'],
  function(augment, PIXI, poly2tri, _, gameSession, Body){

  var verticesToContour = function(list){
    var results = [];
    for(var i = 0; i < list.length; i+=2){
      results.push({x:list[i], y:list[i+1]})
    }

    return results;
  }
  var contourToVertices = function(list){
    var results = [];
    for(var i = 0; i < list.length; i++){
      results.push(list[i].x, list[i].y)
    }

    return results;
  }

   var TriangleGraphic = augment(PIXI.Container, function(uber){
    this.constructor = function(vertices, color){
      uber.constructor.call(this);
      var color = color || 0xff0000;

      var graphics = new PIXI.Graphics();
      this.addChild(graphics);
      graphics.lineStyle(1, color)
      graphics.moveTo(vertices[0], vertices[0+1])
      
      for(var k =0; k < vertices.length;k+=2){
        graphics.lineTo(vertices[k], vertices[k+1])
      }
      graphics.lineTo(vertices[0], vertices[0+1])
    }
  });

  var PolygonGraphic = augment(PIXI.Container, function(uber){
    this.constructor = function(vertices, color){
      uber.constructor.call(this);
      var color = color || 0xff0000;

      var graphics = new PIXI.Graphics();
      this.addChild(graphics);
      graphics.lineStyle(1, color)
      graphics.drawPolygon(vertices)

      graphics.lineTo(vertices[0], vertices[1]);
    }
  });



  var Polygon = augment(PIXI.Container, function(uber){
    
    this.constructor = function(texture, data){
      uber.constructor.call(this);
      //this.data = data.slice(0,2);
      this.data = data;
      if(data.length>1){
        this.data = data.slice(0,7);
      }

      for(var i = 0;i<this.data.length;i++){
        this.drawMesh(this.data[i].hull, texture);
      }
      
      this.createBody(this.data);
    }

    this.createBody = function(data){
      this.body = new Body(this, this.x, this.y, 0, gameSession.physicsWorld);
      this.body.polygonFromJSON(_(data).pluck('fixtures').value());
    }
    
    this.getMinimapShape = function(){
      return this.data.hull;
    }
    
    this.drawMesh = function(vertices, texture){
      vertices = vertices.concat([]);

      var contour = verticesToContour(vertices);
      var triangles = new poly2tri.SweepContext(contour).triangulate().getTriangles();
      var triangulated = _(triangles).map(function(triangle){
        return contourToVertices(triangle.getPoints());
      }).flatten().value();
      
      var ww = texture.width;
      var hh = texture.height;

      var vertices = new Float32Array(triangulated);

      uvs = []
      for(var i = 0; i< vertices.length; i+=2){
        var x1 = (vertices[i])/ww
        var y1 = (vertices[i+1])/hh
        uvs.push(x1,y1)
      }

      uvs = new Float32Array(uvs)
      var indices = new Uint16Array(_.times(vertices.length/2, function(n){return n}));
      var mesh = new PIXI.mesh.Mesh(texture, vertices, uvs, indices, PIXI.mesh.Mesh.DRAW_MODES.TRIANGLES)
      mesh._renderCanvasDrawTriangle = this._renderCanvasDrawTriangle;
      this.addChild(mesh);
    }

    this._renderCanvasDrawTriangle = function (context, vertices, uvs, index0, index1, index2)
    {
        var textureSource = this._texture.baseTexture.source;
        var textureWidth = this._texture.baseTexture.width;
        var textureHeight = this._texture.baseTexture.height;

        var x0 = vertices[index0], x1 = vertices[index1], x2 = vertices[index2];
        var y0 = vertices[index0 + 1], y1 = vertices[index1 + 1], y2 = vertices[index2 + 1];

        var u0 = uvs[index0] * textureWidth, u1 = uvs[index1] * textureWidth, u2 = uvs[index2] * textureWidth;
        var v0 = uvs[index0 + 1] * textureHeight, v1 = uvs[index1 + 1] * textureHeight, v2 = uvs[index2 + 1] * textureHeight;
        
        this.canvasPadding = 1;

        if (this.canvasPadding > 0)
        {
            var paddingX = this.canvasPadding / this.worldTransform.a;
            var paddingY = this.canvasPadding / this.worldTransform.d;
            var centerX = (x0 + x1 + x2) / 3;
            var centerY = (y0 + y1 + y2) / 3;

            var normX = x0 - centerX;
            var normY = y0 - centerY;

            var dist = Math.sqrt(normX * normX + normY * normY);
            x0 = centerX + (normX / dist) * (dist + paddingX);
            y0 = centerY + (normY / dist) * (dist + paddingY);

            //

            normX = x1 - centerX;
            normY = y1 - centerY;

            dist = Math.sqrt(normX * normX + normY * normY);
            x1 = centerX + (normX / dist) * (dist + paddingX);
            y1 = centerY + (normY / dist) * (dist + paddingY);

            normX = x2 - centerX;
            normY = y2 - centerY;

            dist = Math.sqrt(normX * normX + normY * normY);
            x2 = centerX + (normX / dist) * (dist + paddingX);
            y2 = centerY + (normY / dist) * (dist + paddingY);
        }

        context.save();
        context.beginPath();


        context.moveTo(x0, y0);
        context.lineTo(x1, y1);
        context.lineTo(x2, y2);

        context.closePath();


      // create a nice shiny pattern!
      // TODO this needs to be refreshed if texture changes..
      if(!this._canvasPattern)
      { 
          var texture = this._texture;
          var baseTexture = texture.baseTexture;
          // cut an object from a spritesheet..
          var tempCanvas = new PIXI.CanvasBuffer(texture._frame.width, texture._frame.height);
          tempCanvas.context.drawImage(baseTexture.source, -texture._frame.x,-texture._frame.y);
          this._canvasPattern = tempCanvas.context.createPattern( tempCanvas.canvas, 'repeat' );
      }
      context.fillStyle = this._canvasPattern;
      context.fill();
    }

    this.debug = function(vertices){
      vertices = vertices.concat([]);
      var contour = verticesToContour(vertices);
      
      //var g = new PolygonGraphic(vertices);
      //this.addChild(g);

      var triangles = new poly2tri.SweepContext(contour).triangulate().getTriangles();
      var trianglulatedList = _(triangles).map(function(triangle){
        return contourToVertices(triangle.getPoints());
      }).value();

      var self = this;
      _.each(trianglulatedList,function(vvv){
        var g = new TriangleGraphic(vvv,0xff0000);
        self.addChild(g);
      });
    }
    
  });

  return Polygon;
});