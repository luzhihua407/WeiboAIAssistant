<template>
  <div class="table-operations">
    <a-button type="primary" :loading="loading" @click="onSaveGoods()">更新商品</a-button>
    <a-button type="primary" :loading="loading" @click="handlePage()">刷新</a-button>
  </div>  
  <a-table :loading="state.loading" :columns="columns" :data-source="data" :pagination="pagination" @change="handlePageChange">
    <template #bodyCell="{ column ,record }">
      <template v-if="column.key === 'operation'">
        <a-button type="primary" :loading="sendLoading" @click="onSendWeibo(record.id)">发微博</a-button>
      </template>
    </template>
  </a-table>
</template>

<script lang="ts" setup>
import { ref, onMounted,reactive } from 'vue';
import type { TableColumnsType } from 'ant-design-vue';
import { getProductPage,sendWeibo,saveGoods } from '../js/jdapi'; // 根据实际路径引入
import { login } from '../js/yuanbaoapi'; // 根据实际路径引入
import { message as message_tauri } from '@tauri-apps/plugin-dialog';
import { message as message_ant } from 'ant-design-vue';
const columns: TableColumnsType = [
  { title: '商品', width: 100, dataIndex: 'sku_name' },
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
  pageSize: 10,
  total: 0,
});
const state = reactive<{
  selectedRowKeys: Key[];
  loading: boolean;
}>({
  selectedRowKeys: [], // Check here to configure the default column
  loading: false,
});
async function getpage(pageNo: number, pageSize: number) {
  try {
    state.loading=true;
    const response = await getProductPage({ pageNo, pageSize });
    if (response && response.data.products) {
      data.value = response.data.products;
      pagination.value.total = response.data.total; // 假设返回的数据中有总数信息
    } else {
      console.error('Invalid response structure:', response);
    }
    state.loading=false;
  } catch (error) {
    console.error('Error fetching product page:', error);
  }
}
async function onSendWeibo(id:any) {
  try {
    sendLoading.value=true
    const resp = await login();
    if(resp.data.is_logined){
      const response = await sendWeibo({ id:id });
      if (response.code!=200) {
        await message_tauri(response.msg, { title: '系统提示', kind: 'error' });
        console.error('Invalid response structure:', response);
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
      // Shows message
      await message_tauri(response.msg, { title: '系统提示', kind: 'error' });
    }else{
      this.loading=false
      message_ant.info('操作完成');
      getpage(pagination.value.current, pagination.value.pageSize);
    }
  } catch (error) {
    this.loading=false
    state.loading=false;
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