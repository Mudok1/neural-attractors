import * as THREE from "three";

class SmokeBackground {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        this.plane = new THREE.PlaneGeometry(2, 2);

        this.material = new THREE.ShaderMaterial({
            uniforms: {
                u_time: { value: 0.0 },
                u_color1: { value: new THREE.Color(0x0a1a2f) }, 
                u_color2: { value: new THREE.Color(0x2a5298) }, 
                u_accent: { value: new THREE.Color(0x4b2c72) }, 
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                precision highp float;

                uniform float u_time;
                uniform vec3 u_color1;
                uniform vec3 u_color2;
                uniform vec3 u_accent;
                varying vec2 vUv;

                // Simplex Noise 2D
                vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

                float snoise(vec2 v) {
                    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                                        -0.577350269189626, 0.024390243902439);
                    vec2 i = floor(v + dot(v, C.yy));
                    vec2 x0 = v - i + dot(i, C.xx);
                    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                    vec4 x12 = x0.xyxy + C.xxzz;
                    x12.xy -= i1;
                    i = mod289(i);
                    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                                    + i.x + vec3(0.0, i1.x, 1.0));
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
                    n0 = t0 < 0.0 ? 0.0 : pow(t0, 4.0) * dot(g0, x0);
                    n1 = t1 < 0.0 ? 0.0 : pow(t1, 4.0) * dot(g1, x12.xy);
                    n2 = t2 < 0.0 ? 0.0 : pow(t2, 4.0) * dot(g2, x12.zw);
                    return 70.0 * (n0 + n1 + n2);
                }

                // - Fractal Brownian Motion 
                float fbm(vec2 st) {
                    float value = 0.0;
                    float amp = 0.5;
                    for (int i = 0; i < 5; i++) {
                        value += amp * snoise(st);
                        st *= 2.0;
                        amp *= 0.5;
                    }
                    return value;
                }

                void main() {
                    vec2 uv = vUv * 3.0;
                    uv.x += u_time * 0.005;
                    uv.y -= u_time * 0.002;

                    // --- Domain Warping ---
                    float n1 = fbm(uv + u_time * 0.05);
                    float n2 = fbm(uv + n1 * 2.0);
                    float n = fbm(uv + n1 + n2);

                    // Gradiente de color
                    vec3 baseColor = mix(u_color1, u_color2, n);

                    //Toque purpura
                    float accentMask = smoothstep(0.4, 0.7, n);
                    vec3 finalColor = mix(baseColor, u_accent, accentMask * 0.25);

                    
                    finalColor *= 0.30;

                    gl_FragColor = vec4(finalColor, 1.0);
                }
            `,
            side: THREE.DoubleSide,
            depthTest: false,
            depthWrite: false,
        });

        this.quad = new THREE.Mesh(this.plane, this.material);
        this.scene.add(this.quad);
    }
}

export default SmokeBackground;
