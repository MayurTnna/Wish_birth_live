/**
 * VISH - THE WISH GOD FULFILLED
 * Chapter – A Dream You Can Finally Cut (Interactive 3D Three.js Celebration)
 */

class CakeDreamExperience {
    constructor() {
        this.container = document.getElementById('cake-canvas-container');
        if (!this.container) return;

        this.initialized = false;
        this.active = false;
        this.stage = 'stars'; // stars -> cake -> celebrate -> cut -> wish -> blown

        // Three.js Core Objects
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.clock = new THREE.Clock();

        // Scene Groups
        this.cakeGroup = new THREE.Group();
        this.mainCakeGroup = new THREE.Group();
        this.sliceGroup = new THREE.Group();
        this.platformGroup = new THREE.Group();
        this.particleGroup = new THREE.Group();
        this.fireworksGroup = new THREE.Group();
        this.knifeGroup = new THREE.Group();

        // Interactive Objects Reference
        this.roses = [];
        this.candleFlame = null;
        this.candleLight = null;
        this.starsParticleSystem = null;
        this.cutGlowPlanes = [];

        // Materials cache
        this.materials = {};

        // Slicing State
        this.knifePosition = { y: 6.0 };
        this.sliceDistance = { value: 0 };
        this.cumulativeRotation = 0;
        this.hasTriggered360Egg = false;

        // Audio Analyser for Blow Detection
        this.audioContext = null;
        this.analyser = null;
        this.micStream = null;
        this.isBlowListening = false;
        this.blowThreshold = 65; // Volume threshold for blow detection

        // UI Selectors
        this.celebrateBtn = document.getElementById('btn-cake-celebrate');
        this.sliceInstructions = document.getElementById('cake-slice-instructions');
        this.fallbackCutBtn = document.getElementById('btn-cake-cut-fallback');
        this.wishContainer = document.getElementById('cake-wish-container');
        this.wishBtn = document.getElementById('btn-cake-wish');
        this.messagePanel = document.getElementById('cake-message-panel');
        this.noteModal = document.getElementById('cake-easter-egg-modal');
        this.closeNoteBtn = document.getElementById('btn-close-cake-note');

        // Bind events
        this.celebrateBtn.addEventListener('click', () => this.startCelebratePhase());
        this.fallbackCutBtn.addEventListener('click', () => this.triggerCinematicCut());
        this.wishBtn.addEventListener('click', () => this.triggerWishFulfilled());
        this.closeNoteBtn.addEventListener('click', () => this.hideNoteModal());

        // Setup double-click camera focus
        this.container.addEventListener('dblclick', () => this.focusCamera());
    }

    init() {
        if (this.initialized) return;

        // 1. Create Scene & Camera
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x04060d, 0.035);

        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        this.camera.position.set(0, 4, 10);

        // 2. Renderer Setup
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.container.appendChild(this.renderer.domElement);

        // 3. Orbit Controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 15;
        // Limit vertical rotation to stay above platform level
        this.controls.minPolarAngle = Math.PI / 6;
        this.controls.maxPolarAngle = Math.PI / 1.9;

        // 4. Create Lighting
        this.setupLighting();

        // 5. Generate Textures & Materials
        this.generateProceduralMaterials();

        // 6. Build the Platform and Cake
        this.buildPlatform();
        this.buildCake();

        // 7. Add Groups to Scene
        this.scene.add(this.cakeGroup);
        this.scene.add(this.platformGroup);
        this.scene.add(this.particleGroup);
        this.scene.add(this.fireworksGroup);
        this.scene.add(this.knifeGroup);

        this.cakeGroup.add(this.mainCakeGroup);
        this.cakeGroup.add(this.sliceGroup);

        // Position groups
        this.cakeGroup.position.set(0, -0.5, 0);
        this.platformGroup.position.set(0, -1.5, 0);

        // 8. Start gathering stars animation
        this.buildStarGatheringParticles();

        // 9. Resize Listener
        window.addEventListener('resize', () => this.handleResize());

