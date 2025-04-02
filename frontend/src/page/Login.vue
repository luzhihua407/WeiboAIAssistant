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
        <a-qrcode
          :value="qrcodeImg"
          :status="qrcodeStatus"
          :icon-size="80"
          :size="200"
          @refresh="handleRefresh"
        />
      </div>
    </div>
    </a-modal>
</template>
<script lang="ts" setup>
import { computed, ref } from 'vue';
import { yuanbao_refresh_qrcode } from '../api/yuanbao-api'; // Corrected path
import { weibo_refresh_qrcode } from '../api/weibo-api'; // Corrected path
import { useStore } from 'vuex';

const store = useStore();
const qrcodeImg  = computed(() => store.state.qrcode);
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
let qrcodeStatus = ref<'active' | 'expired' | 'loading' | 'scanned'>('active'); // Changed to ref
qrcodeStatus= computed(() => store.state.qrcode);
const QRCODE_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  LOADING: 'loading',
  SCANNED: 'scanned',
} as const;

const handleRefresh = async () => {
  qrcodeStatus.value = QRCODE_STATUS.LOADING;
  try {
    if (channel.value === '微博') {
      await weibo_refresh_qrcode();
    }
    if (channel.value === '元宝') {
      await yuanbao_refresh_qrcode();
    }
    qrcodeStatus.value = QRCODE_STATUS.ACTIVE;
  } catch (error) {
    qrcodeStatus.value = QRCODE_STATUS.EXPIRED;
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
