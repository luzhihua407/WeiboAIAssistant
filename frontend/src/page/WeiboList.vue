<template>
  <div>
    <a-space style="margin-bottom:16px">
      
      <a-button @click="onRemoveSelect">
        <DeleteOutlined />
        删除所选
      </a-button>
      <a-button @click="onFreshData">
        <ReloadOutlined />
        刷新
      </a-button>

    </a-space>
    <a-table :loading="state.loading" :row-selection="rowSelection" :row-key="record => record.id" :columns="columns"
      :data-source="data" :pagination="false">
      <template #bodyCell="{ column ,record }">
        <template v-if="column.dataIndex === 'text'">
          <a-space direction="vertical">
            <a-row>
              <a-col :span="8">
                <ClockCircleOutlined /> {{ record.createdAt }}
              </a-col>
              <a-col :span="8" v-if="record.visible=='公开'">
                <EyeOutlined /> 公开
              </a-col>
              <a-col :span="8" v-if="record.visible!='公开'">
                <EyeInvisibleOutlined /> 私密
              </a-col>
            </a-row>
            <div><div v-html="record.text" @click="handleExpand(record)"></div></div>
             
            <a-row>
              <a-col :span="8">
                <ReadOutlined /> {{ record.readsCount }}
              </a-col>
              <a-col :span="8">
                <CommentOutlined /> {{ record.commentsCount }}
              </a-col>

            </a-row>
            <div class="photo-wall">
            <div class="photo-item" v-for="(photo, index) in record.pic_infos">
              <img v-lazy="photo.large.url" :alt="`Photo ${index + 1}`" />
            </div>
          </div>
              
          </a-space>
        </template>
        <template v-if="column.key === 'operation'">
          <a-popconfirm title="你确定要删除该微博吗?" ok-text="确定" cancel-text="取消" @confirm="onDeleteWeibo([record.id])">
            <a-button :loading="sendLoading">
              <DeleteOutlined />
              删除
            </a-button>
          </a-popconfirm>
        </template>
      </template>
    </a-table>
    <a-pagination v-if="pagination.total>0" v-model:current="pagination.current" v-model:page-size="pagination.pageSize"
      :total="pagination.total" :show-total="total => `总${total}条`" @change="handlePageChange" style="position: absolute;right: 0;"/>
      <a-back-top />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted,reactive  } from 'vue';
import { TableColumnsType,message } from 'ant-design-vue';
import { page,delete_by_id,longtext } from '../api/weiboapi'; // 根据实际路径引入
import { CommentOutlined,EyeOutlined,EyeInvisibleOutlined,ReadOutlined,ClockCircleOutlined,DeleteOutlined,ReloadOutlined } from '@ant-design/icons-vue';

const columns: TableColumnsType = [
  { title: '微博内容', width: 300,key:'text',  dataIndex: 'text',ellipsis: false },
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
// 点击展开的处理函数
async function handleExpand(record) {
      console.log("点击了展开按钮");

      const response = await longtext({ id:record.id });
      if (response.code==200 && response.data!=null) {
        record.text = response.data.data.longTextContent;
      } else {
        console.error('Invalid response structure:', response);
      }
    }
async function getpage(pageNo: number, pageSize: number) {
  try {
    state.loading=true;
    const response = await page({ pageNo, pageSize });
    if (response.code==200 && response.data!=null) {
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
function onFreshData(){
  getpage(pagination.value.current, pagination.value.pageSize);
}


function handlePageChange(page:number, pageSize:number) {
  console.log(page,pageSize)
  pagination.value.current=page
  pagination.value.pageSize = pageSize;
  getpage(page, pageSize);
}
onMounted(() => {
  onFreshData()
});

</script>
<style scoped>
.photo-wall {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.photo-item {
  width: 130px;
  height: 130px;
  overflow: hidden;
  border-radius: 8px;
  background-color: #f0f0f0; /* 占位符背景色 */
}

.photo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
:deep(.collapse),
:deep(span.expand) {
  margin: 0 0 0 4px;
  color: #eb7350;
  cursor: pointer;
}
</style>