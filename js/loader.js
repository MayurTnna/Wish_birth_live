/**
 * Cinematic Loader and Chapter Zero Timeline Coordinator
 */

document.addEventListener('DOMContentLoaded', () => {
    const gateOverlay = document.getElementById('timer-gate-overlay');
    const countdownPanel = document.getElementById('gate-countdown-panel');
    const lockPanel = document.getElementById('gate-lock-panel');
    const passcodeField = document.getElementById('gate-passcode-field');
    const submitBtn = document.getElementById('btn-submit-passcode');
    const errorEl = document.getElementById('gate-validation-error');
    const clockTitle = document.getElementById('clock-title');

    const loader = document.getElementById('loader');
    const progressBar = document.getElementById('progress-bar');
    const percentageNum = document.getElementById('loader-percentage-num');
    const phraseElement = document.getElementById('loader-phrase');
    const enterBtn = document.getElementById('btn-enter-universe');

    // Gate sequence interval handle
    let timerInterval = null;

    // Check if already unlocked in this session
    const isUnlocked = sessionStorage.getItem('passcodeUnlocked') === 'true';
    if (isUnlocked) {
        if (gateOverlay) gateOverlay.style.display = 'none';
        if (loader) loader.style.display = 'flex';
        updateLoader();
    } else {
        // Hide loader initially
        if (loader) loader.style.display = 'none';
        startGateSequence();
    }

    // Stages of memories configuration
    const loadStages = [
        { progress: 10, phrase: "Preparing a universe for Vish..." },
        { progress: 25, phrase: "Finding the old classroom..." },
        { progress: 40, phrase: "Connecting five roads..." },
        { progress: 55, phrase: "Looking for the STAR Batch..." },
        { progress: 70, phrase: "Opening the hostel window..." },
        { progress: 82, phrase: "Counting 497 reasons to be proud..." },
        { progress: 92, phrase: "Growing roses..." },
        { progress: 98, phrase: "Almost ready, Dr. Vishwa..." },
        { progress: 100, phrase: "Her universe is ready." }
    ];

    let currentProgress = 0;
    
    function updateLoader() {
        if (currentProgress < 100) {
            currentProgress += Math.floor(Math.random() * 4) + 1;
            if (currentProgress > 100) currentProgress = 100;

            // Update loader bar & number
            if (progressBar) progressBar.style.width = `${currentProgress}%`;
            if (percentageNum) percentageNum.textContent = currentProgress;

            // Update matching phrase
            const matchedStage = loadStages.reduce((prev, curr) => {
                return (currentProgress >= curr.progress) ? curr : prev;
            }, loadStages[0]);
            
            if (phraseElement && phraseElement.textContent !== matchedStage.phrase) {
                gsap.to(phraseElement, {
                    opacity: 0,
                    y: -5,
                    duration: 0.2,
                    onComplete: () => {
                        phraseElement.textContent = matchedStage.phrase;
                        gsap.to(phraseElement, { opacity: 1, y: 0, duration: 0.2 });
                    }
                });
            }

            // Continue loading loop
            setTimeout(updateLoader, Math.random() * 120 + 30);
        } else {
            // Loading Complete
            gsap.to(progressBar.parentElement, { opacity: 0, duration: 0.3 });
            gsap.to(percentageNum.parentElement, { opacity: 0, duration: 0.3 });
            
            // Show Enter button with magnetic/glow reveal
            if (enterBtn) {
                enterBtn.classList.remove('hidden');
                gsap.fromTo(enterBtn, 
                    { scale: 0.8, opacity: 0 }, 
                    { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.7)" }
                );
            }
        }
    }

    function startGateSequence() {
        const targetStr = storyConfig.birthdayTarget;
        const targetDate = new Date(targetStr);

        function updateGateTimer() {
            const now = new Date();
            const diff = targetDate - now;

            if (diff <= 0) {
                // Countdown complete! Show lock screen
                if (timerInterval) {
                    clearInterval(timerInterval);
                }
                showPasswordGate();
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            document.getElementById('gate-timer-days').textContent = String(days).padStart(2, '0');
            document.getElementById('gate-timer-hours').textContent = String(hours).padStart(2, '0');
            document.getElementById('gate-timer-minutes').textContent = String(minutes).padStart(2, '0');
            document.getElementById('gate-timer-seconds').textContent = String(seconds).padStart(2, '0');
        }

        // Only start timer loop if the target is in the future
        const initialDiff = targetDate - new Date();
        if (initialDiff <= 0) {
            showPasswordGate();
        } else {
            updateGateTimer();
            timerInterval = setInterval(updateGateTimer, 1000);
        }

        // Bind developer bypass double-click on clock title
        if (clockTitle) {
            clockTitle.addEventListener('dblclick', () => {
                if (timerInterval) {
                    clearInterval(timerInterval);
                }
                showPasswordGate();
            });
        }
    }

    function showPasswordGate() {
        gsap.to(countdownPanel, {
            opacity: 0,
            y: -15,
            duration: 0.5,
            onComplete: () => {
                countdownPanel.classList.add('hidden');
                lockPanel.classList.remove('hidden');
                gsap.fromTo(lockPanel, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5 });
                if (passcodeField) passcodeField.focus();
            }
        });
    }

    // Verify passcode
    function verifyPasscode() {
        const val = passcodeField.value.trim().toLowerCase();
        const validCodes = ['1807', 'vish', 'vishu', 'vishwa', '497'];

        if (validCodes.includes(val)) {
            // Success!
            sessionStorage.setItem('passcodeUnlocked', 'true');
            if (errorEl) errorEl.textContent = '';
            
            // Audio feedback
            if (window.AudioManager) {
                window.AudioManager.initAudio();
                window.AudioManager.playSFX('sparkle_long');
            }

            // Animate transition out
            gsap.to(gateOverlay, {
                y: -window.innerHeight,
                opacity: 0,
                duration: 1.2,
                ease: "power3.inOut",
                onComplete: () => {
                    gateOverlay.style.display = 'none';
                    loader.style.display = 'flex';
                    gsap.fromTo(loader, { opacity: 0 }, { opacity: 1, duration: 0.5 });
                    updateLoader();
                }
            });
        } else {
            // Failure shake and message
            if (errorEl) {
                errorEl.textContent = "The stars frown. Try again (Hint: Nickname or Date DDMM)";
            }
            const card = document.querySelector('.lock-card');
            if (card) {
                card.classList.add('shake-error');
                setTimeout(() => card.classList.remove('shake-error'), 600);
            }
            if (passcodeField) {
                passcodeField.value = '';
                passcodeField.focus();
            }
        }
    }

    if (submitBtn) {
        submitBtn.addEventListener('click', verifyPasscode);
    }
    if (passcodeField) {
        passcodeField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') verifyPasscode();
        });
    }

    // Trigger Chapter Zero on "Enter Her Universe"
    if (enterBtn) {
        enterBtn.addEventListener('click', () => {
            // Unlock audio context on user interaction
            if (window.AudioManager) {
                window.AudioManager.initAudio();
                window.AudioManager.playSFX('enter');
            }
            
            // Fade out loader screen
            gsap.to(loader, {
                opacity: 0,
                duration: 1,
                ease: "power2.out",
                onComplete: () => {
                    loader.style.display = 'none';
                    startChapterZero();
                }
            });
        });
    }

    // Chapter Zero Animations Timeline
    function startChapterZero() {
        const chapter = document.getElementById('chapter-zero');
        if (!chapter) return;
        
        chapter.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        // Pre-remove hidden class from all narrative elements to avoid display: none issues
        const zeroDate = document.getElementById('zero-date');
        const n1 = document.getElementById('narrative-1');
        const n2 = document.getElementById('narrative-2');
        const n3 = document.getElementById('narrative-3');
        const petalContainer = document.getElementById('single-petal-container');
        const heroReveal = document.getElementById('hero-reveal');

        const elements = [zeroDate, n1, n2, n3, petalContainer, heroReveal];
        elements.forEach(el => {
            if (el) {
                el.classList.remove('hidden');
                gsap.set(el, { opacity: 0 }); // Initialize opacities
            }
        });

        // Background music heartbeat start
        if (window.AudioManager) {
            window.AudioManager.playHeartbeat();
        }

        const tl = gsap.timeline();

        // 1. Darkness & Typewriter Birthdate Pulse
        tl.fromTo(zeroDate, 
            { opacity: 0, scale: 0.7 }, 
            { opacity: 1, scale: 1, duration: 1.5, ease: "power3.out" }
        );
        tl.to(zeroDate, { opacity: 0.1, duration: 1.2, repeat: 1, yoyo: true });
        tl.to(zeroDate, { opacity: 0, scale: 1.05, duration: 0.8, ease: "power2.in" });

        // 2. Narration lines revealing one by one
        tl.fromTo(n1, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 1.2, ease: "power2.out" }, "+=0.2");
        tl.to(n1, { opacity: 0, y: -10, duration: 0.8, ease: "power2.in" }, "+=1.5");

        tl.fromTo(n2, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 1.2, ease: "power2.out" }, "+=0.2");
        tl.to(n2, { opacity: 0, y: -10, duration: 0.8, ease: "power2.in" }, "+=1.5");

        tl.fromTo(n3, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 1.6, ease: "power2.out" }, "+=0.2");
        tl.to(n3, { opacity: 0, scale: 1.03, duration: 0.8, ease: "power2.in" }, "+=2.0");

        // 3. Falling Petal Reveal
        const petal = document.getElementById('falling-petal');
        tl.set(petalContainer, { opacity: 1 }, "+=0.2");
        tl.fromTo(petal, 
            { y: -100, x: -50, rotation: 0, scale: 0.4 }, 
            { 
                y: window.innerHeight + 100, 
                x: window.innerWidth * 0.1, 
                rotation: 360, 
                scale: 1, 
                duration: 4.5, 
                ease: "power1.inOut",
                onUpdate: function() {
                    // Sway effect
                    const progress = this.progress();
                    const sway = Math.sin(progress * Math.PI * 4) * 40;
                    gsap.set(petal, { x: sway });
                }
            },
            "<" // Start immediately when petalContainer becomes active
        );

        // 4. Hero Title VISH Reveal
        const heroTitle = document.getElementById('hero-title');
        const heroSubtitle = document.getElementById('hero-subtitle');
        const exploreBtn = document.getElementById('btn-explore-universe');

        tl.fromTo(heroReveal, { opacity: 0 }, { opacity: 1, duration: 1.5 }, "-=2.5");
        
        // Splitting subtitle into text block fades
        tl.fromTo(heroTitle, 
            { scale: 0.9, opacity: 0, letterSpacing: '0px' }, 
            { scale: 1, opacity: 1, letterSpacing: '8px', duration: 2, ease: "power3.out" }, 
            "-=1.5"
        );
        tl.fromTo(heroSubtitle, 
            { y: 20, opacity: 0 }, 
            { y: 0, opacity: 1, duration: 1.2, ease: "power2.out" }, 
            "-=0.8"
        );
        tl.fromTo(exploreBtn, 
            { y: 20, opacity: 0 }, 
            { y: 0, opacity: 1, duration: 1, ease: "back.out(1.7)" }, 
            "-=0.4"
        );

        // Activate exploration button trigger
        if (exploreBtn) {
            exploreBtn.addEventListener('click', () => {
                triggerUniverseExplosion();
            });
        }
    }

    // Particle explosion on exploration button click
    function triggerUniverseExplosion() {
        if (window.AudioManager) {
            window.AudioManager.stopHeartbeat();
            window.AudioManager.playSFX('sparkle_long');
        }

        const canvas = document.getElementById('explosion-canvas');
        if (!canvas) {
            redirectToStory();
            return;
        }

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        const colors = ['#ffd700', '#ff758c', '#ff7eb3', '#ffffff', '#e0f0ff'];
        
        const rect = document.getElementById('btn-explore-universe').getBoundingClientRect();
        const startX = rect.left + rect.width / 2;
        const startY = rect.top + rect.height / 2;

        for (let i = 0; i < 200; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 12 + 4;
            particles.push({
                x: startX,
                y: startY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: Math.random() * 3 + 1,
                alpha: 1,
                decay: Math.random() * 0.015 + 0.01,
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }

        function explode() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let alive = false;

            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.alpha -= p.decay;

                if (p.alpha > 0) {
                    alive = true;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                    ctx.fillStyle = p.color;
                    ctx.globalAlpha = p.alpha;
                    ctx.fill();
                }
            });

            if (alive) {
                requestAnimationFrame(explode);
            }
        }
        explode();

        // Screen-wipe transition to story.html
        const wipe = document.getElementById('transition-wipe');
        gsap.to(wipe, {
            clipPath: 'circle(150% at 50% 50%)',
            duration: 1.5,
            ease: "power2.inOut",
            delay: 0.6,
            onComplete: redirectToStory
        });
    }

    function redirectToStory() {
        // Carry forward the audioEnabled state using sessionStorage
        sessionStorage.setItem('audioEnabled', 'true');
        window.location.href = './story.html';
    }
});
