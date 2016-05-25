define(['augment','box2d'], function(augment, box2d){
  

  var DebugDrawer = augment.defclass({

    constructor: function (pixelsPerMeter)
    {
        this.context = null;
        this.pixelsPerMeter = pixelsPerMeter;
        this.flags = box2d.b2DrawFlags.e_shapeBit;
    },


    color: new box2d.b2Color(1, 1, 1),

    /**
     * Sets which aspects of the world to render
     *
     * @export 
     * @return {void}
     * @param {number} flags - a bitflag made from one or more of the following:
     *     box2d.b2DrawFlags = { e_none, e_shapeBit, e_jointBit, e_aabbBit, e_pairBit, e_centerOfMassBit, e_all }
     */
    SetFlags: function (flags)
    {
        this.flags = flags;
    },

    /**
     * Gets which aspects of the world are currently set to be rendered
     *
     * @export 
     * @return {number} - the flags currently set
     */
    GetFlags: function ()
    {
        return this.flags;
    },

    /**
     * Sets the canvas context to use in subsequent rendering and applies overall transform.
     *
     * @export 
     * @return {void} 
     * @param {CanvasRenderingContext2D} context
     */
    start: function (context, mat)
    {
        this.context = context;
        this.context.save();
        
        this.offsetX = mat[4]/this.pixelsPerMeter
        this.offsetY = mat[5]/this.pixelsPerMeter
        this.context.scale(-1, -1);
        this.context.scale(1/mat[0]*this.pixelsPerMeter, 1/mat[3]*this.pixelsPerMeter);
    },

    /**
     * Resets transform state to original
     *
     * @export 
     * @return {void} 
     */
    stop: function ()
    {
        this.context.restore();
    },

    /**
     * @export 
     * @return {void} 
     * @param {box2d.b2Transform} xf 
     */
    PushTransform: function (xf)
    {
        var ctx = this.context;
        ctx.save();
        ctx.translate(xf.p.x + this.offsetX, xf.p.y + this.offsetY);
        ctx.rotate(xf.q.GetAngle());
    },

    /**
     * @export 
     * @return {void} 
     * @param {box2d.b2Transform} xf 
     */
    PopTransform: function ()
    {
        var ctx = this.context;
        ctx.restore();
    },

    /**
     * @export 
     * @return {void} 
     * @param {Array.<box2d.b2Vec2>} vertices 
     * @param {number} vertexCount 
     * @param {box2d.b2Color} color 
     */
    DrawPolygon: function (vertices, vertexCount, color)
    {
        if (!vertexCount)
        {
            return;
        }

        var ctx = this.context;
        
        ctx.lineWidth = 1 / this.pixelsPerMeter;

        ctx.beginPath();
        ctx.moveTo(vertices[0].x, vertices[0].y);

        for (var i = 1; i < vertexCount; i++)
        {
            ctx.lineTo(vertices[i].x, vertices[i].y);
        }

        ctx.closePath();
        ctx.strokeStyle = color.MakeStyleString(1);
        ctx.stroke();
    },

    /**
     * @export 
     * @return {void} 
     * @param {Array.<box2d.b2Vec2>} vertices 
     * @param {number} vertexCount 
     * @param {box2d.b2Color} color 
     */
    DrawSolidPolygon: function (vertices, vertexCount, color)
    {
        if (!vertexCount)
        {
            return;
        }
        //console.log('DrawAABB', vertices[0].x, vertices[0].y)

        var ctx = this.context;
        
        ctx.lineWidth = 1 / this.pixelsPerMeter;

        ctx.beginPath();
        ctx.moveTo(vertices[0].x, vertices[0].y);

        for (var i = 1; i < vertexCount; i++)
        {
            ctx.lineTo(vertices[i].x, vertices[i].y);
        }

        ctx.closePath();
        ctx.fillStyle = color.MakeStyleString(0.5);
        ctx.fill();
        ctx.strokeStyle = color.MakeStyleString(1);
        ctx.stroke();
    },

    /**
     * @export 
     * @return {void} 
     * @param {box2d.b2Vec2} center 
     * @param {number} radius 
     * @param {box2d.b2Color} color 
     */
    DrawCircle: function (center, radius, color)
    {
        if (!radius)
        {
            return;
        }

        var ctx = this.context;

        ctx.beginPath();
        ctx.arc(center.x, center.y, radius, 0, Math.PI * 2, true);
        ctx.strokeStyle = color.MakeStyleString(1);
        ctx.stroke();
    },

    /**
     * @export 
     * @return {void} 
     * @param {box2d.b2Vec2} center 
     * @param {number} radius 
     * @param {box2d.b2Vec2} axis 
     * @param {box2d.b2Color} color 
     */
    DrawSolidCircle: function (center, radius, axis, color)
    {
        if (!radius)
        {
            return;
        }

        var ctx = this.context;
        
        ctx.lineWidth = 1 / this.pixelsPerMeter;

        var cx = center.x;
        var cy = center.y;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2, true);
        ctx.moveTo(cx, cy);
        ctx.lineTo((cx + axis.x * radius), (cy + axis.y * radius));
        ctx.fillStyle = color.MakeStyleString(0.5);
        ctx.fill();
        ctx.strokeStyle = color.MakeStyleString(1);
        ctx.stroke();
    },

    /**
     * @export 
     * @return {void} 
     * @param {box2d.b2Vec2} p1 
     * @param {box2d.b2Vec2} p2 
     * @param {box2d.b2Color} color 
     */
    DrawSegment: function (p1, p2, color)
    {
        var ctx = this.context;
        
        ctx.lineWidth = 1 / this.pixelsPerMeter;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = color.MakeStyleString(1);
        ctx.stroke();
    },

    /**
     * @export 
     * @return {void} 
     * @param {box2d.b2Transform} xf 
     */
    DrawTransform: function (xf)
    {
        var ctx = this.context;
        
        ctx.lineWidth = 1 / this.pixelsPerMeter;

        this.PushTransform(xf);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(1, 0);
        ctx.strokeStyle = box2d.b2Color.RED.MakeStyleString(1);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 1);
        ctx.strokeStyle = box2d.b2Color.GREEN.MakeStyleString(1);
        ctx.stroke();

        this.PopTransform(xf);
    },

    /**
     * @export 
     * @return {void} 
     * @param {box2d.b2Vec2} p 
     * @param {number} size 
     * @param {box2d.b2Color} color 
     */
    DrawPoint: function (p, size, color)
    {
        var ctx = this.context;

        ctx.fillStyle = color.MakeStyleString();
        //size /= this.m_settings.viewZoom;
        //size /= this.m_settings.canvasScale;
        var hsize = size / 2;
        ctx.fillRect(p.x - hsize, p.y - hsize, size, size);
    },

    /**
     * @export 
     * @return {void} 
     * @param {box2d.b2AABB} aabb 
     * @param {box2d.b2Color} color 
     */
    DrawAABB: function (aabb, color)
    {
        var ctx = this.context;
        ctx.strokeStyle = color.MakeStyleString();
        var x = aabb.lowerBound.x;
        var y = aabb.lowerBound.y;
        var w = aabb.upperBound.x - aabb.lowerBound.x;
        var h = aabb.upperBound.y - aabb.lowerBound.y;
        ctx.strokeRect(x, y, w, h);
    },

    DrawParticles: function (centers, radius, colors, count){
      var ctx = this.context;

      var diameter = 2 * radius;

      ctx.save();
      ctx.translate(this.offsetX, this.offsetY);

      if (colors !== null)
      {
        for (var i = 0; i < count; ++i)
        {
          var center = centers[i];
          var color = colors[i];
          ctx.fillStyle = 'rgba(' + color.r + ',' + color.g + ',' + color.b + ',' + (color.a/255.0) + ')';
          ctx.fillRect(center.x - radius, center.y - radius, diameter, diameter);
          //ctx.beginPath();
          //ctx.arc(center.x, center.y, radius, 0, box2d.b2_pi * 2, true);
          //ctx.fill();
        }
      }
      else
      {
        ctx.fillStyle = 'rgba(255,255,0,0.5)';
        ctx.beginPath();
        for (var i = 0; i < count; ++i)
        {
          var center = centers[i];
          ctx.rect(center.x - radius, center.y - radius, diameter, diameter);
          //ctx.beginPath();
          //ctx.arc(center.x, center.y, radius, 0, box2d.b2_pi * 2, true);
          //ctx.fill();
        }
        ctx.fill();
      }

      ctx.restore();
    }
  });


  
    /**
    * @name Phaser.Physics.Box2D.DefaultDebugDraw#shapes
    * @property {boolean} shapes - Specifies whether the debug draw should render shapes.
    */
    Object.defineProperty(DebugDrawer.prototype, "shapes", {

          get: function () {

              return this.flags & box2d.b2DrawFlags.e_shapeBit;

          },

          set: function (value) {

              if (value)
              {
                  this.flags |= box2d.b2DrawFlags.e_shapeBit;
              }
              else
              {
                  this.flags &= ~box2d.b2DrawFlags.e_shapeBit;
              }

          }

      });

    Object.defineProperty(DebugDrawer.prototype, "joints", {

        get: function () {

            return this.flags & box2d.b2DrawFlags.e_jointBit;

        },

        set: function (value) {

            if (value)
            {
                this.flags |= box2d.b2DrawFlags.e_jointBit;
            }
            else
            {
                this.flags &= ~box2d.b2DrawFlags.e_jointBit;
            }

        }

    });

    /**
    * @name DebugDrawer#aabbs
    * @property {boolean} aabbs - Specifies whether the debug draw should render fixture AABBs.
    */
    Object.defineProperty(DebugDrawer.prototype, "aabbs", {

        get: function () {

            return this.flags & box2d.b2DrawFlags.e_aabbBit;

        },

        set: function (value) {

            if (value)
            {
                this.flags |= box2d.b2DrawFlags.e_aabbBit;
            }
            else
            {
                this.flags &= ~box2d.b2DrawFlags.e_aabbBit;
            }

        }

    });

    /**
    * @name DebugDrawer#pairs
    * @property {boolean} pairs - Specifies whether the debug draw should render contact pairs.
    */
    Object.defineProperty(DebugDrawer.prototype, "pairs", {

        get: function () {

            return this.flags & box2d.b2DrawFlags.e_pairBit;

        },

        set: function (value) {

            if (value)
            {
                this.flags |= box2d.b2DrawFlags.e_pairBit;
            }
            else
            {
                this.flags &= ~box2d.b2DrawFlags.e_pairBit;
            }

        }

    });

    /**
    * @name DebugDrawer#centerOfMass
    * @property {boolean} centerOfMass - Specifies whether the debug draw should render the center of mass of bodies.
    */
    Object.defineProperty(DebugDrawer.prototype, "centerOfMass", {

        get: function () {

            return this.flags & box2d.b2DrawFlags.e_centerOfMassBit;

        },

        set: function (value) {

            if (value)
            {
                this.flags |= box2d.b2DrawFlags.e_centerOfMassBit;
            }
            else
            {
                this.flags &= ~box2d.b2DrawFlags.e_centerOfMassBit;
            }

        }

    });

     /**
    * @name DebugDrawer#centerOfMass
    * @property {boolean} centerOfMass - Specifies whether the debug draw should render the center of mass of bodies.
    */
    Object.defineProperty(DebugDrawer.prototype, "particles", {

        get: function () {

            return this.flags & box2d.b2DrawFlags.e_particleBit;

        },

        set: function (value) {

            if (value)
            {
                this.flags |= box2d.b2DrawFlags.e_particleBit;
            }
            else
            {
                this.flags &= ~box2d.b2DrawFlags.e_particleBit;
            }

        }

    });



  return DebugDrawer;
});