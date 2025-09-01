import LorenzAttractor from './math/lorenz.js';
import Canvas2DRenderer from './visuals/Canvas2DRenderer.js';
import ThreeJSRenderer from './visuals/ThreeJSRenderer.js';

/**
 * Main application entry point
 */


class NeuralAttractorsApp {
    constructor() {
        this.lorenz = new LorenzAttractor();
        //this.renderer = new Canvas2DRenderer('container');
        this.renderer = new ThreeJSRenderer('container');
        this.isRunning = false;
        
        this.init();
    }
    
    init() {
        console.log('Neural Attractors v0.2.2 - Initializing...');
        
        this.lorenz.generatePoints(100);

        if (this.renderer.rendererType == "3D") {
            this.initPoints = this.lorenz.generatePoints(700);
            this.renderer.calculateBoundsFromArray(this.initPoints);

            this.initPointIndex = 0
            this.animateInitialPoints()
        }

        else {
            this.start();
        }

    }

    animateInitialPoints() {
        
        if (this.initPointIndex < this.initPoints.length) {
            const point = this.initPoints[this.initPointIndex];
            this.renderer.addPoint(point);
            this.renderer.render();
            this.initPointIndex++;
            
            requestAnimationFrame(() => this.animateInitialPoints());
        } else {
            // Transición suave a animación normal
            console.log('Transitioning to live generation...');
            this.start();
        }
    }
    
    start() {
        this.isRunning = true;
        console.log('Simulation started'); 
        this.animate();
    }
    
    animate() {
        if (!this.isRunning) return;
        
        const newPoint = this.lorenz.step();
        
        this.renderer.addPoint(newPoint);
        
        this.renderer.render();
        
        requestAnimationFrame(() => this.animate());
    }
    
    stop() {
        this.isRunning = false;
        console.log('Simulation stopped');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new NeuralAttractorsApp();
});