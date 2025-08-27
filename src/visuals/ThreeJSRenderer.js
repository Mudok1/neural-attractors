import * as THREE from "three"

class ThreeJSRenderer {
    constructor(containerId) {
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
        this.setupScene();

    }

    setupScene() {
        console.log('Llego');


        // Camara
        this.camera.position.set(0, 0, 80);
        this.camera.lookAt(0, 0, 0);

        // Ejes
        const axesHelper = new THREE.AxesHelper(12);
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

    addPoint(point3D) {
        const scale = 1;
        const vectorPoint = new THREE.Vector3(point3D.x, point3D.y, point3D.z)
        const scaledPoint = vectorPoint.clone().multiplyScalar(scale);

        //console.log("Point added:", vectorPoint);
        //console.log("Total points:", this.points.length);

        this.points.push(scaledPoint);

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

        console.log("Buffer positions:", this.positions.slice(0, this.points.length * 3));
    
        this.pointsGeometry.setDrawRange(0, this.points.length);
        this.pointsGeometry.attributes.position.needsUpdate = true;

        this.renderer.render(this.scene, this.camera);
    }
}

export default ThreeJSRenderer;