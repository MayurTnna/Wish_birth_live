/**
 * Interactive Starfield & Constellation Engine
 */

class Starfield {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.stars = [];
        this.maxStars = window.innerWidth < 768 ? 100 : 250;
        this.mouse = { x: -1000, y: -1000, radius: 120 };
        this.parallax = { x: 0, y: 0, targetX: 0, targetY: 0 };
        this.activeConstellation = null;
        
        this.init();
    }

    init() {
        this.resize();
        this.createStars();
        
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
            
            // Subtle parallax targets
            const dx = e.clientX - window.innerWidth / 2;
            const dy = e.clientY - window.innerHeight / 2;
            this.parallax.targetX = dx * 0.03;
            this.parallax.targetY = dy * 0.03;
        });

        // Start render loop
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.createStars();
    }

    createStars() {
        this.stars = [];
        const colors = ['#ffffff', '#ffeedd', '#e0f0ff', '#f8e3ff', '#fff1c5'];
        for (let i = 0; i < this.maxStars; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 1.8 + 0.3,
                baseAlpha: Math.random() * 0.7 + 0.2,
                alpha: Math.random(),
                speed: Math.random() * 0.03 + 0.005,
                color: colors[Math.floor(Math.random() * colors.length)],
                twinkleDirection: Math.random() > 0.5 ? 1 : -1
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Interpolate parallax
        this.parallax.x += (this.parallax.targetX - this.parallax.x) * 0.08;
        this.parallax.y += (this.parallax.targetY - this.parallax.y) * 0.08;

        // Draw normal stars
        this.stars.forEach(star => {
            // Update alpha (twinkling)
            star.alpha += star.speed * star.twinkleDirection;
            if (star.alpha >= 1) {
                star.alpha = 1;
                star.twinkleDirection = -1;
            } else if (star.alpha <= star.baseAlpha) {
                star.alpha = star.baseAlpha;
                star.twinkleDirection = 1;
            }

            // Draw star with parallax shift
            const shiftX = star.size * this.parallax.x;
            const shiftY = star.size * this.parallax.y;
            
            let drawX = star.x + shiftX;
            let drawY = star.y + shiftY;

            // Wrap edges
            if (drawX < 0) drawX += this.canvas.width;
            if (drawX > this.canvas.width) drawX -= this.canvas.width;
            if (drawY < 0) drawY += this.canvas.height;
            if (drawY > this.canvas.height) drawY -= this.canvas.height;

            this.ctx.beginPath();
            this.ctx.arc(drawX, drawY, star.size, 0, Math.PI * 2);
            this.ctx.fillStyle = star.color;
            this.ctx.globalAlpha = star.alpha;
            this.ctx.fill();
        });

        this.ctx.globalAlpha = 1.0;

        // Draw Interactive Constellation if active
        if (this.activeConstellation) {
            this.activeConstellation.draw(this.ctx, this.mouse);
        }

        requestAnimationFrame(() => this.animate());
    }

    startConstellationGame(onCompleteCallback) {
        this.activeConstellation = new ConstellationGame(this.canvas, onCompleteCallback);
    }

    stopConstellationGame() {
        this.activeConstellation = null;
    }
}

class ConstellationGame {
    constructor(canvas, onComplete) {
        this.canvas = canvas;
        this.onComplete = onComplete;
        this.nodes = [];
        this.lines = [];
        this.completed = false;
        this.completionTimer = 0;
        
        this.init();
    }

    init() {
        // Define coordinates relative to canvas center for "VISHWA" constellation nodes
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;
        const widthScale = Math.min(this.canvas.width * 0.75, 800);
        
        const alreadyDone = sessionStorage.getItem('constellationCompleted') === 'true';
        if (alreadyDone) {
            this.completed = true;
        }
        
        // Define nodes matching a celestial letters mapping for V-I-S-H-W-A
        const nodeOffsets = [
            // V (nodes 0, 1, 2)
            { id: 0, x: -0.45, y: -0.15 },
            { id: 1, x: -0.41, y: 0.1 },
            { id: 2, x: -0.37, y: -0.15 },
            // I (nodes 3, 4)
            { id: 3, x: -0.30, y: -0.15 },
            { id: 4, x: -0.30, y: 0.1 },
            // S (nodes 5, 6, 7, 8, 9, 10)
            { id: 5, x: -0.16, y: -0.15 },
            { id: 6, x: -0.23, y: -0.15 },
            { id: 7, x: -0.23, y: -0.03 },
            { id: 8, x: -0.16, y: -0.03 },
            { id: 9, x: -0.16, y: 0.1 },
            { id: 10, x: -0.23, y: 0.1 },
            // H (nodes 11, 12, 13, 14, 15, 16)
            { id: 11, x: -0.09, y: -0.15 },
            { id: 12, x: -0.09, y: 0.1 },
            { id: 13, x: -0.02, y: -0.15 },
            { id: 14, x: -0.02, y: 0.1 },
            { id: 15, x: -0.09, y: -0.02 },
            { id: 16, x: -0.02, y: -0.02 },
            // W (nodes 17, 18, 19, 20, 21)
            { id: 17, x: 0.05, y: -0.15 },
            { id: 18, x: 0.09, y: 0.1 },
            { id: 19, x: 0.13, y: -0.02 },
            { id: 20, x: 0.17, y: 0.1 },
            { id: 21, x: 0.21, y: -0.15 },
            // A (nodes 22, 23, 24, 25, 26)
            { id: 22, x: 0.28, y: 0.1 },
            { id: 23, x: 0.33, y: -0.15 },
            { id: 24, x: 0.38, y: 0.1 },
            { id: 25, x: 0.305, y: -0.02 },
            { id: 26, x: 0.355, y: -0.02 }
        ];

        this.nodes = nodeOffsets.map(n => ({
            id: n.id,
            x: cx + n.x * widthScale,
            y: cy + n.y * 220,
            connected: alreadyDone,
            pulse: Math.random() * Math.PI,
            size: Math.random() * 3 + 4.5,
            glow: 12
        }));

        // Connections to form when player drags through them
        this.targetConnections = [
            [0, 1], [1, 2], // V
            [3, 4], // I
            [5, 6], [6, 7], [7, 8], [8, 9], [9, 10], // S
            [11, 12], [13, 14], [15, 16], // H
            [17, 18], [18, 19], [19, 20], [20, 21], // W
            [22, 23], [23, 24], [25, 26] // A
        ];
        
        if (alreadyDone) {
            this.checkNewConnections();
        }
    }

