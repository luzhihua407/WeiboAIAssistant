<template>
    <a-table :columns="columns" :data-source="dataSource">
      <template #bodyCell="{ column }">
        <template v-if="column.key === 'operation'">
          <a>发微博</a>
        </template>
      </template>
    </a-table>
  </template>
  <script lang="ts" setup>
  import type { TableColumnsType } from 'ant-design-vue';
  import {getProductPage} from '../js/aiapi'; // 根据实际路径引入
import { onMounted } from 'vue';
  const columns: TableColumnsType = [
    { title: '商品', width: 100, dataIndex: 'sku_name'},
    { title: '价格', width: 100, dataIndex: 'purchase_price'},
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

  // let data: DataItem[] = [];
  async function getpage() {
    try {
      const response= await getProductPage({})
      // console.log(response);
      this.data=response.products
      console.log(data)
    } catch (error) {
      console.error(error);
    }
  }
  
    export default {
      components: {
      },
      /**
       * name
       */
      public name() {
        
      }
    };
  </script>
  
  