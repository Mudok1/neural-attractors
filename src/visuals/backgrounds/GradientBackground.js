import * as THREE from "three"

class GradientBackground {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.plane = new THREE.PlaneGeometry(2,2);
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                u_time: { value: 0.0 },
                u_color1: { value: new THREE.Color(0x0d1b2a) }, // azul casi negro
                u_color2: { value: new THREE.Color(0x1b263b) }, // azul marino
                u_accent: { value: new THREE.Color(0x3a0ca3) }  // púrpura sutil
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float u_time;
                uniform vec3 u_color1;
                uniform vec3 u_color2;
                uniform vec3 u_accent;
                varying vec2 vUv;
        
                // Simplex noise GLSL 
                vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

                float snoise(vec2 v){
                    const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                                        0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                                        -0.577350269189626, // -1.0 + 2.0 * C.x
                                        0.024390243902439); // 1.0 / 41.0
                    vec2 i  = floor(v + dot(v, C.yy));
                    vec2 x0 = v -   i + dot(i, C.xx);

                    vec2 i1;
                    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                    vec4 x12 = x0.xyxy + C.xxzz;
                    x12.xy -= i1;

                    i = mod289(i); // Avoid truncation effects in permutation
                    vec3 p = permute( permute(
                                i.y + vec3(0.0, i1.y, 1.0 ))
                            + i.x + vec3(0.0, i1.x, 1.0 ));

                    vec3 x = fract(p * C.w) * 2.0 - 1.0;
                    vec3 h = abs(x) - 0.5;
                    vec3 ox = floor(x + 0.5);
                    vec3 a0 = x - ox;

                    vec2 g0 = vec2(a0.x, h.x);
                    vec2 g1 = vec2(a0.y, h.y);
                    vec2 g2 = vec2(a0.z, h.z);

                    float t0 = 0.5 - dot(x0, x0);
                    float t1 = 0.5 - dot(x12.xy, x12.xy);
                    float t2 = 0.5 - dot(x12.zw, x12.zw);

                    float n0, n1, n2;
                    n0 = t0<0.0 ? 0.0 : pow(t0, 4.0) * dot(g0, x0);
                    n1 = t1<0.0 ? 0.0 : pow(t1, 4.0) * dot(g1, x12.xy);
                    n2 = t2<0.0 ? 0.0 : pow(t2, 4.0) * dot(g2, x12.zw);

                    return 70.0 * (n0 + n1 + n2);
                }

                void main() {
                    // base UV + animación temporal
                    vec2 uv = vUv * 3.0; 
                    float n = snoise(uv + vec2(u_time * 0.1, u_time * 0.15));

                    // Gradiente azul 
                    float gradient = vUv.y + 0.5 * n;
                    vec3 color = mix(u_color1, u_color2, clamp(gradient, 0.0, 1.0));

                    float accentMask = smoothstep(0.2, 0.6, n); //  ruido > 0.2
                    color = mix(color, u_accent, accentMask * 0.35);

                    color *= 0.9;

                    gl_FragColor = vec4(color, 1.0);
                }

            `,
            side: THREE.DoubleSide,
            depthTest: false,
            depthWrite: false
        });
        

        this.quad = new THREE.Mesh(this.plane, this.material);

        this.scene.add(this.quad)
    }



}

export default GradientBackground;