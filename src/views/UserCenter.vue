<template>
  <div class="user-center-page">
    <button class="btn-back" @click="$router.push('/')">← 返回创作空间</button>

    <div class="main-layout">
      <aside class="side-panel">
        <div class="user-info-brief">
          <div class="avatar-container" @click="triggerAvatar">
            <img :src="userInfo.avatar" alt="Avatar">
            <div class="avatar-mask">更换头像</div>
          </div>
          <h3 class="user-name">{{ userInfo.nickname }}</h3>
          <span class="user-id">UID: 820260127</span>
        </div>

        <nav class="nav-menu">
          <button :class="{ active: currentTab === 'profile' }" @click="currentTab = 'profile'">
            <span class="icon">👤</span> 基础资料
          </button>
          <button :class="{ active: currentTab === 'gallery' }" @click="currentTab = 'gallery'">
            <span class="icon">🎨</span> 我的画廊
          </button>
          <button :class="{ active: currentTab === 'security' }" @click="currentTab = 'security'">
            <span class="icon">🔒</span> 安全中心
          </button>
          <button :class="{ active: currentTab === 'verify' }" @click="currentTab = 'verify'">
            <span class="icon">🆔</span> 实名认证
          </button>
        </nav>

        <button class="btn-logout" @click="doLogout">退出登录</button>
      </aside>

      <section class="content-panel">
        <transition name="fade-slide" mode="out-in">
          
          <div v-if="currentTab === 'profile'" class="tab-card">
            <h2>PROFILE INFO</h2>
            <div class="form-group">
              <label>艺术昵称</label>
              <input type="text" v-model="userInfo.nickname" placeholder="给你的艺术身份起个名字">
            </div>
            <div class="form-group">
              <label>个人简介</label>
              <textarea v-model="userInfo.bio" placeholder="描述你的创作风格..."></textarea>
            </div>
            <button class="btn-primary" @click="handleUpdate">保存基本信息</button>
          </div>

          <ArtHistory v-else-if="currentTab === 'gallery'" />

          <div v-else-if="currentTab === 'security'" class="tab-card">
            <h2>SECURITY CENTER</h2>
            <div class="form-group">
              <label>原密码</label>
              <input type="password" v-model="pwdData.old" placeholder="请输入当前密码">
            </div>
            <div class="form-item-divider"></div>
            <div class="form-group">
              <label>新密码</label>
              <input type="password" v-model="pwdData.new" placeholder="8位以上，含大小写与特殊字符">
            </div>
            <div class="form-group">
              <label>确认新密码</label>
              <input type="password" v-model="pwdData.confirm" placeholder="请再次输入新密码">
            </div>
            <button class="btn-primary" @click="handlePwdUpdate">更新安全凭证</button>
          </div>

          <div v-else-if="currentTab === 'verify'" class="tab-card">
            <h2>IDENTIFICATION</h2>
            <div v-if="!userInfo.verified" class="verify-status-box">
              <p class="desc">为了保障创作版权，请完成实名认证。</p>
              <div class="form-group">
                <label>真实姓名</label>
                <input type="text" v-model="verifyData.name">
              </div>
              <div class="form-group">
                <label>身份证号</label>
                <input type="text" v-model="verifyData.idCard">
              </div>
              <button class="btn-primary" @click="handleVerify">提交认证申请</button>
            </div>
            <div v-else class="verified-ok">
              <div class="check-icon">✔</div>
              <p>身份验证已通过</p>
              <span>您可以导出 4K 超清视频作品</span>
            </div>
          </div>

        </transition>
      </section>
    </div>

    <input type="file" ref="fileRef" @change="onFileChange" accept="image/*" style="display:none">
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import ArtHistory from '../components/ArtHistory.vue';

const router = useRouter();
const currentTab = ref('profile');
const fileRef = ref(null);

// 模拟用户信息
const userInfo = reactive({
  nickname: 'NeonArtist_88',
  avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Art',
  bio: '频率即是色彩，振幅即是几何。',
  verified: false
});

// 表单数据
const pwdData = reactive({ old: '', new: '', confirm: '' });
const verifyData = reactive({ name: '', idCard: '' });

