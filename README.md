# VISH — THE WISH GOD FULFILLED

An extraordinary, deeply emotional, cinematic, and highly interactive birthday website for **Dr. Vishwa Jambudiya**.

Built completely using HTML5, CSS3, and Vanilla JavaScript, optimized for smooth performance (60fps) and compatible with **GitHub Pages** hosting.

---

## 📂 Project Architecture

```text
vish-birthday/
│
├── index.html                  # Landing Page & Chapter Zero (The 18th of July)
├── story.html                  # Story Page (Chapters 1 to 21)
├── README.md                   # Setup and Deployment Instructions
│
├── css/
│   ├── main.css                # Base layouts & Core Theme Variables
│   ├── animations.css          # CSS custom text glitches & spin animations
│   ├── responsive.css          # Scale factors for Mobile & 4K Viewports
│   └── accessibility.css       # Skip links & Reduced Motion styles
│
├── js/
│   ├── main.js                 # Global configuration & State engine
│   ├── loader.js               # Loading screen & Chapter Zero GSAP timelines
│   ├── cursor.js               # Custom pointer & magnetic transitions
│   ├── stars.js                # Twinkling starfields & connect-stars minigame
│   ├── roses.js                # Drifting rose petals & procedural rose garden canvas
│   ├── audio.js                # Synthesized SFX, heartbeats & music frequency manager
│   ├── search-experience.js    # Universe typing search bar & glitch output
│   ├── birthday.js             # Birthday countdown & 18 gift star constellation
│   ├── easter-eggs.js          # Secret spectacled lenses & golden rose triggers
│   └── timeline.js             # Lenis scrolling & ScrollTrigger chapters
│
└── assets/
    ├── audio/
    │   └── perfect.mp3         # Local sound track (Ed Sheeran's Perfect)
    └── images/                 # Categorized image storage
        ├── school/
        ├── tuition/
        ├── hostel/
        ├── achievements/
        ├── birthday/
        └── vishwa/
```

---

## 🎨 Creative & Technical Features

1. **Procedural Web Audio Engine**: Generates sub-bass heartbeat double-beats, chiming sparklers, and sweeps an LFO bandpass filter over noise to synthesise background wind/rain without needing asset dependencies.
2. **Procedural Canvas Roses**: Renders fully mathematical stems, leaves, sepals, and layered overlapping blooming petals in red/blush pink at 60fps on a dynamic HTML5 Canvas.
3. **Interactive Constellation Game**: Connect-the-dots starry game to form "VISHWA" in Chapter Three.
4. **Universe Search Glitch**: Automatic typist queries ending with a screen-shaking glitch and rank highlights.
5. **Secret Easter Eggs**:
   - Type `V I S H` on the keyboard to trigger a global rose shower.
   - Click the rank `497` three times to trigger a golden spark explosion.
   - Clean the lenses on the spectacles grid item to see "Then vs Now" reflections.
   - Hover over the word `STAR` to reveal *"She always was one."*
   - Find the hidden golden rose in the garden canvas for a deep note of gratitude.

---

## 🚀 Local Installation & Setup

1. **Clone/Download the files**:
   Place the directories (`css`, `js`, `assets`) and the `.html` files in any folder.

2. **Verify Audio Asset**:
   Make sure the background song is located at:
   `./assets/audio/perfect.mp3`

3. **Run Locally**:
   Because the site utilizes CDNs and vanilla scripts, you can open `index.html` directly in your browser.
   *Note: For the best audio routing (linking Howler to the canvas visualizer), we recommend running a local static server. For example:*
   - Using VS Code: Right-click `index.html` and select **"Open with Live Server"**.
   - Using Python: `python -m http.server 8000` (then navigate to `http://localhost:8000`).

---

## 📦 GitHub Pages Deployment

To deploy this project to GitHub Pages:

1. **Initialize Git & Commit**:
   ```bash
   git init
   git add .
   git commit -m "Initialize Vish birthday project"
   ```

2. **Push to a Public GitHub Repository**:
   Create a new repository on GitHub (e.g., `vish-birthday`) and run:
   ```bash
   git remote add origin https://github.com/your-username/vish-birthday.git
   git branch -M main
   git push -u origin main
   ```

3. **Enable GitHub Pages**:
   - Navigate to your repository on GitHub.
   - Click on the **Settings** tab.
   - Under **Pages** (in the sidebar under "Code and automation"), select the branch `main` and directory `/ (root)`.
   - Click **Save**.

4. **Verify Relative Asset Reference**:
   The website is configured with relative paths (`./css/...`, `./js/...`, `./assets/...`), meaning it will load perfectly at either your root domain (`https://username.github.io`) or inside repository paths (`https://username.github.io/vish-birthday/`).
