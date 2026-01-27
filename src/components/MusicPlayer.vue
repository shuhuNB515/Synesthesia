<template>
  <div class="music-player-card">
    
    <div v-if="!isLoggedIn" class="upload-zone locked" @click="$emit('require-login')">
      <div class="upload-btn">
        <span class="icon">🔒</span>
        <span class="text">LOGIN TO UPLOAD</span>
        <span class="sub">登录后解锁音乐上传与视频导出</span>
      </div>
    </div>

    <div v-else-if="!hasFile" class="upload-zone">
      <input type="file" id="music-upload" accept="audio/*" @change="handleUpload">
      <label for="music-upload" class="upload-btn">
        <span class="icon">🎵</span>
        <span class="text">UPLOAD AUDIO</span>
        <span class="sub">支持 MP3 / WAV · 生成专属视频</span>
      </label>
    </div>

    <div v-else class="player-zone">
      <div class="disc-wrapper" :class="{ spinning: isPlaying }">
        <div class="disc-art"></div>
      </div>

      <div class="track-info">
        <div class="track-name">{{ fileName }}</div>
        <div class="track-status">
          <span v-if="isRecording" class="recording-dot">🔴 REC</span>
          <span v-else>{{ isPlaying ? 'PLAYING' : 'READY' }}</span>
        </div>
      </div>

      <div class="controls">
        <button class="ctrl-btn" @click="togglePlay" :disabled="isRecording">
          {{ isPlaying ? '⏸' : '▶' }}
        </button>
        
        <button 
          class="ctrl-btn record-btn" 
          :class="{ active: isRecording }"
          @click="toggleRecord"
          title="录制视频"
        >
          {{ isRecording ? '⏹' : '🎥' }}
        </button>

        <button class="ctrl-btn small" @click="resetFile" :disabled="isRecording">⏏</button>
      </div>
    </div>

    <div v-if="videoUrl" class="video-preview-modal">
      <div class="preview-header">
        <span>PREVIEW</span>
        <button class="close-btn" @click="closePreview">×</button>
      </div>
      <video :src="videoUrl" controls autoplay class="preview-video"></video>
      <div class="download-actions">
        <a :href="videoUrl" download="synesthesia_art.webm" class="dl-btn">下载 WebM</a>
        <a :href="videoUrl" download="synesthesia_art.mp4" class="dl-btn outline">下载 MP4 (兼容)</a>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps(['isLoggedIn']);
const emit = defineEmits(['file-loaded', 'require-login', 'play', 'pause', 'reset', 'start-record', 'stop-record']);

const hasFile = ref(false);
const fileName = ref('');
const isPlaying = ref(false);
const isRecording = ref(false);
const videoUrl = ref(null); // 录制完成后的 Blob URL

const handleUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  fileName.value = file.name;
  hasFile.value = true;
  
  const reader = new FileReader();
  reader.onload = (e) => emit('file-loaded', e.target.result);
  reader.readAsArrayBuffer(file);
};

const togglePlay = () => {
  isPlaying.value = !isPlaying.value;
  isPlaying.value ? emit('play') : emit('pause');
};

const toggleRecord = () => {
  if (isRecording.value) {
    // 停止录制
    isRecording.value = false;
    emit('stop-record');
  } else {
    // 开始录制
    isRecording.value = true;
    if (!isPlaying.value) togglePlay(); // 自动开始播放
    emit('start-record');
  }
};

// 父组件录制完成后调用此方法传入视频地址
const setRecordedVideo = (url) => {
  videoUrl.value = url;
  isPlaying.value = false; // 停止播放音乐
  isRecording.value = false;
};

const closePreview = () => {
  URL.revokeObjectURL(videoUrl.value); // 释放内存
  videoUrl.value = null;
};

const resetFile = () => {
  hasFile.value = false;
  isPlaying.value = false;
  videoUrl.value = null;
  emit('reset');
};

defineExpose({ setRecordedVideo });
</script>

<style scoped>
.music-player-card {
  position: fixed; bottom: 30px; left: 30px; z-index: 500;
  width: 300px;
  background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px;
  padding: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.6);
}

/* 锁定状态 */
.upload-zone.locked .upload-btn { border-color: #333; cursor: not-allowed; opacity: 0.7; }
.upload-zone.locked:hover .upload-btn { border-color: #ff3366; color: #ff3366; background: rgba(255, 51, 102, 0.05); }

/* 上传按钮通用 */
.upload-zone input { display: none; }
.upload-btn {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 100px; border: 2px dashed #444; border-radius: 8px;
  cursor: pointer; color: #888; transition: 0.3s;
}
.upload-btn:hover { border-color: #00ffff; color: #fff; }
.upload-btn .sub { font-size: 10px; margin-top: 5px; opacity: 0.5; }

/* 播放器区域 */
.player-zone { display: flex; align-items: center; gap: 15px; }
.disc-wrapper {
  width: 50px; height: 50px; border-radius: 50%;
  background: radial-gradient(circle, #333 20%, #000 100%);
  border: 2px solid #00ffff; position: relative;
  display: flex; align-items: center; justify-content: center;
}
.disc-art { width: 15px; height: 15px; background: #00ffff; border-radius: 50%; }
.spinning { animation: spin 3s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }

.track-info { flex: 1; overflow: hidden; }
.track-name { font-size: 12px; color: white; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.track-status { font-size: 10px; color: #666; }
.recording-dot { color: #ff3366; animation: blink 1s infinite; }
@keyframes blink { 50% { opacity: 0.5; } }

.controls { display: flex; gap: 8px; }
.ctrl-btn {
  width: 32px; height: 32px; border-radius: 50%; background: transparent;
  border: 1px solid #fff; color: #fff; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.ctrl-btn:hover { background: #fff; color: #000; }
.ctrl-btn.record-btn { border-color: #ff3366; color: #ff3366; }
.ctrl-btn.record-btn:hover { background: #ff3366; color: white; }
.ctrl-btn.record-btn.active { background: #ff3366; color: white; box-shadow: 0 0 10px #ff3366; }
.ctrl-btn.small { width: 24px; height: 24px; font-size: 10px; border-color: #666; color: #666; }

/* 视频预览弹窗 (嵌入在卡片上方) */
.video-preview-modal {
  position: absolute; bottom: 100%; left: 0; width: 100%;
  background: #111; border: 1px solid #333; border-radius: 12px;
  padding: 10px; margin-bottom: 10px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.8);
}
.preview-header { display: flex; justify-content: space-between; color: #fff; font-size: 12px; margin-bottom: 10px; }
.close-btn { background: none; border: none; color: #666; cursor: pointer; font-size: 16px; }
.preview-video { width: 100%; border-radius: 8px; background: #000; margin-bottom: 10px; }
.download-actions { display: flex; gap: 5px; }
.dl-btn {
  flex: 1; text-align: center; padding: 8px 0; font-size: 12px;
  background: #00ffff; color: #000; text-decoration: none; border-radius: 4px;
}
.dl-btn.outline { background: transparent; border: 1px solid #444; color: #ccc; }
.dl-btn:hover { opacity: 0.8; }
</style>