/**
 * The Universe Search Experience (Chapter 12)
 */

class UniverseSearch {
    constructor() {
        this.container = document.getElementById('search-experience-section');
        this.input = document.getElementById('search-input');
        this.resultsDiv = document.getElementById('search-results');
        this.searchBtn = document.getElementById('search-btn');
        this.chips = document.querySelectorAll('.search-chip');
        this.isTyping = false;
        
        this.queries = [
            {
                q: "What is unconditional love?",
                r: "Someone who stays without keeping score."
            },
            {
                q: "What is loyalty?",
                r: "Choosing someone's side even on difficult days."
            },
            {
                q: "What is kindness?",
                r: "Making someone feel less alone without asking for credit."
            },
            {
                q: "What is care?",
                r: "Remembering the things the other person forgot to say."
            },
            {
                q: "What does hardworking look like?",
                r: "NEET MDS 2026 — AIR 497 🎓"
            },
            {
                q: "Who is the most beautiful girl in the world?",
                r: "GLITCH" // Will trigger special glitch sequence
            }
        ];
        
        this.currentQueryIndex = 0;
        this.init();
    }

    init() {
        if (!this.input || !this.searchBtn) return;
        
        // Chip click replay triggers
        this.chips.forEach((chip, index) => {
            chip.addEventListener('click', () => {
                if (this.isTyping) return;
                this.runSearchSequence(index);
            });
        });

        // Trigger on search button click
        this.searchBtn.addEventListener('click', () => {
            if (this.isTyping) return;
            const queryVal = this.input.value;
            if (queryVal.trim() !== '') {
                this.searchBtn.classList.add('loading');
                setTimeout(() => {
                    this.searchBtn.classList.remove('loading');
                    this.showGlitchResult();
                }, 1000);
            }
        });
    }

    // Run the full automatic sequence when the chapter enters viewport
    startAutoSequence() {
        if (this.isTyping) return;
        this.currentQueryIndex = 0;
        this.runNextQuery();
    }

    runNextQuery() {
        if (this.currentQueryIndex >= this.queries.length) return;
        
        this.runSearchSequence(this.currentQueryIndex, () => {
            this.currentQueryIndex++;
            if (this.currentQueryIndex < this.queries.length) {
                // Wait 2.5s before typing next query
                setTimeout(() => this.runNextQuery(), 2500);
            }
        });
    }

    runSearchSequence(index, onComplete) {
        this.isTyping = true;
        const queryObj = this.queries[index];
        this.input.value = "";
        
        // Highlights active chip if available
        this.chips.forEach((c, idx) => {
            if (idx === index) c.classList.add('active');
            else c.classList.remove('active');
        });

        // Fade out previous results
        gsap.to(this.resultsDiv, {
            opacity: 0,
            y: 10,
            duration: 0.3,
            onComplete: () => {
                this.resultsDiv.innerHTML = "";
                this.typeQuery(queryObj.q, 0, () => {
                    // Search Button Load State Trigger
                    this.searchBtn.classList.add('loading');
                    
                    if (window.AudioManager) {
                        window.AudioManager.playSFX('click');
                    }

                    setTimeout(() => {
                        this.searchBtn.classList.remove('loading');
                        
                        if (queryObj.r === "GLITCH") {
                            this.showGlitchResult();
                        } else {
                            this.showTextResult(queryObj.r);
                        }
                        
                        this.isTyping = false;
                        if (onComplete) onComplete();
                    }, 1000);
                });
            }
        });
    }

    typeQuery(text, charIndex, callback) {
        if (charIndex < text.length) {
            this.input.value += text[charIndex];
            
            // Soft random keyboard click synthesizer triggers
            if (window.AudioManager && Math.random() > 0.4) {
                window.AudioManager.playSFX('click');
            }
            
            setTimeout(() => {
                this.typeQuery(text, charIndex + 1, callback);
            }, Math.random() * 60 + 40);
        } else {
            if (callback) callback();
        }
    }

    showTextResult(resultText) {
        this.resultsDiv.innerHTML = `
            <div class="result-card">
                <p class="result-label font-sans">Search Answer:</p>
                <h3 class="result-title">${resultText}</h3>
            </div>
        `;
        
        gsap.fromTo(this.resultsDiv, 
            { opacity: 0, y: 15 }, 
            { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
        );
        
        if (window.AudioManager) {
            window.AudioManager.playSFX('sparkle');
        }
    }

    showGlitchResult() {
        // Glitch HTML construction
        this.resultsDiv.innerHTML = `
            <div class="result-card glitch-card">
                <p class="result-label font-sans">Searching billions of possibilities...</p>
                <div class="progress-bar-container mini">
                    <div id="search-progress" class="progress-bar active-glow"></div>
                </div>
                <p id="search-percentage-text" class="text-right text-xs">99%</p>
                <div id="glitch-output" class="hidden">
                    <h3 class="result-title text-accent glitch" data-text="Obviously, your Vish.">Obviously, your Vish.</h3>
                    <h2 class="result-name text-gold mt-2 font-serif">Miss Vishwa Jambudiya</h2>
                    <p class="result-did-you-mean mt-3 text-sm">Did you mean: <span class="did-you-mean-link italic text-bold">Dr. Vishwa Jambudiya?</span> 🩺</p>
                </div>
            </div>
        `;

        gsap.fromTo(this.resultsDiv, 
            { opacity: 0, y: 15 }, 
            { opacity: 1, y: 0, duration: 0.5 }
        );

        const progress = document.getElementById('search-progress');
        const percentageText = document.getElementById('search-percentage-text');
        const glitchOutput = document.getElementById('glitch-output');

        // Animate mini loader bar
        gsap.to(progress, {
            width: '99%',
            duration: 1.5,
            ease: "power1.inOut",
            onComplete: () => {
                // Glitch sound, screen shaking classes, and final cards
                if (window.AudioManager) {
                    window.AudioManager.playSFX('sparkle_long');
                }
                
                percentageText.style.display = 'none';
                progress.parentElement.style.display = 'none';
                
                // Add screen shake/glitch effect to the search card
                const card = this.resultsDiv.querySelector('.result-card');
                card.classList.add('shaking-glitch');
                
                setTimeout(() => {
                    card.classList.remove('shaking-glitch');
                    glitchOutput.classList.remove('hidden');
                    
                    gsap.fromTo(glitchOutput.children, 
                        { opacity: 0, y: 10 }, 
                        { opacity: 1, y: 0, duration: 0.6, stagger: 0.2, ease: "back.out(1.5)" }
                    );

                    // Explode stardust particles around card coordinates
                    if (window.RoseGardenInstance) {
                        const rect = card.getBoundingClientRect();
                        const x = rect.left + rect.width / 2;
                        const y = rect.top + rect.height / 2;
                        for (let i = 0; i < 20; i++) {
                            window.RoseGardenInstance.createSparkle(x + (Math.random() - 0.5) * 200, y + (Math.random() - 0.5) * 100);
                        }
                    }
                }, 400);
            }
        });
    }
}

// Bind to window when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('search-experience-section')) {
        window.UniverseSearchInstance = new UniverseSearch();
    }
});
