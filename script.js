import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, camera, renderer, controls;
const interactiveObjects = [];
const electricityLines = [];
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let clock = new THREE.Clock();
let particleSystem;
let hoverObject = null;
let activePanel = null;

// --- Initialization ---

// Function called after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    init();
});

function init() {
    createScene();
    createCamera();
    createRenderer();
    createLighting();
    createControls();
    createBackground();
    createParticles();
    createInteractiveObjects();
    createElectricityEffects();
    createElectricityDOMEffects();
    
    // Event Listeners
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('click', onClick);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('keydown', onKeyDown);
    
    const navButtons = document.querySelectorAll('.nav-button');
    const contentPanels = document.querySelectorAll('.content-panel');
    const closeButtons = document.querySelectorAll('.close-button');
    const scrollToProfileBtn = document.getElementById('scroll-to-profile');
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    const profileSection = document.getElementById('profile-section');
    
    // Initialize the 3D simulation
    initSimulation();
    
    // Set initial scroll position to the top
    window.scrollTo(0, 0);
    
    // Add event listeners for nav buttons
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const panelId = this.getAttribute('data-panel');
            
            // Stay on current view - don't scroll to profile section
            
            // Remove active class from all nav buttons
            navButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to the clicked button
            this.classList.add('active');
            
            // Hide all content panels
            contentPanels.forEach(panel => {
                panel.classList.remove('active');
            });
            
            // Show the selected content panel
            const targetPanel = document.getElementById(panelId);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });
    
    // Add event listeners for close buttons
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Find the closest content panel parent
            const panel = this.closest('.content-panel');
            if (panel) {
                panel.classList.remove('active');
            }
            
            // Remove active class from all nav buttons
            navButtons.forEach(btn => btn.classList.remove('active'));
        });
    });
    
    // Scroll to profile section
    if (scrollToProfileBtn) {
        scrollToProfileBtn.addEventListener('click', function() {
            // Hide any active content panels first
            contentPanels.forEach(panel => {
                panel.classList.remove('active');
            });
            
            // Remove active class from all nav buttons
            navButtons.forEach(btn => btn.classList.remove('active'));
            
            // Then scroll to profile section
            profileSection.scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    // Scroll to top (main view)
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', function() {
            // Hide any active content panels first
            contentPanels.forEach(panel => {
                panel.classList.remove('active');
            });
            
            // Remove active class from all nav buttons
            navButtons.forEach(btn => btn.classList.remove('active'));
            
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Show/hide scroll-to-top button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    });
    
    // Start Animation Loop
    animate();
}

// --- Scene Setup ---

function createScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060c21); // Deep blue background
    scene.fog = new THREE.FogExp2(0x060c21, 0.03);
}

function createCamera() {
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 10;
    camera.position.y = 0;
}

function createRenderer() {
    const container = document.getElementById('simulation-container');
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
}

function createControls() {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.7;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.enableZoom = true;
    controls.maxDistance = 20;
    controls.minDistance = 5;
    
    controls.addEventListener('start', function() {
        controls.autoRotate = false;
    });
}

function createLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x333355, 0.5);
    scene.add(ambientLight);
    
    // Directional light (like sunlight)
    const directionalLight = new THREE.DirectionalLight(0x00a8ff, 1);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    
    // Point lights (for accent)
    const colors = [0x00a8ff, 0x7047d9, 0x4fc3f7];
    const positions = [
        [-8, 4, 5],
        [8, 3, 2],
        [0, -5, -5]
    ];
    
    for (let i = 0; i < colors.length; i++) {
        const pointLight = new THREE.PointLight(colors[i], 1, 15);
        pointLight.position.set(...positions[i]);
        scene.add(pointLight);
        
        // Optional: add visual indicator for the light
        const lightSphere = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 16, 16),
            new THREE.MeshBasicMaterial({ color: colors[i] })
        );
        lightSphere.position.copy(pointLight.position);
        scene.add(lightSphere);
    }
}

