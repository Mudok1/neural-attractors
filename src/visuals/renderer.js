/**
 * Simple 2D Canvas Renderer for Lorenz Attractor
 * (Temporary until we add Three.js)
 */

class SimpleRenderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.setupCanvas();
        this.points = [];
        this.maxPoints = 2000;
    }
    
    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.canvas.style.background = '#000';
        this.container.appendChild(this.canvas);
        
        // Resize handler
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }
    
    // Convertir coordenadas 3D del atractor a 2D del canvas
    project3DTo2D(point) {
        const scale = 8;
        const offsetX = this.canvas.width / 2;
        const offsetY = this.canvas.height / 2;
        
        // Proyección simple (ignoramos Z por ahora)
        const x = point.x * scale + offsetX;
        const y = point.y * scale + offsetY;
        
        return { x, y };
    }
    
    addPoint(point3D) {
        const point2D = this.project3DTo2D(point3D);
        this.points.push(point2D);
        
        // Mantener solo los últimos N puntos
        if (this.points.length > this.maxPoints) {
            this.points.shift();
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // Efecto de trail
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.points.length < 2) return;
        
        // Dibujar la trayectoria
        this.ctx.beginPath();
        this.ctx.moveTo(this.points[0].x, this.points[0].y);
        
        for (let i = 1; i < this.points.length; i++) {
            const alpha = i / this.points.length; // Fade effect
            const hue = (i * 2) % 360; // Color rainbow
            
            this.ctx.strokeStyle = `hsla(${hue}, 70%, 60%, ${alpha})`;
            this.ctx.lineWidth = 2;
            
            this.ctx.lineTo(this.points[i].x, this.points[i].y);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.moveTo(this.points[i].x, this.points[i].y);
        }
    }
}