import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { array } from "three/tsl";

import GradientBackground from "../backgrounds/GradientBackground";
import SmokeBackground from "../backgrounds/SmokeBackground";

class ThreeJSRenderer {
    constructor(containerId) {
        this.rendererType = "3D";
        this.container = document.getElementById(containerId);
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.container.appendChild(this.renderer.domElement)

        this.points = [];
        this.maxPoints = 8000;
        this.lastPointCount = 0

        // variables Autocentrado
        this.minBounds = new THREE.Vector3(Infinity, Infinity, Infinity);
        this.maxBounds = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
        this.centerOffset = new THREE.Vector3(0, 0, 0);
        this.boundsCalculated = false;

        //this.background = new GradientBackground();
        this.background = new SmokeBackground();

        this._elapsedTime = 0;
        this._lastTime = performance.now()

        this.setupScene();
        this.setupOrbitControls()

    }

    setupScene() {
        console.log('Llego');


        // Camara
        this.camera.position.set(0, 0, 80);
        this.camera.lookAt(0, 0, 0);

        this.linesGeometry = new LineGeometry();
        this.linesMaterial = new LineMaterial({
            linewidth: 1,
            vertexColors: true,
            transparent: true,
            opacity: 1,
            blending: THREE.AdditiveBlending
            //resolution: new THREE.Vector2(window.innerWidth, window.innerHeight)    
        });

        
        this.positions = new Float32Array(this.maxPoints * 3);
        this.linesGeometry.setPositions(this.positions)
        this.linesGeometry.setDrawRange(0, 0);

        this.colors = new Float32Array(this.maxPoints * 3);

        this.hueOffset = 0;
        this.hueSpeed  = 0.015;   
        this.startHue  = 210;     // azul base
        this.hueRange  = 60;      //  (210–270)
        this.saturation = 0.8;   
        this.minLight   = 0.35;   
        this.maxLight   = 0.7;   

        this._tmpColor = new THREE.Color();
        this._lastTime = performance.now();
        
        this.lines = new Line2(this.linesGeometry, this.linesMaterial);
        this.scene.add(this.lines);

        //DUPLICADO LINEA GLOW

        this.glowMaterial = new LineMaterial({
            color: 0x66ccff,          // Azul brillante
            linewidth: 2.2,           
            transparent: true,
            opacity: 0.3,             
            blending: THREE.AdditiveBlending,
            vertexColors: false       
        });
        this.glowLine = new Line2(this.linesGeometry, this.glowMaterial);
        this.scene.add(this.glowLine);
        this.glowMaterial.resolution.set(window.innerWidth, window.innerHeight);


        // Segundo glow (aura muy difusa)
        this.glowMaterial2 = new LineMaterial({
            color: 0xffffff,
            linewidth: 5.0,              
            transparent: true,
            opacity: 0.08,            
            blending: THREE.AdditiveBlending,
            vertexColors: false
        });
        this.glowLine2 = new Line2(this.linesGeometry, this.glowMaterial2);
        this.scene.add(this.glowLine2);
        this.glowMaterial2.resolution.set(window.innerWidth, window.innerHeight);
    }

    setupOrbitControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        
    }

    calculateBounds(point) {

        this.minBounds.min(point);
        this.maxBounds.max(point);

        if (this.points.length > 100 && !this.boundsCalculated) {
            this.centerOffset.copy(this.minBounds).add(this.maxBounds).multiplyScalar(0.5);
            this.boundsCalculated = true;
            console.log("Centro:", this.centerOffset);
        }
    }

    calculateBoundsFromArray(pointsArray) {
        if (!pointsArray || pointsArray.length === 0) {
            console.warn("No se proporcionaron puntos para calcular bounds");
            return;
        }
    
        console.log(`centro con ${pointsArray.length} puntos previos`);
    
        // Reset bounds
        this.minBounds.set(Infinity, Infinity, Infinity);
        this.maxBounds.set(-Infinity, -Infinity, -Infinity);
    
        // Procesar todos los puntos del array
        pointsArray.forEach(point => {
            const vector = new THREE.Vector3(point.x, point.y, point.z);
            this.minBounds.min(vector);
            this.maxBounds.max(vector);
        });
    
        // Calcular centro inmediatamente
        this.centerOffset.copy(this.minBounds).add(this.maxBounds).multiplyScalar(0.5);
        this.boundsCalculated = true;
    
        console.log("Límites calculados:");
        console.log("- Min:", this.minBounds);
        console.log("- Max:", this.maxBounds);
        console.log("- Centro:", this.centerOffset);
    }

    addPoint(point3D) {
        const scale = 1;
        const vectorPoint = new THREE.Vector3(point3D.x, point3D.y, point3D.z)
        
        const centeredPoint = vectorPoint.clone();
        if (this.boundsCalculated) {
            centeredPoint.sub(this.centerOffset);
        }
        centeredPoint.multiplyScalar(scale);
        
        
        this.points.push(centeredPoint);

        if (this.points.length > this.maxPoints) {
            this.points.shift();
        }
    }

    render() {
        if (this.points.length < 2) return;
        
        this.points.forEach((p, i) => {
            this.positions[i * 3] = p.x;
            this.positions[i * 3 + 1] = p.y;
            this.positions[i * 3 + 2] = p.z;

        });

        const now = performance.now();
        const dt = (now - this._lastTime) / 1000;
        this._lastTime = now;

        this.hueOffset = (this.hueOffset + dt * this.hueSpeed) % 1;

        for (let i = 0; i < this.points.length; i++) {
            const t = (i / (this.points.length - 1) + this.hueOffset) % 1;

            const fade = Math.pow(i / (this.points.length - 1), 1.4);
            const light = this.minLight + fade * (this.maxLight - this.minLight);

            const hue = this.startHue + t * this.hueRange;

            this._tmpColor.setHSL(hue / 360, this.saturation, light);

            this.colors[i * 3]     = this._tmpColor.r;
            this.colors[i * 3 + 1] = this._tmpColor.g;
            this.colors[i * 3 + 2] = this._tmpColor.b;
        }
        
        const validPositions = this.positions.slice(0, this.points.length * 3);
        const usedColors = this.colors.slice(0, this.points.length * 3);
        
        console.log(`Puntos actuales: ${this.points.length}, Último: ${this.lastPointCount}`);
        
        const needsRecreation = 
            this.lastPointCount === 0 || 
            this.points.length > this.lastPointCount;

        if (needsRecreation) {
            this.scene.remove(this.lines);
            this.scene.remove(this.glowLine);
            this.scene.remove(this.glowLine2)

            this.linesGeometry = new LineGeometry();
            this.linesGeometry.setPositions(validPositions);

            this.lines = new Line2(this.linesGeometry, this.linesMaterial);
            this.scene.add(this.lines);

            this.glowLine = new Line2(this.linesGeometry, this.glowMaterial);
            this.scene.add(this.glowLine);

            this.glowLine2 = new Line2(this.linesGeometry, this.glowMaterial2);
            this.scene.add(this.glowLine2);
        } else {
            this.linesGeometry.setPositions(validPositions);
        }

        this.linesGeometry.setColors(usedColors);
        this.linesMaterial.opacity = 0.85;
        this.glowMaterial.opacity = 0.12;   // mitad
        this.glowMaterial2.opacity = 0.08;

        this.lastPointCount = this.points.length;
        
        this.lines.computeLineDistances();
        this.linesMaterial.resolution.set(window.innerWidth, window.innerHeight);
        this.glowMaterial.resolution.set(window.innerWidth, window.innerHeight);
        this.glowMaterial2.resolution.set(window.innerWidth, window.innerHeight);
        
        this._elapsedTime += dt; // acumulador
        this.background.material.uniforms.u_time.value = this._elapsedTime;

        this.renderer.autoClear = false;
        this.renderer.clear();

        this.controls.update();
        this.renderer.render(this.background.scene, this.background.camera)
        this.renderer.render(this.scene, this.camera);
    }
}

export default ThreeJSRenderer;