function createBackground() {
    // Starfield background
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.1,
        transparent: true,
        opacity: 0.8
    });
    
    const starsVertices = [];
    for (let i = 0; i < 3000; i++) {
        const x = THREE.MathUtils.randFloatSpread(100);
        const y = THREE.MathUtils.randFloatSpread(100);
        const z = THREE.MathUtils.randFloatSpread(100) - 50; // Push stars to the back
        starsVertices.push(x, y, z);
    }
    
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);
}

function createParticles() {
    const particleCount = 2000;
    const particleGeometry = new THREE.BufferGeometry();
    const particleMaterial = new THREE.PointsMaterial({
        color: 0x00a8ff,
        size: 0.05,
        transparent: true,
        blending: THREE.AdditiveBlending,
        opacity: 0.8,
        sizeAttenuation: true
    });
    
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];
    
    for (let i = 0; i < particleCount; i++) {
        // Position
        const x = THREE.MathUtils.randFloatSpread(20);
        const y = THREE.MathUtils.randFloatSpread(20);
        const z = THREE.MathUtils.randFloatSpread(20);
        
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        
        // Velocity (for animation)
        velocities.push({
            x: THREE.MathUtils.randFloatSpread(0.02),
            y: THREE.MathUtils.randFloatSpread(0.02),
            z: THREE.MathUtils.randFloatSpread(0.02)
        });
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.velocities = velocities;
    
    particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);
}

// --- Interactive Objects ---

function createInteractiveObjects() {
    const geometry = new THREE.IcosahedronGeometry(1, 1); // More detailed icosahedron
    
    const materials = {
        'about-content': createCustomMaterial(0xff6347, 0.75), // Tomato
        'education-content': createCustomMaterial(0x4682b4, 0.75), // SteelBlue
        'skills-content': createCustomMaterial(0x32cd32, 0.75), // LimeGreen
        'pictures-content': createCustomMaterial(0xffd700, 0.75), // Gold
        'cv-content': createCustomMaterial(0x6a5acd, 0.75) // SlateBlue
    };
    
    // Adjust positions to be lower on the screen to avoid collision with header
    const positions = {
        'about-content': [-8, -1, 0],
        'education-content': [-4, -1, 0],
        'skills-content': [0, -1, 0],
        'pictures-content': [4, -1, 0],
        'cv-content': [8, -1, 0]
    };
    
    const labels = {
        'about-content': 'About Me',
        'education-content': 'Education',
        'skills-content': 'Skills',
        'pictures-content': 'Gallery',
        'cv-content': 'CV'
    };
    
    for (const panelId in materials) {
        const material = materials[panelId];
        
        // Create the 3D object
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(...positions[panelId]);
        mesh.userData.panelId = panelId;
        mesh.userData.baseScale = 1;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        // Add label
        addLabel(mesh, labels[panelId]);
        
        scene.add(mesh);
        interactiveObjects.push(mesh);
    }
}

function createCustomMaterial(color, metalness = 0.7) {
    return new THREE.MeshPhysicalMaterial({
        color: color,
        metalness: metalness, 
        roughness: 0.2,
        clearcoat: 1.0,
        clearcoatRoughness: 0.2,
        emissive: color,
        emissiveIntensity: 0.3,
        envMapIntensity: 1.0,
        reflectivity: 1.0
    });
}

function addLabel(mesh, text) {
    // Create canvas for the label
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 128;
    
    // Style the text
    context.fillStyle = 'rgba(0, 0, 0, 0)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = 'bold 36px Orbitron, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Draw glow
    context.shadowColor = '#00a8ff';
    context.shadowBlur = 15;
    context.fillStyle = '#ffffff';
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    
    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    const labelMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true
    });
    
    // Create sprite with the texture
    const label = new THREE.Sprite(labelMaterial);
    label.scale.set(2, 1, 1);
    label.position.set(0, -1.2, 0); // Position closer to the object (was -1.5)
    
    // Store the original position for the label
    mesh.userData.label = label;
    
    // Create a separate object to hold the label so it doesn't rotate with the parent
    const labelHolder = new THREE.Object3D();
    labelHolder.position.copy(mesh.position);
    labelHolder.position.y -= 1.2; // Position closer to the object (was -1.5)
    labelHolder.add(label);
    scene.add(labelHolder);
    
    // Store the labelHolder reference in the mesh's userData
    mesh.userData.labelHolder = labelHolder;
}

