<template>
    <a-modal
      v-model:open="open"
      :title="`请${channel}扫码登录`"
      ok-text="刷新"
      :closable="false"
      :centered="true"
      :forceRender="true"
      :maskClosable="false"
      :footer="null"
      width="300px"
    >
    <div class="qrcode-container">
      <div class="spin-content">
        <div v-if="qrcodeStatus !== QRCODE_STATUS.ACTIVE">
          <a-qrcode
              value="http://www.antdv.com"
              :status=qrcodeStatus
              @refresh="handleRefresh"
            />
        </div>
        <a-image
            v-else
            :preview="false"
            :width="200"
            :height="200"
            :src="qrcodeImg"
          />
      </div>
    </div>
    </a-modal>
</template>
<script lang="ts" setup>
import { computed, ref } from 'vue';
import {login as yuanbao_login } from '../api/yuanbao-api'; // Corrected path
import {login as weibo_login } from '../api/weibo-api'; // Corrected path
import { useStore } from 'vuex';

const store = useStore();
const qrcodeImg  = computed(() => store.state.qrcode);
const qrcodeStatus  = computed(() => store.state.qrcodeStatus);
const channel  = computed(() => store.state.channel);
const open = computed({
  // getter
  get() {
    return store.state.login_win_show
  },
  // setter
  set(newValue) {
    store.state.login_win_show = newValue
  }
});
const loading = ref(false);
const QRCODE_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  LOADING: 'loading',
  SCANNED: 'scanned',
} as const;

const handleRefresh = async () => {
  store.dispatch('setQRcodeStatus', { "qrcodeStatus": QRCODE_STATUS.LOADING });
  try {
    if (channel.value === '微博') {
      await weibo_login();
    }
    if (channel.value === '元宝') {
      await yuanbao_login();
    }
  } catch (error) {
    store.dispatch('setQRcodeStatus', { "qrcodeStatus": QRCODE_STATUS.EXPIRED });
  }
};
</script>
<style scoped>
.qrcode-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.spin-content {
  padding: 20px;
  background: #fff;
  border-radius: 4px;
}
</style>
