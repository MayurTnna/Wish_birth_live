/**
 * Storyboard Scroll Orchestrator & GSAP ScrollTrigger Timelines
 */

document.addEventListener('DOMContentLoaded', () => {
    // Page security and reload redirection
    const isUnlocked = sessionStorage.getItem('passcodeUnlocked') === 'true';
    const fromLoader = sessionStorage.getItem('fromLoader') === 'true';

    if (!isUnlocked) {
        window.location.href = './index.html';
        return;
    } else if (!fromLoader) {
        window.location.href = './index.html';
        return;
    } else {
        sessionStorage.removeItem('fromLoader');
    }

    // 1. Initialize Smooth Scrolling (Lenis)
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        smoothTouch: false
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync Lenis scroll events with ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // Expose Lenis to allow disabling scroll in modals
    window.LenisInstance = lenis;

    // Retrieve state from landing screen
    const audioState = sessionStorage.getItem('audioEnabled');
    if (audioState === 'true' && window.AudioManager) {
        window.AudioManager.initAudio();
        
        // Setup visualizer in the audio panel if it exists
        window.AudioManager.startVisualizer('audio-wave-visualizer');

        // Fallback user interaction resume hooks on main page load
        const fallbackResume = () => {
            if (window.AudioManager) {
                window.AudioManager.resumeContextAndPlay();
            }
        };
        ['click', 'keydown', 'touchstart'].forEach(event => {
            document.addEventListener(event, fallbackResume, { once: true, passive: true });
        });
    }

    // Floating Audio Widget Mute Button triggers
    const musicBtn = document.getElementById('floating-audio-widget');
    if (musicBtn) {
        musicBtn.addEventListener('click', () => {
            if (window.AudioManager) {
                const muted = window.AudioManager.toggleMute();
                if (muted) {
                    musicBtn.classList.add('muted');
                    musicBtn.setAttribute('data-cursor-text', 'Unmute Sound 🔊');
                } else {
                    musicBtn.classList.remove('muted');
                    musicBtn.setAttribute('data-cursor-text', 'Mute Sound 🔇');
                }
            }
        });
    }

    // 2. Build ScrollTrigger Chapter Animations
    const chapters = document.querySelectorAll('.story-chapter');

    chapters.forEach((chapter, index) => {
        const id = chapter.getAttribute('id');
        
        // Base fade-in for each chapter section title and text
        const contentElements = chapter.querySelectorAll('.chapter-title, .chapter-body, .animate-reveal');
        
        if (contentElements.length > 0) {
            gsap.fromTo(contentElements, 
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    stagger: 0.25,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: chapter,
                        start: "top 70%",
                        toggleActions: "play none none reverse"
                    }
                }
            );
        }

        // Section Background Color Morphing based on theme
        const theme = chapter.getAttribute('data-theme');
        if (theme) {
            ScrollTrigger.create({
                trigger: chapter,
                start: "top 50%",
                end: "bottom 50%",
                onEnter: () => changeBodyTheme(theme),
                onEnterBack: () => changeBodyTheme(theme)
            });
        }

        // Chapter Specific Scroll Actions
        switch (id) {
            case 'ch-1-classroom':
                setupClassroomScroll(chapter);
                break;
            case 'ch-2-paths':
                setupPathsScroll(chapter);
                break;
            case 'ch-3-tuition':
                setupTuitionScroll(chapter);
                break;
            case 'ch-6-hostel':
                setupHostelScroll(chapter);
                break;
            case 'ch-7-vishwa-vish':
                setupVishwaVishScroll(chapter);
                break;
            case 'ch-8-one-word':
                setupOneWordScroll(chapter);
                break;
            case 'ch-10-struggle':
                setupStruggleScroll(chapter);
                break;
            case 'ch-12-search':
                setupSearchScroll(chapter);
                break;
            case 'ch-cake-dream':
                setupCakeDreamScroll(chapter);
                break;
            case 'ch-14-meaning':
                setupMeaningScroll(chapter);
                break;
            case 'ch-17-garden':
                setupGardenScroll(chapter);
                break;
        }
    });

    // Theme Switcher helper
    function changeBodyTheme(theme) {
        document.body.className = `${theme}-theme`;
    }

    // Classroom interactive items zoom
    function setupClassroomScroll(chapter) {
        if (document.querySelector('.classroom-benches-layout')) {
            gsap.fromTo('.classroom-benches-layout', 
                { scale: 0.9, opacity: 0 },
                {
                    scale: 1,
                    opacity: 1,
                    duration: 1.2,
                    scrollTrigger: {
                        trigger: chapter,
                        start: "top 60%"
                    }
                }
            );
        }
    }

    // Different Paths split silhouettes
    function setupPathsScroll(chapter) {
        if (document.querySelector('.glowing-silhouette.boy')) {
            gsap.fromTo('.glowing-silhouette.boy', { x: -50 }, {
                x: -250,
                scrollTrigger: {
                    trigger: chapter,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1
                }
            });
        }
        if (document.querySelector('.glowing-silhouette.girl')) {
            gsap.fromTo('.glowing-silhouette.girl', { x: 50 }, {
                x: 250,
                scrollTrigger: {
                    trigger: chapter,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1
                }
            });
        }
    }

    // Tuition garden connect stars puzzle trigger
    function setupTuitionScroll(chapter) {
        ScrollTrigger.create({
            trigger: chapter,
            start: "top 40%",
            end: "bottom 30%",
            onEnter: () => {
                if (window.StarfieldInstance) {
                    window.StarfieldInstance.startConstellationGame(() => {
                        window.showToast("Constellation complete: VISHWA! ✨", 4000);
                        if (window.AudioManager) {
                            window.AudioManager.playSFX('constellation_complete');
                        }
                        // Trigger final text highlight fade
                        if (document.querySelector('.constellation-complete-message')) {
                            gsap.to('.constellation-complete-message', { opacity: 1, duration: 0.5 });
                        }
                    });
                }
            },
            onLeave: () => {
                if (window.StarfieldInstance) {
                    window.StarfieldInstance.stopConstellationGame();
                }
            },
            onEnterBack: () => {
                if (window.StarfieldInstance) {
                    window.StarfieldInstance.startConstellationGame(() => {
                        // Already completed, just reveal completed message
                        if (document.querySelector('.constellation-complete-message')) {
                            gsap.to('.constellation-complete-message', { opacity: 1, duration: 0.5 });
                        }
                    });
                }
            },
            onLeaveBack: () => {
                if (window.StarfieldInstance) {
                    window.StarfieldInstance.stopConstellationGame();
                }
            }
        });
    }

    // Hostel window rain effect activation
    function setupHostelScroll(chapter) {
        if (document.querySelector('.hostel-window-container')) {
            gsap.fromTo('.hostel-window-container', 
                { filter: 'blur(5px)', opacity: 0.5 },
                {
                    filter: 'blur(0px)',
                    opacity: 1,
                    scrollTrigger: {
                        trigger: chapter,
                        start: "top 80%",
                        end: "bottom 20%",
                        scrub: true
                    }
                }
            );
        }
    }

    // Letter WA drifting away
    function setupVishwaVishScroll(chapter) {
        if (document.querySelector('.text-wa')) {
            gsap.fromTo('.text-wa', 
                { x: 0, opacity: 1, scale: 1 },
                {
                    x: 150,
                    opacity: 0,
                    scale: 0.6,
                    scrollTrigger: {
                        trigger: chapter,
                        start: "top 30%",
                        end: "bottom 70%",
                        scrub: true
                    }
                }
            );
        }
        if (document.querySelector('.text-wish-reflection')) {
            gsap.fromTo('.text-wish-reflection', 
                { opacity: 0, y: 10 },
                {
                    opacity: 0.85,
                    y: 0,
                    scrollTrigger: {
                        trigger: chapter,
                        start: "top 20%",
                        end: "bottom 80%",
                        scrub: true
                    }
                }
            );
        }
    }

    // One Word Floating words orbit trigger
    function setupOneWordScroll(chapter) {
        const orbitWords = chapter.querySelectorAll('.orbit-word');
        
        ScrollTrigger.create({
            trigger: chapter,
            start: "top 50%",
            onEnter: () => {
                orbitWords.forEach((word, idx) => {
                    const angle = (idx * Math.PI * 2) / orbitWords.length;
                    const r = 160; // Orbit radius
                    
                    // Spread words out in orbit around center
                    gsap.to(word, {
                        x: Math.cos(angle) * r,
                        y: Math.sin(angle) * r,
                        opacity: 1,
                        duration: 1.2,
                        ease: "back.out(1.2)"
                    });
                });
            }
        });

        // Click to try to check words
        orbitWords.forEach(word => {
            word.addEventListener('click', () => {
                if (window.AudioManager) {
                    window.AudioManager.playSFX('click');
                }
                
                // Show glitchy "Not enough" response
                const label = word.querySelector('.word-badge');
                const origVal = label.textContent;
                
                label.classList.add('glitch-alert');
                label.textContent = "Not enough.";
                
                setTimeout(() => {
                    label.classList.remove('glitch-alert');
                    label.textContent = origVal;
                }, 1500);
            });
        });
    }

    function setupSearchScroll(chapter) {
        ScrollTrigger.create({
            trigger: chapter,
            start: "top 40%",
            onEnter: () => {
                if (window.UniverseSearchInstance) {
                    window.UniverseSearchInstance.startAutoSequence();
                }
            }
        });
    }

    // Scroll trigger for 3D cake chapter entrance
    function setupCakeDreamScroll(chapter) {
        ScrollTrigger.create({
            trigger: chapter,
            start: "top 60%",
            onEnter: () => {
                if (window.CakeDreamInstance) {
                    window.CakeDreamInstance.triggerEntrance();
                }
            }
        });
    }

    // Galaxy expansion zooms out
    function setupMeaningScroll(chapter) {
        if (document.querySelector('.galaxy-canvas-container')) {
            gsap.fromTo('.galaxy-canvas-container', 
                { scale: 0.8, rotate: 0 },
                {
                    scale: 1.5,
                    rotate: 25,
                    scrollTrigger: {
                        trigger: chapter,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: true
                    }
                }
            );
        }
    }

    // Rose Garden active state
    function setupGardenScroll(chapter) {
        ScrollTrigger.create({
            trigger: chapter,
            start: "top 60%",
            end: "bottom 40%",
            onEnter: () => {
                if (window.RoseGardenInstance) {
                    // Turn on interactive canvas clicks
                    window.RoseGardenInstance.setGardenState(true, (msg) => {
                        window.showToast(msg, 3500);
                    });
                    
                    // Bloom some initial decorative roses
                    if (window.RoseGardenInstance.roses.length === 0) {
                        const w = window.RoseGardenInstance.canvas.width;
                        const h = window.RoseGardenInstance.canvas.height;
                        window.RoseGardenInstance.bloomRose(w * 0.2, h * 0.7, 0.7);
                        window.RoseGardenInstance.bloomRose(w * 0.8, h * 0.65, 0.65);
                    }
                }
            },
            onLeave: () => {
                if (window.RoseGardenInstance) {
                    window.RoseGardenInstance.setGardenState(false);
                }
            },
            onEnterBack: () => {
                if (window.RoseGardenInstance) {
                    window.RoseGardenInstance.setGardenState(true);
                }
            }
        });
    }

    // Chapter 10: Storm Weather Canvas Animation
    let stopStormAnimation = null;
    function setupStruggleScroll(chapter) {
        ScrollTrigger.create({
            trigger: chapter,
            start: "top 70%",
            end: "bottom 30%",
            onEnter: () => {
                if (!stopStormAnimation) stopStormAnimation = initStormCanvas();
            },
            onLeave: () => {
                if (stopStormAnimation) {
                    stopStormAnimation();
                    stopStormAnimation = null;
                }
            },
            onEnterBack: () => {
                if (!stopStormAnimation) stopStormAnimation = initStormCanvas();
            },
            onLeaveBack: () => {
                if (stopStormAnimation) {
                    stopStormAnimation();
                    stopStormAnimation = null;
                }
            }
        });
    }

    function initStormCanvas() {
        const canvas = document.getElementById('storm-canvas');
        if (!canvas) return null;
        const ctx = canvas.getContext('2d');
        
        let animationFrame;
        let width = canvas.width = canvas.clientWidth;
        let height = canvas.height = canvas.clientHeight;
        
        const raindrops = [];
        const maxRain = 35;
        for (let i = 0; i < maxRain; i++) {
            raindrops.push({
                x: Math.random() * width,
                y: Math.random() * height - 30,
                length: Math.random() * 15 + 12,
                speed: Math.random() * 6 + 5,
                opacity: Math.random() * 0.25 + 0.15
            });
        }

        let progress = 0;
        const trail1 = [];
        const trail2 = [];

        function animate() {
            ctx.fillStyle = 'rgba(7, 9, 18, 0.15)'; // Deep trail fade
            ctx.fillRect(0, 0, width, height);

            // Draw rain
            ctx.strokeStyle = 'rgba(174, 194, 224, 0.3)';
            ctx.lineWidth = 1;
            raindrops.forEach(r => {
                ctx.beginPath();
                ctx.moveTo(r.x, r.y);
                ctx.lineTo(r.x - 3, r.y + r.length);
                ctx.stroke();

                r.y += r.speed;
                r.x -= 3 * (r.speed / 8);

                if (r.y > height) {
                    r.y = -20;
                    r.x = Math.random() * width;
                }
            });

            // Walking coordinates
            progress += 0.0025;
            if (progress > 1.0) {
                progress = 0;
                trail1.length = 0;
                trail2.length = 0;
            }

            const startX = 40;
            const endX = width - 40;
            const currentX = startX + (endX - startX) * progress;

            // Sway height matching footstep rhythms
            const sway = Math.sin(progress * Math.PI * 18) * 3.5;
            const y1 = height * 0.40 + sway;
            const y2 = height * 0.60 + sway;

            trail1.push({ x: currentX, y: y1 });
            trail2.push({ x: currentX, y: y2 });

            if (trail1.length > 60) trail1.shift();
            if (trail2.length > 60) trail2.shift();

            // Render Mayur Light Trail (Pink)
            ctx.beginPath();
            for (let i = 0; i < trail1.length; i++) {
                const pt = trail1[i];
                if (i === 0) ctx.moveTo(pt.x, pt.y);
                else ctx.lineTo(pt.x, pt.y);
            }
            ctx.strokeStyle = 'rgba(255, 117, 140, 0.7)';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Render Vishwa Light Trail (Gold)
            ctx.beginPath();
            for (let i = 0; i < trail2.length; i++) {
                const pt = trail2[i];
                if (i === 0) ctx.moveTo(pt.x, pt.y);
                else ctx.lineTo(pt.x, pt.y);
            }
            ctx.strokeStyle = 'rgba(255, 215, 0, 0.7)';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Render current heads
            ctx.beginPath();
            ctx.arc(currentX, y1, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#ff758c';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(currentX, y2, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#ffd700';
            ctx.fill();

            animationFrame = requestAnimationFrame(animate);
        }

        animate();

        // Return cleanup callback
        return () => {
            cancelAnimationFrame(animationFrame);
        };
    }
});