// --- Electricity Effects ---

function createElectricityEffects() {
    // Create electricity lines between objects
    for (let i = 0; i < interactiveObjects.length - 1; i++) {
        const startObject = interactiveObjects[i];
        const endObject = interactiveObjects[i + 1];
        
        const lineGeometry = new THREE.BufferGeometry();
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x00a8ff,
            transparent: true,
            opacity: 0.8,
            linewidth: 2
        });
        
        // Create the line with vertices
        const points = [];
        const segments = 20;
        
        for (let j = 0; j <= segments; j++) {
            const t = j / segments;
            const x = startObject.position.x * (1 - t) + endObject.position.x * t;
            const y = ((Math.random() - 0.5) * 0.8) - 1;
            const z = 0;
            points.push(new THREE.Vector3(x, y, z));
        }
        
        lineGeometry.setFromPoints(points);
        const line = new THREE.Line(lineGeometry, lineMaterial);
        line.userData = { 
            startObject: startObject,
            endObject: endObject,
            originalPoints: [...points],
            time: 0
        };
        
        scene.add(line);
        electricityLines.push(line);
        
        // Add a second line for thicker appearance
        const lineGeometry2 = new THREE.BufferGeometry();
        const lineMaterial2 = new THREE.LineBasicMaterial({
            color: 0x7047d9, // Purple color for contrast
            transparent: true,
            opacity: 0.6,
            linewidth: 2
        });
        
        const points2 = [];
        
        for (let j = 0; j <= segments; j++) {
            const t = j / segments;
            const x = startObject.position.x * (1 - t) + endObject.position.x * t;
            const y = ((Math.random() - 0.5) * 0.8) - 1.2; // Slight offset
            const z = 0.1;
            points2.push(new THREE.Vector3(x, y, z));
        }
        
        lineGeometry2.setFromPoints(points2);
        const line2 = new THREE.Line(lineGeometry2, lineMaterial2);
        line2.userData = { 
            startObject: startObject,
            endObject: endObject,
            originalPoints: [...points2],
            time: Math.PI / 2 // Phase offset for animation
        };
        
        scene.add(line2);
        electricityLines.push(line2);
    }
}

function updateElectricityLines(delta) {
    electricityLines.forEach(line => {
        line.userData.time += delta * 2;
        
        const positions = line.geometry.attributes.position.array;
        const originalPoints = line.userData.originalPoints;
        
        // Update start and end positions to match the current object positions
        const startPos = line.userData.startObject.position;
        const endPos = line.userData.endObject.position;
        
        // Update all points
        const segments = originalPoints.length - 1;
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const x = startPos.x * (1 - t) + endPos.x * t;
            
            // Update the points in between with noise (not the endpoints)
            if (i > 0 && i < segments) {
                const noiseX = Math.sin(line.userData.time + i * 0.5) * 0.2;
                const noiseY = Math.cos(line.userData.time * 0.7 + i * 0.5) * 0.5;
                
                positions[i * 3] = x + noiseX;
                positions[i * 3 + 1] = originalPoints[i].y + noiseY;
                positions[i * 3 + 2] = originalPoints[i].z;
            } else {
                // For endpoints, just follow the objects
                positions[i * 3] = x;
                positions[i * 3 + 1] = (i === 0) ? startPos.y : endPos.y;
                positions[i * 3 + 2] = originalPoints[i].z;
            }
        }
        
        line.geometry.attributes.position.needsUpdate = true;
        
        // Pulse the opacity for a stronger glowing effect
        const material = line.material;
        if (material.color.getHex() === 0x00a8ff) {
            material.opacity = 0.7 + Math.sin(line.userData.time * 3) * 0.3;
        } else {
            material.opacity = 0.5 + Math.cos(line.userData.time * 2.5) * 0.3;
        }
    });
}

function createElectricityDOMEffects() {
    // Create DOM-based electricity effects
    const electricContainer = document.createElement('div');
    electricContainer.className = 'electric-container';
    document.body.appendChild(electricContainer);
    
    // Create electricity elements
    for (let i = 0; i < 15; i++) {
        createElectricityElement(electricContainer);
    }
}

