<template>
  <div class="table-operations">
    <a-button :loading="loading" @click="onSaveGoods()">
      <CloudDownloadOutlined /> 拉取商品
    </a-button>
    <a-button :loading="loading" @click="handlePage()">
      <ReloadOutlined /> 刷新
    </a-button>
  </div>
  <a-table
    :loading="state.loading"
    :columns="columns"
    :data-source="data"
    :pagination="pagination"
    @change="handlePageChange"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.dataIndex === 'purchase_price'">
        ¥{{ record.purchase_price }}
      </template>
      <template v-if="column.key === 'operation'">
        <router-link :to="{ name: 'WeiboPage', query: { record: JSON.stringify(record) } }">
          <a-button>
            <SendOutlined /> 发微博
          </a-button>
        </router-link>
      </template>
    </template>
  </a-table>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import type { TableColumnsType } from 'ant-design-vue';
import { getProductPage, saveGoods } from '../api/jd-api'; // 根据实际路径引入
import { message } from 'ant-design-vue';
import { SendOutlined, ReloadOutlined, CloudDownloadOutlined } from '@ant-design/icons-vue';

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
const pagination = ref({
  current: 1,
  pageSize: 20,
  total: 0,
});
const state = reactive<{
  selectedRowKeys: Key[];
  loading: boolean;
}>({
  selectedRowKeys: [],
  loading: false,
});

const router = useRouter();

async function getpage(pageNo: number, pageSize: number) {
  try {
    state.loading = true;
    const response = await getProductPage({ pageNo, pageSize });
    if (response.code == 200) {
      data.value = response.data.products;
      pagination.value.total = response.data.total;
      console.log(pagination);
    } else {
      console.error('Invalid response structure:', response);
      message.error(response.msg);
    }
  } catch (error) {
    console.error('Error fetching product page:', error);
  } finally {
    state.loading = false;
  }
}

async function onSaveGoods() {
  try {
    loading.value = true;
    state.loading = true;
    const response = await saveGoods({ rankId: 200000 });
    if (response.code != 200) {
      loading.value = false;
      state.loading = false;
      message.error(response.msg);
    } else {
      loading.value = false;
      message.info('操作完成');
      getpage(pagination.value.current, pagination.value.pageSize);
    }
  } catch (error) {
    loading.value = false;
    state.loading = false;
    message.error(error);
    console.error('Error fetching product page:', error);
  }
}

function handlePageChange(page: number) {
  console.log(page);
  pagination.value.current = page.current;
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