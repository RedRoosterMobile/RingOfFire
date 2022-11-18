import * as THREE from 'three'
import { extend } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import glsl from 'babel-plugin-glsl/macro'

// This shader is from Bruno Simons Threejs-Journey: https://threejs-journey.xyz
const LavaMaterial = shaderMaterial(
  {
    time: 1.,
    fogColor: new THREE.Color('#505050'),
    fogDensity: 0.69,
    texture1: undefined,
    texture2: undefined,
    uvScale: new THREE.Vector2( 3.0, 1.0 )
  },
  glsl`
      uniform vec2 uvScale;
      varying vec2 vUv;
      
      void main()
      {
        vUv = uvScale * uv;
        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
        gl_Position = projectionMatrix * mvPosition;
      }
  `,
  // for more heat distortion https://www.shadertoy.com/view/XsVSRd
  glsl`
      #define PI 3.14159265359
      // https://threejs.org/examples/webgl_shader_lava.html
      uniform float time;

      uniform float fogDensity;
      uniform vec3 fogColor;
      // noise
      // https://threejs.org/examples/textures/lava/cloud.png
      uniform sampler2D texture1;
      // lavatile
      // https://threejs.org/examples/textures/lava/lavatile.jpg
      uniform sampler2D texture2;

      varying vec2 vUv;
      
      // Simplex 2D noise
      // usage https://www.shadertoy.com/view/cssXD8
      vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

      float snoise(vec2 v){
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod(i, 289.0);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
          dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }
      float snoise_octaves(vec2 uv, int octaves, float alpha, float beta, vec2 gamma, float delta) {
          vec2 pos = uv;
          float t = 1.0;
          float s = 1.0;
          vec2 q = gamma;
          float r = 0.0;
          for(int i=0;i<octaves;i++) {
              r += s * snoise(pos + q);
              pos += t * uv;
              t *= beta;
              s *= alpha;
              q *= delta;
          }
          return r;
      }
      // not used?
      vec2 mainUv(vec2 uv, vec4 tex) {
        float angle = -((tex.r) * (PI* 2.) - PI);
        float vx = -(tex.r *2. - 1.);
        float vy = -(tex.g *2. - 1.);
        float intensity = tex.b;
        uv.x += vx * 0.2 * intensity;
        uv.y += vy * 0.2  *intensity;
        return uv;
      }
      
      // todo: parameter to make it more intense. understand to code
      void main( void ) {
        vec2 newUv = mainUv(vUv, gl_FragColor);
        //vec2 uUv = - 1.0 + 2.0 * vUv;
        

        vec4 noise = texture2D( texture1, newUv );
        vec2 T1 = vUv + vec2( 1.5, - 1.5 ) * time * 0.02;
        vec2 T2 = vUv + vec2( - 0.5, 2.0 ) * time * 0.01;

        T1.x += noise.x * 2.0;
        T1.y += noise.y * 2.0;
        T2.x -= noise.y * 0.2;
        T2.y += noise.z * 0.2;

        float p = texture2D( texture1, T1 * 2.0 ).a;

        vec4 color = texture2D( texture2, T2 * 2.0 );
        vec4 temp = color * ( vec4( p, p, p, p ) * 2.0 ) + ( color * color - 0.1 );

        if( temp.r > 1.0 ) { temp.bg += clamp( temp.r - 2.0, 0.0, 100.0 ); }
        if( temp.g > 1.0 ) { temp.rb += temp.g - 1.0; }
        if( temp.b > 1.0 ) { temp.rg += temp.b - 1.0; }

        gl_FragColor = temp;

        float depth = gl_FragCoord.z / gl_FragCoord.w;
        const float LOG2 = 1.442695;
        float fogFactor = exp2( - fogDensity * fogDensity * depth * depth * LOG2 );
        fogFactor = 1.0 - clamp( fogFactor, 0.0, 1.0 );
        //vec2 newUv = vUv+time; 
        // gl_FragColor =  texture2D( texture2, newUv);
        
        gl_FragColor =  mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );
      }`
)

extend({ LavaMaterial })

export { LavaMaterial }
/*
vec4 mainUv(vec2 uv, vec4 tex) {
  float angle = -((tex.r) * (3.14159265359 * 2.) - 3.14159265359);
  float vx = -(tex.r *2. - 1.);
  float vy = -(tex.g *2. - 1.);
  float intensity = tex.b;
  uv.x += vx * 0.2 * intensity;
  uv.y += vy * 0.2  *intensity;
  return uv;
}
*/