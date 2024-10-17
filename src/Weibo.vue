<template>
      <a-image
    :width="200"
    src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
  />
    <a-form
      :model="formState"
      v-bind="layout"
      name="nest-messages"
      :validate-messages="validateMessages"
      @finish="onFinish"
    >
      <a-form-item :name="['weibo', 'title']" label="标题" :rules="[{ required: true }]">
        <a-input v-model:value="formState.weibo.title" />
      </a-form-item>
      <a-form-item :name="['weibo', 'content']" label="内容">
        <a-textarea v-model:value="formState.weibo.content" />
      </a-form-item>
      <a-form-item :wrapper-col="{ ...layout.wrapperCol, offset: 8 }">
        <a-button type="primary" html-type="submit">发送</a-button>
      </a-form-item>
    </a-form>
  </template>
  <script lang="ts" setup>
  import { reactive } from 'vue';
  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };
  
  const validateMessages = {
    required: '${label} is required!',
    types: {
      email: '${label} is not a valid email!',
      number: '${label} is not a valid number!',
    },
    number: {
      range: '${label} must be between ${min} and ${max}',
    },
  };
  
  const formState = reactive({
    weibo: {
      title: '',
      content: '',
    },
  });
  const onFinish = (values: any) => {
    console.log('Success:', values);
  };
  </script>
  
  