function createElectricityElement(container) {
    const electricity = document.createElement('div');
    electricity.className = 'electricity';
    
    // Randomize properties
    const width = Math.random() * 100 + 50;
    const delay = Math.random() * 5;
    const duration = Math.random() * 2 + 1;
    const rotation = Math.random() * 360;
    
    // Randomize position
    const top = Math.random() * 100;
    const left = Math.random() * 100;
    
    electricity.style.width = `${width}px`;
    electricity.style.top = `${top}%`;
    electricity.style.left = `${left}%`;
    electricity.style.transform = `rotate(${rotation}deg)`;
    electricity.style.animationDelay = `${delay}s`;
    electricity.style.animationDuration = `${duration}s`;
    
    // Random color (blue or purple)
    const colors = ['var(--electric-blue)', 'var(--electric-purple)'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    electricity.style.background = `linear-gradient(90deg, transparent, ${randomColor}, transparent)`;
    
    container.appendChild(electricity);
}

function updateParticles(delta) {
    if (!particleSystem) return;
    
    const positions = particleSystem.geometry.attributes.position.array;
    const velocities = particleSystem.geometry.velocities;
    
    for (let i = 0; i < positions.length / 3; i++) {
        // Update positions based on velocity
        positions[i * 3] += velocities[i].x;
        positions[i * 3 + 1] += velocities[i].y;
        positions[i * 3 + 2] += velocities[i].z;
        
        // Wrap particles if they go too far
        if (positions[i * 3] > 10) positions[i * 3] = -10;
        if (positions[i * 3] < -10) positions[i * 3] = 10;
        if (positions[i * 3 + 1] > 10) positions[i * 3 + 1] = -10;
        if (positions[i * 3 + 1] < -10) positions[i * 3 + 1] = 10;
        if (positions[i * 3 + 2] > 10) positions[i * 3 + 2] = -10;
        if (positions[i * 3 + 2] < -10) positions[i * 3 + 2] = 10;
    }
    
    particleSystem.geometry.attributes.position.needsUpdate = true;
}

// --- Panel Management ---

function showPanel(panelId) {
    // Show the target panel
    const panel = document.getElementById(panelId);
    if (panel) {
        activePanel = panelId;
        panel.classList.add('active');
    } else {
        console.error(`Panel with ID ${panelId} not found.`);
    }
}

function hidePanel(panelId) {
    const panel = document.getElementById(panelId);
    if (panel) {
        panel.classList.remove('active');
        activePanel = null;
    }
}

// Make functions globally accessible for HTML onclick
window.showPanel = showPanel;
window.hidePanel = hidePanel;

// --- Event Handlers ---

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onClick(event) {
    // Calculate mouse position in normalized device coordinates (-1 to +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    
    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);
    
    // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(interactiveObjects);
    
    if (intersects.length > 0) {
        // Get the first intersected object
        const intersectedObject = intersects[0].object;
        if (intersectedObject.userData.panelId) {
            // Create a "click" effect
            intersectedObject.scale.set(0.8, 0.8, 0.8);
            setTimeout(() => {
                intersectedObject.scale.set(1, 1, 1);
            }, 150);
            
            const panelId = intersectedObject.userData.panelId;
            
            // Do NOT scroll - stay on the 3D page
            
            // Hide any active panel first
            document.querySelectorAll('.content-panel.active').forEach(panel => {
                panel.classList.remove('active');
            });
            
            // Activate the nav button
            document.querySelectorAll('.nav-button').forEach(btn => {
                btn.classList.remove('active');
                if (btn.getAttribute('data-panel') === panelId) {
                    btn.classList.add('active');
                }
            });
            
            // Show the panel
            const panel = document.getElementById(panelId);
            if (panel) {
                panel.classList.add('active');
            }
        }
    }
}

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactiveObjects);
    
    // Reset previously hovered object
    if (hoverObject && (!intersects.length || intersects[0].object !== hoverObject)) {
        hoverObject.scale.set(1, 1, 1);
        document.body.style.cursor = 'default';
        
        // Reset material
        if (hoverObject.userData.originalEmissive) {
            hoverObject.material.emissiveIntensity = hoverObject.userData.originalEmissive;
        }
        
        hoverObject = null;
    }
    
    // Set new hover object
    if (intersects.length && intersects[0].object !== hoverObject) {
        const newHoverObject = intersects[0].object;
        newHoverObject.scale.set(1.1, 1.1, 1.1);
        document.body.style.cursor = 'pointer';
        
        // Increase emission for glow effect
        if (newHoverObject.material.emissive) {
            newHoverObject.userData.originalEmissive = newHoverObject.material.emissiveIntensity;
            newHoverObject.material.emissiveIntensity = 0.7; // More intense glow
        }
        
        hoverObject = newHoverObject;
    }
}

