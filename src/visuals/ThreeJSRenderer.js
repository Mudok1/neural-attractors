import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { array } from "three/tsl";

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

        this.setupScene();
        this.setupOrbitControls()

    }

    setupScene() {
        console.log('Llego');


        // Camara
        this.camera.position.set(0, 0, 80);
        this.camera.lookAt(0, 0, 0);

        // Ejes
        // Puntos
        // this.pointsGeometry = new THREE.BufferGeometry();
        // this.pointsMaterial = new THREE.PointsMaterial({
        //     size: 0.05,
        //     vertexColors: false,
        //     color: 0xff0000
        // });

        this.linesGeometry = new LineGeometry();
        this.linesMaterial = new LineMaterial({
            color: 0xffffff,
            linewidth: 1,
            //vertexColors: true,
            transparent: true,
            opacity: 1,
            blending: THREE.AdditiveBlending
            //resolution: new THREE.Vector2(window.innerWidth, window.innerHeight)    
        });

        
        this.positions = new Float32Array(this.maxPoints * 3);
        this.linesGeometry.setPositions(this.positions)
        this.linesGeometry.setDrawRange(0, 0);
        
        this.lines = new Line2(this.linesGeometry, this.linesMaterial);
        this.scene.add(this.lines);
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
        
        //console.log("Point added:", vectorPoint);
        //console.log("Total points:", this.points.length);

        // Aplicar centrado y escala
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
        
        // Llenar TODOS los puntos en orden correcto
        this.points.forEach((p, i) => {
            this.positions[i * 3] = p.x;
            this.positions[i * 3 + 1] = p.y;
            this.positions[i * 3 + 2] = p.z;
        });
        
        // Crear array con solo los puntos válidos
        const validPositions = this.positions.slice(0, this.points.length * 3);
        
        // Recrear geometría si cambió el número de puntos

        console.log(`Puntos actuales: ${this.points.length}, Último: ${this.lastPointCount}`);
        
        const needsRecreation = 
            this.lastPointCount === 0 || 
            this.points.length > this.lastPointCount;

        if (needsRecreation) {
            this.scene.remove(this.lines);
            this.linesGeometry = new LineGeometry();
            this.linesGeometry.setPositions(validPositions);
            this.lines = new Line2(this.linesGeometry, this.linesMaterial);
            this.scene.add(this.lines);
        } else {
            this.linesGeometry.setPositions(validPositions);
        }

        this.lastPointCount = this.points.length; // ✅ Actualizar SIEMPRE
        
        this.lines.computeLineDistances();
        this.linesMaterial.resolution.set(window.innerWidth, window.innerHeight);
        
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

export default ThreeJSRenderer;