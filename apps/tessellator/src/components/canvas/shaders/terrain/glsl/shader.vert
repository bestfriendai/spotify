#pragma glslify: noise = require('glsl-noise/simplex/3d')
varying vec3 vUv; 
uniform float uTime;
uniform float uXScale;
uniform float uYScale;
uniform float uAmplitude;

void main() {
  vUv = vec3(position.xy, noise(vec3(position.x / uXScale, position.y / uYScale, uTime))); 

  vec4 modelViewPosition = modelViewMatrix * vec4(vUv, 1.0);
  gl_Position = projectionMatrix * modelViewPosition; 
}
