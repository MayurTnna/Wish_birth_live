/**
 * Birthday Mode Countdown, Gifts Constellation & Final Letter Coordinator
 */

class BirthdayManager {
    constructor() {
        this.birthdayUniverse = document.getElementById('birthday-universe-section');
        this.finalLetterModal = document.getElementById('final-letter-modal');
        this.btnOneLastThing = document.getElementById('btn-one-last-thing');
        this.btnCloseLetter = document.getElementById('btn-close-letter');
        
        // 18 Gifts array
        this.gifts = [
            "Joy ☀️ (A life filled with laughter and lightness)",
            "Peace 🕊️ (A quiet heart through all seasons)",
            "Health 🩺 (Vitality, strength, and energy as a Dr. and a person)",
            "Laughter 😂 (Inside jokes that make your stomach hurt)",
            "Courage 🦁 (Strength to step into your next chapter)",
            "Success 🏆 (Achieving everything your MDS career holds)",
            "Adventure 🗺️ (Wanderlust, exploring beautiful corners of the world)",
            "Love ❤️ (Being surrounded by warmth that doesn't ask for reasons)",
            "Family 🏡 (Safety, comfort, and deep-rooted belonging)",
            "Friendship 🤝 (A circle that stands strong through every down)",
            "Dreams 🌠 (The canvas to paint your wildest wishes)",
            "Strength ⚓ (The power to stand tall in difficult times)",
            "Wonder 🔮 (Never losing the spark in your eyes)",
            "Kindness 🌸 (Continuing to heal people with your gentle heart)",
            "Growth 🌱 (Becoming the highest version of yourself)",
            "Pride 🎓 (Knowing how incredibly far you've already come)",
            "Magic ✨ (Subtle unexpected surprises in your everyday)",
            "A future even brighter than today 🌟"
        ];

        this.init();
    }

    init() {
        // Unlock immediately
        this.unlockBirthdayUniverse();

        // Connect birthday stars interaction
        this.setupGiftConstellation();

        // Modal triggers
        if (this.btnOneLastThing) {
            this.btnOneLastThing.addEventListener('click', () => this.openFinalLetter());
        }
        if (this.btnCloseLetter) {
            this.btnCloseLetter.addEventListener('click', () => this.closeFinalLetter());
        }
    }

    unlockBirthdayUniverse() {
        if (this.birthdayUniverse) {
            // Stardust/Glow introduction for numbers 18
            gsap.fromTo('.bday-intro-glow', 
                { opacity: 0, scale: 0.8 }, 
                { opacity: 1, scale: 1, duration: 1.5, ease: "power2.out", stagger: 0.3 }
            );
        }
    }

    setupGiftConstellation() {
        const giftContainer = document.getElementById('gift-stars-container');
        if (!giftContainer) return;

        // Generate 18 stars in a circle/constellation grid
        const centerX = 200;
        const centerY = 200;
        const radius = 140;

        for (let i = 0; i < 18; i++) {
            const angle = (i * Math.PI * 2) / 18;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            const star = document.createElement('div');
            star.className = 'gift-star';
            star.style.left = `${x}px`;
            star.style.top = `${y}px`;
            star.setAttribute('data-index', i);
            star.setAttribute('data-cursor-text', 'Unwrap Gift 🎁');

            // Custom floating numbers inside stars
            star.innerHTML = `<span class="gift-star-num">${i + 1}</span>`;

            // Hover particle trails
            star.addEventListener('mouseenter', () => {
                gsap.to(star, { scale: 1.3, boxShadow: '0 0 20px #ffd700', duration: 0.2 });
            });
            star.addEventListener('mouseleave', () => {
                gsap.to(star, { scale: 1, boxShadow: '0 0 5px rgba(255, 215, 0, 0.4)', duration: 0.2 });
            });

            // Click to reveal gift wish
            star.addEventListener('click', () => {
                this.revealGift(i, star);
            });

            giftContainer.appendChild(star);
        }
    }

    revealGift(index, starElement) {
        const giftBox = document.getElementById('gift-reveal-box');
        if (!giftBox) return;

        // Mark star as unwrapped
        starElement.classList.add('unwrapped');

        // Particle sparks on click
        if (window.RoseGardenInstance) {
            const rect = starElement.getBoundingClientRect();
            const canvasRect = window.RoseGardenInstance.canvas.getBoundingClientRect();
            const x = rect.left - canvasRect.left + rect.width / 2;
            const y = rect.top - canvasRect.top + rect.height / 2;
            for (let i = 0; i < 12; i++) {
                window.RoseGardenInstance.createSparkle(x, y);
            }
        }

        if (window.AudioManager) {
            window.AudioManager.playSFX('sparkle');
        }

        // Update card text with animation
        gsap.to(giftBox, {
            opacity: 0,
            y: 10,
            duration: 0.2,
            onComplete: () => {
                giftBox.innerHTML = `
                    <div class="gift-card-content text-center">
                        <span class="gift-emoji text-3xl">🎁</span>
                        <h4 class="text-gold font-sans uppercase tracking-wider text-xs mt-2">Gift ${index + 1} of 18</h4>
                        <p class="gift-text font-serif italic mt-3 text-lg">${this.gifts[index]}</p>
                    </div>
                `;
                gsap.to(giftBox, { opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.5)" });
            }
        });
    }

    openFinalLetter() {
        if (!this.finalLetterModal) return;

        this.finalLetterModal.classList.add('active');
        document.body.style.overflow = 'hidden';

        if (window.AudioManager) {
            window.AudioManager.playSFX('enter');
        }

        // Bloom anim for the letter rose bud
        gsap.fromTo('.letter-rose-svg', 
            { scale: 0.1, rotation: -90, opacity: 0 },
            { scale: 1, rotation: 0, opacity: 1, duration: 1.2, ease: "back.out(1.4)" }
        );

        // Letter layout slide-up
        gsap.fromTo('.letter-card', 
            { y: 100, opacity: 0 }, 
            { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.2 }
        );

        // Dynamic scroll indicator hiding
        const card = this.finalLetterModal.querySelector('.letter-card');
        const indicator = document.getElementById('letter-scroll-indicator');
        
        if (card && indicator) {
            // Reset indicator visibility
            gsap.set(indicator, { opacity: 1 });

            // Remove existing listener to prevent duplicates and bind scroll check
            card.onscroll = () => {
                const scrollTop = card.scrollTop;
                const scrollHeight = card.scrollHeight;
                const clientHeight = card.clientHeight;

                // Fade out indicator when scrolled past 60px or reached bottom
                if (scrollTop > 60 || (scrollHeight - scrollTop - clientHeight < 25)) {
                    gsap.to(indicator, { opacity: 0, duration: 0.3, overwrite: "auto" });
                } else {
                    gsap.to(indicator, { opacity: 1, duration: 0.3, overwrite: "auto" });
                }
            };
        }
    }

    closeFinalLetter() {
        if (!this.finalLetterModal) return;

        gsap.to('.letter-card', {
            y: 100,
            opacity: 0,
            duration: 0.5,
            ease: "power3.in",
            onComplete: () => {
                this.finalLetterModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
}

// Bind on load
document.addEventListener('DOMContentLoaded', () => {
    window.BirthdayManagerInstance = new BirthdayManager();
});
