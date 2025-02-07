<template>
  <div>
    <a-space style="margin-bottom: 16px;">
      <a-button @click="showModal"><PlusOutlined />新增字典</a-button>
      <a-button @click="onFreshData"><ReloadOutlined />刷新</a-button>
    </a-space>
    <a-table :loading="loading" :row-selection="rowSelection" :row-key="record => record.id" :columns="columns"
        :data-source="data" :pagination="false" bordered>
        <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <a-button type="link" @click="editDict(record)"><EditOutlined />编辑</a-button>
          <a-popconfirm title="你确定要删除该字典吗?" ok-text="确定" cancel-text="取消" @confirm="deleteDict(record.id)">
            <a-button type="link"><DeleteOutlined />删除</a-button>
          </a-popconfirm>
        </template>
      </template>
    </a-table>
    <a-pagination v-if="pagination.total>0" v-model:current="pagination.current" v-model:page-size="pagination.pageSize"
        :total="pagination.total" :show-total="total => `总${total}条`" @change="handlePageChange" style="position: absolute;right: 0;"/>
    <a-modal v-model:visible="modalVisible" :title="modalTitle" @ok="handleOk" @cancel="handleCancel">
      <a-form ref="formRef" :model="formState" :rules="rules">
        <a-form-item label="字典名称" name="name">
          <a-input v-model:value="formState.name" />
        </a-form-item>
        <a-form-item label="字典编码" name="code">
          <a-input v-model:value="formState.code" />
        </a-form-item>
        <a-form-item label="字典值" name="value">
          <a-input v-model:value="formState.value" />
        </a-form-item>
        <a-form-item label="排序" name="num_value">
            <a-input-number v-model:value="formState.num_value" style="width: 100%;" />
        </a-form-item>
        <a-form-item label="备注" name="remark">
          <a-input v-model:value="formState.remark" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive } from 'vue';
import { message } from 'ant-design-vue';
import { PlusOutlined, ReloadOutlined,EditOutlined,DeleteOutlined } from '@ant-design/icons-vue';
import { page, get_dict, add_dict, update_dict, delete_dict } from '../api/dictapi';

const data = ref([]);
const loading = ref(false);
const modalVisible = ref(false);
const modalTitle = ref('新增字典');
const formRef = ref(null);
const formState = reactive({
  id: null,
  name : '',
  code: '',
  value: '',
  num_value: 0,
  remark: '',
});
const rules = {
  name: [{ required: true, message: '请输入字典名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入字典编码', trigger: 'blur' }],
  value: [{ required: true, message: '请输入字典值', trigger: 'blur' }],
};
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});
const columns = [
  {
    title: '字典名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '字典编码',
    dataIndex: 'code',
    key: 'code',
  },
  {
    title: '字符字典值',
    dataIndex: 'value',
    key: 'value',
  },
  {
    title: '数字字典值',
    dataIndex: 'num_value',
    key: 'num_value',
  },
  {
    title: '备注',
    dataIndex: 'remark',
    key: 'remark',
  },
  {
    title: '操作',
    key: 'action',
  },
];
function onFreshData(){
  getpage(pagination.current, pagination.pageSize);
}
async function getpage(pageNo: number, pageSize: number) {
  try {
    loading.value=true;
    const response = await page({ pageNo, pageSize });
    if (response.code==200) {
      data.value = response.data.sysDicts;
      pagination.total = response.data.total; // 假设返回的数据中有总数信息
    } else {
      console.error('Invalid response structure:', response);
    }
    loading.value=false;
  } catch (error) {
    console.error('Error fetching product page:', error);
  }
}

const showModal = () => {
  modalVisible.value = true;
  modalTitle.value = '新增字典';
  formState.id = null;
  formState.name = '';
  formState.code = '';
  formState.value = '';
  formState.num_value = 0;
  formState.remark = '';
};

const editDict = async (record) => {
  modalVisible.value = true;
  modalTitle.value = '编辑字典';
  formState.id = record.id;
  const response = await get_dict({ id: record.id });
  if(response.code==200){
    formState.name=response.data.name
    formState.code=response.data.code
    formState.value=response.data.value
    formState.num_value=response.data.num_value
    formState.remark=response.data.remark
    console.log(formState)
  }
  else{
    message.error('字典获取失败');
  }
  
};

const handleOk = async () => {
  try {
    await formRef.value.validateFields();
    let response:any;
    if(formState.id){
        response = await update_dict(formState);
    }else{
        response = await add_dict(formState);
    }
    if (response.code!=200) {
      message.error(response.msg);
    }else{
      message.info('操作完成');
      getpage(pagination.current, pagination.pageSize);
    }
    modalVisible.value=false;
  } catch (error) {
    console.error('Error saving dictionary:', error);
    message.error('Error saving dictionary');
  }

};

const handleCancel = () => {
  modalVisible.value = false;
};

const deleteDict = async (id:number) => {
  try {
    const response = await delete_dict({ id:id });
    if (response.code === 200) {
      message.success('字典删除成功');
      getpage(pagination.current, pagination.pageSize);
    } else {
      message.error('字典删除失败');
    }
  } catch (error) {
    console.error('Error deleting dictionary:', error);
    message.error('Error deleting dictionary');
  }
};



function handlePageChange(page:number, pageSize:number) {
  console.log(page,pageSize)
  pagination.current=page
  pagination.pageSize = pageSize;
  getpage(page, pageSize);
}

onMounted(() => {
  getpage(pagination.current, pagination.pageSize);
});
</script>
