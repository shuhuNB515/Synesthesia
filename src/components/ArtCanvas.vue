<template>
  <div ref="container" class="canvas-box"></div>
  
  <div class="control-panel">
    
    <div class="panel-section shapes">
      <div class="section-title">GEOMETRY / 几何</div>
      <div class="btn-group">
        <button :class="{ active: mode === 'sphere' }" @click="switchShape('sphere')">🔮 灵球</button>
        <button :class="{ active: mode === 'cube' }" @click="switchShape('cube')">🧊 晶体</button>
        <button :class="{ active: mode === 'knot' }" @click="switchShape('knot')">🥨 扭结</button>
        <button :class="{ active: mode === 'cone' }" @click="switchShape('cone')">📐 锥体</button>
        <button :class="{ active: mode === 'particles' }" @click="switchShape('particles')">✨ 星尘</button>
      </div>
    </div>

    <div class="panel-section colors">
      <div class="section-title">COLOR / 色彩</div>
      <div class="color-controls">
        <div class="color-picker-wrapper">
          <input type="color" id="userColor" v-model="config.userColor" @input="updateColor">
          <label for="userColor" :style="{ background: config.userColor }"></label>
        </div>
        
        <button 
          class="toggle-btn" 
          :class="{ active: config.isAutoColor }" 
          @click="config.isAutoColor = !config.isAutoColor"
        >
          {{ config.isAutoColor ? '🌈 律动变色: ON' : '🔒 锁定颜色' }}
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { onMounted, ref, reactive } from 'vue';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

const container = ref(null);
let scene, camera, renderer, composer;
let currentMesh = null;
let particleSystem = null;
const mode = ref('sphere'); // 当前形状模式

// 配置状态
const config = reactive({
  userColor: '#00ffff', // 默认青色
  isAutoColor: true     // 默认开启律动变色
});

const initThree = () => {
  if (renderer) return;

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.02);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // 限制像素比，提升性能
  container.value.appendChild(renderer.domElement);

  // 后期处理：辉光
  const renderScene = new RenderPass(scene, camera);
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5, 0.4, 0.85
  );
  composer = new EffectComposer(renderer);
  composer.addPass(renderScene);
  composer.addPass(bloomPass);

  // 默认形状
  switchShape('sphere');
};

// --- 形状创建工厂 ---
const createGeometry = (type) => {
  // 移除旧物体
  if (currentMesh) { scene.remove(currentMesh); currentMesh = null; }
  if (particleSystem) { scene.remove(particleSystem); particleSystem = null; }

  const color = new THREE.Color(config.userColor);
  const material = new THREE.MeshBasicMaterial({ color: color, wireframe: true });

  switch (type) {
    case 'sphere':
      currentMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, 10), material);
      break;
    case 'cube':
      currentMesh = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2, 4, 4, 4), material);
      break;
    case 'knot':
      // 扭结形状：非常适合展示线条美
      currentMesh = new THREE.Mesh(new THREE.TorusKnotGeometry(1, 0.3, 100, 16), material);
      break;
    case 'cone':
      currentMesh = new THREE.Mesh(new THREE.ConeGeometry(1.5, 3, 32, 5, true), material);
      break;
    case 'particles':
      createParticles();
      return; // 粒子单独处理
  }
  
  if (currentMesh) scene.add(currentMesh);
};

// 粒子系统创建
const createParticles = () => {
  const geometry = new THREE.BufferGeometry();
  const count = 3000;
  const positions = new Float32Array(count * 3);
  for(let i=0; i<count*3; i++) positions[i] = (Math.random() - 0.5) * 12;
  
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ 
    size: 0.05, 
    color: new THREE.Color(config.userColor) 
  });
  particleSystem = new THREE.Points(geometry, material);
  scene.add(particleSystem);
};

// 切换形状入口
const switchShape = (type) => {
  mode.value = type;
  createGeometry(type);
};

// 手动更新颜色 (当用户拖动颜色选择器时)
const updateColor = () => {
  if (config.isAutoColor) return; // 如果是自动模式，忽略手动选择
  const newColor = new THREE.Color(config.userColor);
  
  if (currentMesh) currentMesh.material.color = newColor;
  if (particleSystem) particleSystem.material.color = newColor;
};
const getCanvasStream = () => {
  if (renderer && renderer.domElement) {
    // 30 FPS 足够了，太高浏览器会卡
    return renderer.domElement.captureStream(30);
  }
  return null;
};

