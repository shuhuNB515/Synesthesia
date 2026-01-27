export class AudioHandler {
  constructor() {
    this.context = null;
    this.analyser = null;
    this.dataArray = null;
    this.source = null; // 当前的音频源 (麦克风或文件)
    this.audioBuffer = null; // 存储解码后的音频文件
    this.isPlaying = false;
    this.startTime = 0;
    this.pauseOffset = 0;
  }

  // 初始化基础环境 (只做一次)
// src/utils/AudioHandler.js 局部修改
initContext() {
  if (!this.context) {
    this.context = new (window.AudioContext || window.webkitAudioContext)();
    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = 512;
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    // 【新增】创建音频流目标节点
    this.dest = this.context.createMediaStreamDestination();
    // 将分析器连接到这个目标，这样录像机就能收到声音
    this.analyser.connect(this.dest);
  }
}

// 【新增】获取音频流的方法
getAudioStream() {
  return this.dest ? this.dest.stream : null;
}
  // 模式 A: 启动麦克风
  async useMicrophone() {
    this.stop(); // 先停止当前的
    this.initContext();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.source = this.context.createMediaStreamSource(stream);
      this.source.connect(this.analyser);
      this.isPlaying = true;
      console.log("已切换至麦克风模式");
    } catch (e) {
      console.error("麦克风获取失败", e);
    }
  }

  // 模式 B: 加载音频文件 (ArrayBuffer)
  async loadFile(arrayBuffer) {
    this.initContext();
    // 解码音频数据
    this.audioBuffer = await this.context.decodeAudioData(arrayBuffer);
    console.log("音频文件解码完成");
  }

  // 播放已加载的文件
  playFile() {
    if (!this.audioBuffer) return;
    this.stop(); // 停止之前的源
    this.initContext();

    this.source = this.context.createBufferSource();
    this.source.buffer = this.audioBuffer;
    this.source.connect(this.analyser);
    this.analyser.connect(this.context.destination); // 只有文件模式需要连 destination (听见声音)

    this.source.start(0, this.pauseOffset);
    this.startTime = this.context.currentTime;
    this.isPlaying = true;
    
    // 播放结束时的回调
    this.source.onended = () => {
       // 简单的循环播放逻辑，或重置状态
    };
  }

  // 暂停文件
  pauseFile() {
    if (this.source && this.isPlaying) {
      this.source.stop();
      this.pauseOffset += this.context.currentTime - this.startTime;
      this.isPlaying = false;
    }
  }

  // 停止所有声音
  stop() {
    if (this.source) {
      try {
        this.source.disconnect();
        if (this.source.stop) this.source.stop(); // 只有 BufferSource 有 stop
      } catch(e) {} // 忽略已停止的报错
    }
    this.isPlaying = false;
  }

  // 获取频率数据 (通用)
  getFrequencyData() {
    if (!this.analyser) return { bass: 0, mid: 0, high: 0 };
    
    this.analyser.getByteFrequencyData(this.dataArray);
    
    // 智能计算频段
    const bass = this.average(this.dataArray.slice(0, 10));
    const mid = this.average(this.dataArray.slice(10, 100));
    const high = this.average(this.dataArray.slice(100, 200));

    return { bass, mid, high };
  }

  average(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }
}