// ISOLA - Heartbeat simulation engine
// Generates realistic BPM values with organic drift

class HeartbeatSimulator {
    constructor(baseMin = 62, baseMax = 78) {
        this.base = baseMin + Math.random() * (baseMax - baseMin);
        this.current = Math.round(this.base);
        this.t = Math.random() * 1000; // random phase offset
        this.seed = Math.random() * 100;
    }

    _noise(t, seed) {
        const x = Math.sin(t * 0.7 + seed * 100) * 43758.5453;
        return (x - Math.floor(x)) * 2 - 1;
    }

    _smoothNoise(t, seed) {
        const n1 = this._noise(t, seed);
        const n2 = this._noise(t + 0.1, seed);
        return n1 * 0.7 + n2 * 0.3;
    }

    update(dt) {
        this.t += dt;
        // Slow base drift
        this.base += this._smoothNoise(this.t * 0.02, this.seed) * 0.1;
        this.base = Math.max(58, Math.min(95, this.base));
        // Per-beat variation
        this.current = Math.round(this.base + this._smoothNoise(this.t * 0.3, this.seed + 5) * 4);
        this.current = Math.max(55, Math.min(100, this.current));
        return this.current;
    }
}