function onKeyDown(event) {
    // Close active panel when Escape key is pressed
    if (event.key === "Escape" && activePanel) {
        hidePanel(activePanel);
    }
}

// --- Animation Loop ---

function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    
    // Update controls if damping is enabled
    controls.update();
    
    // Rotate interactive objects individually but NOT their labels
    interactiveObjects.forEach((obj, index) => {
        // Different rotation speeds for each object
        const speed = 0.2 + (index * 0.05); 
        
        // Apply rotation to the object
        obj.rotation.y += 0.005;
        obj.rotation.x += 0.002;
        
        // Update label holder position to match object's position
        if (obj.userData.labelHolder) {
            obj.userData.labelHolder.position.x = obj.position.x;
            obj.userData.labelHolder.position.z = obj.position.z;
        }
    });
    
    // Update electricity effects
    updateElectricityLines(delta);
    
    // Update particles
    updateParticles(delta);
    
    renderer.render(scene, camera);
}

// --- Start ---

// Initialize 3D simulation
function initSimulation() {
    const container = document.getElementById('simulation-container');
    if (!container) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    // Camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    
    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    
    // Particles
    const particleCount = 2000;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
        // Position in a sphere
        const radius = 3 + Math.random() * 2;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        positions[i] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i + 2] = radius * Math.cos(phi);
        
        // Blue-green color gradient
        colors[i] = 0.1 + Math.random() * 0.3;         // R
        colors[i + 1] = 0.5 + Math.random() * 0.5;     // G
        colors[i + 2] = 0.8 + Math.random() * 0.2;     // B
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
    });
    
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);
    
    // Mouse interaction 
    const mouse = new THREE.Vector2();
    const mouseSpeed = 0.05;
    
    function onMouseMove(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }
    
    window.addEventListener('mousemove', onMouseMove, false);
    
    // Handle window resize
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    window.addEventListener('resize', onWindowResize, false);
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        // Rotate particle system based on mouse position
        particleSystem.rotation.x += 0.002 + (mouse.y * mouseSpeed);
        particleSystem.rotation.y += 0.003 + (mouse.x * mouseSpeed);
        
        renderer.render(scene, camera);
    }
    
    animate();
}