// --- 核心动画循环 ---
const updateGeometry = (data) => {
  const scale = 1 + data.bass / 200;
  
  // 1. 处理颜色逻辑
  if (config.isAutoColor) {
    // 自动模式：随中音变色 (HSL 色轮旋转)
    const hue = data.mid / 255; 
    const dynamicColor = new THREE.Color().setHSL(hue, 1, 0.5);
    
    if (currentMesh) currentMesh.material.color = dynamicColor;
    if (particleSystem) particleSystem.material.color = dynamicColor;
  } else {
    // 锁定模式：保持用户颜色，但随低音闪烁亮度
    const baseColor = new THREE.Color(config.userColor);
    // 亮度增强：0.5 是基础亮度，data.bass/500 是闪烁增量
    const lightness = 0.5 + data.bass / 500; 
    baseColor.offsetHSL(0, 0, lightness - 0.5); // 仅调整亮度
    
    if (currentMesh) currentMesh.material.color = baseColor;
    if (particleSystem) particleSystem.material.color = baseColor;
  }

  // 2. 处理形状运动
  if (currentMesh) {
    currentMesh.scale.set(scale, scale, scale);
    currentMesh.rotation.y += 0.005;
    currentMesh.rotation.x += 0.002;
    
    // 针对不同形状的特殊动作
    if (mode.value === 'knot') currentMesh.rotation.z += 0.01;
    if (mode.value === 'cone') currentMesh.rotation.x -= 0.01;
  }

  if (particleSystem) {
    particleSystem.rotation.y -= 0.002;
    // 粒子随重低音扩散
    const pScale = 1 + data.bass / 100;
    particleSystem.scale.set(pScale, pScale, pScale);
  }

  if (composer) composer.render();
};

defineExpose({ initThree, updateGeometry, getCanvasStream });
</script>

<style scoped>
.canvas-box { width: 100%; height: 100%; position: absolute; z-index: 0; }

/* 控制面板整体样式 */
.control-panel {
  position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%);
  z-index: 200;
  display: flex; gap: 40px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  padding: 20px 40px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}

.section-title {
  color: #666; font-size: 10px; letter-spacing: 2px; margin-bottom: 10px; font-weight: bold;
}

.btn-group { display: flex; gap: 10px; }

/* 形状按钮 */
.btn-group button {
  background: transparent; border: 1px solid #444; color: #888;
  padding: 8px 16px; border-radius: 8px; cursor: pointer; transition: 0.3s;
  font-size: 12px;
}
.btn-group button:hover { border-color: #fff; color: #fff; }
.btn-group button.active {
  background: rgba(0, 255, 255, 0.2); border-color: #00ffff; color: #00ffff;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
}

/* 颜色控制区 */
.color-controls { display: flex; align-items: center; gap: 15px; }

/* 自定义颜色选择器 UI */
.color-picker-wrapper { position: relative; width: 30px; height: 30px; }
.color-picker-wrapper input[type="color"] {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  opacity: 0; cursor: pointer; z-index: 2;
}
.color-picker-wrapper label {
  display: block; width: 100%; height: 100%;
  border-radius: 50%; border: 2px solid #fff;
  box-shadow: 0 0 5px rgba(255,255,255,0.5);
  transition: 0.3s;
}
.color-picker-wrapper input:hover + label { transform: scale(1.1); }

/* 律动开关按钮 */
.toggle-btn {
  background: #222; border: 1px solid #444; color: #888;
  padding: 8px 16px; border-radius: 20px; cursor: pointer; font-size: 12px;
  min-width: 100px;
}
.toggle-btn.active {
  background: linear-gradient(90deg, #ff00ff, #00ffff);
  border: none; color: #000; font-weight: bold;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .control-panel { 
    flex-direction: column; width: 80%; gap: 20px; padding: 20px;
    bottom: 20px;
  }
  .btn-group { flex-wrap: wrap; justify-content: center; }
}
</style>