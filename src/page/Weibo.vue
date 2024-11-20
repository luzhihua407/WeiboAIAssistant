<template>
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
        <a-button type="primary" html-type="submit" @click="generateText1">发送</a-button>
      </a-form-item>
    </a-form>
  </template>
  <script lang="ts" setup>
  import { reactive } from 'vue';
  import { Command } from '@tauri-apps/plugin-shell';
  import {generateText} from '../js/aiapi'; // 根据实际路径引入
  import {
  warn,
  debug,
  trace,
  info,
  error,
  attachConsole,
  attachLogger,
} from '@tauri-apps/plugin-log';
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
  const startServer = async(values: any) => {
    console.log('1111');
    const command = Command.sidecar('bin/main');
    console.log('Success:', command);
    const output = await command.execute();
    console.log('Success:', output);

  };
  async function generateText1() {
  try {
    const response= await generateText({"prompt": "你好"})
    console.log(response);
  } catch (error) {
    console.error(error);
  }
}
  </script>
  
  