precision lowp float;
uniform sampler2D uDiffuseTexture; // diffuse texture for particle
varying vec4 vColor;             // input color from vertex shader

void main() {
  gl_FragColor = texture2D(uDiffuseTexture, gl_PointCoord);
  gl_FragColor *= vColor;
}