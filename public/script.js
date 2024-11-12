class ModelViewer {
    constructor() {
        // Initialize DOM elements
        this.container = document.getElementById('container');
        this.loadingScreen = document.getElementById('loading-screen');
        this.progressBar = document.querySelector('.progress');
        this.loadingStatus = document.querySelector('.loading-status');
        this.errorMessage = document.getElementById('error-message');
        this.settingsPanel = document.getElementById('settings-panel');
        
        // Initialize settings
        this.settings = {
            backgroundColor: '#1a1a1a',
            animationSpeed: 1,
            quality: 'high'
        };

        // Initialize model cache
        this.modelCache = new Map();
        
        // Initialize stats monitor
        this.stats = new Stats();
        this.stats.showPanel(0); // 0: fps, 1: ms, 2: memory
        this.stats.dom.style.transform = 'scale(2)'; // Make the stats monitor bigger
        this.stats.dom.style.transformOrigin = 'top left'; // Set the origin for scaling
        document.body.appendChild(this.stats.dom);
        
        // Initialize scene
        this.init();
        this.setupLights();
        this.setupEventListeners();
        this.animate();
    }

    init() {
        // Scene setup with fog
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(this.settings.backgroundColor);
        this.scene.fog = new THREE.Fog(this.settings.backgroundColor, 10, 50);

        // Advanced camera setup
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(5, 2, 5);
        this.camera.lookAt(0, 0, 0);

        // Advanced renderer setup
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            powerPreference: "high-performance",
            stencil: false
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        // Enhanced controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 2;
        this.controls.maxDistance = 15;
        this.controls.maxPolarAngle = Math.PI / 1.8;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 3.0; // Increased auto-rotate speed
    }

    setupLights() {
        // Enhanced ambient lighting
        const ambientLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.5);
        this.scene.add(ambientLight);

        // Main directional light with shadows
        const mainLight = new THREE.DirectionalLight(0xffffff, 1);
        mainLight.position.set(5, 5, 5);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 0.1;
        mainLight.shadow.camera.far = 20;
        this.scene.add(mainLight);

        // Rim lighting
        const rimLight = new THREE.DirectionalLight(0x00ffff, 0.3);
        rimLight.position.set(-5, 0, -5);
        this.scene.add(rimLight);

        // Dynamic point lights
        this.pointLights = [];
        const colors = [0xff0000, 0x00ff00, 0x0000ff];
        for(let i = 0; i < 3; i++) {
            const light = new THREE.PointLight(colors[i], 0.5, 10);
            light.position.set(
                Math.cos(i * Math.PI * 2/3) * 5,
                2,
                Math.sin(i * Math.PI * 2/3) * 5
            );
            this.pointLights.push(light);
            this.scene.add(light);
        }
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize(), false);
        
        // Settings panel controls
        document.getElementById('background-color').addEventListener('input', (e) => {
            this.settings.backgroundColor = e.target.value;
            this.scene.background = new THREE.Color(this.settings.backgroundColor);
            this.scene.fog.color = new THREE.Color(this.settings.backgroundColor);
        });

        document.getElementById('animation-speed').addEventListener('input', (e) => {
            this.settings.animationSpeed = parseFloat(e.target.value);
            this.controls.autoRotateSpeed = 2.0 * this.settings.animationSpeed; // Adjusted for faster rotation
        });

        document.getElementById('quality-setting').addEventListener('change', (e) => {
            this.settings.quality = e.target.value;
            this.updateQualitySettings();
        });

        // Reset view on 'R' key press
        document.addEventListener('keydown', (e) => {
            if(e.key.toLowerCase() === 'r') {
                this.resetCamera();
            }
        });

        // Toggle settings panel
        document.getElementById('settings-btn').addEventListener('click', () => {
            this.settingsPanel.classList.toggle('hidden');
        });
    }

    async loadModel(url) {
        // Check cache first
        if (this.modelCache.has(url)) {
            const cachedModel = this.modelCache.get(url);
            this.scene.add(cachedModel.clone());
            this.hideLoadingScreen();
            return;
        }

        const dracoLoader = new THREE.DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.4.1/');
        dracoLoader.preload();

        const loader = new THREE.GLTFLoader();
        loader.setDRACOLoader(dracoLoader);

        this.loadingStatus.textContent = 'Loading 3D Model...';

        try {
            const gltf = await new Promise((resolve, reject) => {
                loader.load(
                    url,
                    resolve,
                    (xhr) => {
                        const percentComplete = (xhr.loaded / xhr.total) * 100;
                        this.updateProgress(percentComplete);
                    },
                    reject
                );
            });

            this.loadingStatus.textContent = 'Processing Model...';
            const model = gltf.scene;
            
            // Enable shadows
            model.traverse((node) => {
                if(node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                    if(node.material) {
                        node.material.envMapIntensity = 1.5;
                        node.material.needsUpdate = true;
                    }
                }
            });

            // Center and scale model
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            model.position.sub(center);

            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 3 / maxDim;
            model.scale.multiplyScalar(scale);

            // Cache the processed model
            this.modelCache.set(url, model.clone());

            // Add to scene with animation
            this.scene.add(model);
            gsap.from(model.rotation, {
                duration: 1.5,
                y: Math.PI * 2,
                ease: "power2.out"
            });

            this.hideLoadingScreen();
        } catch (error) {
            this.showError('Error loading 3D model: ' + error.message);
            console.error('Error loading 3D model:', error);
        }
    }

    updateProgress(percent) {
        gsap.to(this.progressBar, {
            width: `${percent}%`,
            duration: 0.3,
            ease: "power1.out"
        });
    }

    hideLoadingScreen() {
        gsap.to(this.loadingScreen, {
            opacity: 0,
            duration: 0.5,
            onComplete: () => {
                this.loadingScreen.style.display = 'none';
            }
        });
    }

    showError(message) {
        const errorText = this.errorMessage.querySelector('.error-text');
        errorText.textContent = message;
        gsap.to(this.errorMessage, {
            display: 'block',
            opacity: 1,
            duration: 0.3
        });
        this.hideLoadingScreen();
    }

    resetCamera() {
        gsap.to(this.camera.position, {
            x: 5,
            y: 2,
            z: 5,
            duration: 1,
            ease: "power2.inOut"
        });
        this.controls.reset();
    }

    updateQualitySettings() {
        switch(this.settings.quality) {
            case 'low':
                this.renderer.setPixelRatio(1);
                this.renderer.shadowMap.enabled = false;
                break;
            case 'medium':
                this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
                this.renderer.shadowMap.enabled = true;
                break;
            case 'high':
                this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                this.renderer.shadowMap.enabled = true;
                break;
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        this.stats.begin();

        requestAnimationFrame(() => this.animate());
        
        // Animate point lights
        const time = Date.now() * 0.001;
        this.pointLights.forEach((light, i) => {
            light.position.x = Math.cos(time + i * Math.PI * 2/3) * 5;
            light.position.z = Math.sin(time + i * Math.PI * 2/3) * 5;
        });

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
        
        this.stats.end();
    }
}

