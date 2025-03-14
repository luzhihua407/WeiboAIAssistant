<template>
  <div class="table-operations">
    <a-button :loading="loading" @click="onSaveGoods()"><CloudDownloadOutlined />拉取商品</a-button>
    <a-button :loading="loading" @click="handlePage()"><ReloadOutlined />刷新</a-button>
  </div>  
  <a-table :loading="state.loading" :columns="columns" :data-source="data" :pagination="pagination" @change="handlePageChange">
    <template #bodyCell="{ column ,record }">
      <template v-if="column.dataIndex === 'purchase_price'">
        ¥{{ record.purchase_price }}
      </template>
      <template v-if="column.key === 'operation'">
        <a-button @click="showModal(record)"><SendOutlined />发微博</a-button>
        <a-modal v-model:visible="isModalVisible" title="发微博" @ok="handleOk" @cancel="handleCancel">
          <a-form :model="form">
            <a-form-item label="原内容">
              <a-textarea v-model:value="form.originalContent" disabled />
            </a-form-item>
            <a-form-item label="生成内容">
              <a-textarea v-model:value="form.generatedContent" />
              <a-button @click="generateContent" :loading="aiLoading">AI生成</a-button>
            </a-form-item>
          </a-form>
          <template #footer>
            <a-button @click="handleCancel">取消</a-button>
            <a-button type="primary" :loading="sendLoading" @click="handleOk">发送</a-button>
          </template>
        </a-modal></template>
    </template>
  </a-table>
</template>

<script lang="ts" setup>
import { ref, onMounted,reactive } from 'vue';
import type { TableColumnsType } from 'ant-design-vue';
import { getProductPage,sendWeibo,saveGoods } from '../api/jdapi'; // 根据实际路径引入
import {generateContent} from '../api/yuanbaoapi.js'; // 根据实际路径引入
import { login } from '../api/yuanbaoapi'; // 根据实际路径引入
import { message } from 'ant-design-vue';
import { SendOutlined,ReloadOutlined,CloudDownloadOutlined } from '@ant-design/icons-vue';
const columns: TableColumnsType = [
  { title: '商品', width: 300, dataIndex: 'sku_name' },
  { title: '价格', width: 100, dataIndex: 'purchase_price' },
  {
    title: '操作',
    key: 'operation',
    fixed: 'right',
    width: 100,
  },
];

interface DataItem {
  id: number;
  sku_name: string;
  purchase_price: number;
}

const data = ref<DataItem[]>([]);
const loading = ref<boolean>(false);
const sendLoading = ref<boolean>(false);
const pagination = ref({
  current: 1,
  pageSize: 20,
  total: 0,
});
const state = reactive<{
  selectedRowKeys: Key[];
  loading: boolean;
}>({
  selectedRowKeys: [], // Check here to configure the default column
  loading: false,
});

const isModalVisible = ref(false);
const form = reactive({
  originalContent: '',
  generatedContent: ''
});
const aiLoading = ref(false);

function showModal(record: DataItem) {
  form.originalContent = record.sku_name;
  form.generatedContent = ''; // Reset the generated content
  isModalVisible.value = true;
}

function handleOk() {
  // Handle the OK button click
  isModalVisible.value = false;
}

function handleCancel() {
  // Handle the Cancel button click
  isModalVisible.value = false;
}

async function generateContent() {
  try {
    aiLoading.value = true;
    const response = await generateContent({ input: form.originalContent });
    if (response.code === 200) {
      form.generatedContent = response.data.content;
    } else {
      message.error(response.msg);
    }
  } catch (error) {
    console.error('Error generating content:', error);
    message.error('生成内容失败');
  } finally {
    aiLoading.value = false;
  }
}

async function getpage(pageNo: number, pageSize: number) {
  try {
    state.loading=true;
    const response = await getProductPage({ pageNo, pageSize });
    if (response.code==200) {
      data.value = response.data.products;
      pagination.value.total = response.data.total; // 假设返回的数据中有总数信息
      console.log(pagination)
    } else {
      console.error('Invalid response structure:', response);
      message.error(response.msg);
    }
    
  } catch (error) {
    console.error('Error fetching product page:', error);
  }finally{
    state.loading=false;
  }
}
async function onSendWeibo(id:any) {
  try {
    sendLoading.value=true
    const resp = await login();
    if(resp.data.is_logined){
      const response = await sendWeibo({ id:id });
      if (response.code!=200) {
        message.error(response.msg);
        console.error('Invalid response structure:', response);
      } else {
        message.info('操作完成');
      }
    }
 
    sendLoading.value=false
  } catch (error) {
    sendLoading.value=false
    console.error('Error fetching product page:', error);
  }
}
async function onSaveGoods() {
  try {
    this.loading=true
    state.loading=true;
    const response = await saveGoods({ rankId:200000 });
    if (response.code!=200) {
      this.loading=false
      this.state.loading=false;
      message.error(response.msg);
    }else{
      this.loading=false
      message.info('操作完成');
      getpage(pagination.value.current, pagination.value.pageSize);
    }
  } catch (error) {
    this.loading=false
    this.state.loading=false;
    message.error(error);
    console.error('Error fetching product page:', error);
  }
}

function handlePageChange(page: number) {
  console.log(page)
  pagination.value.current=page.current
  pagination.value.pageSize = page.pageSize;
  getpage(page.current, page.pageSize);
}

function handlePage() {
  getpage(pagination.value.current, pagination.value.pageSize);
}

onMounted(() => {
  getpage(pagination.value.current, pagination.value.pageSize);
});

</script>
<style scoped>
.table-operations {
  margin-bottom: 16px;
}

.table-operations > button {
  margin-right: 8px;
}
</style>