<template>
  <a-table :columns="columns" :data-source="data" :pagination="pagination" @change="handlePageChange">
    <template #bodyCell="{ column }">
      <template v-if="column.key === 'operation'">
        <a>发微博</a>
      </template>
    </template>
  </a-table>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import type { TableColumnsType } from 'ant-design-vue';
import { getProductPage } from '../js/aiapi'; // 根据实际路径引入

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
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
});

async function getpage(pageNo: number, pageSize: number) {
  try {
    const response = await getProductPage({ pageNo, pageSize });
    if (response && response.products) {
      data.value = response.products;
      pagination.value.total = response.total; // 假设返回的数据中有总数信息
      console.log(data.value);
    } else {
      console.error('Invalid response structure:', response);
    }
  } catch (error) {
    console.error('Error fetching product page:', error);
  }
}

function handlePageChange(page: number) {
  console.log('page')
  pagination.value.current=page.current
  getpage(page.current, page.pageSize);
}

function handlePageSizeChange(current: number, pageSize: number) {
  pagination.value.current = current;
  pagination.value.pageSize = pageSize;
  getpage(current, pageSize);
}

onMounted(() => {
  getpage(pagination.value.current, pagination.value.pageSize);
});

</script>