// Audio cache manager
class AudioCache {
    constructor() {
        this.cache = new Map();
    }

    async loadAudio(url) {
        if (this.cache.has(url)) {
            return this.cache.get(url);
        }

        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            
            const audio = new Audio(url);
            this.cache.set(url, audio);
            return audio;
        } catch (error) {
            console.error('Error loading audio:', error);
            throw error;
        }
    }
}

// Initialize viewer with enhanced error handling
try {
    const viewer = new ModelViewer();
    viewer.loadModel('furina.glb');
} catch(error) {
    console.error('Failed to initialize ModelViewer:', error);
    document.getElementById('error-message').style.display = 'block';
    document.querySelector('.error-text').textContent = 'Failed to initialize viewer: ' + error.message;
}

// Initialize audio with caching
const audioCache = new AudioCache();
let bgMusic;

async function initAudio() {
    try {
        bgMusic = await audioCache.loadAudio('audio/banananana.mp3');
        setupAudioControls();
    } catch (error) {
        console.error('Failed to load audio:', error);
    }
}

function setupAudioControls() {
    const playPauseBtn = document.getElementById('playPauseBtn');
    const playPauseIcon = playPauseBtn.querySelector('i');

    playPauseBtn.addEventListener('click', () => {
        if (bgMusic.paused) {
            bgMusic.play().catch(e => console.log("Audio play failed:", e));
            playPauseIcon.classList.remove('fa-play');
            playPauseIcon.classList.add('fa-pause');
        } else {
            bgMusic.pause();
            playPauseIcon.classList.remove('fa-pause');
            playPauseIcon.classList.add('fa-play');
        }
    });
}

// Initialize audio system
initAudio();

// Setup one-time click listener for audio
document.addEventListener('click', () => {
    if (bgMusic) {
        bgMusic.play().catch(e => console.log("Audio play failed:", e));
    }
}, { once: true });