        // 10. Start Animation Loop
        this.initialized = true;
        this.animate();
    }

    setupLighting() {
        // Ambient
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        // Warm Key Light (Golden Hour)
        const keyLight = new THREE.DirectionalLight(0xffdfa9, 1.8);
        keyLight.position.set(5, 8, 5);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 2048;
        keyLight.shadow.mapSize.height = 2048;
        keyLight.shadow.bias = -0.0001;
        this.scene.add(keyLight);

        // Soft Fill Light (Warm Rose)
        const fillLight = new THREE.DirectionalLight(0xffb3c1, 0.6);
        fillLight.position.set(-5, 3, -5);
        this.scene.add(fillLight);

        // Platform Glow Light (Rose Tinted Point Light)
        const pointGlow = new THREE.PointLight(0xff758c, 1.5, 8);
        pointGlow.position.set(0, -1.3, 0);
        this.scene.add(pointGlow);

        // God Rays Simulator (soft spot light from top-right)
        const godLight = new THREE.SpotLight(0xffeaad, 3.0, 20, Math.PI / 6, 0.5, 1.0);
        godLight.position.set(8, 12, 4);
        godLight.target.position.set(0, 0, 0);
        this.scene.add(godLight);
        this.scene.add(godLight.target);
    }

    generateProceduralMaterials() {
        // --- 1. Procedural Marble Texture Canvas ---
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Base cream ivory gradient
        const grad = ctx.createLinearGradient(0, 0, 512, 512);
        grad.addColorStop(0, '#fefbfa');
        grad.addColorStop(0.5, '#faf5ec');
        grad.addColorStop(1, '#f7f0e4');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);

        // Draw marble veins
        ctx.strokeStyle = 'rgba(194, 149, 0, 0.15)'; // Gold veins
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            let x = Math.random() * 512;
            let y = 0;
            ctx.moveTo(x, y);
            while (y < 512) {
                x += (Math.random() - 0.5) * 40;
                y += Math.random() * 80 + 20;
                ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        // Draw subtle grey veins
        ctx.strokeStyle = 'rgba(120, 120, 130, 0.08)';
        ctx.lineWidth = 1.0;
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            let x = 0;
            let y = Math.random() * 512;
            ctx.moveTo(x, y);
            while (x < 512) {
                x += Math.random() * 80 + 20;
                y += (Math.random() - 0.5) * 40;
                ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        // Render Engravings directly onto the texture
        ctx.fillStyle = 'rgba(194, 149, 0, 0.45)';
        ctx.font = 'italic 16px serif';
        ctx.fillText('AIR 497', 60, 100);
        ctx.fillText('⭐ STAR BATCH', 320, 240);
        ctx.fillText('VISH', 140, 380);
        ctx.fillText('18 JULY', 340, 440);

        const marbleTexture = new THREE.CanvasTexture(canvas);
        marbleTexture.wrapS = THREE.RepeatWrapping;
        marbleTexture.wrapT = THREE.RepeatWrapping;

        // --- 2. Materials Cache ---
        // Frosting (Marble physical material)
        this.materials.frosting = new THREE.MeshPhysicalMaterial({
            map: marbleTexture,
            roughness: 0.25,
            metalness: 0.05,
            clearcoat: 0.2,
            clearcoatRoughness: 0.1,
            subsurfaceColor: 0xffeef0,
            transmission: 0.0, // Solid but looks creamy
            bumpMap: marbleTexture,
            bumpScale: 0.015
        });

        // Dark chocolate glaze for top of tiers (mirror-like glossy coating)
        this.materials.darkGlaze = new THREE.MeshPhysicalMaterial({
            color: 0x1a0d07, // Rich deep dark chocolate
            roughness: 0.12,
            metalness: 0.05,
            clearcoat: 1.0,
            clearcoatRoughness: 0.05,
            subsurfaceColor: 0x3a1a0f,
            transmission: 0.0
        });

        // Golden materials
        this.materials.gold = new THREE.MeshStandardMaterial({
            color: 0xecd599, // Champagne Gold
            roughness: 0.15,
            metalness: 0.95,
            envMapIntensity: 1.5
        });

        // Inner glowing cake slice surface
        this.materials.glowSlice = new THREE.MeshPhysicalMaterial({
            color: 0xffbe0b,
            emissive: 0xffa200,
            emissiveIntensity: 1.8,
            roughness: 0.2,
            metalness: 0.5,
            clearcoat: 0.8
        });

        // Rose velvet pink
        this.materials.rosePink = new THREE.MeshPhysicalMaterial({
            color: 0xff8fa3,
            roughness: 0.85,
            metalness: 0.05,
            clearcoat: 0.0,
            subsurfaceColor: 0xff477e
        });

        // Rose leaf green
        this.materials.leafGreen = new THREE.MeshStandardMaterial({
            color: 0x2e4231,
            roughness: 0.7,
            metalness: 0.1
        });

        // Porcelain white teeth
        this.materials.porcelain = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            roughness: 0.08,
            metalness: 0.05,
            clearcoat: 1.0,
            clearcoatRoughness: 0.05,
            transmission: 0.1
        });

        // Crystal transparent
        this.materials.crystal = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            roughness: 0.02,
            metalness: 0.1,
            transmission: 0.95,
            ior: 1.5,
            transparent: true,
            opacity: 1.0
        });

        // Candle Wick
        this.materials.wick = new THREE.MeshBasicMaterial({ color: 0x111111 });
    }

    buildStarGatheringParticles() {
        const count = 350;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const randomSpeeds = [];

        // Spawn particles in a wide cloud
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 6.0 + Math.random() * 8.0;
            const x = Math.cos(angle) * radius;
            const y = (Math.random() - 0.5) * 8.0;
            const z = Math.sin(angle) * radius;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            randomSpeeds.push({
                x: x,
                y: y,
                z: z,
                phase: Math.random() * Math.PI * 2,
                speed: 0.5 + Math.random() * 1.5
            });
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        // Create glowing star particle points
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
        grad.addColorStop(0, 'rgba(255,255,255,1)');
        grad.addColorStop(0.3, 'rgba(255,223,169,0.8)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 16, 16);
        const pTexture = new THREE.CanvasTexture(canvas);

        const material = new THREE.PointsMaterial({
            size: 0.2,
            map: pTexture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.starsParticleSystem = new THREE.Points(geometry, material);
        this.particleGroup.add(this.starsParticleSystem);
        this.randomSpeeds = randomSpeeds;
    }

    buildPlatform() {
        // Glowing Rose Platform
        // 1. Base stone ring
        const ringGeo = new THREE.CylinderGeometry(3.6, 3.8, 0.3, 32);
        const ring = new THREE.Mesh(ringGeo, this.materials.gold);
        ring.receiveShadow = true;
        this.platformGroup.add(ring);

        // 2. Circular ring of roses below the cake
        const roseCount = 18;
        const radius = 3.5;
        for (let i = 0; i < roseCount; i++) {
            const angle = (i / roseCount) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            const rose = this.createProceduralRose(0.4);
            rose.position.set(x, 0.15, z);
            rose.rotation.y = -angle + Math.PI / 2 + (Math.random() - 0.5) * 0.4;
            rose.rotation.x = (Math.random() - 0.2) * 0.3; // slight tilt outwards
            
            // Tag details for raycasting / interaction scaling
            rose.userData = {
                baseScale: 0.4,
                scaleFactor: { value: 1.0 },
                angle: angle
            };

            this.platformGroup.add(rose);
            this.roses.push(rose);
        }

        // Add leaves in between roses
        for (let i = 0; i < roseCount; i++) {
            const angle = ((i + 0.5) / roseCount) * Math.PI * 2;
            const x = Math.cos(angle) * (radius - 0.1);
            const z = Math.sin(angle) * (radius - 0.1);

            const leafGeo = new THREE.SphereGeometry(0.18, 8, 8);
            leafGeo.scale(1.8, 0.3, 0.8);
            const leaf = new THREE.Mesh(leafGeo, this.materials.leafGreen);
            leaf.position.set(x, 0.05, z);
            leaf.rotation.y = -angle + Math.PI / 2;
            leaf.rotation.z = 0.2;
            this.platformGroup.add(leaf);
        }
    }

    createProceduralRose(size = 0.5) {
        const roseGroup = new THREE.Group();
        
        // Bud core
        const coreGeo = new THREE.SphereGeometry(0.18 * size, 8, 8);
        const core = new THREE.Mesh(coreGeo, this.materials.rosePink);
        core.position.y = 0.1 * size;
        roseGroup.add(core);

        // Spiral Petals
        const petalGeo = new THREE.SphereGeometry(0.25 * size, 8, 8, 0, Math.PI, 0, Math.PI / 2);
        petalGeo.scale(1, 1.4, 0.45); // flatten and heighten

        const layers = 3;
        const petalsPerLayer = [5, 6, 7];
        const rotSteps = [0.15, 0.35, 0.55];

        for (let l = 0; l < layers; l++) {
            const pCount = petalsPerLayer[l];
            const pRadius = (0.08 + l * 0.07) * size;
            const tilt = rotSteps[l];

            for (let p = 0; p < pCount; p++) {
                const angle = (p / pCount) * Math.PI * 2 + (l * 0.45);
                const petal = new THREE.Mesh(petalGeo, this.materials.rosePink);

                // Position on ring
                const px = Math.cos(angle) * pRadius;
                const pz = Math.sin(angle) * pRadius;
                petal.position.set(px, (0.05 + l * 0.03) * size, pz);

                // Rotate to cup outwards
                petal.rotation.y = -angle + Math.PI / 2;
                petal.rotation.x = tilt;

                roseGroup.add(petal);
            }
        }
        
        roseGroup.scale.set(1, 1, 1);
        return roseGroup;
    }

    buildCake() {
        // The cake is split into two halves: mainCakeGroup (angles 0.4 to 2PI) and sliceGroup (angles 0 to 0.4)
        // Cylinder parameters: radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength
        const thetaCut = 0.45; // angle of slice

        // --- 1. Tiers Geometry ---
        // Bottom Tier (Radius = 2.5, Height = 1.8)
        this.buildCakePiece(
            2.5, 2.5, 1.8, 
            thetaCut, 
            0.0, // bottom tier Y position
            "bottom"
        );

        // Top Tier (Radius = 1.8, Height = 1.4)
        this.buildCakePiece(
            1.8, 1.8, 1.4, 
            thetaCut, 
            1.8, // top tier Y position (stacks directly on bottom)
            "top"
        );

        // --- 2. Dentistry Theme Elegant Toppings ---
        // Mirror, Crowns, Molars, and Smile arcs are placed on top or around.
        this.buildCakeDecorations(thetaCut);
    }

    buildCakePiece(radius, rBot, height, thetaCut, yOffset, name) {
        const glazeHeight = 0.04;
        const frostingHeight = height - glazeHeight;

        // --- Main Cake Wedge ---
        const mainWedgeGeo = new THREE.CylinderGeometry(
            radius, rBot, frostingHeight, 64, 1, false, 
            thetaCut, Math.PI * 2 - thetaCut
        );
        const mainMesh = new THREE.Mesh(mainWedgeGeo, this.materials.frosting);
        mainMesh.position.y = yOffset + frostingHeight / 2;
        mainMesh.castShadow = true;
        mainMesh.receiveShadow = true;
        this.mainCakeGroup.add(mainMesh);

        // --- Main Cake Top Glaze (Dark Chocolate) ---
        const mainGlazeGeo = new THREE.CylinderGeometry(
            radius + 0.005, rBot + 0.005, glazeHeight, 64, 1, false,
            thetaCut, Math.PI * 2 - thetaCut
        );
        const mainGlazeMesh = new THREE.Mesh(mainGlazeGeo, this.materials.darkGlaze);
        mainGlazeMesh.position.y = yOffset + frostingHeight + glazeHeight / 2;
        mainGlazeMesh.castShadow = true;
        mainGlazeMesh.receiveShadow = true;
        this.mainCakeGroup.add(mainGlazeMesh);

        // Bottom metal ribbon for elegance
        const ribbonGeo = new THREE.CylinderGeometry(
            radius + 0.02, rBot + 0.02, 0.08, 64, 1, false,
            thetaCut, Math.PI * 2 - thetaCut
        );
        const ribbonMesh = new THREE.Mesh(ribbonGeo, this.materials.gold);
        ribbonMesh.position.y = yOffset + 0.05;
        this.mainCakeGroup.add(ribbonMesh);

        // --- Slice Wedge ---
        const sliceWedgeGeo = new THREE.CylinderGeometry(
            radius, rBot, frostingHeight, 64, 1, false,
            0.0, thetaCut
        );
        const sliceMesh = new THREE.Mesh(sliceWedgeGeo, this.materials.frosting);
        sliceMesh.position.y = yOffset + frostingHeight / 2;
        sliceMesh.castShadow = true;
        sliceMesh.receiveShadow = true;
        this.sliceGroup.add(sliceMesh);

        // --- Slice Top Glaze (Dark Chocolate) ---
        const sliceGlazeGeo = new THREE.CylinderGeometry(
            radius + 0.005, rBot + 0.005, glazeHeight, 64, 1, false,
            0.0, thetaCut
        );
        const sliceGlazeMesh = new THREE.Mesh(sliceGlazeGeo, this.materials.darkGlaze);
        sliceGlazeMesh.position.y = yOffset + frostingHeight + glazeHeight / 2;
        sliceGlazeMesh.castShadow = true;
        sliceGlazeMesh.receiveShadow = true;
        this.sliceGroup.add(sliceGlazeMesh);

        // Slice metal ribbon
        const sliceRibbonGeo = new THREE.CylinderGeometry(
            radius + 0.02, rBot + 0.02, 0.08, 64, 1, false,
            0.0, thetaCut
        );
        const sliceRibbon = new THREE.Mesh(sliceRibbonGeo, this.materials.gold);
        sliceRibbon.position.y = yOffset + 0.05;
        this.sliceGroup.add(sliceRibbon);

        // --- Closed Inner Cut Planes (Glowing golden light) ---
        // For a wedge of cylinder, the inner faces go from center (0,0) to edge at angle 0.0 and angle thetaCut.
        // Dimension of plane: radius x height
        const cutPlaneGeo = new THREE.PlaneGeometry(radius, height);
        
        // 1. Plane on main wedge at angle = thetaCut
        const planeMain1 = new THREE.Mesh(cutPlaneGeo, this.materials.glowSlice);
        // Position at average height, rotate, offset to sit along radius
        planeMain1.position.set(
            Math.cos(thetaCut) * (radius / 2),
            yOffset + height / 2,
            Math.sin(thetaCut) * (radius / 2)
        );
        planeMain1.rotation.y = -thetaCut - Math.PI / 2;
        this.mainCakeGroup.add(planeMain1);
        this.cutGlowPlanes.push(planeMain1);

        // 2. Plane on main wedge at angle = 0.0 (or 2PI)
        const planeMain2 = new THREE.Mesh(cutPlaneGeo, this.materials.glowSlice);
        planeMain2.position.set(radius / 2, yOffset + height / 2, 0);
        planeMain2.rotation.y = Math.PI / 2;
        this.mainCakeGroup.add(planeMain2);
        this.cutGlowPlanes.push(planeMain2);

        // 3. Plane on slice wedge at angle = thetaCut
        const planeSlice1 = new THREE.Mesh(cutPlaneGeo, this.materials.glowSlice);
        planeSlice1.position.set(
            Math.cos(thetaCut) * (radius / 2),
            yOffset + height / 2,
            Math.sin(thetaCut) * (radius / 2)
        );
        planeSlice1.rotation.y = -thetaCut + Math.PI / 2;
        this.sliceGroup.add(planeSlice1);
        this.cutGlowPlanes.push(planeSlice1);

        // 4. Plane on slice wedge at angle = 0.0
        const planeSlice2 = new THREE.Mesh(cutPlaneGeo, this.materials.glowSlice);
        planeSlice2.position.set(radius / 2, yOffset + height / 2, 0);
        planeSlice2.rotation.y = -Math.PI / 2;
        this.sliceGroup.add(planeSlice2);
        this.cutGlowPlanes.push(planeSlice2);
    }

    buildCakeDecorations(thetaCut) {
        // Place decorations on top of the main cake and the slice
        
        // --- A. TOP CALLIGRAPHY PLATE (Main Cake Only) ---
        // Generates typography map
        const textCanvas = document.createElement('canvas');
        textCanvas.width = 512;
        textCanvas.height = 512;
        const textCtx = textCanvas.getContext('2d');
        textCtx.clearRect(0,0,512,512);

        // Calligraphy Text
        textCtx.textAlign = 'center';
        textCtx.shadowColor = 'rgba(0, 0, 0, 0.75)';
        textCtx.shadowBlur = 10;
        
        // "HAPPY BIRTHDAY"
        textCtx.fillStyle = '#ecd599'; // Gold
        textCtx.font = '300 36px serif';
        textCtx.fillText('HAPPY BIRTHDAY', 256, 210);

        // "Dr. Vishwa"
        textCtx.font = 'italic 55px cursive, "Caveat", "Brush Script MT", sans-serif';
        textCtx.fillText('Dr. Vishwa', 256, 280);

        const textTexture = new THREE.CanvasTexture(textCanvas);
        const textPlateGeo = new THREE.PlaneGeometry(3.0, 3.0);
        const textPlateMat = new THREE.MeshBasicMaterial({
            map: textTexture,
            transparent: true,
            side: THREE.DoubleSide
        });
        const textPlate = new THREE.Mesh(textPlateGeo, textPlateMat);
        // Lay flat on top tier (y = 1.8 + 1.4 = 3.2)
        textPlate.position.set(-0.2, 3.21, -0.2);
        textPlate.rotation.x = -Math.PI / 2;
        textPlate.rotation.z = 0.2; // slight artistic angle
        this.mainCakeGroup.add(textPlate);

        // --- B. CANDLE ON THE SLICE ---
        // The slice will float away carrying the candle. Y stack = 3.2. Angle = thetaCut/2.
        const candleAngle = thetaCut / 2;
        const candleRadius = 1.2;
        const cx = Math.cos(candleAngle) * candleRadius;
        const cz = Math.sin(candleAngle) * candleRadius;

        const candleGroup = new THREE.Group();
        candleGroup.position.set(cx, 3.2, cz);

        // Candle Body
        const candleBodyGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 16);
        const candleBody = new THREE.Mesh(candleBodyGeo, this.materials.gold);
        candleBody.position.y = 0.4;
        candleGroup.add(candleBody);

        // Wick
        const wickGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.15, 8);
        const wick = new THREE.Mesh(wickGeo, this.materials.wick);
        wick.position.y = 0.85;
        candleGroup.add(wick);

        // Flame mesh (initially invisible / scaled to 0)
        const flameGeo = new THREE.ConeGeometry(0.08, 0.22, 16);
        flameGeo.translate(0, 0.11, 0); // shift origin to bottom for scaling
        this.candleFlame = new THREE.Mesh(flameGeo, new THREE.MeshBasicMaterial({
            color: 0xffa500,
            transparent: true,
            blending: THREE.AdditiveBlending
        }));
        this.candleFlame.position.set(0, 0.9, 0);
        this.candleFlame.scale.set(0, 0, 0);
        candleGroup.add(this.candleFlame);

        // Flame point light source
        this.candleLight = new THREE.PointLight(0xffbe0b, 0, 5);
        this.candleLight.position.set(0, 1.0, 0);
        candleGroup.add(this.candleLight);

        this.sliceGroup.add(candleGroup);

        // --- C. DENTIST LUXURY ORNAMENTS (Procedural) ---
        // 1. Crystal Molar on top tier (Main cake, front edge)
        const crystalMolar = this.createMolarModel(this.materials.crystal, 0.6);
        crystalMolar.position.set(-1.0, 3.25, 0.8);
        crystalMolar.rotation.y = 0.4;
        this.mainCakeGroup.add(crystalMolar);

        // 2. Porcelain Molar (Main cake, middle step)
        const porcelainMolar = this.createMolarModel(this.materials.porcelain, 0.55);
        porcelainMolar.position.set(1.5, 1.85, -1.0);
        porcelainMolar.rotation.y = -0.8;
        this.mainCakeGroup.add(porcelainMolar);

        // 3. Golden Molar (Middle step, opposite side)
        const goldenMolar = this.createMolarModel(this.materials.gold, 0.5);
        goldenMolar.position.set(-1.8, 1.85, -1.0);
        goldenMolar.rotation.y = 0.8;
        this.mainCakeGroup.add(goldenMolar);

        // 4. Pearl Smile Arc (Top tier side face)
        // Arrange small white sphere pearls in a smile shape
        const pearlCount = 10;
        const pearlGeo = new THREE.SphereGeometry(0.06, 16, 16);
        const pearlGroup = new THREE.Group();
        // Position on the side of the top tier (Radius = 1.8, Height Y = 1.8 to 3.2)
        for (let i = 0; i < pearlCount; i++) {
            const t = i / (pearlCount - 1);
            // Parabolic curve mapping a smile
            const arcX = (t - 0.5) * 1.2;
            const arcY = (t - 0.5) * (t - 0.5) * 0.4 + 2.3;
            // Project onto top cylinder face (offset slightly outwards to avoid clipping)
            const angle = Math.PI + (arcX / 1.8);
            const px = Math.cos(angle) * 1.82;
            const pz = Math.sin(angle) * 1.82;

            const pearl = new THREE.Mesh(pearlGeo, this.materials.porcelain);
            pearl.position.set(px, arcY, pz);
            pearlGroup.add(pearl);
        }
        this.mainCakeGroup.add(pearlGroup);

        // 5. Sugar Dental Mirror (Protruding from middle tier top)
        const mirrorGroup = new THREE.Group();
        mirrorGroup.position.set(-0.8, 1.81, -1.5);
        mirrorGroup.rotation.set(0.4, 0.3, -0.5); // lean artistically

        // Handle (thin gold rod)
        const mirrorHandleGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.4, 8);
        const handle = new THREE.Mesh(mirrorHandleGeo, this.materials.gold);
        handle.position.y = 0.7;
        mirrorGroup.add(handle);

        // Head (circular frame)
        const mirrorHeadGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.04, 24);
        const head = new THREE.Mesh(mirrorHeadGeo, this.materials.gold);
        head.position.y = 1.4;
        head.rotation.x = Math.PI / 4;
        mirrorGroup.add(head);

        // Glass reflector face
        const mirrorGlassGeo = new THREE.CylinderGeometry(0.17, 0.17, 0.01, 16);
        const glass = new THREE.Mesh(mirrorGlassGeo, this.materials.crystal);
        glass.position.set(0, 1.41, 0.01);
        glass.rotation.x = Math.PI / 4;
        mirrorGroup.add(glass);

        this.mainCakeGroup.add(mirrorGroup);

        // 6. Gold Dental Crown (Resting on top tier)
        const crownGroup = new THREE.Group();
        crownGroup.position.set(0.8, 3.21, -0.6);
        crownGroup.rotation.set(0.1, 0, -0.1);

        const crownBaseGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.15, 16, 1, true);
        const crownBase = new THREE.Mesh(crownBaseGeo, this.materials.gold);
        crownGroup.add(crownBase);

        // Crown spikes
        const spikeGeo = new THREE.ConeGeometry(0.04, 0.15, 4);
        for(let i=0; i<6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const spike = new THREE.Mesh(spikeGeo, this.materials.gold);
            spike.position.set(Math.cos(angle)*0.24, 0.12, Math.sin(angle)*0.24);
            spike.rotation.y = -angle;
            spike.rotation.x = 0.25; // tilt out
            crownGroup.add(spike);
        }
        this.mainCakeGroup.add(crownGroup);

        // --- D. BLUSH PINK ROSES CLIMBING THE CAKE ---
        const cakeRose1 = this.createProceduralRose(0.35);
        cakeRose1.position.set(1.6, 1.9, 0.8);
        cakeRose1.rotation.set(0.2, 0.4, -0.2);
        this.mainCakeGroup.add(cakeRose1);

        const cakeRose2 = this.createProceduralRose(0.3);
        cakeRose2.position.set(-1.4, 1.9, 1.2);
        cakeRose2.rotation.set(0.3, -0.8, 0.1);
        this.mainCakeGroup.add(cakeRose2);
    }

    createMolarModel(material, scale = 0.5) {
        const group = new THREE.Group();
        group.scale.set(scale, scale, scale);

        // 1. Crown base (rounded cube shape via bevel box simulator)
        const crownGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const crown = new THREE.Mesh(crownGeo, material);
        crown.position.y = 0.25;
        group.add(crown);

        // 2. Add 4 rounded cusps on top
        const cuspGeo = new THREE.SphereGeometry(0.16, 16, 16);
        const offsets = [
            [-0.18, 0.45, -0.18],
            [0.18, 0.45, -0.18],
            [-0.18, 0.45, 0.18],
            [0.18, 0.45, 0.18]
        ];
        offsets.forEach(offset => {
            const cusp = new THREE.Mesh(cuspGeo, material);
            cusp.position.set(offset[0], offset[1], offset[2]);
            group.add(cusp);
        });

        // 3. Two root cones below
        const rootGeo = new THREE.ConeGeometry(0.12, 0.45, 12);
        
        const root1 = new THREE.Mesh(rootGeo, material);
        root1.position.set(-0.12, -0.1, 0);
        root1.rotation.z = 0.2; // splay root
        
        const root2 = new THREE.Mesh(rootGeo, material);
        root2.position.set(0.12, -0.1, 0);
        root2.rotation.z = -0.2;

        group.add(root1, root2);

        // Set casting shadow tags
        group.traverse(child => {
            if(child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        return group;
    }

    // --- PHASE TRANSITIONS & INTERACTIONS ---

    startCelebratePhase() {
        if (this.stage !== 'cake') return;
        this.stage = 'celebrate';

        // Play SFX click
        if (window.AudioManager) window.AudioManager.playSFX('click');

        // Hide "Celebrate" button
        gsap.to(this.celebrateBtn, { opacity: 0, y: 15, duration: 0.4, onComplete: () => {
            this.celebrateBtn.style.display = 'none';
        }});

        // Assemble golden knife in mid-air
        this.buildGoldenKnife();

        // Position knife above cake
        this.knifeGroup.position.set(0, 6.0, 0);
        this.knifeGroup.scale.set(0.01, 0.01, 0.01);
        this.knifeGroup.rotation.set(-Math.PI / 6, 0, Math.PI / 8);

        // Animate knife arrival
        gsap.timeline()
            .to(this.knifeGroup.scale, { x: 1, y: 1, z: 1, duration: 1.2, ease: "back.out(1.7)" })
            .to(this.knifeGroup.rotation, { x: 0, y: -0.4, z: 0, duration: 1.2, ease: "power2.out" }, "<")
            .to(this.knifeGroup.position, { y: 4.8, z: 0.3, duration: 1.0, ease: "power2.out" }, "<")
            .call(() => {
                // Reveal dragging instructions / fallback slice button
                this.sliceInstructions.classList.remove('hidden');
                setTimeout(() => {
                    this.sliceInstructions.classList.add('visible');
                }, 100);
            });
    }

    buildGoldenKnife() {
        // Luxury golden knife
        // Handle (thick decorative cylinder)
        const handleGeo = new THREE.CylinderGeometry(0.05, 0.06, 1.2, 16);
        handleGeo.translate(0, -0.6, 0); // pivot at knife base
        const handle = new THREE.Mesh(handleGeo, this.materials.gold);
        this.knifeGroup.add(handle);

        const handleCrownGeo = new THREE.SphereGeometry(0.08, 16, 16);
        const handleCrown = new THREE.Mesh(handleCrownGeo, this.materials.gold);
        handleCrown.position.y = -1.2;
        this.knifeGroup.add(handleCrown);

        // Blade (thin long shape)
        const bladeShape = new THREE.Shape();
        bladeShape.moveTo(0, 0);
        bladeShape.lineTo(0.18, 0);
        bladeShape.lineTo(0.16, 2.5); // long blade
        bladeShape.quadraticCurveTo(0.08, 2.8, 0, 2.9); // sharp tip curve
        bladeShape.lineTo(0, 0);

        const extrudeSettings = { depth: 0.012, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.005, bevelThickness: 0.005 };
        const bladeGeo = new THREE.ExtrudeGeometry(bladeShape, extrudeSettings);
        bladeGeo.translate(0, 0, -0.006); // center on Z
        
        const blade = new THREE.Mesh(bladeGeo, this.materials.gold);
        // Align blade extending up from the handle
        this.knifeGroup.add(blade);
    }

    triggerCinematicCut() {
        if (this.stage !== 'celebrate') return;
        this.stage = 'cut';

        // Play sound
        if (window.AudioManager) window.AudioManager.playSFX('click');

        // Hide slicing guide
        this.sliceInstructions.classList.remove('visible');
        setTimeout(() => {
            this.sliceInstructions.classList.add('hidden');
        }, 500);

        // Knife cutting timeline
        const tl = gsap.timeline();

        // 1. Position knife directly above slicing wedge (angle theta = 0.22)
        const wedgeAngle = 0.22;
        const kx = Math.cos(wedgeAngle) * 0.8;
        const kz = Math.sin(wedgeAngle) * 0.8;

        tl.to(this.knifeGroup.rotation, { x: 0, y: -wedgeAngle - Math.PI / 2, z: 0, duration: 0.8, ease: "power2.inOut" })
          .to(this.knifeGroup.position, { x: kx, y: 3.5, z: kz, duration: 0.8, ease: "power2.inOut" }, "<")
          
          // 2. Cut down through the cake
          .to(this.knifeGroup.position, { y: 0.3, duration: 1.5, ease: "power3.inOut" })
          .call(() => {
              // Screen shake / rumble effect
              this.container.classList.add('rumble');
              setTimeout(() => this.container.classList.remove('rumble'), 800);
              
              // Sparkle sound
              if (window.AudioManager) {
                  window.AudioManager.playSFX('sparkle_long');
              }
              
              // Sparkle particles rising from cut
              this.spawnCutParticles();
          }, "<0.5")

          // 3. Slide Knife back up and fade away
          .to(this.knifeGroup.position, { y: 5.5, z: -1.0, duration: 0.8, ease: "power2.in" })
          .to(this.knifeGroup.scale, { x: 0.01, y: 0.01, z: 0.01, duration: 0.8, ease: "power2.in" }, "<")
          
          // 4. Animate the Cake Slice sliding outwards (floating away)
          .to(this.sliceDistance, { 
              value: 1.5, 
              duration: 2.0, 
              ease: "power2.out" 
          })
          .call(() => {
              this.triggerInsideMessagePhase();
          }, "<0.8");
    }

    spawnCutParticles() {
        const count = 60;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const velocities = [];

        // Center slice position (Y middle, angle theta = 0.22)
        const wedgeAngle = 0.22;
        const rx = Math.cos(wedgeAngle) * 1.2;
        const rz = Math.sin(wedgeAngle) * 1.2;

        for (let i = 0; i < count; i++) {
            positions[i * 3] = rx + (Math.random() - 0.5) * 0.4;
            positions[i * 3 + 1] = 1.0 + (Math.random() - 0.5) * 1.5;
            positions[i * 3 + 2] = rz + (Math.random() - 0.5) * 0.4;

            velocities.push({
                x: (Math.random() - 0.5) * 0.05,
                y: 0.02 + Math.random() * 0.06,
                z: (Math.random() - 0.5) * 0.05,
                gravity: -0.0002,
                life: 1.0,
                decay: 0.015 + Math.random() * 0.02
            });
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const mat = new THREE.PointsMaterial({
            size: 0.15,
            color: 0xffbe0b, // Golden spark particles
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const system = new THREE.Points(geometry, mat);
        this.particleGroup.add(system);
        
        // Track this transient particle system in the render loop
        this.cutParticleSystem = {
            system: system,
            velocities: velocities,
            positions: positions,
            count: count
        };
    }

    triggerInsideMessagePhase() {
        this.stage = 'wish';

        // 1. Reveal message on overlay
        this.messagePanel.classList.remove('hidden');
        setTimeout(() => {
            this.messagePanel.classList.add('visible');
        }, 100);

        // Animate each text line in succession
        const lines = this.messagePanel.querySelectorAll('.msg-line, .msg-divider');
        lines.forEach((line, index) => {
            setTimeout(() => {
                line.classList.add('reveal');
                if (window.AudioManager && line.classList.contains('msg-line')) {
                    window.AudioManager.playSFX('sparkle');
                }
            }, 600 + index * 1200);
        });

        // 2. After messages finish, light the candle and show Make a Wish
        const totalTextDelay = 600 + lines.length * 1200;
        setTimeout(() => {
            // Light candle flame (scale up)
            gsap.to(this.candleFlame.scale, { x: 1, y: 1, z: 1, duration: 1.2, ease: "elastic.out(1, 0.3)" });
            gsap.to(this.candleLight, { intensity: 1.5, duration: 1.0 });

            // Reveal wish buttons
            this.wishContainer.classList.remove('hidden');
            setTimeout(() => {
                this.wishContainer.classList.add('visible');
            }, 100);

            // Listen for microphone blow
            this.startMicListen();
        }, totalTextDelay + 800);
    }

    startMicListen() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
        
        this.isBlowListening = true;
        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            .then(stream => {
                this.micStream = stream;
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const source = this.audioContext.createMediaStreamSource(stream);
                this.analyser = this.audioContext.createAnalyser();
                this.analyser.fftSize = 256;
                source.connect(this.analyser);
                
                console.log("Blow detection active. Speak or blow into microphone...");
            })
            .catch(err => {
                console.warn("Microphone access denied or unavailable. Fallback button active.", err);
                this.isBlowListening = false;
            });
    }

    stopMicListen() {
        this.isBlowListening = false;
        if (this.micStream) {
            this.micStream.getTracks().forEach(track => track.stop());
        }
        if (this.audioContext) {
            this.audioContext.close();
        }
    }

    checkBlowDetection() {
        if (!this.isBlowListening || !this.analyser) return;

        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(dataArray);

        // Calculate average volume
        let values = 0;
        const length = dataArray.length;
        for (let i = 0; i < length; i++) {
            values += dataArray[i];
        }
        const average = values / length;

        if (average > this.blowThreshold) {
            console.log("Blow detected! Average amplitude:", average);
            this.stopMicListen();
            this.triggerWishFulfilled();
        }
    }

    triggerWishFulfilled() {
        if (this.stage !== 'wish') return;
        this.stage = 'blown';

        this.stopMicListen();

        // Mute/Hide Wish Button UI
        this.wishContainer.classList.remove('visible');
        setTimeout(() => this.wishContainer.classList.add('hidden'), 500);

        // 1. Extinguish candle flame
        gsap.to(this.candleFlame.scale, { x: 0.01, y: 0.01, z: 0.01, duration: 0.3 });
        gsap.to(this.candleLight, { intensity: 0, duration: 0.3 });

        // Play constellation completion audio chime
        if (window.AudioManager) {
            window.AudioManager.playSFX('constellation_complete');
        }

        // Pause for brief suspense...
        setTimeout(() => {
            // 2. Explosive Fireworks & Showers!
            this.launchFireworksCelebration();
            
            // 3. Play/Swell the main soundtrack!
            if (window.AudioManager) {
                // Sells the main birthday ambient track crossfade
                window.AudioManager.playMusic();
            }

            // Toast to announce celebration
            if (window.showToast) {
                window.showToast("Wish sent to the stars! Happy Birthday Dr. Vishwa! 🌟✨🎂", 4500);
            }
        }, 600);
    }

    launchFireworksCelebration() {
        // Trigger multi-point colorful particle fireworks in 3D Space
        const fireworkCount = 5;
        const colors = [0xffbe0b, 0xff758c, 0xffffff, 0xff8fa3, 0xffd700];

        for (let f = 0; f < fireworkCount; f++) {
            setTimeout(() => {
                // Position fireworks around the cake
                const radius = 2.5 + Math.random() * 2.0;
                const angle = Math.random() * Math.PI * 2;
                const fx = Math.cos(angle) * radius;
                const fy = 2.0 + Math.random() * 2.5;
                const fz = Math.sin(angle) * radius;
                
                this.createFireworkShell(fx, fy, fz, colors[f % colors.length]);
                
                // Play secondary spark chime SFX
                if (window.AudioManager) {
                    window.AudioManager.playSFX('sparkle');
                }
            }, f * 500);
        }
    }

    createFireworkShell(x, y, z, color) {
        const count = 120;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const velocities = [];

        for (let i = 0; i < count; i++) {
            // Spherical coordinate distribution for expansion shell
            const u = Math.random();
            const v = Math.random();
            const theta = u * 2.0 * Math.PI;
            const phi = Math.acos(2.0 * v - 1.0);
            const speed = 0.05 + Math.random() * 0.08;

            const vx = Math.sin(phi) * Math.cos(theta) * speed;
            const vy = Math.sin(phi) * Math.sin(theta) * speed;
            const vz = Math.cos(phi) * speed;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            velocities.push({
                x: vx,
                y: vy,
                z: vz,
                gravity: -0.0006,
                life: 1.0,
                decay: 0.01 + Math.random() * 0.015
            });
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        // Custom circle particle texture for cleaner look
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
        grad.addColorStop(0, 'rgba(255,255,255,1)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0,0,16,16);
        const fTex = new THREE.CanvasTexture(canvas);

        const mat = new THREE.PointsMaterial({
            size: 0.15,
            color: color,
            map: fTex,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const system = new THREE.Points(geometry, mat);
        this.fireworksGroup.add(system);

        // Register particle shell in local lists to animate in render loop
        if (!this.activeFireworks) this.activeFireworks = [];
        this.activeFireworks.push({
            system: system,
            velocities: velocities,
            positions: positions,
            count: count
        });
    }

    // --- EASTER EGGS ---

    checkRotationEasterEgg() {
        if (this.hasTriggered360Egg) return;

        // Fetch current OrbitControls Y rotation
        const currentRotY = this.controls.getAzimuthalAngle();
        
        // Sum up absolute changes
        if (this.lastRotY !== undefined) {
            let delta = currentRotY - this.lastRotY;
            // Handle wrapping
            if (delta > Math.PI) delta -= Math.PI * 2;
            if (delta < -Math.PI) delta += Math.PI * 2;
            
            this.cumulativeRotation += Math.abs(delta);
        }
        this.lastRotY = currentRotY;

        // Check if full circle revolution achieved (approx 2*PI radians = 6.28)
        if (this.cumulativeRotation >= Math.PI * 2) {
            this.hasTriggered360Egg = true;
            this.showNoteModal();
        }
    }

    showNoteModal() {
        // Slide open Secret Note drawer UI
        this.noteModal.classList.remove('hidden');
        setTimeout(() => {
            this.noteModal.classList.add('visible');
            if (window.AudioManager) {
                window.AudioManager.playSFX('sparkle_long');
            }
        }, 150);
    }

    hideNoteModal() {
        this.noteModal.classList.remove('visible');
        setTimeout(() => this.noteModal.classList.add('hidden'), 600);
    }

    focusCamera() {
        // Smoothly tween camera zoom into cake core
        gsap.to(this.camera.position, {
            x: 0,
            y: 2,
            z: 5.5,
            duration: 1.5,
            ease: "power2.out",
            onUpdate: () => this.controls.update()
        });
    }

    handleResize() {
        if (!this.initialized) return;
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    // --- SCROLL ENTRANCE TRIGGER ---

    triggerEntrance() {
        if (this.active) return;
        this.active = true;

        this.init();

        // 1. Gather particles animation
        const count = 350;
        const posAttr = this.starsParticleSystem.geometry.attributes.position;
        
        // Calculate target positions representing the cake cylinders
        // We will distribute half of the particles on bottom cylinder and half on top cylinder
        const targetPositions = [];
        for (let i = 0; i < count; i++) {
            let radius, hMin, hMax;
            if (i < count * 0.6) {
                // Bottom tier shell
                radius = 2.5;
                hMin = -0.5;
                hMax = 1.3;
            } else {
                // Top tier shell
                radius = 1.8;
                hMin = 1.3;
                hMax = 2.7;
            }
            const angle = Math.random() * Math.PI * 2;
            const px = Math.cos(angle) * radius;
            const py = hMin + Math.random() * (hMax - hMin);
            const pz = Math.sin(angle) * radius;

            targetPositions.push({ x: px, y: py, z: pz });
        }

        // Animate particles converging
        for (let i = 0; i < count; i++) {
            const idx = i;
            const target = targetPositions[idx];
            
            gsap.to(posAttr.array, {
                [idx * 3]: target.x,
                [idx * 3 + 1]: target.y,
                [idx * 3 + 2]: target.z,
                duration: 2.4,
                ease: "power3.out",
                delay: i * 0.002, // slight cascade/spiral ripple effect
                onUpdate: () => {
                    posAttr.needsUpdate = true;
                }
            });
        }

        // Hide canvas initial black veil, fade out particles, fade in physical cake
        const containerOverlay = this.container.querySelector('.cake-instructions');
        if (containerOverlay) containerOverlay.style.opacity = 0;

        // Hide particles & Reveal solid cake meshes
        // Initial setup for cake scale (invisible)
        this.cakeGroup.scale.set(0.01, 0.01, 0.01);

        gsap.timeline({ delay: 2.2 })
            .to(this.starsParticleSystem.material, { opacity: 0, duration: 1.0 })
            .to(this.cakeGroup.scale, { 
                x: 1.0, y: 1.0, z: 1.0, 
                duration: 1.8, 
                ease: "elastic.out(1, 0.55)" 
            }, "<0.2")
            .call(() => {
                // Destroy particle points to save memory
                this.particleGroup.remove(this.starsParticleSystem);
                this.starsParticleSystem.geometry.dispose();
                this.starsParticleSystem.material.dispose();
                this.starsParticleSystem = null;

                // Move stage
                this.stage = 'cake';

                // Display Orbit drag helper instructions
                if (containerOverlay) containerOverlay.style.opacity = 0.9;
                
                // Show "Celebrate" button
                this.celebrateBtn.style.display = 'block';
                gsap.fromTo(this.celebrateBtn, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 });
            });
    }

    // --- CORE RENDER LOOP ---

    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();
        const time = this.clock.getElapsedTime();

        // 1. Particle floating movements (Initial phase)
        if (this.stage === 'stars' && this.starsParticleSystem) {
            const posAttr = this.starsParticleSystem.geometry.attributes.position;
            const positions = posAttr.array;
            
            for (let i = 0; i < this.randomSpeeds.length; i++) {
                const s = this.randomSpeeds[i];
                // Idle floating oscillation
                s.phase += delta * s.speed;
                positions[i * 3] += Math.sin(s.phase) * 0.005;
                positions[i * 3 + 1] += Math.cos(s.phase) * 0.005;
                positions[i * 3 + 2] += Math.sin(s.phase * 0.8) * 0.005;
            }
            posAttr.needsUpdate = true;
        }

        // 2. Slow Cake Rotation & Slice displacement
        if (this.stage === 'cake' || this.stage === 'celebrate') {
            // Idle hover spin
            this.cakeGroup.rotation.y += 0.003;
        }

        // Displace the sliced slice group outwards
        if (this.stage === 'wish' || this.stage === 'blown') {
            // Sliced angle = 0.22. Slide outwards along that angle
            const angle = 0.22;
            const dx = Math.cos(angle) * this.sliceDistance.value;
            const dz = Math.sin(angle) * this.sliceDistance.value;
            
            this.sliceGroup.position.set(dx, 0.0, dz);
            
            // Add a slight tilt & hover float to the plate slice
            this.sliceGroup.position.y = Math.sin(time * 1.5) * 0.06;
            this.sliceGroup.rotation.y = Math.sin(time * 0.5) * 0.03;
        }

        // 3. Flicker Candle Flame
        if (this.candleFlame && this.candleFlame.scale.x > 0.1) {
            const flicker = 0.9 + Math.sin(time * 25.0) * 0.12;
            this.candleFlame.scale.y = flicker;
            this.candleFlame.scale.x = flicker * (0.95 + Math.cos(time * 15.0) * 0.05);
            this.candleFlame.rotation.z = Math.sin(time * 10.0) * 0.03;
            
            // Update light intensity
            this.candleLight.intensity = 1.3 + Math.sin(time * 18.0) * 0.2;
        }

        // 4. Animate Cut Sparkles
        if (this.cutParticleSystem) {
            const system = this.cutParticleSystem.system;
            const vels = this.cutParticleSystem.velocities;
            const posAttr = system.geometry.attributes.position;
            const posArr = posAttr.array;
            let active = false;

            for (let i = 0; i < this.cutParticleSystem.count; i++) {
                const vel = vels[i];
                if (vel.life <= 0) continue;

                active = true;
                vel.y += vel.gravity; // gravity pulls down
                posArr[i * 3] += vel.x;
                posArr[i * 3 + 1] += vel.y;
                posArr[i * 3 + 2] += vel.z;

                vel.life -= vel.decay;
                
                // Fade out
                system.material.opacity = vel.life;
            }

            posAttr.needsUpdate = true;

            if (!active) {
                this.particleGroup.remove(system);
                system.geometry.dispose();
                system.material.dispose();
                this.cutParticleSystem = null;
            }
        }

        // 5. Animate Sky Fireworks
        if (this.activeFireworks && this.activeFireworks.length > 0) {
            for (let f = this.activeFireworks.length - 1; f >= 0; f--) {
                const fw = this.activeFireworks[f];
                const system = fw.system;
                const vels = fw.velocities;
                const posAttr = system.geometry.attributes.position;
                const posArr = posAttr.array;
                let alive = false;

                for (let i = 0; i < fw.count; i++) {
                    const vel = vels[i];
                    if (vel.life <= 0) continue;

                    alive = true;
                    // Apply velocity and gravity
                    vel.y += vel.gravity;
                    posArr[i * 3] += vel.x;
                    posArr[i * 3 + 1] += vel.y;
                    posArr[i * 3 + 2] += vel.z;

                    vel.life -= vel.decay;
                }

                posAttr.needsUpdate = true;
                system.material.opacity = Math.max(0, system.material.opacity - 0.008);

                if (!alive || system.material.opacity <= 0) {
                    this.fireworksGroup.remove(system);
                    system.geometry.dispose();
                    system.material.dispose();
                    this.activeFireworks.splice(f, 1);
                }
            }
        }

        // 6. Check Microphone blowing input
        if (this.stage === 'wish') {
            this.checkBlowDetection();
        }

        // 7. Track Easter Egg Rotations
        if (this.controls && this.stage === 'cake') {
            this.checkRotationEasterEgg();
        }

        // 8. Update controls & Render
        if (this.controls) {
            this.controls.update();
        }
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }
}

// Global instance mapping
window.addEventListener('DOMContentLoaded', () => {
    window.CakeDreamInstance = new CakeDreamExperience();
});