    draw(ctx, mouse) {
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;

        // Check if light theme is active
        const isLightTheme = document.body.classList.contains('childhood-theme') || document.body.classList.contains('vish-theme');
        const activeAlpha = isLightTheme ? 0.35 : 0.85;
        const lineAlpha = isLightTheme ? 0.15 : 0.35;
        const outlineAlpha = isLightTheme ? 0.04 : 0.08;

        // 1. Draw guiding constellation hint outline (Dotted Lines suggestion)
        if (!this.completed) {
            ctx.strokeStyle = isLightTheme ? `rgba(180, 130, 20, ${outlineAlpha})` : `rgba(255, 255, 255, ${outlineAlpha})`;
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 4]); // Dashed guides
            this.targetConnections.forEach(pair => {
                const p1 = this.nodes.find(n => n.id === pair[0]);
                const p2 = this.nodes.find(n => n.id === pair[1]);
                if (p1 && p2) {
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            });
            ctx.setLineDash([]); // Reset
        }

        // 2. Draw user completed connections
        ctx.strokeStyle = isLightTheme ? `rgba(180, 130, 0, ${lineAlpha * 1.5})` : `rgba(255, 215, 0, ${lineAlpha})`;
        ctx.lineWidth = 2;
        this.lines.forEach(line => {
            ctx.beginPath();
            ctx.moveTo(line.p1.x, line.p1.y);
            ctx.lineTo(line.p2.x, line.p2.y);
            if (!isLightTheme) {
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#ffd700';
            }
            ctx.stroke();
        });
        ctx.shadowBlur = 0; // Reset

        // 3. Update nodes and draw them
        this.nodes.forEach(node => {
            node.pulse += 0.05;
            const dist = Math.hypot(mouse.x - node.x, mouse.y - node.y);
            
            // Connect when cursor is extremely close (magnetic snap)
            if (dist < 35 && !node.connected) {
                node.connected = true;
                this.checkNewConnections();
                
                // Play notification click sound
                if (window.AudioManager) {
                    window.AudioManager.playSFX('sparkle');
                }
            }

            const currentSize = node.size + Math.sin(node.pulse) * 1.2;

            ctx.beginPath();
            ctx.arc(node.x, node.y, currentSize, 0, Math.PI * 2);
            
            if (node.connected) {
                ctx.fillStyle = isLightTheme ? 'rgba(180, 120, 0, 0.85)' : '#ffd700';
                if (!isLightTheme) {
                    ctx.shadowColor = '#ffd700';
                    ctx.shadowBlur = 12;
                }
            } else {
                ctx.shadowBlur = 0;
                ctx.fillStyle = isLightTheme ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.3)';
            }
            ctx.fill();
        });
        ctx.shadowBlur = 0; // Reset shadow

        // Check completion
        if (!this.completed) {
            const allConnected = this.nodes.every(n => n.connected);
            if (allConnected) {
                this.completed = true;
                this.completionTimer = Date.now();
                sessionStorage.setItem('constellationCompleted', 'true');
                if (this.onComplete) this.onComplete();
            }
        }

        // 4. Draw magnetic guiding indicator threads from mouse
        this.nodes.forEach(node => {
            const d = Math.hypot(mouse.x - node.x, mouse.y - node.y);
            if (d < 100 && !node.connected) {
                ctx.beginPath();
                ctx.moveTo(node.x, node.y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.strokeStyle = isLightTheme ? `rgba(180, 120, 0, ${0.4 * (1 - d/100)})` : `rgba(255, 215, 0, ${0.6 * (1 - d/100)})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        });

        // If completed, render full VISHWA glow text
        if (this.completed) {
            ctx.font = "italic 500 52px 'Cormorant Garamond', serif";
            ctx.fillStyle = isLightTheme ? "rgba(180, 100, 0, 0.95)" : "rgba(255, 215, 0, 0.95)";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            if (!isLightTheme) {
                ctx.shadowColor = '#ffd700';
                ctx.shadowBlur = 20;
            }
            ctx.fillText("V I S H W A", cx, cy + 140);
            ctx.shadowBlur = 0;
        }
    }

    checkNewConnections() {
        this.targetConnections.forEach(pair => {
            const p1 = this.nodes.find(n => n.id === pair[0]);
            const p2 = this.nodes.find(n => n.id === pair[1]);
            
            if (p1.connected && p2.connected) {
                // Check if connection line is already created
                const exists = this.lines.some(l => 
                    (l.p1.id === p1.id && l.p2.id === p2.id) || 
                    (l.p1.id === p2.id && l.p2.id === p1.id)
                );
                
                if (!exists) {
                    this.lines.push({ p1, p2 });
                }
            }
        });
    }
}

// Instantiate on DOM load if canvas is available
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('stars-canvas')) {
        window.StarfieldInstance = new Starfield('stars-canvas');
    }
});
