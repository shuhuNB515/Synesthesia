<template>
  <div class="history-container">
    <div class="header-actions">
      <h2>MY GALLERY / 创作历史</h2>
      <span class="count">共 {{ list.length }} 件作品</span>
    </div>

    <div v-if="list.length > 0" class="art-grid">
      <div v-for="(item, index) in list" :key="item._id" class="art-card">
        <div class="thumb-wrapper">
          <img :src="item.image_url" alt="Art Thumbnail">
          <div class="overlay-actions">
            <button class="btn-play" @click="previewVideo(item.video_url)">▶ 播放视频</button>
          </div>
        </div>

        <div class="info-bar">
          <div class="title-row">
            <input 
              v-if="editingId === item._id" 
              type="text" 
              v-model="editTitle" 
              @blur="saveRename(item)"
              @keyup.enter="saveRename(item)"
              ref="editInput"
              class="edit-input"
            >
            <span v-else class="title-text">{{ item.title }}</span>
            <button class="icon-btn" @click="startRename(item)">✎</button>
          </div>
          <div class="meta-row">
            <span class="date">{{ formatDate(item.create_time) }}</span>
            <button class="btn-delete" @click="confirmDelete(item._id, index)">删除</button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <p>还没有任何艺术纪录，快去首页开启创作台吧</p>
    </div>

    <div v-if="previewUrl" class="video-modal" @click="previewUrl = null">
      <video :src="previewUrl" controls autoplay @click.stop></video>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue';

const list = ref([]);
const editingId = ref(null);
const editTitle = ref('');
const editInput = ref(null);
const previewUrl = ref(null);

// 模拟从数据库加载数据
const fetchHistory = () => {
  // 实际开发中应调用: uniCloud.database().collection('artworks').get()
  list.value = [
    { _id: '1', title: '深海频率 #001', image_url: 'https://via.placeholder.com/300x200/00ffff/000000?text=Art+1', video_url: '', create_time: Date.now() - 86400000 },
    { _id: '2', title: '霓虹扭结', image_url: 'https://via.placeholder.com/300x200/ff00ff/000000?text=Art+2', video_url: '', create_time: Date.now() - 172800000 },
  ];
};

// 重命名逻辑
const startRename = (item) => {
  editingId.value = item._id;
  editTitle.value = item.title;
  nextTick(() => editInput.value && editInput.value[0].focus());
};

const saveRename = (item) => {
  if (!editTitle.value.trim()) return;
  item.title = editTitle.value;
  editingId.value = null;
  // 实际开发中应同步至数据库: 
  // db.collection('artworks').doc(item._id).update({ title: editTitle.value })
  console.log(`作品 ${item._id} 已更名为: ${editTitle.value}`);
};

// 删除逻辑
const confirmDelete = (id, index) => {
  if (confirm("确定要永久删除这件艺术品吗？")) {
    list.value.splice(index, 1);
    // 实际开发中应同步至数据库:
    // db.collection('artworks').doc(id).remove()
    console.log("作品已删除");
  }
};

const previewVideo = (url) => {
  if (!url) {
    alert("该作品仅包含快照图片，无视频纪录");
    return;
  }
  previewUrl.value = url;
};

const formatDate = (ts) => new Date(ts).toLocaleDateString();

onMounted(fetchHistory);
</script>

<style scoped>
.history-container { padding: 10px; }

.header-actions {
  display: flex; justify-content: space-between; align-items: baseline;
  margin-bottom: 30px; border-bottom: 1px solid #222; padding-bottom: 10px;
}
.header-actions h2 { font-weight: 200; letter-spacing: 3px; color: #fff; }
.count { color: #555; font-size: 12px; }

.art-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
}

/* 作品卡片 */
.art-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid #222;
  border-radius: 12px;
  overflow: hidden;
  transition: 0.3s;
}
.art-card:hover { border-color: #00ffff; transform: translateY(-5px); }

.thumb-wrapper {
  position: relative; height: 180px; background: #111;
}
.thumb-wrapper img { width: 100%; height: 100%; object-fit: cover; opacity: 0.8; }

.overlay-actions {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.4); opacity: 0; transition: 0.3s;
}
.thumb-wrapper:hover .overlay-actions { opacity: 1; }

.btn-play {
  background: #00ffff; color: #000; border: none; padding: 8px 16px;
  border-radius: 20px; font-weight: bold; cursor: pointer;
}

/* 信息条 */
.info-bar { padding: 15px; }

.title-row {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;
}
.title-text { font-size: 15px; color: #eee; font-weight: bold; }
.edit-input { 
  background: #111; border: 1px solid #00ffff; color: #fff; padding: 2px 5px; 
  width: 80%; outline: none;
}

.icon-btn { background: transparent; border: none; color: #444; cursor: pointer; font-size: 14px; }
.icon-btn:hover { color: #00ffff; }

.meta-row { display: flex; justify-content: space-between; align-items: center; }
.date { font-size: 11px; color: #555; }
.btn-delete { background: transparent; border: none; color: #ff3366; cursor: pointer; font-size: 11px; }
.btn-delete:hover { text-decoration: underline; }

/* 视频弹窗 */
.video-modal {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(0,0,0,0.9); z-index: 9999;
  display: flex; align-items: center; justify-content: center;
}
.video-modal video { max-width: 80%; max-height: 80%; border: 2px solid #333; }

.empty-state { text-align: center; padding: 100px 0; color: #444; letter-spacing: 2px; }
</style>