// 头像逻辑
const triggerAvatar = () => fileRef.value.click();
const onFileChange = (e) => {
  const file = e.target.files[0];
  if (file) userInfo.avatar = URL.createObjectURL(file);
};

// 退出登录
const doLogout = () => {
  if (confirm("确定要离开创作台并退出登录吗？")) {
    localStorage.removeItem('user_token');
    router.push('/');
    location.reload(); // 刷新状态
  }
};

// 业务方法
const handleUpdate = () => alert("个人资料已同步至云端");
const handleVerify = () => {
  if (verifyData.name && verifyData.idCard.length === 18) {
    userInfo.verified = true;
    alert("实名认证已成功");
  }
};

const handlePwdUpdate = () => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{8,}$/;
  if (!regex.test(pwdData.new)) return alert("新密码不符合安全强度要求");
  if (pwdData.new !== pwdData.confirm) return alert("两次输入的密码不一致");
  alert("密码已更新，请牢记。");
};
</script>

<style scoped>
.user-center-page {
  min-height: 100vh; background: #000; color: #fff; padding: 40px; box-sizing: border-box;
  font-family: 'Helvetica Neue', sans-serif;
}
.btn-back {
  background: transparent; border: 1px solid #333; color: #666; padding: 10px 20px;
  cursor: pointer; margin-bottom: 40px; transition: 0.3s;
}
.btn-back:hover { color: #fff; border-color: #00ffff; }

.main-layout { display: flex; gap: 40px; max-width: 1200px; margin: 0 auto; }

/* 侧边栏 */
.side-panel {
  width: 300px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05);
  padding: 40px 20px; border-radius: 20px; display: flex; flex-direction: column;
}
.user-info-brief { text-align: center; margin-bottom: 40px; }
.avatar-container {
  width: 100px; height: 100px; border-radius: 50%; border: 2px solid #00ffff;
  margin: 0 auto 15px; overflow: hidden; position: relative; cursor: pointer;
}
.avatar-container img { width: 100%; height: 100%; object-fit: cover; }
.avatar-mask {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.6); color: #fff; font-size: 12px;
  display: flex; align-items: center; justify-content: center; opacity: 0; transition: 0.3s;
}
.avatar-container:hover .avatar-mask { opacity: 1; }
.user-name { font-size: 18px; margin-bottom: 5px; }
.user-id { font-size: 10px; color: #555; letter-spacing: 2px; }

.nav-menu { display: flex; flex-direction: column; gap: 10px; flex: 1; }
.nav-menu button {
  background: transparent; border: none; color: #888; text-align: left;
  padding: 15px 20px; border-radius: 12px; cursor: pointer; transition: 0.3s;
}
.nav-menu button.active { background: rgba(0,255,255,0.1); color: #00ffff; }

.btn-logout {
  margin-top: 40px; background: rgba(255,50,50,0.1); border: 1px solid rgba(255,50,50,0.2);
  color: #ff5555; padding: 12px; border-radius: 10px; cursor: pointer;
}

/* 内容区 */
.content-panel { flex: 1; }
.tab-card {
  background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
  padding: 40px; border-radius: 20px; min-height: 500px;
}
h2 { font-weight: 200; letter-spacing: 5px; color: #00ffff; margin-bottom: 40px; }

.form-group { margin-bottom: 30px; }
.form-group label { display: block; color: #555; font-size: 11px; margin-bottom: 10px; letter-spacing: 2px; }
input, textarea {
  width: 100%; background: #0a0a0a; border: 1px solid #222; color: #fff;
  padding: 12px; border-radius: 8px; outline: none; box-sizing: border-box;
}
input:focus { border-color: #00ffff; }
textarea { height: 100px; resize: none; }

.btn-primary {
  background: #00ffff; color: #000; border: none; padding: 12px 40px;
  font-weight: bold; cursor: pointer; border-radius: 4px;
}

.verified-ok { text-align: center; padding: 60px 0; }
.check-icon { 
  width: 60px; height: 60px; border: 2px solid #00ff00; border-radius: 50%;
  line-height: 60px; color: #00ff00; font-size: 30px; margin: 0 auto 20px;
}

.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.3s; }
.fade-slide-enter-from { opacity: 0; transform: translateX(20px); }
.fade-slide-leave-to { opacity: 0; transform: translateX(-20px); }
</style>