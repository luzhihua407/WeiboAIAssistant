<template>
  <div>
    <div>
    <a-textarea v-model:value="yamlContent" :auto-size="{ minRows: 10, maxRows: 25 }" class="custom-textarea"></a-textarea>
    </div>
    <div style="padding: 24px">
      <a-button @click="saveYaml" type="primary"><SaveOutlined />保存</a-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { get, update } from '../api/config-api';
import { message } from 'ant-design-vue';
import { SaveOutlined } from '@ant-design/icons-vue';
const yamlContent = ref('');

// 加载 YAML 文件
const loadYaml = async () => {
  try {
    const response = await get({id:1});
    if(response.code==200){
      yamlContent.value = response.data.content;
    }
  } catch (error) {
    console.log(error);
  }
};

// 保存 YAML 文件
const saveYaml = async () => {
  try {
    await update( {id:1,content: yamlContent.value});
    message.info('YAML 文件保存成功');
  } catch (error) {
    message.error(`保存 YAML 文件失败: ${error.message}`);
  }
};

onMounted(async () => {
  await loadYaml();
});
</script>
<style scoped>
.custom-textarea {
  background-color: #181d28;
  color: white;
}
</style>
