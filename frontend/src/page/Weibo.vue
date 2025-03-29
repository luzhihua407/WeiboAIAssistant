<template>
  <div>
    <a-form
    ref="formRef"
    :model="formState"
    :rules="rules"
  >
      <a-form-item name="content" label="内容">
        <QuillEditor ref="quillRef" style="height: 200px;" theme="snow" v-model:content="formState.content" contentType="text" placeholder="有什么新鲜事想分享给大家？"/>
        <div style="margin: 10px 0;">
          <a-button @click="aichat" :loading="aiLoading" class="button">AI生成</a-button>
          <a-button @click="clearContent" class="button">清空内容</a-button>
        </div>
      </a-form-item>
      <a-form-item name="is_self_see" label="可见性">
        <a-checkbox v-model:checked="formState.is_self_see">仅自己可见</a-checkbox>
    </a-form-item>
    <a-form-item name="img_list" label="图片" extra="点击可以删除图片">
      <a-upload
        v-model:fileList="img_list"
        name="logo"
        list-type="picture-card"
        multiple
        @preview="handlePreview"
        :before-upload="beforeUpload"
        @change="handleChange"
      >
      <div>
        <plus-outlined />
        <div style="margin-top: 8px">上传</div>
      </div>
      </a-upload>
    </a-form-item>
      <a-form-item :wrapper-col="{ ...layout.wrapperCol, offset: 8 }">
        <a-button :loading="loading" @click="onSubmit"><SendOutlined />发布</a-button>
      </a-form-item>
    </a-form>
  </div>
  <a-modal :open="previewVisible" :title="previewTitle" :footer="null" @cancel="handleCancel">
      <img alt="example" style="width: 100%" :src="previewImage" />
    </a-modal>
  </template>
  <script lang="ts" setup>
  import { reactive,ref,toRaw } from 'vue';
  import { send_weibo } from '../api/weibo-api'; // 根据实际路径引入
  import { UploadProps,message } from 'ant-design-vue';
  import type { Rule } from 'ant-design-vue/es/form';
  import { PlusOutlined,SendOutlined } from '@ant-design/icons-vue';
  import type { UploadChangeParam } from 'ant-design-vue';
  import { chat, checkLogin, yuanbao_refresh_qrcode } from '../api/yuanbao-api'; // 根据实际路径引入

  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };
const previewVisible = ref(false);
const loading = ref(false);
const previewImage = ref('');
const previewTitle = ref('');
let currentContent = ref(''); // Initialize as an empty string
const rules: Record<string, Rule[]> = {
  content: [{ required: true, message: '内容不能为空', trigger: 'change'}]
};
const formRef = ref();
const img_list = ref([]);
const quillRef = ref();
const formState = reactive({
    content: '',
    img_list: [],
    is_self_see: false

  });
const aiLoading = ref(false);

async function aichat() {
  try {
    if (!formState.content.trim()) {
      message.warning('请先输入内容再生成');
      return;
    }

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
    currentContent.value = ''; // Clear previous content
    await chat({ input: formState.content }, (chunk) => {
      currentContent.value += chunk; // Append to the actual value of the ref
      quillRef.value.setText(currentContent.value); // Insert new content into Quill editor
      console.log('currentContent:',currentContent.value); // Log the received chunk
    });

    message.success('生成内容完成');
  } catch (error) {
    console.error('Error generating content:', error);
    message.error('生成内容失败');
  } finally {
    aiLoading.value = false;
  }
}
  function getBase64(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}
const handleCancel = () => {
  previewVisible.value = false;
  previewTitle.value = '';
};
  const handlePreview = async (file: UploadProps['fileList'][number]) => {
    console.log(file)
  if (!file.url && !file.preview) {
    file.preview = (await getBase64(file.originFileObj)) as string;
  }
  previewImage.value = file.url || file.preview;
  previewVisible.value = true;
  previewTitle.value = file.name || file.url.substring(file.url.lastIndexOf('/') + 1);
};
const beforeUpload: UploadProps['beforeUpload'] = async(file) => {
  return false;
};
const handleChange = async (info: UploadChangeParam) => {
    const img_list=[]
    for(const img of info.fileList){
        const data= await getBase64(img.originFileObj)
        img_list.push({"name":img.name,"type":img.type,"base64":data})
    }
    formState.img_list=img_list
    console.log(formState.img_list)
    };
const onSubmit =async () => {
  // 验证表单
  await formRef.value.validate();
  console.log('values', formState);
  loading.value=true
  // 发送微博，这里假设 send_weibo 是一个返回 Promise 的函数
  try {
    const response = await send_weibo(toRaw(formState));
    loading.value=false
    if(response.code==200){
      formRef.value.resetFields()
      img_list.value=[]
      quillRef.value.setText('')
      message.success('发布成功');
    }
    
    console.log('response', response); // 打印响应
  } catch (error) {
    // 处理验证错误或其他错误
    message.error(error);
    console.error('error', error);
    loading.value=false
  }
};

function clearContent() {
  formState.content = ''; // Clear the reactive content state
  quillRef.value.setText(''); // Clear the Quill editor content
}
  </script>
<style scoped>
.button {
  margin: 0 5px; /* Add left and right margins of 5px */
  margin-bottom: 10px;
}
</style>

