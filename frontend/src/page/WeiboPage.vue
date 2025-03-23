<template>
  <div>
    <a-button @click="goBack" class="button">返回</a-button>
    <a-form :model="form" class="form" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
      <a-form-item label="原内容" class="form-item">
        <a-textarea v-model:value="form.originalContent" disabled />
      </a-form-item>
      <a-form-item label="生成内容" class="form-item">
        <a-textarea v-model:value="form.generatedContent" :rows="10" />
        <div style="margin: 10px 0;">
          <a-button @click="aichat" :loading="aiLoading" class="button">AI生成</a-button>
        </div>
      </a-form-item>
    </a-form>
    <a-button type="primary" :loading="sendLoading" @click="handleOk" class="button">发送</a-button>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { chat, checkLogin,yuanbao_refresh_qrcode } from '../api/yuanbao-api'; // 根据实际路径引入
import { sendWeibo } from '../api/jd-api'; // 根据实际路径引入
import { message } from 'ant-design-vue';
const router = useRouter();
const route = useRoute();
const record = JSON.parse(route.query.record);
console.log('Record:', record);

const form = reactive({
  id: record.id,
  originalContent: record.sku_name,
  generatedContent: ''
});
const aiLoading = ref(false);
const sendLoading = ref(false);

function goBack() {
  router.back();
}

async function aichat() {
  try {
    aiLoading.value = true;
    const loginResponse = await checkLogin();
    if (loginResponse.code == 200) {
      if (!loginResponse.data.is_logined) {
        yuanbao_refresh_qrcode();
        message.error('请先登录元宝');
        aiLoading.value = false;
        return;
      }
    }

    form.generatedContent = ''; // Clear previous content

    await chat({ input: form.originalContent }, (chunk) => {
      form.generatedContent += chunk; // Append new content chunk
    });

    message.success('生成内容完成');
  } catch (error) {
    console.error('Error generating content:', error);
    message.error('生成内容失败');
  } finally {
    aiLoading.value = false;
  }
}

async function handleOk() {
  try {
    sendLoading.value = true;
    const response = await sendWeibo({ id:form.id,content: form.generatedContent });
    if (response.code != 200) {
      message.error(response.msg);
      console.error('Invalid response structure:', response);
    } else {
      message.info('操作完成');
      goBack();
    }
  } catch (error) {
    console.error('Error sending Weibo:', error);
    message.error('发送失败');
  } finally {
    sendLoading.value = false;
  }
}
</script>

<style scoped>
.form {
  margin-top: 20px;
}

.form-item {
  margin-bottom: 20px;
}

.button {
  margin-right: 10px;
  margin-bottom: 10px;
}
</style>
