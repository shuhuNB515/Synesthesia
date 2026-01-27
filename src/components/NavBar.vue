<template>
  <div class="navbar-fixed">
    <div class="brand-logo" @click="$router.push('/')">SYN.ART</div>

    <div class="user-area">
      <div v-if="isLoggedIn" class="user-controls">
        <div class="user-entry" @click="$router.push('/user')">
          <div class="avatar-glow">U</div>
          <span class="entry-text">个人中心</span>
        </div>
        <button class="btn-logout-mini" @click="$emit('logout')">退出</button>
      </div>

      <button v-else class="btn-login-glass" @click="$emit('open-auth')">
        <span class="icon">✨</span> 登录 / 注册
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps(['isLoggedIn']);
defineEmits(['open-auth', 'logout']); // 声明 logout 事件
</script>

<style scoped>

.user-controls { display: flex; align-items: center; gap: 15px; }

.btn-logout-mini {
  background: transparent;
  border: 1px solid rgba(255, 50, 50, 0.3);
  color: rgba(255, 100, 100, 0.8);
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 12px;
  cursor: pointer;
  transition: 0.3s;
}

.btn-logout-mini:hover {
  background: rgba(255, 50, 50, 0.1);
  border-color: rgba(255, 50, 50, 0.8);
  color: #ff5555;
}
.user-entry {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 5px 15px;
  border-radius: 30px;
  transition: 0.3s;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.2);
}
.user-entry:hover {
  background: rgba(0, 255, 255, 0.1);
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.2);
}
.entry-text { color: white; font-size: 14px; letter-spacing: 1px; }
/* 1. 强制固定在屏幕最上方，层级最高 */
.navbar-fixed {
  position: fixed; 
  top: 0; 
  left: 0; 
  width: 100%; 
  height: 80px;
  display: flex; 
  justify-content: space-between; 
  align-items: center;
  padding: 0 40px;
  z-index: 1000; /* 必须比 Canvas 高 */
  pointer-events: none; /* 让鼠标能透过空白处点击 3D 画布 */
  box-sizing: border-box;
  background: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent); /* 渐变顶栏 */
}

/* 2. 恢复按钮的点击交互 */
.user-area, .brand-logo { pointer-events: auto; }

.brand-logo {
  font-family: 'Courier New', monospace;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 4px;
  font-weight: bold;
}

/* 3. 高级感玻璃按钮 */
.btn-login-glass {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 10px 24px;
  border-radius: 50px;
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  letter-spacing: 1px;
  box-shadow: 0 0 10px rgba(0,0,0,0.5);
}

.btn-login-glass:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: #00ffff;
  color: #00ffff;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
}

/* 头像样式 */
.user-profile { display: flex; align-items: center; gap: 10px; }
.avatar-glow {
  width: 36px; height: 36px;
  background: linear-gradient(135deg, #00ffff, #ff00ff);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: bold; color: black;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}
.user-name { color: white; font-size: 14px; }
.btn-logout {
  background: none; border: none; color: #666; cursor: pointer; font-size: 12px;
}
.btn-logout:hover { color: red; }
</style>