// User Interaction Tracking System
// Track all clicks and views performed by a user across HTML tags and CSS objects
function initUserTracking() {
    console.log('User interaction tracking initialized');
    
    // Format timestamp with both ISO and Indian Standard Time
    function formatTimestamp() {
        const now = new Date();
        
        // Get ISO timestamp
        const isoTimestamp = now.toISOString();
        
        // Format for Indian Standard Time (IST is UTC+5:30)
        const istOptions = { 
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };
        
        // Get IST timestamp
        const istTimestamp = now.toLocaleString('en-IN', istOptions) + ' IST';
        
        // Return both timestamps
        return `${isoTimestamp} (${istTimestamp})`;
    }
    
    // Get descriptive name for the clicked element
    function getElementDescription(element) {
        // Check for specific element types
        if (element.classList.contains('nav-button')) {
            return `Navigation Button: ${element.textContent.trim()}`;
        } else if (element.classList.contains('close-button')) {
            return 'Close Button';
        } else if (element.classList.contains('glow-button')) {
            return `Glow Button: ${element.textContent.trim()}`;
        } else if (element.tagName === 'IMG') {
            return `Image: ${element.alt || 'No alt text'}`;
        } else if (element.classList.contains('download-btn')) {
            return 'CV Download Button';
        } else if (element.classList.contains('gallery-item')) {
            return `Gallery Item: ${element.querySelector('p')?.textContent || 'Unknown'}`;
        } else if (element.tagName === 'H1' || element.tagName === 'H2' || element.tagName === 'H3') {
            return `Heading: ${element.textContent.trim()}`;
        } else if (element.closest('.content-panel')) {
            return `Content Panel: ${element.closest('.content-panel').id}`;
        } else if (element.closest('.profile-block')) {
            return `Profile Block: ${element.closest('.profile-block').querySelector('h3')?.textContent.trim() || 'Unknown'}`;
        } else if (element.classList.contains('text-block')) {
            return `Text Block: ${element.querySelector('h3')?.textContent.trim() || 'Unknown'}`;
        } else if (element.classList.contains('skill-category')) {
            return `Skill Category: ${element.querySelector('h3')?.textContent.trim() || 'Unknown'}`;
        }
        
        // 3D object clicks
        if (hoverObject && element.closest('#simulation-container')) {
            return `3D Object: ${hoverObject.userData.panelId || 'Unknown 3D Object'}`;
        }
        
        // Generic fallback
        return `${element.tagName.toLowerCase()}${element.id ? '#' + element.id : ''}${
            Array.from(element.classList).length ? '.' + Array.from(element.classList).join('.') : ''
        }`;
    }
    
    // Track all click events
    document.addEventListener('click', function(event) {
        const timestamp = formatTimestamp();
        const eventType = 'click';
        const targetElement = event.target;
        const elementDescription = getElementDescription(targetElement);
        
        console.log(`${timestamp}, ${eventType}, ${elementDescription}`);
    }, true); // Use capture phase to catch all events
    
    // Track page views using Intersection Observer
    const viewObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const timestamp = formatTimestamp();
                const eventType = 'view';
                const elementDescription = getElementDescription(entry.target);
                
                console.log(`${timestamp}, ${eventType}, ${elementDescription}`);
            }
        });
    }, { threshold: 0.5 }); // Element is considered "viewed" when 50% visible
    
    // Observe sections and important elements
    const elementsToObserve = [
        document.getElementById('main-view'),
        document.getElementById('profile-section'),
        ...document.querySelectorAll('.content-panel'),
        ...document.querySelectorAll('.profile-block'),
        ...document.querySelectorAll('.text-block'),
        ...document.querySelectorAll('.gallery-item'),
        ...document.querySelectorAll('.skill-category')
    ];
    
    elementsToObserve.forEach(element => {
        if (element) {
            viewObserver.observe(element);
        }
    });
    
    // Track 3D object hovers
    const originalOnMouseMove = onMouseMove;
    window.onMouseMove = function(event) {
        // Call the original handler
        originalOnMouseMove(event);
        
        // If a new object is being hovered, log it
        if (hoverObject && hoverObject !== previousHoverObject) {
            const timestamp = formatTimestamp();
            const eventType = 'hover';
            const elementDescription = `3D Object: ${hoverObject.userData.panelId || 'Unknown 3D Object'}`;
            
            console.log(`${timestamp}, ${eventType}, ${elementDescription}`);
            previousHoverObject = hoverObject;
        }
    };
    let previousHoverObject = null;
    
    // Track navigation between sections
    const scrollToProfileBtn = document.getElementById('scroll-to-profile');
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    
    if (scrollToProfileBtn) {
        scrollToProfileBtn.addEventListener('click', function() {
            const timestamp = formatTimestamp();
            console.log(`${timestamp}, click, Scroll to Profile Button`);
        });
    }
    
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', function() {
            const timestamp = formatTimestamp();
            console.log(`${timestamp}, click, Scroll to Top Button`);
        });
    }
    
    // Track initial page load
    console.log(`${formatTimestamp()}, view, Page Load`);
    
    // Track when user leaves the page
    window.addEventListener('beforeunload', function() {
        console.log(`${formatTimestamp()}, event, Page Unload`);
    });
}

// Initialize the user tracking after the DOM has loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize user tracking
    initUserTracking();
});
