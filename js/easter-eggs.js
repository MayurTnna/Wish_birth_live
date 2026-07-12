/**
 * Secret Easter Eggs and Interaction Modules
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Easter Egg: Type VISH
    let keyBuffer = [];
    const targetCode = "VISH";

    window.addEventListener('keydown', (e) => {
        keyBuffer.push(e.key.toUpperCase());
        
        // Keep buffer size limited to length of code
        if (keyBuffer.length > targetCode.length) {
            keyBuffer.shift();
        }

        if (keyBuffer.join('') === targetCode) {
            triggerWishFlippedEgg();
            keyBuffer = []; // Clear
        }
    });

    function triggerWishFlippedEgg() {
        // Flood screen with canvas rose petals
        if (window.RoseGardenInstance) {
            window.RoseGardenInstance.startFallingPetals();
            
            // Generate dozens of immediate roses
            for (let i = 0; i < 25; i++) {
                const rx = Math.random() * window.innerWidth;
                const ry = Math.random() * window.innerHeight;
                window.RoseGardenInstance.bloomRose(rx, ry, Math.random() * 0.3 + 0.4);
            }
        }

        if (window.AudioManager) {
            window.AudioManager.playSFX('sparkle_long');
        }

        // Show floating message
        showToastNotification("Wish fulfilled. 🌹", 4000);
    }

    // 2. Easter Egg: Click 497 three times
    let clickCount497 = 0;
    document.body.addEventListener('click', (e) => {
        const target = e.target.closest('.rank-number, #click-497-trigger');
        if (target) {
            clickCount497++;
            
            if (window.AudioManager) {
                window.AudioManager.playSFX('click');
            }

            if (clickCount497 === 3) {
                triggerRankGoldExplosion(target);
                clickCount497 = 0;
            }
        }
    });

    function triggerRankGoldExplosion(element) {
        if (window.AudioManager) {
            window.AudioManager.playSFX('sparkle_long');
        }
        
        // Spawn sparks specifically around clicked rank
        const rect = element.getBoundingClientRect();
        if (window.RoseGardenInstance) {
            for (let i = 0; i < 30; i++) {
                window.RoseGardenInstance.createSparkle(
                    rect.left + rect.width / 2 + (Math.random() - 0.5) * 50,
                    rect.top + rect.height / 2 + (Math.random() - 0.5) * 50
                );
            }
        }

        showToastNotification("All India Rank 497 — A testament to endless grit! 🎓", 3000);
    }

    // 3. Easter Egg: Spectacles Lens Reflections
    document.body.addEventListener('click', (e) => {
        const lens = e.target.closest('.spectacles-lens-egg');
        if (lens) {
            const side = lens.getAttribute('data-lens-side'); // 'left' or 'right'
            const leftText = lens.parentElement.querySelector('.lens-text-left');
            const rightText = lens.parentElement.querySelector('.lens-text-right');
            
            if (window.AudioManager) {
                window.AudioManager.playSFX('sparkle');
            }

            if (side === 'left') {
                lens.classList.toggle('revealed');
                if (leftText) leftText.classList.toggle('active');
            } else if (side === 'right') {
                lens.classList.toggle('revealed');
                if (rightText) rightText.classList.toggle('active');
            }
        }
    });

    // 4. Easter Egg: Hover STAR for 4+ seconds
    let starHoverTimer = null;
    document.body.addEventListener('mouseenter', (e) => {
        const starWord = e.target.closest('.star-hover-egg');
        if (starWord) {
            starHoverTimer = setTimeout(() => {
                const subLabel = starWord.querySelector('.star-sub-label');
                if (subLabel) {
                    gsap.to(subLabel, {
                        opacity: 1,
                        y: 0,
                        duration: 0.4,
                        onStart: () => {
                            subLabel.textContent = "She always was one.";
                            if (window.AudioManager) window.AudioManager.playSFX('sparkle');
                        }
                    });
                }
            }, 3500); // Trigger after 3.5s of continuous hovering
        }
    }, true);

    document.body.addEventListener('mouseleave', (e) => {
        const starWord = e.target.closest('.star-hover-egg');
        if (starWord) {
            if (starHoverTimer) {
                clearTimeout(starHoverTimer);
                starHoverTimer = null;
            }
        }
    }, true);

    // 5. Easter Egg: Hidden Golden Rose Finder
    document.body.addEventListener('click', (e) => {
        const goldRose = e.target.closest('.hidden-golden-rose');
        if (goldRose) {
            // Spin and highlight rose
            gsap.to(goldRose, {
                rotation: 360,
                scale: 1.5,
                color: '#ffd700',
                duration: 0.6,
                onComplete: () => {
                    gsap.to(goldRose, { scale: 1, duration: 0.4 });
                }
            });

            if (window.AudioManager) {
                window.AudioManager.playSFX('sparkle_long');
            }

            showToastNotification("Of all the beautiful things I could have found in life, I'm still most grateful I found you. 🌹", 5000);
            
            // Disable further clicks to make it a one-time secret
            goldRose.classList.remove('hidden-golden-rose');
        }
    });

    // Unified Toast Notification Creator
    function showToastNotification(text, duration = 3000) {
        // Remove existing toasts first
        const existingToasts = document.querySelectorAll('.toast-card');
        existingToasts.forEach(t => t.remove());

        const toast = document.createElement('div');
        toast.className = 'toast-card';
        toast.innerHTML = `<span class="toast-text font-serif">${text}</span>`;
        
        document.body.appendChild(toast);
        
        // GSAP animate toast slide up
        gsap.fromTo(toast, 
            { y: 50, opacity: 0 }, 
            { y: 0, opacity: 1, duration: 0.4, ease: "back.out(1.4)" }
        );

        setTimeout(() => {
            gsap.to(toast, {
                y: -30,
                opacity: 0,
                duration: 0.5,
                ease: "power2.in",
                onComplete: () => toast.remove()
            });
        }, duration);
    }

    // Expose global toast trigger for other modules (like Rose Garden clicks)
    window.showToast = showToastNotification;
});
