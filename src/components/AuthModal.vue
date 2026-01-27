<template>
  <div v-if="isVisible" class="modal-backdrop" @click.self="close">
    <div class="cyber-card">
      <div class="neon-line"></div>
      
      <h2 class="title">
        {{ mode === 'login' ? 'IDENTITY LOGIN' : (mode === 'register' ? 'CREATE ACCESS' : 'RESET PASSWORD') }}
      </h2>

      <div class="form-group">
        <label>ACCOUNT</label>
        <div class="input-wrapper">
          <input 
            type="text" 
            v-model="form.account" 
            placeholder="手机号 / 邮箱"
            @blur="validateAccountExists"
          >
        </div>
        <p class="error-msg">{{ errors.account }}</p>

        <div v-if="mode === 'forgot' || mode === 'register'">
          <label>VERIFICATION CODE</label>
          <div class="input-wrapper code-row">
            <input type="text" v-model="form.code" placeholder="6位验证码">
            <button class="btn-send-code" @click="sendCode" :disabled="countdown > 0">
              {{ countdown > 0 ? `${countdown}s` : '获取' }}
            </button>
          </div>
        </div>

        <label>{{ mode === 'login' ? 'PASSWORD' : 'NEW PASSWORD' }}</label>
        <div class="input-wrapper">
          <input type="password" v-model="form.password" placeholder="请输入密码">
        </div>
        <p class="error-msg">{{ errors.password }}</p>

        <div v-if="mode !== 'login'">
          <label>CONFIRM PASSWORD</label>
          <div class="input-wrapper">
            <input type="password" v-model="form.confirmPwd" placeholder="再次输入密码">
          </div>
          <p class="error-msg">{{ errors.confirm }}</p>
        </div>
      </div>

      <button class="btn-main" @click="handleSubmit">
        {{ mode === 'login' ? '立即登录' : (mode === 'register' ? '提交注册' : '确认重置') }}
      </button>

      <div class="footer-links">
        <div v-if="mode === 'login'" class="between">
          <a @click="mode = 'forgot'">忘记密码?</a>
          <a @click="mode = 'register'">去注册</a>
        </div>
        <div v-else class="center">
          <a @click="mode = 'login'">返回登录</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';

const props = defineProps(['isVisible']);
const emit = defineEmits(['close', 'login-success']);

// 模拟数据库 (实际应从 uniCloud 获取)
const mockDB = [
  { account: '13800138000', password: 'Password@123' },
  { account: 'test@art.com', password: 'Password@456' }
];

const mode = ref('login'); // login | register | forgot
const countdown = ref(0);
const form = reactive({ account: '', password: '', confirmPwd: '', code: '' });
const errors = reactive({ account: '', password: '', confirm: '' });

const close = () => {
  mode.value = 'login';
  emit('close');
};

// 1. 验证账号是否存在
const validateAccountExists = () => {
  if (!form.account) return;
  const exists = mockDB.some(u => u.account === form.account);
  
  if (mode.value === 'login' && !exists) {
    errors.account = '该账号尚未注册';
  } else if (mode.value === 'register' && exists) {
    errors.account = '该账号已存在，请直接登录';
  } else {
    errors.account = '';
  }
};

// 2. 发送验证码 (模拟)
const sendCode = () => {
  if (!form.account) { alert("请先输入账号"); return; }
  alert("验证码已发送至: " + form.account);
  countdown.value = 60;
  const timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) clearInterval(timer);
  }, 1000);
};

// 3. 核心提交逻辑
const handleSubmit = () => {
  // --- A. 格式校验 ---
  const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{8,}$/;
  if (!pwdRegex.test(form.password)) {
    errors.password = '需8位以上，含大小写和特殊符号';
    return;
  } else { errors.password = ''; }

  // --- B. 业务逻辑校验 ---
  if (mode.value === 'login') {
    // 【核心修复】不仅看格式，还要看数据库匹配
    const user = mockDB.find(u => u.account === form.account);
    if (!user) {
      errors.account = '账号不存在';
    } else if (user.password !== form.password) {
      errors.password = '密码错误，请重试';
    } else {
      // 登录成功
      alert("登录成功，欢迎回来");
      emit('login-success');
      close();
    }
  } 
  
  else if (mode.value === 'forgot') {
    // 找回密码逻辑
    if (form.password !== form.confirmPwd) {
      errors.confirm = '两次密码不一致';
      return;
    }
    if (!form.code) { alert("请输入验证码"); return; }
    
    // 模拟修改数据库
    const userIndex = mockDB.findIndex(u => u.account === form.account);
    if (userIndex !== -1) {
      mockDB[userIndex].password = form.password;
      alert("密码已重置，请使用新密码登录");
      mode.value = 'login';
    } else {
      alert("账号不存在，重置失败");
    }
  }

  else if (mode.value === 'register') {
    // 注册逻辑
    if (mockDB.some(u => u.account === form.account)) {
      alert("账号已存在");
      return;
    }
    mockDB.push({ account: form.account, password: form.password });
    alert("注册成功！");
    mode.value = 'login';
  }
};
</script>

<style scoped>
.modal-backdrop {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(10px);
  display: flex; justify-content: center; align-items: center; z-index: 9999;
}

.cyber-card {
  width: 380px; padding: 40px; background: #080808; border: 1px solid #222;
  box-shadow: 0 0 50px rgba(0, 255, 255, 0.1); position: relative;
}

.neon-line {
  position: absolute; top: 0; left: 0; width: 100%; height: 3px;
  background: linear-gradient(90deg, #00ffff, #ff00ff);
}

.title { color: white; font-weight: 200; letter-spacing: 5px; text-align: center; margin-bottom: 30px; }

.form-group label { color: #555; font-size: 11px; letter-spacing: 2px; display: block; margin-bottom: 8px; }

.input-wrapper { margin-bottom: 5px; }
input {
  width: 100%; padding: 12px; background: #111; border: 1px solid #333; color: white;
  box-sizing: border-box; font-family: monospace;
}
input:focus { border-color: #00ffff; outline: none; }

/* 验证码行 */
.code-row { display: flex; gap: 10px; }
.btn-send-code {
  width: 80px; background: transparent; border: 1px solid #00ffff; color: #00ffff;
  font-size: 12px; cursor: pointer;
}
.btn-send-code:disabled { border-color: #333; color: #333; cursor: not-allowed; }

.error-msg { color: #ff3366; font-size: 11px; height: 16px; margin-bottom: 10px; }

.btn-main {
  width: 100%; padding: 14px; background: #00ffff; border: none; font-weight: bold;
  cursor: pointer; letter-spacing: 2px; margin-top: 10px; transition: 0.3s;
}
.btn-main:hover { background: white; box-shadow: 0 0 20px rgba(0, 255, 255, 0.5); }

.footer-links { margin-top: 25px; font-size: 12px; }
.footer-links a { color: #00ffff; cursor: pointer; text-decoration: underline; }
.footer-links .between { display: flex; justify-content: space-between; }
.footer-links .center { text-align: center; }
</style>