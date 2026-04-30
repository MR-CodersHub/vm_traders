/**
 * 3D Particle Background for VM Traders
 * A lightweight particle system with parallax effect to create a modern 3D look.
 */

(function() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    const particleCount = 60; // Moderate amount for performance
    const connectionRadius = 150; // How close particles must be to connect
    let mouse = { x: null, y: null };

    // Function to set canvas size
    function setSize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    // Particle class
    class Particle {
        constructor() {
            this.init();
        }

        init() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            // Z-axis simulation (size and speed)
            this.z = Math.random() * 0.8 + 0.2; // Depth from 0.2 to 1.0
            this.size = this.z * 3; // Particles further away (smaller z) are smaller
            
            // Random direction, slower speed for subtle effect
            this.vx = (Math.random() - 0.5) * 0.5 * this.z;
            this.vy = (Math.random() - 0.5) * 0.5 * this.z;
            
            // Colors from a modern, soft palette (light greens/teals to match logo)
            this.color = `rgba(46, 125, 50, ${0.1 * this.z})`; // Varying opacity based on depth
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Simple parallax relative to mouse
            if (mouse.x && mouse.y) {
                const dx = (mouse.x - width / 2) * 0.01 * this.z;
                const dy = (mouse.y - height / 2) * 0.01 * this.z;
                this.x -= dx * 0.1;
                this.y -= dy * 0.1;
            }

            // Wrap around screen
            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    // Create particles
    function createParticles() {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        // Update and draw particles
        for (let i = 0; i < particles.length; i++) {
            const p1 = particles[i];
            p1.update();
            p1.draw();

            // Connections
            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < connectionRadius) {
                    // Opacity based on distance and average depth
                    const avgZ = (p1.z + p2.z) / 2;
                    const opacity = (1 - dist / connectionRadius) * 0.03 * avgZ;
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(46, 125, 50, ${opacity})`;
                    ctx.lineWidth = 0.5 * avgZ;
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        }
        
        requestAnimationFrame(animate);
    }

    // Event listeners
    window.addEventListener('resize', () => {
        setSize();
        createParticles();
    });

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    // Initialize
    setSize();
    createParticles();
    animate();
})();
