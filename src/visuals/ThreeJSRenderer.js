import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/Addons.js";

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
        const axesHelper = new THREE.AxesHelper(15);
        this.scene.add(axesHelper);

        // Puntos
        this.pointsGeometry = new THREE.BufferGeometry();
        this.pointsMaterial = new THREE.PointsMaterial({
            size: 0.05,
            vertexColors: false,
            color: 0xff0000
        });

        this.pointsMesh = new THREE.Points(this.pointsGeometry, this.pointsMaterial);
        this.scene.add(this.pointsMesh);

        this.positions = new Float32Array(this.maxPoints * 3);
        this.pointsGeometry.setAttribute(
            "position",
            new THREE.BufferAttribute(this.positions, 3)
        );

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
        
        this.points.forEach((p, i) => {
            
            
            this.positions[i * 3]     = p.x;
            this.positions[i * 3 + 1] = p.y;
            this.positions[i * 3 + 2] = p.z;
        });
    
        this.pointsGeometry.setDrawRange(0, this.points.length);
        this.pointsGeometry.attributes.position.needsUpdate = true;

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
        
    }
}

export default ThreeJSRenderer;