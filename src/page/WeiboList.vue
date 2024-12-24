<template>
<div>
  <a-row>
    <a-col :span="24">
      <a-space :size="16" wrap>
            <a-avatar :src="user_pic" v-if="isLogined==true" />
            <a-avatar v-if="isLogined==false">
                    <template #icon>
                      <UserOutlined />
                    </template>
            </a-avatar>
        </a-space>  
    </a-col>
  </a-row>
  <div class="table-operations">
    <a-button type="primary" @click="onRemoveSelect">删除所选</a-button>
  </div>

  <a-table :loading="state.loading" :row-selection="rowSelection" :row-key="record => record.id"
  :columns="columns" :data-source="data" :pagination="false" bordered>
    <template #bodyCell="{ column ,record }">
      <template v-if="column.key === 'operation'">
        <a-popconfirm
        title="你确定要删除该微博吗?"
        ok-text="确定"
        cancel-text="取消"
        @confirm="onDeleteWeibo([record.id])"
      >
        <a-button type="primary" :loading="sendLoading">删除</a-button>
      </a-popconfirm>
      </template>
    </template>
  </a-table>
  <a-pagination v-if="pagination.total>0"
      v-model:current="pagination.current"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      :show-total="total => `总${total}条`"
      @change="handlePageChange" 
    />
</div>
</template>

<script lang="ts" setup>
import { ref, onMounted,reactive  } from 'vue';
import { TableColumnsType,message } from 'ant-design-vue';
import { page,delete_by_id,get_user,login } from '../js/weiboapi'; // 根据实际路径引入
import { UserOutlined } from '@ant-design/icons-vue';
import { convertFileSrc } from '@tauri-apps/api/core';
import { useStore } from 'vuex';
const store = useStore();
// import { message } from '@tauri-apps/plugin-dialog';
const columns: TableColumnsType = [
  { title: '内容', width: 150, dataIndex: 'text',ellipsis: true },
  { title: '发布时间', width: 150, dataIndex: 'createdAt',ellipsis: false },
  { title: '阅读数', width: 50, dataIndex: 'readsCount' },
  { title: '评论数', width: 50, dataIndex: 'commentsCount' },
  { title: '可见性', width: 50, dataIndex: 'visible' },
  {
    title: '操作',
    key: 'operation',
    fixed: 'right',
    width: 100,
  },
];

interface DataItem {
  id: number;
  text: string;
  createdAt: string;
  readsCount: string;
  commentsCount: string;
  visible: string;
}
const data = ref<DataItem[]>([]);
const isLogined = ref<boolean>(false);
const sendLoading = ref<boolean>(false);
const user_pic = ref<string>();
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
const rowSelection: TableProps['rowSelection'] = {
  onChange: (selectedRowKeys: string[], selectedRows: DataType[]) => {
    console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
    state.selectedRowKeys = selectedRowKeys;
  },
  getCheckboxProps: (record: DataType) => ({
    disabled: record.name === 'Disabled User', // Column configuration not to be checked
    name: record.name,
  }),
};
const onRemoveSelect = () => {
  console.log('selectedRowKeys changed: ', state.selectedRowKeys);
  if(state.selectedRowKeys.length==0){
    message.error('请先勾选要操作的记录');
  }else{
    deleteWeibo({ids:state.selectedRowKeys})
  }

};
async function getpage(pageNo: number, pageSize: number) {
  try {
    state.loading=true;
    const response = await page({ pageNo, pageSize });
    if (response.code==200) {
      data.value = response.data.items;
      pagination.value.total = response.data.total; // 假设返回的数据中有总数信息
    } else {
      console.error('Invalid response structure:', response);
    }
    state.loading=false;
  } catch (error) {
    console.error('Error fetching product page:', error);
  }
}

function onDeleteWeibo(id:any) {
    this.sendLoading=true
    deleteWeibo({ids:id})
    this.sendLoading=false
}
async function deleteWeibo(data:any) {
  try {
    const response = await delete_by_id(data);
    if (response.code==200) {
      // Shows message
      message.info(response.msg);
      // await message(response.msg, { title: '系统提示', kind: 'info' });
    }
    getpage(pagination.value.current, pagination.value.pageSize);
  } catch (error) {
    console.error('Error fetching product page:', error);
  }
}

async function getLogin() {
  const response=await get_user()
    if (response.code==200) {
      const user_img=response.data.user_img
      const assetUrl = convertFileSrc(user_img);
      user_pic.value=assetUrl
      isLogined.value=true
      getpage(pagination.value.current, pagination.value.pageSize);
    }else if(response.code==10000){
      login()
    }
    console.log("登录状态",isLogined)
}

function handlePageChange(page:number, pageSize:number) {
  console.log(page,pageSize)
  pagination.value.current=page
  pagination.value.pageSize = pageSize;
  getpage(page, pageSize);
}

onMounted(() => {
  getLogin()
});

</script>
<style scoped>
.table-operations {
  margin-top: 16px;
  margin-bottom: 16px;
}

.table-operations > button {
  margin-right: 8px;
}
</style>