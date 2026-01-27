<template>
  <router-view></router-view>
</template>

<script setup>
import { ref, reactive } from 'vue';
import ArtCanvas from './components/ArtCanvas.vue'; // 注意路径
import { AudioHandler } from './utils/AudioHandler'; // 注意路径

const canvasRef = ref(null); // 这个名字必须和 template 里的 ref 一样
const isStarted = ref(false);
let handler = null;

const start = async () => {
  handler = new AudioHandler();
  await handler.init();
  
  // 这里的 initThree 必须在子组件里 defineExpose 之后才能调用
  if (canvasRef.value) {
    canvasRef.value.initThree();
    isStarted.value = true;
    loop();
  } else {
    console.error("找不到 Canvas 组件！");
  }
};

const loop = () => {
  const data = handler.getFrequencyData(); // 确保 AudioHandler 里有这个方法
  
  if (canvasRef.value) {
    // 调用子组件的更新方法
    canvasRef.value.updateGeometry(data);
  }
  requestAnimationFrame(loop);
};
</script>

<style>
/* 全局重置 */
body, html { margin: 0; padding: 0; background: #000; font-family: 'Helvetica Neue', Arial, sans-serif; }
</style>