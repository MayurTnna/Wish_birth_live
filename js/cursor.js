/**
 * Luminous Custom Cursor System
 */

document.addEventListener('DOMContentLoaded', () => {
    const cursor = document.getElementById('custom-cursor');
    if (!cursor) return;

    // Disable custom cursor on mobile
    if (appState.isMobile) {
        cursor.style.display = 'none';
        return;
    }

    const dot = cursor.querySelector('.cursor-dot');
    const ring = cursor.querySelector('.cursor-ring');
    const label = cursor.querySelector('.cursor-label');

    // GSAP quickSetter for high performance positioning
    const setCursorX = gsap.quickSetter(cursor, "x", "px");
    const setCursorY = gsap.quickSetter(cursor, "y", "px");
    const setRingX = gsap.quickSetter(ring, "x", "px");
    const setRingY = gsap.quickSetter(ring, "y", "px");

    let mouseX = 0;
    let mouseY = 0;
    let ringRadius = 15; // default centering offset (30px size / 2)

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Instant response for dot
        setCursorX(mouseX);
        setCursorY(mouseY);
    });

    // Animate the ring with a slight delay for trailing effect
    gsap.ticker.add(() => {
        // Retrieve current ring translation to interpolate
        const currentRingX = gsap.getProperty(ring, "x") || 0;
        const currentRingY = gsap.getProperty(ring, "y") || 0;
        
        // Offset using the dynamic ringRadius
        const targetRingX = mouseX - ringRadius;
        const targetRingY = mouseY - ringRadius;
        
        setRingX(currentRingX + (targetRingX - currentRingX) * 0.15);
        setRingY(currentRingY + (targetRingY - currentRingY) * 0.15);
    });

    // Custom Interactive Hover Labels
    const cursorInteractiveElements = [
        { selector: 'button, .btn, .magnetic', text: 'Click me' },
        { selector: '#stars-canvas, .star-connector', text: 'Make a wish ✨' },
        { selector: '.rose-interactive', text: 'For Vish 🌹' },
        { selector: '.achievement-card, .rank-number', text: 'Proud! 🎓' },
        { selector: '.play-music, .audio-widget', text: 'Play Sound 🎵' },
        { selector: '.spectacles-lens', text: 'Reflections 👓' },
        { selector: 'a', text: 'Navigate' }
    ];

    function updateCursorLabel(text) {
        if (text) {
            label.textContent = text;
            cursor.classList.add('has-label');
            
            // Animate width, height, and the dynamic radius value
            gsap.to(ring, { width: 80, height: 80, duration: 0.3, ease: "power2.out" });
            gsap.to({ val: ringRadius }, {
                val: 40,
                duration: 0.3,
                ease: "power2.out",
                onUpdate: function() {
                    ringRadius = this.targets()[0].val;
                }
            });
        } else {
            cursor.classList.remove('has-label');
            
            gsap.to(ring, { width: 30, height: 30, duration: 0.3, ease: "power2.out" });
            gsap.to({ val: ringRadius }, {
                val: 15,
                duration: 0.3,
                ease: "power2.out",
                onUpdate: function() {
                    ringRadius = this.targets()[0].val;
                }
            });
        }
    }

    // Delegate hover states to document
    document.addEventListener('mouseover', (e) => {
        // Check if element has a custom data-cursor-text attribute override
        const targetText = e.target.closest('[data-cursor-text]');
        if (targetText) {
            updateCursorLabel(targetText.getAttribute('data-cursor-text'));
            return;
        }

        // Match generic selectors
        for (const element of cursorInteractiveElements) {
            const matched = e.target.closest(element.selector);
            if (matched) {
                updateCursorLabel(element.text);
                return;
            }
        }
        
        updateCursorLabel(null);
    });

    // Magnetic Button Effect
    document.addEventListener('mouseover', (e) => {
        const target = e.target.closest('.btn-magnetic, .magnetic, .btn-magnetic-explore');
        if (target) {
            cursor.classList.add('active-magnetic');
            
            target.addEventListener('mousemove', dragMagnetic);
            target.addEventListener('mouseleave', releaseMagnetic);
        }
    });

    function dragMagnetic(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        gsap.to(this, {
            x: x * 0.35,
            y: y * 0.35,
            scale: 1.05,
            duration: 0.3,
            ease: "power2.out"
        });
    }

    function releaseMagnetic() {
        gsap.to(this, {
            x: 0,
            y: 0,
            scale: 1,
            duration: 0.5,
            ease: "elastic.out(1, 0.3)"
        });
        this.removeEventListener('mousemove', dragMagnetic);
        this.removeEventListener('mouseleave', releaseMagnetic);
        cursor.classList.remove('active-magnetic');
    }
});
