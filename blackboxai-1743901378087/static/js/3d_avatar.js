// Core 3D Avatar Implementation
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

class Avatar3D {
    constructor() {
        this.currentEmotion = 'neutral';
        this.initScene();
        this.initRenderer();
        this.initCamera();
        this.initLights();
        this.loadModel();
        this.setupEventListeners();
        this.animate();
    }

    initScene() {
        this.scene = new THREE.Scene();
        this.clock = new THREE.Clock();
        this.mixer = null;
    }

    initRenderer() {
        this.container = document.getElementById('3d-avatar-container');
        this.renderer = new THREE.WebGLRenderer({ 
            alpha: true,
            antialias: true 
        });
        this.renderer.setSize(256, 256);
        this.container.appendChild(this.renderer.domElement);
    }

    initCamera() {
        this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        this.camera.position.z = 2;
    }

    initLights() {
        const ambient = new THREE.AmbientLight(0xffffff, 0.5);
        const directional = new THREE.DirectionalLight(0xffffff, 0.8);
        directional.position.set(1, 1, 1);
        this.scene.add(ambient, directional);
    }

    loadModel() {
        new GLTFLoader().load(
            '/static/models/ai_avatar.glb',
            (gltf) => {
                this.model = gltf.scene;
                this.model.scale.set(0.8, 0.8, 0.8);
                this.scene.add(this.model);
                
                if (gltf.animations?.length) {
                    this.mixer = new THREE.AnimationMixer(this.model);
                    this.animations = {};
                    gltf.animations.forEach(clip => {
                        this.animations[clip.name] = clip;
                    });
                }
            },
            undefined,
            (error) => {
                console.error('Model load failed:', error);
                this.createFallbackModel();
            }
        );
    }

    createFallbackModel() {
        const geometry = new THREE.SphereGeometry(0.5, 32, 32);
        const material = new THREE.MeshStandardMaterial({
            color: 0x3498db,
            metalness: 0.7,
            roughness: 0.2
        });
        this.model = new THREE.Mesh(geometry, material);
        this.scene.add(this.model);
    }

    setEmotion(emotion) {
        this.currentEmotion = emotion;
        const emotions = {
            'happy': { color: 0xffdd00, animation: 'happy' },
            'angry': { color: 0xff3300, animation: 'angry' }, 
            'neutral': { color: 0xffffff, animation: 'idle' }
        };
        
        const config = emotions[emotion] || emotions.neutral;
        
        this.model?.traverse(child => {
            if (child.isMesh) child.material.color.setHex(config.color);
        });
        
        if (this.mixer && this.animations?.[config.animation]) {
            this.mixer.clipAction(this.animations[config.animation]).play();
        }
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
        this.renderer.domElement.addEventListener('click', () => this.cycleEmotion());
        this.renderer.domElement.addEventListener('touchstart', () => this.cycleEmotion());
    }

    cycleEmotion() {
        const emotions = ['happy', 'angry', 'neutral'];
        const nextIndex = (emotions.indexOf(this.currentEmotion) + 1) % emotions.length;
        this.setEmotion(emotions[nextIndex]);
    }

    onWindowResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(
            this.container.clientWidth,
            this.container.clientHeight
        );
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        const delta = this.clock.getDelta();
        if (this.mixer) this.mixer.update(delta);
        if (this.model && !this.mixer) this.model.rotation.y += 0.01;
        this.renderer.render(this.scene, this.camera);
    }
}

// Make globally accessible
window.Avatar3D = Avatar3D;
export default Avatar3D;