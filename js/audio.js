/**
 * Web Audio Synthesizer & Howler Music Engine
 */

class AudioManagerClass {
    constructor() {
        this.ctx = null;
        this.ambientLFO = null;
        this.heartbeatTimer = null;
        this.howlInstance = null;
        this.analyser = null;
        this.dataArray = null;
        this.isMuted = false;
        this.visualizers = [];
        this.visualizerAnimation = null;
        
        // Settings
        this.musicSrc = storyConfig.song.src;

        // Auto-resume AudioContext on first user interaction
        const resumeTrigger = () => this.resumeContextAndPlay();
        ['click', 'mousedown', 'keydown', 'touchstart'].forEach(evt => {
            document.addEventListener(evt, resumeTrigger, { passive: true });
        });
    }

    initAudio() {
        if (this.ctx) return;
        
        // Setup Web Audio Context
        if (window.Howler && window.Howler.ctx) {
            this.ctx = window.Howler.ctx;
        } else {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        
        // Setup Analyser for visualization
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 256;
        const bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(bufferLength);
        
        // Setup state variables BEFORE starting ambience to avoid race conditions
        appState.audioInitialized = true;
        appState.audioEnabled = true;

        // Setup background cinematic melody synth
        this.startCinematicAmbience();
    }

    // Force resumes audio context on user interaction (bypasses browser autoplay restrictions)
    resumeContextAndPlay() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().then(() => {
                console.log("AudioContext resumed successfully.");
                // Instantly play first chord rather than waiting for next 5-second tick
                if (this.ambienceInterval) {
                    clearTimeout(this.ambienceInterval);
                    this.ambienceInterval = null;
                }
                this.startCinematicAmbience();
            });
        }
    }

    // Synthesized Sound Effects
    playSFX(type) {
        if (!this.ctx || this.isMuted) return;
        
        // Resume context if suspended
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        const now = this.ctx.currentTime;
        
        switch (type) {
            case 'enter':
                this.synthChime(now, [261.63, 329.63, 392.00, 523.25]); // C major arpeggio
                break;
            case 'sparkle':
                this.synthSparkle(now);
                break;
            case 'sparkle_long':
                this.synthChime(now, [523.25, 659.25, 783.99, 1046.50, 1318.51]); // High sparkling arpeggio
                break;
            case 'constellation_complete':
                this.synthChime(now, [261.63, 329.63, 392.00, 493.88, 523.25, 659.25, 783.99, 1046.50]); // Sparkling C major 7 arpeggio sweep
                break;
            case 'click':
                this.synthClick(now);
                break;
        }
    }

    synthClick(time) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, time);
        osc.frequency.exponentialRampToValueAtTime(80, time + 0.1);
        
        gain.gain.setValueAtTime(0.15, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(time);
        osc.stop(time + 0.12);
    }

    synthSparkle(time) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        const startFreq = 900 + Math.random() * 500;
        osc.frequency.setValueAtTime(startFreq, time);
        osc.frequency.exponentialRampToValueAtTime(startFreq * 2.5, time + 0.35);
        
        gain.gain.setValueAtTime(0.08, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(time);
        osc.stop(time + 0.4);
    }

    synthChime(time, freqs) {
        freqs.forEach((freq, idx) => {
            const delay = idx * 0.08;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, time + delay);
            
            gain.gain.setValueAtTime(0.0, time + delay);
            gain.gain.linearRampToValueAtTime(0.12, time + delay + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, time + delay + 0.8);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start(time + delay);
            osc.stop(time + delay + 0.9);
        });
    }

    // Heartbeat Sound Synthesis
    playHeartbeat() {
        if (this.heartbeatTimer) return;
        
        const scheduleBeat = () => {
            if (!this.isMuted && this.ctx) {
                const now = this.ctx.currentTime;
                
                // Beat 1
                this.synthHeartBeatTone(now);
                // Beat 2 (slightly softer and delayed)
                this.synthHeartBeatTone(now + 0.28, 0.07);
            }
            
            // Loop beat every 1.2s (approx 50 BPM)
            this.heartbeatTimer = setTimeout(scheduleBeat, 1200);
        };
        
        scheduleBeat();
    }

    synthHeartBeatTone(time, intensity = 0.1) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(55, time); // Low sub frequency
        osc.frequency.exponentialRampToValueAtTime(20, time + 0.18);
        
        gain.gain.setValueAtTime(0.001, time);
        gain.gain.linearRampToValueAtTime(intensity, time + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(time);
        osc.stop(time + 0.2);
    }

    stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearTimeout(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    // Ethereal continuous slow background score synthesized procedurally
    startCinematicAmbience() {
        if (!this.ctx) return;
        if (this.ambienceInterval) return;

        this.ambienceGainNode = this.ctx.createGain();
        this.ambienceGainNode.gain.setValueAtTime(0.015, this.ctx.currentTime); // Soft volume

        // Setup delay node for warm echo/reverb feedback
        const delay = this.ctx.createDelay();
        delay.delayTime.value = 0.6;
        const delayFeedback = this.ctx.createGain();
        delayFeedback.gain.value = 0.45;

        delay.connect(delayFeedback);
        delayFeedback.connect(delay);

        this.ambienceGainNode.connect(delay);
        this.ambienceGainNode.connect(this.ctx.destination);
        delay.connect(this.ctx.destination);

        // Dreaming chords: Cmaj9, Fmaj9, Am9, G6
        const chords = [
            [130.81, 164.81, 196.00, 246.94, 293.66], // Cmaj9
            [174.61, 220.00, 261.63, 329.63, 392.00], // Fmaj9
            [110.00, 146.83, 174.61, 220.00, 261.63], // Am9
            [196.00, 246.94, 293.66, 392.00, 440.00]  // G6
        ];

        let chordIdx = 0;

        const playChordStep = () => {
            if (this.isMuted || !appState.audioEnabled || (this.howlInstance && this.howlInstance.playing())) {
                this.ambienceInterval = setTimeout(playChordStep, 4000);
                return;
            }

            const now = this.ctx.currentTime;
            const currentChord = chords[chordIdx];
            chordIdx = (chordIdx + 1) % chords.length;

            currentChord.forEach((freq, idx) => {
                const noteDelay = idx * 0.45 + Math.random() * 0.25;
                const osc = this.ctx.createOscillator();
                const noteGain = this.ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + noteDelay);

                // Very slow, soothing attack/release envelope
                noteGain.gain.setValueAtTime(0, now + noteDelay);
                noteGain.gain.linearRampToValueAtTime(0.04, now + noteDelay + 1.2);
                noteGain.gain.exponentialRampToValueAtTime(0.001, now + noteDelay + 4.8);

                osc.connect(noteGain);
                noteGain.connect(this.ambienceGainNode);

                osc.start(now + noteDelay);
                osc.stop(now + noteDelay + 5.0);
            });

            this.ambienceInterval = setTimeout(playChordStep, 5000);
        };

        playChordStep();
    }

    // Play "Perfect" track
    playMusic() {
        const isFileProtocol = window.location.protocol === 'file:';
        // Initialize howler if not present
        if (!this.howlInstance) {
            this.howlInstance = new Howl({
                src: [this.musicSrc],
                html5: true,
                loop: true,
                volume: 0.6,
                onload: () => {
                    if (isFileProtocol) {
                        console.log("File protocol detected: bypassing Web Audio routing to avoid CORS silence.");
                        return;
                    }
                    // Route Howler to Web Audio analyzer node if Web Audio is loaded
                    try {
                        const node = Howler.ctx.createMediaElementSource(this.howlInstance._sounds[0]._node);
                        node.connect(this.analyser);
                        this.analyser.connect(Howler.ctx.destination);
                    } catch (e) {
                        console.warn("Could not route to visualizer analyser: ", e);
                    }
                }
            });
        }
        
        // Stop the background cinematic ambience when perfect.mp3 is played
        if (this.ctx && this.ambienceGainNode) {
            this.ambienceGainNode.gain.setValueAtTime(0, this.ctx.currentTime);
        }

        if (this.isMuted) {
            this.howlInstance.mute(true);
        } else {
            this.howlInstance.mute(false);
            this.howlInstance.play();
        }
    }

    pauseMusic() {
        if (this.howlInstance) {
            this.howlInstance.pause();
        }
        // Resume soft ambient background score when perfect.mp3 is paused
        if (this.ctx && this.ambienceGainNode && !this.isMuted) {
            this.ambienceGainNode.gain.setValueAtTime(0.015, this.ctx.currentTime);
        }
    }

    setVolume(value) {
        if (this.howlInstance) {
            this.howlInstance.volume(value);
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        appState.isMuted = this.isMuted;
        
        if (this.howlInstance) {
            this.howlInstance.mute(this.isMuted);
        }
        
        if (this.ctx && this.ambienceGainNode) {
            if (this.isMuted) {
                this.ambienceGainNode.gain.setValueAtTime(0, this.ctx.currentTime);
            } else if (!this.howlInstance || !this.howlInstance.playing()) {
                this.ambienceGainNode.gain.setValueAtTime(0.015, this.ctx.currentTime);
            }
        }
        
        return this.isMuted;
    }

    // Frequency Visualizer Rendering
    startVisualizer(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        if (!this.visualizers) {
            this.visualizers = [];
        }
        
        // Add to active list if not already present
        if (!this.visualizers.some(v => v.canvas === canvas)) {
            this.visualizers.push({
                canvas: canvas,
                ctx: canvas.getContext('2d')
            });
        }
        
        // Start animation loop if not already running
        if (!this.visualizerAnimation) {
            this.renderVisualizers();
        }
    }

    renderVisualizers() {
        const render = () => {
            this.visualizerAnimation = requestAnimationFrame(render);
            
            const isFileProtocol = window.location.protocol === 'file:';
            if (this.analyser && !this.isMuted && !isFileProtocol) {
                this.analyser.getByteFrequencyData(this.dataArray);
            }
            
            this.visualizers.forEach(v => {
                const w = v.canvas.width;
                const h = v.canvas.height;
                const ctx = v.ctx;
                
                ctx.clearRect(0, 0, w, h);
                
                if (!this.ctx || this.isMuted || !appState.audioEnabled) {
                    // Draw static line
                    ctx.beginPath();
                    ctx.moveTo(0, h / 2);
                    ctx.lineTo(w, h / 2);
                    ctx.strokeStyle = v.canvas.classList.contains('audio-visualizer-mini') ? 'rgba(255, 215, 0, 0.25)' : 'rgba(255, 117, 140, 0.25)';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    return;
                }
                
                if (isFileProtocol) {
                    // Simulated waveform (procedural wave animation)
                    const time = Date.now() * 0.0035;
                    const isMini = v.canvas.classList.contains('audio-visualizer-mini');
                    const barCount = isMini ? 24 : 64;
                    const barWidth = w / barCount;
                    
                    ctx.beginPath();
                    for (let i = 0; i < barCount; i++) {
                        const edgeMultiplier = Math.sin((i / barCount) * Math.PI);
                        const waveVal = Math.sin(i * 0.2 + time) * Math.cos(i * 0.08 - time * 0.8) * Math.sin(time * 0.5);
                        const percent = Math.max(0.1, Math.abs(waveVal) * (0.4 + Math.random() * 0.2) * edgeMultiplier * 1.6);
                        const barHeight = percent * h * 0.85;
                        const y = h / 2 - barHeight / 2;
                        
                        const color = isMini ? 
                            `rgba(255, 215, 0, ${percent * 0.65 + 0.35})` : 
                            `rgba(255, 117, 140, ${percent * 0.65 + 0.35})`;
                        ctx.fillStyle = color;
                        ctx.fillRect(i * barWidth, y, barWidth - 1.5, barHeight);
                    }
                    return;
                }
                
                // Actual real-time analysis
                const isMini = v.canvas.classList.contains('audio-visualizer-mini');
                const barCount = this.analyser.frequencyBinCount;
                const displayBars = isMini ? 24 : 64;
                const barWidth = w / displayBars;
                
                ctx.beginPath();
                for (let i = 0; i < displayBars; i++) {
                    const dataIndex = Math.floor(i * (barCount / displayBars));
                    const percent = this.dataArray[dataIndex] / 255;
                    const barHeight = percent * h * 0.85;
                    const y = h / 2 - barHeight / 2;
                    
                    const color = isMini ? 
                        `rgba(255, 215, 0, ${percent * 0.65 + 0.35})` : 
                        `rgba(255, 117, 140, ${percent * 0.65 + 0.35})`;
                    ctx.fillStyle = color;
                    ctx.fillRect(i * barWidth, y, barWidth - 1.5, barHeight);
                }
            });
        };
        
        render();
    }

    stopVisualizer() {
        if (this.visualizerAnimation) {
            cancelAnimationFrame(this.visualizerAnimation);
            this.visualizerAnimation = null;
        }
        this.visualizers = [];
    }

    bindMusicPlayerUI() {
        const playBtn = document.getElementById('player-play-btn');
        const progressSlider = document.getElementById('player-progress-slider');
        const currentTimeEl = document.getElementById('player-current-time');
        const durationEl = document.getElementById('player-duration');
        const volumeSlider = document.getElementById('player-volume-slider');
        const vinylDisc = document.querySelector('.vinyl-disc');
        const needle = document.querySelector('.player-arm-needle');
        
        if (!playBtn) return;

        // Auto start visualizer on player-visualizer if initialized
        this.startVisualizer('player-visualizer');

        // Check if music is already playing initially and update UI
        if (this.howlInstance && this.howlInstance.playing()) {
            playBtn.textContent = '❚❚';
            playBtn.setAttribute('style', 'background-color: #ff5f7e;');
            if (vinylDisc) vinylDisc.style.animationPlayState = 'running';
            if (needle) needle.classList.add('playing');
        } else {
            if (vinylDisc) vinylDisc.style.animationPlayState = 'paused';
            if (needle) needle.classList.remove('playing');
        }

        // Play/Pause button trigger
        playBtn.addEventListener('click', () => {
            if (!this.howlInstance || !this.howlInstance.playing()) {
                this.initAudio();
                this.playMusic();
                playBtn.textContent = '❚❚';
                playBtn.setAttribute('style', 'background-color: #ff5f7e;');
                if (vinylDisc) vinylDisc.style.animationPlayState = 'running';
                if (needle) needle.classList.add('playing');
            } else {
                this.pauseMusic();
                playBtn.textContent = '▶';
                playBtn.removeAttribute('style');
                if (vinylDisc) vinylDisc.style.animationPlayState = 'paused';
                if (needle) needle.classList.remove('playing');
            }
        });

        // Volume control trigger
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                const vol = e.target.value / 100;
                this.setVolume(vol);
            });
        }

        // Progress bar scrubbing trigger
        if (progressSlider) {
            progressSlider.addEventListener('input', (e) => {
                if (this.howlInstance) {
                    const dur = this.howlInstance.duration();
                    const seekPos = (e.target.value / 100) * dur;
                    this.howlInstance.seek(seekPos);
                }
            });
        }

        // Duration progress indicator updater loop
        const updateTimer = () => {
            if (this.howlInstance && this.howlInstance.playing()) {
                const seek = this.howlInstance.seek() || 0;
                const duration = this.howlInstance.duration() || 0;
                
                // Update progress slider
                if (progressSlider && duration > 0) {
                    progressSlider.value = (seek / duration) * 100;
                }
                
                // Format display times
                if (currentTimeEl) currentTimeEl.textContent = this.formatTime(seek);
                if (durationEl && duration > 0) durationEl.textContent = this.formatTime(duration);
            }
            setTimeout(updateTimer, 300);
        };
        updateTimer();
    }

    formatTime(secs) {
        const minutes = Math.floor(secs / 60) || 0;
        const seconds = Math.floor(secs % 60) || 0;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
}

// Instantiate globally and auto-bind on DOM load
window.AudioManager = new AudioManagerClass();
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.AudioManager) {
            window.AudioManager.bindMusicPlayerUI();
        }
    }, 800);
});
