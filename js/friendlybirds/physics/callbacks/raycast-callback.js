define(['augment', 'box2d'], function(augment, box2d){
    var RayCastCallback = augment(box2d.b2RayCastCallback, function(uber){
      this.constructor = function(world, closestHitOnly, filterFunction){
        this.world = world;
        this.closestHitOnly = closestHitOnly;
        this.filterFunction = filterFunction;    
        this.hits = [];
      }

      this.ReportFixture = function (fixture, point, normal, fraction){
          // If a filter function was given, use that to decide if this hit should be ignored
          if (this.filterFunction !== null )
          {
              var pxPoint = { x: this.world.mpx(-point.x), y: this.world.mpx(-point.y) };
              var pxNormal = { x: -normal.x, y: -normal.y };
              var body = fixture.GetBody().parent;

              if (!this.filterFunction.call(this, body, fixture, pxPoint, pxNormal))
              {
                  return -1;
              }
          }
          
          // If we are looking for the closest hit, we will have returned 'fraction' from any previously
          // reported hits to clip the ray length, so we know this hit is closer than what we already had.
          if (this.closestHitOnly)
          {
              this.hits = [];
          }
          
          var hit = {};
          hit.body = fixture.GetBody().parent;
          hit.fixture = fixture;
          hit.point = { x: point.x, y: point.y };
          hit.normal = { x: normal.x, y: normal.y };
          this.hits.push(hit);
          
          if (this.closestHitOnly)
          {
              return fraction;
          }
          else
          {
              return 1;
          }

      };
    });
    
    return RayCastCallback;
});