/**
 * Lorenz Attractor Implementation
 * dx/dt = σ(y - x)
 * dy/dt = x(ρ - z) - y
 * dz/dt = xy - βz
 */

class LorenzAttractor {
    constructor(sigma = 10, rho = 28, beta = 8/3) {
        this.sigma = sigma;  // σ
        this.rho = rho;      // ρ  
        this.beta = beta;    // β
        
        this.x = 1;
        this.y = 1;
        this.z = 1;
        
        this.dt = 0.01;
    }
    
    derivatives(x, y, z) {
        const dx = this.sigma * (y - x);
        const dy = x * (this.rho - z) - y;
        const dz = x * y - this.beta * z;
        
        return { dx, dy, dz };
    }
    
    //(método de Euler)
    step() {
        const { dx, dy, dz } = this.derivatives(this.x, this.y, this.z);
        
        this.x += dx * this.dt;
        this.y += dy * this.dt;
        this.z += dz * this.dt;
        
        return { x: this.x, y: this.y, z: this.z };
    }
    
    // Generar múltiples puntos
    generatePoints(numPoints = 1000) {
        const points = [];
        
        for (let i = 0; i < numPoints; i++) {
            const point = this.step();
            points.push(point);
        }

        return points;
    }
    
    // Condiciones iniciales
    reset(x = 1, y = 1, z = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

export default LorenzAttractor;
