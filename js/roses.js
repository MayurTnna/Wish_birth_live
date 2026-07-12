/**
 * Procedural Canvas Rose Garden & Falling Petals Engine
 */

class RoseGarden {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.roses = [];
        this.petals = [];
        this.sparkles = [];
        
        this.isGardenActive = false;
        this.mouse = { x: -1000, y: -1000 };
        this.maxPetals = 40;
        
        this.messages = [
            "For every time you stayed. 🌹",
            "For every scolding I secretly deserved. 🎓",
            "For every difficult day you made lighter. ✨",
            "For every version of me you supported. 💖",
            "For Dr. Vishwa. 🩺",
            "For my Vishu. 🌸",
            "For my Vish. 🌌",
            "And simply... for you. 🌹"
        ];
        this.messageIndex = 0;
        this.toastCallback = null;

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // Track mouse interaction
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
            
            // Interaction with existing roses
            this.roses.forEach(rose => {
                const dist = Math.hypot(this.mouse.x - rose.x, this.mouse.y - rose.y);
                if (dist < 80) {
                    // Sway effect
                    rose.targetSway = (this.mouse.x - rose.x) * 0.15;
                    // Sparkles trigger
                    if (Math.random() < 0.15 && this.isGardenActive) {
                        this.createSparkle(rose.x, rose.y - rose.scale * 30);
                    }
                } else {
                    rose.targetSway = 0;
                }
            });
        });

        // Click to bloom
        this.canvas.addEventListener('click', (e) => {
            if (!this.isGardenActive) return;
            const rect = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            
            // Bloom a new rose
            this.bloomRose(clickX, clickY);
            
            // Trigger feedback message
            if (this.toastCallback) {
                const msg = this.messages[this.messageIndex];
                this.toastCallback(msg);
                this.messageIndex = (this.messageIndex + 1) % this.messages.length;
            }
        });

        // Start render loop
        this.animate();
    }

    resize() {
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight || window.innerHeight;
    }

    createSparkle(x, y) {
        this.sparkles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4 - 2,
            radius: Math.random() * 2 + 1,
            alpha: 1,
            decay: Math.random() * 0.03 + 0.02,
            color: '#ffd700'
        });
    }

    bloomRose(x, y, scale = null) {
        const targetScale = scale || Math.random() * 0.4 + 0.5; // Scale range
        this.roses.push({
            x: x,
            y: y,
            scale: 0.01,
            targetScale: targetScale,
            sway: 0,
            targetSway: 0,
            bloomSpeed: Math.random() * 0.03 + 0.02,
            color: Math.random() > 0.3 ? '#ff758c' : '#e0284f', // blushing or deep red
            petalRotation: Math.random() * Math.PI,
            leafAngle: Math.random() * Math.PI,
            growth: 0 // 0 to 1
        });
        
        // Spawn small sparkle particles on bloom
        for (let i = 0; i < 8; i++) {
            this.createSparkle(x, y - 20);
        }
        
        if (window.AudioManager) {
            window.AudioManager.playSFX('sparkle');
        }
    }

    clearGarden() {
        this.roses = [];
        this.sparkles = [];
    }

    // Set interactive garden mode
    setGardenState(active, toastCallback) {
        this.isGardenActive = active;
        this.toastCallback = toastCallback;
        if (active) {
            this.resize();
        }
    }

    // Spawn falling petals drifting across the canvas
    startFallingPetals() {
        this.petals = [];
        for (let i = 0; i < this.maxPetals; i++) {
            this.petals.push(this.createPetal(true));
        }
    }

    createPetal(randomY = false) {
        return {
            x: Math.random() * this.canvas.width,
            y: randomY ? Math.random() * this.canvas.height - 50 : -20,
            size: Math.random() * 12 + 6,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 2,
            vx: Math.random() * 1.5 + 0.5,
            vy: Math.random() * 1.2 + 0.8,
            sway: Math.random() * 100,
            swaySpeed: Math.random() * 0.02 + 0.01,
            color: Math.random() > 0.5 ? '#ff758c' : '#ff7eb3'
        };
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 1. Draw falling petals
        this.petals.forEach(p => {
            p.y += p.vy;
            p.x += Math.sin(p.sway) * 0.5 + p.vx * 0.2;
            p.sway += p.swaySpeed;
            p.rotation += p.rotationSpeed;

            // Recycle petal if offscreen
            if (p.y > this.canvas.height + 20 || p.x > this.canvas.width + 20) {
                Object.assign(p, this.createPetal(false));
            }

            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.rotation * Math.PI / 180);
            
            // Draw a single curved petal path
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.bezierCurveTo(p.size, -p.size, p.size * 1.5, p.size * 0.5, 0, p.size);
            this.ctx.bezierCurveTo(-p.size * 1.5, p.size * 0.5, -p.size, -p.size, 0, 0);
            
            // Gradient fill
            const grad = this.ctx.createLinearGradient(-p.size, -p.size, p.size, p.size);
            grad.addColorStop(0, p.color);
            grad.addColorStop(1, '#ff3366');
            
            this.ctx.fillStyle = grad;
            this.ctx.fill();
            this.ctx.restore();
        });

        // 2. Draw roses
        this.roses.forEach(r => {
            // Growth interpolation
            if (r.scale < r.targetScale) {
                r.scale += r.bloomSpeed;
            } else {
                r.scale = r.targetScale;
            }
            
            // Sway interpolation
            r.sway += (r.targetSway - r.sway) * 0.1;

            this.drawProceduralRose(r.x, r.y, r.scale, r.sway, r.color, r.petalRotation, r.leafAngle);
        });

        // 3. Draw sparkles
        this.sparkles.forEach((s, idx) => {
            s.x += s.vx;
            s.y += s.vy;
            s.alpha -= s.decay;

            if (s.alpha <= 0) {
                this.sparkles.splice(idx, 1);
            } else {
                this.ctx.save();
                this.ctx.globalAlpha = s.alpha;
                this.ctx.beginPath();
                this.ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = s.color;
                this.ctx.shadowColor = s.color;
                this.ctx.shadowBlur = 10;
                this.ctx.fill();
                this.ctx.restore();
            }
        });

        requestAnimationFrame(() => this.animate());
    }

    drawProceduralRose(x, y, scale, sway, color, rotOffset, leafOffset) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        
        // 1. Draw Stem (curving based on sway)
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(sway * 0.5, 40, sway, 90, 0, 160);
        ctx.strokeStyle = '#2d5a27';
        ctx.lineWidth = 4;
        ctx.stroke();

        // 2. Draw Leaves
        ctx.save();
        ctx.rotate(leafOffset);
        this.drawLeaf(ctx, -20, 70, 25, 0.6);  // Left leaf
        this.drawLeaf(ctx, 20, 90, -25, -0.6); // Right leaf
        ctx.restore();

        // 3. Draw Sepals (small green support leaves right below the bud)
        ctx.fillStyle = '#1e3f20';
        for (let i = 0; i < 3; i++) {
            ctx.save();
            ctx.rotate((i - 1) * 0.4 + sway * 0.05);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(-8, 12, 0, 25);
            ctx.quadraticCurveTo(8, 12, 0, 0);
            ctx.fill();
            ctx.restore();
        }

        // 4. Draw Petal Layers (Bloom effect)
        ctx.translate(0, 0);
        ctx.rotate(sway * 0.03); // Rose head sways slightly
        
        // Outer layer petals (large)
        ctx.fillStyle = color;
        this.drawPetalLayer(ctx, 6, 25, 18, rotOffset);
        
        // Middle layer petals (mid size, slightly darker/lighter shade for depth)
        ctx.fillStyle = this.adjustColor(color, -20);
        this.drawPetalLayer(ctx, 5, 17, 13, rotOffset + 0.4);
        
        // Inner layer petals (tight center)
        ctx.fillStyle = this.adjustColor(color, -40);
        this.drawPetalLayer(ctx, 4, 10, 8, rotOffset + 0.8);
        
        // Bud core center
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#4a0e17';
        ctx.fill();

        ctx.restore();
    }

    drawLeaf(ctx, x, y, rot, flip) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot * Math.PI / 180);
        ctx.scale(flip, 1);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-15, -5, -25, 15, 0, 30);
        ctx.bezierCurveTo(25, 15, 15, -5, 0, 0);
        ctx.fillStyle = '#224d20';
        ctx.fill();
        
        // Vein
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 25);
        ctx.strokeStyle = '#153313';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
    }

    drawPetalLayer(ctx, count, rx, ry, baseAngle) {
        const step = (Math.PI * 2) / count;
        for (let i = 0; i < count; i++) {
            ctx.save();
            ctx.rotate(baseAngle + i * step);
            
            ctx.beginPath();
            // Draw stylized heart-shaped/oval petal
            ctx.ellipse(0, -rx * 0.4, rx, ry, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Petal shadow/highlight overlay
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            ctx.restore();
        }
    }

    // Adjust hex color brightness
    adjustColor(hex, percent) {
        let R = parseInt(hex.substring(1, 3), 16);
        let G = parseInt(hex.substring(3, 5), 16);
        let B = parseInt(hex.substring(5, 7), 16);

        R = parseInt(R * (100 + percent) / 100);
        G = parseInt(G * (100 + percent) / 100);
        B = parseInt(B * (100 + percent) / 100);

        R = (R < 255) ? R : 255;
        G = (G < 255) ? G : 255;
        B = (B < 255) ? B : 255;

        R = (R > 0) ? R : 0;
        G = (G > 0) ? G : 0;
        B = (B > 0) ? B : 0;

        const rHex = R.toString(16).padStart(2, '0');
        const gHex = G.toString(16).padStart(2, '0');
        const bHex = B.toString(16).padStart(2, '0');

        return `#${rHex}${gHex}${bHex}`;
    }
}

// Instantiate globally
document.addEventListener('DOMContentLoaded', () => {
    const gardenCanvas = document.getElementById('garden-canvas');
    if (gardenCanvas) {
        window.RoseGardenInstance = new RoseGarden('garden-canvas');
        window.RoseGardenInstance.startFallingPetals();
    }
});
