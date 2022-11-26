import * as THREE from 'three';
import { extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import glsl from 'babel-plugin-glsl/macro';

const FbmMaterial = shaderMaterial(
  {
    time: 1,
    uvScale: new THREE.Vector2(3.0, 1.0),
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
      #define  iTime time
      // https://threejs.org/examples/webgl_shader_lava.html
      uniform float time;
      varying vec2 vUv;
      
      float noise(vec2 st){
        return fract(sin(dot(vec2(12.23,74.343),st))*43254.);  
      }
    
      #define pi acos(-1.)
      float noise2D(vec2 st){
        
        //id,fract
        vec2 id =floor(st);
        vec2 f = fract(st);
        
        //nachbarn
        float a = noise(id);
        float b = noise(id + vec2(1.,0.));
        float c = noise(id + vec2(0.,1.));
        float d = noise(id + vec2(1.));
        
        
        //f
        f = smoothstep(0.,1.,f);
        
        //mix
        float ab = mix(a,b,f.x);
        float cd = mix(c,d,f.x);
        return mix(ab,cd,f.y);
      }
      
      mat2 rot45 = mat2(0.707,-0.707,0.707,0.707);
      
      mat2 rot(float a){
        float s = sin(a); float c = cos(a);
        return mat2(c,-s,s,c);
      }
      float fbm(vec2 st, float N, float rt){
          st*=3.;
      
        float s = .5;
        float ret = 0.;
        for(float i = 0.; i < N; i++){
          
            ret += noise2D(st)*s; st *= 2.9; s/=2.; st *= rot((pi*(i+1.)/N)+rt*8.);
            st.x += iTime/10.;
        }
        return ret;
        
      }
    
      // todo: parameter to make it more intense. understand to code
      void main( void ) {
        vec2 uv = - 1.0 + 2.0 * vUv;
        // polar coordinates
        //uv = vec2(atan(uv.x,uv.y), length(uv));

        uv.x += iTime*0.04;
        float fa1 = fbm(uv*rot(sin(uv.x)*0.001) ,5., 3.);
        float fb1 = fbm(uv ,5., 5.);
        
        float fa2 = fbm(uv+sin(uv.x*15.) + fa1*5. ,4., 8.);
        float fb2 = fbm(uv + fb1 , 5., 6.);
      
        float fa3 = fbm(uv*1.5 + fa2 ,5., 1.);
        float fb3 = fbm(uv + fa2, 3., 2.);
        
        vec3 col = vec3(0);
        float circle = (fa3);
        
        //salt stained marble thing
        //metal blue
        col=mix(col,vec3(0.1,0.3,0.6),pow(fa3*2.4,1.5));
        
        //metal red
        col=mix(col,vec3(0.9,0.3,0.3),clamp(pow(fb2*.7,1.9),0.,1.));
        
        //black
        //col=mix(col,vec3(0.,0.,0.),clamp(pow(fa2*2.,9.),0.,1.)*0.3);
        
        //gold
        col=mix(col,vec3(0.9,0.6,0.3),clamp(pow(fa2*1.5,20.)*0.7,0.,1.));
        
        //black
      col=mix(col,vec3(0.),clamp(pow(fb1*1.6,1.)*0.8,0.,1.));
        
        //white
        col=mix(col,vec3(0.99),clamp(pow(fb2*1.4-0.05,20.),0.,1.));
      
        col.yz *= rot(-0.12);

        gl_FragColor = vec4(col,1.);
      }`
);

extend({ FbmMaterial });

export { FbmMaterial };
