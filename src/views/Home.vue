<template>
  <div class="home-container">
    <NavBar :isLoggedIn="isLoggedIn" @open-auth="showAuthModal = true" @logout="handleLogout" />

    <ArtCanvas ref="canvasRef" />

   <MusicPlayer 
         ref="musicPlayerRef"
         :isLoggedIn="isLoggedIn"
         @require-login="showAuthModal = true"
         @file-loaded="onFileLoaded"
         @play="onPlay"
         @pause="onPause"
         @reset="onReset"
         @start-record="startRecording"
         @stop-record="stopRecording"
       />
    <AuthModal :isVisible="showAuthModal" @close="showAuthModal = false" @login-success="onLoginSuccess" />

    <div class="hero-overlay" v-if="!isStarted && !isMusicMode">
      <h1 class="title-main">SYNESTHESIA</h1>
      <div class="subtitle-group">
        <p class="cn-text">通感 · 频率 · 艺术</p>
      </div>
      <button class="btn-start" @click="handleMicStart">
        <span class="btn-content">开启麦克风创作</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import NavBar from '../components/NavBar.vue';
import AuthModal from '../components/AuthModal.vue';
import ArtCanvas from '../components/ArtCanvas.vue';
import MusicPlayer from '../components/MusicPlayer.vue';
import { AudioHandler } from '../utils/AudioHandler';

const showAuthModal = ref(false);
const isLoggedIn = ref(false);
const isStarted = ref(false);
const isMusicMode = ref(false);
const canvasRef = ref(null);
const musicPlayerRef = ref(null);

// 保持全局单例
const audioHandler = new AudioHandler();
let mediaRecorder = null;
let recordedChunks = [];

onMounted(() => {
  if (localStorage.getItem('user_token')) isLoggedIn.value = true;
  if (canvasRef.value) canvasRef.value.initThree();
});

// --- 录制核心逻辑 ---
const startRecording = () => {
  if (!canvasRef.value || !audioHandler) return;

  const canvasStream = canvasRef.value.getCanvasStream();
  const audioStream = audioHandler.getAudioStream();

  if (!canvasStream || !audioStream) {
    alert("无法获取录制流，请确保已开启麦克风或播放音乐");
    return;
  }

  // 合并音视频流
  const combinedStream = new MediaStream([
    ...canvasStream.getVideoTracks(),
    ...audioStream.getAudioTracks()
  ]);

  const options = { mimeType: 'video/webm; codecs=vp9,opus' };
  try {
    mediaRecorder = new MediaRecorder(combinedStream, options);
  } catch (e) {
    mediaRecorder = new MediaRecorder(combinedStream);
  }

  recordedChunks = [];
  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) recordedChunks.push(event.data);
  };

  mediaRecorder.onstop = () => {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    if (musicPlayerRef.value) {
      musicPlayerRef.value.setRecordedVideo(url);
    }
    audioHandler.pauseFile();
  };

  mediaRecorder.start();
  console.log("录制开始...");
};

const stopRecording = () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
    console.log("录制结束");
  }
};

// --- 其他交互逻辑 ---
const handleMicStart = async () => {
  try {
    await audioHandler.useMicrophone();
    isStarted.value = true;
    isMusicMode.value = false;
    startVisualLoop();
  } catch(e) {
    alert("需要麦克风权限");
  }
};

const onFileLoaded = async (arrayBuffer) => {
  audioHandler.stop();
  isMusicMode.value = true;
  isStarted.value = true;
  await audioHandler.loadFile(arrayBuffer);
  audioHandler.playFile();
  startVisualLoop();
};

const startVisualLoop = () => {
  const loop = () => {
    if (audioHandler.isPlaying) {
      const data = audioHandler.getFrequencyData();
      if (canvasRef.value) canvasRef.value.updateGeometry(data);
    }
    requestAnimationFrame(loop);
  };
  loop();
};

const onPlay = () => audioHandler.playFile();
const onPause = () => audioHandler.pauseFile();
const onReset = () => {
  audioHandler.stop();
  isMusicMode.value = false;
  isStarted.value = false;
};
const onLoginSuccess = () => { isLoggedIn.value = true; showAuthModal.value = false; localStorage.setItem('user_token', 'ok'); };
const handleLogout = () => { isLoggedIn.value = false; localStorage.removeItem('user_token'); };
</script>

<style scoped>
/* 保持原有样式，无需大改 */
.home-container { width: 100vw; height: 100vh; overflow: hidden; background: #000; }
.hero-overlay {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  text-align: center; color: white; z-index: 10;
}
.title-main {
  font-family: 'Arial Black', sans-serif; font-size: 80px; letter-spacing: 15px;
  background: linear-gradient(180deg, #fff, #666); -webkit-background-clip: text; color: transparent;
}
.cn-text { font-size: 24px; letter-spacing: 12px; color: #00ffff; margin-bottom: 40px; }
.btn-start {
  background: transparent; border: 1px solid #00ffff; color: #00ffff;
  padding: 15px 60px; font-size: 18px; letter-spacing: 5px; cursor: pointer; transition: 0.3s;
}
.btn-start:hover { background: #00ffff; color: #000; box-shadow: 0 0 30px #00ffff; }
</style>