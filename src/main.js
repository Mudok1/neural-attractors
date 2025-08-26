/**
 * Main application entry point
 */

class NeuralAttractorsApp {
    constructor() {
        this.lorenz = new LorenzAttractor();
        this.renderer = new Canvas2DRenderer('container');
        this.isRunning = false;
        
        this.init();
    }
    
    init() {
        console.log('Neural Attractors v0.1 - Initializing...');
        
        this.lorenz.generatePoints(100);
        
        this.start();
    }
    
    start() {
        this.isRunning = true;
        this.animate();
        console.log('Simulation started');
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