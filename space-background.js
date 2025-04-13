document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.querySelector('.starfield-background');
    if (!canvas) return; // Exit if canvas not found

    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Star properties
    const stars = [];
    const starCount = Math.floor(window.innerWidth / 4); // ~250 stars on 1000px width, scales with screen
    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 1.5 + 0.5, // 0.5–2px
            brightness: Math.random() * 0.4 + 0.6, // 0.6–1 alpha (brighter baseline)
            twinkleSpeed: Math.random() * 0.02 + 0.01, // Twinkle rate
            baseSpeed: Math.random() * 0.3 + 0.2, // Faster scroll speed range
        });
    }

    let scrollOffset = 0;

    // Animation loop
    function animate() {
        // Clear canvas with black
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw stars
        stars.forEach(star => {
            // Twinkle effect
            star.brightness = 0.6 + Math.sin(Date.now() * star.twinkleSpeed) * 0.4; // Brighter twinkle range

            // Scroll response: more pronounced vertical shift
            const scrollShift = scrollOffset * star.baseSpeed;
            let yPos = (star.y + scrollShift) % canvas.height;
            if (yPos < 0) yPos += canvas.height;

            // Draw glowing star
            ctx.beginPath();
            ctx.arc(star.x, yPos, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
            ctx.shadowBlur = 15; // Increased glow
            ctx.shadowColor = 'rgba(255, 255, 255, 0.7)'; // Brighter glow
            ctx.fill();
            ctx.shadowBlur = 0; // Reset to avoid affecting other drawings
        });

        requestAnimationFrame(animate);
    }

    // Scroll handler
    window.addEventListener('scroll', () => {
        scrollOffset = window.scrollY / 5; // More responsive movement
    });

    // Start animation
    animate();
});