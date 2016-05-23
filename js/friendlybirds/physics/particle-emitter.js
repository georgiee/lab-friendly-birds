define(['augment','box2d'], function(augment, box2d){
  var RadialEmitter = augment.defclass({
    m_particleSystem: null,
    m_callback: null,
    m_origin:null,
    m_startingVelocity:null,
    m_speed: 0.0,
    m_halfSize: null,
    m_emitRate: 1.0,
    m_color:null,
    m_emitRemainder: 0.0,
    m_flags: box2d.b2ParticleFlag.b2_waterParticle,
    m_group: null,

    constructor: function(){
      this.m_origin = new box2d.b2Vec2();
      this.m_startingVelocity = new box2d.b2Vec2();
      this.m_halfSize = new box2d.b2Vec2();
      this.m_color = new box2d.b2ParticleColor();
    },

    SetPosition: function (origin)
    {
      this.m_origin.Copy(origin);
    },

    GetPosition: function (out)
    {
      return out.Copy(this.m_origin);
    },

    
    SetSize: function (size)
    {
      this.m_halfSize.Copy(size).SelfMul(0.5);
    },

 
    GetSize: function (out)
    {
      return out.Copy(this.m_halfSize).SelfMul(2.0);
    },

    /** 
     * Set the starting velocity of emitted particles. 
     * @return {void} 
     * @param {box2d.b2Vec2} velocity 
     */
    SetVelocity: function (velocity)
    {
      this.m_startingVelocity.Copy(velocity);
    },

    /** 
     * Get the starting velocity. 
     * @return box2d.b2Vec2}
     */
    GetVelocity: function (out)
    {
      return out.Copy(this.m_startingVelocity);
    },

    /** 
     * Set the speed of particles along the direction from the 
     * center of the emitter. 
     * @return {void} 
     * @param {number} speed 
     */
    SetSpeed: function (speed)
    {
      this.m_speed = speed;
    },

    /** 
     * Get the speed of particles along the direction from the 
     * center of the emitter. 
     * @return {number}
     */
    GetSpeed: function ()
    {
      return this.m_speed;
    },

    /** 
     * Set the flags for created particles. 
     * @return {void} 
     * @param {number} flags 
     */
    SetParticleFlags: function (flags)
    {
      this.m_flags = flags;
    },

    /** 
     * Get the flags for created particles. 
     * @return {number}
     */
    GetParticleFlags: function ()
    {
      return this.m_flags;
    },

    /** 
     * Set the color of particles. 
     * @return {void} 
     * @param {box2d.b2ParticleColor} color 
     */
    SetColor: function (color)
    {
      this.m_color.Copy(color);
    },

    /** 
     * Get the color of particles emitter. 
     * @return {box2d.b2ParticleColor}
     */
    GetColor: function (out)
    {
      return out.Copy(this.m_color);
    },

    /** 
     * Set the emit rate in particles per second. 
     * @return {void} 
     * @param {number} emitRate 
     */
    SetEmitRate: function (emitRate)
    {
      this.m_emitRate = emitRate;
    },

    /** 
     * Get the current emit rate. 
     * @return {number}
     */
    GetEmitRate: function ()
    {
      return this.m_emitRate;
    },

    /** 
     * Set the particle system this emitter is adding particles to. 
     * @return {void} 
     * @param {box2d.b2ParticleSystem} particleSystem 
     */
    SetParticleSystem: function (particleSystem)
    {
      this.m_particleSystem = particleSystem;
    },

    /** 
     * Get the particle system this emitter is adding particle to. 
     * @return {box2d.b2ParticleSystem}
     */
    GetParticleSystem: function ()
    {
      return this.m_particleSystem;
    },

    /** 
     * Set the callback that is called on the creation of each 
     * particle. 
     * @return {void} 
     * @param {box2d.Testbed.EmittedParticleCallback} callback 
     */
    SetCallback: function (callback)
    {
      this.m_callback = callback;
    },

    /** 
     * Get the callback that is called on the creation of each 
     * particle. 
     * @return {box2d.Testbed.EmittedParticleCallback}
     */
    GetCallback: function ()
    {
      return this.m_callback;
    },

    /** 
     * This class sets the group flags to b2_particleGroupCanBeEmpty 
     * so that it isn't destroyed and clears the 
     * b2_particleGroupCanBeEmpty on the group when the emitter no 
     * longer references it so that the group can potentially be 
     * cleaned up. 
     * @return {void} 
     * @param {box2d.b2ParticleGroup} group 
     */
    SetGroup: function (group)
    {
      if (this.m_group)
      {
        this.m_group.SetGroupFlags(this.m_group.GetGroupFlags() & ~box2d.b2ParticleGroupFlag.b2_particleGroupCanBeEmpty);
      }
      this.m_group = group;
      if (this.m_group)
      {
        this.m_group.SetGroupFlags(this.m_group.GetGroupFlags() | box2d.b2ParticleGroupFlag.b2_particleGroupCanBeEmpty);
      }
    },

    /** 
     * Get the group particles should be created within. 
     * @return {box2d.b2ParticleGroup}
     */
    GetGroup: function ()
    {
      return this.m_group;
    },

    /** 
     * dt is seconds that have passed, particleIndices is an 
     * optional pointer to an array which tracks which particles 
     * have been created and particleIndicesCount is the size of the 
     * particleIndices array. This function returns the number of 
     * particles created during this simulation step. 
     * @return {number} 
     * @param {number} dt 
     * @param {Array.<number>=} particleIndices 
     * @param {number=} particleIndicesCount 
     */
    Step: function (dt, particleIndices, particleIndicesCount)
    {
      box2d.b2Assert(this.m_particleSystem !== null);
      var numberOfParticlesCreated = 0;
      // How many (fractional) particles should we have emitted this frame?
      this.m_emitRemainder += this.m_emitRate * dt;

      var pd = new box2d.b2ParticleDef();
      pd.color.Copy(this.m_color);
      pd.flags = this.m_flags;
      pd.group = this.m_group;

      // Keep emitting particles on this frame until we only have a
      // fractional particle left.
      while (this.m_emitRemainder > 1.0) {
        this.m_emitRemainder -= 1.0;

        // Randomly pick a position within the emitter's radius.
        var angle = RadialEmitter.Random() * 2.0 * box2d.b2_pi;
        // Distance from the center of the circle.
        var distance = RadialEmitter.Random();
        var positionOnUnitCircle = new box2d.b2Vec2(Math.sin(angle), Math.cos(angle));

        // Initial position.
        pd.position.Set(
          this.m_origin.x + positionOnUnitCircle.x * distance * this.m_halfSize.x,
          this.m_origin.y + positionOnUnitCircle.y * distance * this.m_halfSize.y);
        // Send it flying
        pd.velocity.Copy(this.m_startingVelocity);
        if (this.m_speed !== 0.0)
        {
          /// pd.velocity += positionOnUnitCircle * m_speed;
          pd.velocity.SelfMulAdd(this.m_speed, positionOnUnitCircle);
        }

        var particleIndex = this.m_particleSystem.CreateParticle(pd);
        if (this.m_callback)
        {
          this.m_callback.ParticleCreated(this.m_particleSystem, particleIndex);
        }
        if ((particleIndices !== null) && (numberOfParticlesCreated < particleIndicesCount))
        {
          particleIndices[numberOfParticlesCreated] = particleIndex;
        }
        ++numberOfParticlesCreated;
      }
      return numberOfParticlesCreated;
    }
  });
  
  RadialEmitter.Random = function (){
    return Math.random();
  }
  
  return RadialEmitter;
});




//#endif

