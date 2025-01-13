<template>
  <div>
    <textarea v-model="yamlContent" style="width: 100%; height: 400px;"></textarea>
    <button @click="saveYaml">保存</button>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { readTextFile,writeTextFile } from '@tauri-apps/plugin-fs';

const yamlContent = ref('');
const message = ref('');
const filePath = ref(''); // 存储文件路径

// 加载 YAML 文件
const loadYaml = async () => {
  try {
    console.log(22);
    const file = await readTextFile(filePath.value);
    yamlContent.value = file;
    console.log(yamlContent.value);
  } catch (error) {
    console.log(error);
  }
};

// 保存 YAML 文件
const saveYaml = async () => {
  try {
    await writeTextFile( filePath.value, yamlContent.value);
    message.value = 'YAML 文件保存成功';
  } catch (error) {
    message.value = `保存 YAML 文件失败: ${error.message}`;
  }
};

onMounted(async () => {
  // 假设你已经有了文件路径，例如通过 props 传递
  filePath.value = 'D:/Myself/source_code/rpa_app_ui/src/resources/app.yaml'; // 替换为你的文件路径
  console.log(filePath.value);
  await loadYaml();
});
</script>

