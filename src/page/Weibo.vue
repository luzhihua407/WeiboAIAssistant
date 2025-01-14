<template>
  <div>
    <a-form
    ref="formRef"
    :model="formState"
    :rules="rules"
  >
      <a-form-item name="content" label="内容">
        <QuillEditor ref="quillRef" style="height: 200px;" theme="snow" v-model:content="formState.content" contentType="text" placeholder="有什么新鲜事想分享给大家？"/>
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
  import {send_weibo} from '../js/Weiboapi'; // 根据实际路径引入
  import { UploadProps,message } from 'ant-design-vue';
  import type { Rule } from 'ant-design-vue/es/form';
  import { PlusOutlined,SendOutlined } from '@ant-design/icons-vue';
  import type { UploadChangeParam } from 'ant-design-vue';

  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };
const previewVisible = ref(false);
const loading = ref(false);
const previewImage = ref('');
const previewTitle = ref('');
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
    }
    
    console.log('response', response); // 打印响应
  } catch (error) {
    // 处理验证错误或其他错误
    message.error(error);
    console.error('error', error);
    loading.value=false
  }
};
  </script>
  
  