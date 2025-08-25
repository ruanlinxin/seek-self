<template>
  <a-space direction="vertical" style="width: 100%">
    <div>
      <a-button type="primary" @click="open(defaultFormData())">新增</a-button>
    </div>
    <a-alert >
      当前正在配置{{ cur }}
      <a-button v-if="view.cur != view.base" type="text" @click="view.cur = view.base">返回</a-button>
    </a-alert>
    <a-table v-bind="tableProps">
      <template #act="{record}">
        <a-space>
          <a-button type="text" @click="changeCur(record)">配置</a-button>
          <a-button type="text" @click="open(record)">修改</a-button>
          <a-button type="text" @click="delApp(record.id)">删除</a-button>
        </a-space>
      </template>
    </a-table>
  </a-space>
  <a-modal v-bind="modal.props" v-model:visible="modal.props.visible" @ok="handleSubmit">
    <a-form :model="{}" ref="formRef">
      <a-form-item label="字典类型">
        <a-select :disabled="true" :options="dictOptions" v-model="modal.formData.type"/>
      </a-form-item>
      <a-form-item label="字典值">
        <a-input :disabled="modal.formData.id" v-model="modal.formData.value"/>
      </a-form-item>
      <a-form-item label="字典键">
        <a-input v-model="modal.formData.key"/>
      </a-form-item>
      <a-form-item label="序号">
        <a-input-number v-model="modal.formData.orderNo"/>
      </a-form-item>
      <a-form-item label="是否启用">
        <a-switch v-model="modal.formData.enabled"/>
      </a-form-item>

      <a-form-item label="描述">
        <a-textarea v-model="modal.formData.description"/>
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script setup lang="ts">
import {deleteDict,createDict,updateDict,getDictsByType} from '@seek-self/api'
import {getBasicStore} from "@/modules/basic/store";

const basicStore = getBasicStore()
const dictOptions = basicStore.getDictOptions('dict')
const view = reactive({
  base: 'dict',
  cur: 'dict',
})
const cur = computed(() => basicStore.getDictTranslate('dict', view.cur))

const changeCur = (record) => {
  view.cur = record.value
}


const tableProps = reactive({
  data: [],
  columns: [
    {
      title: '字典键',
      dataIndex: 'key',
    },
    {
      title: '字典值',
      dataIndex: 'value',
    },
    {
      title: '描述',
      dataIndex: 'description',
    },
    {
      title: '操作',
      fixed: 'right',
      slotName: 'act',
      align: 'center',
    },
  ]
})

const formRef = ref()
const defaultFormData = () => ({
  type: view.cur,
  key: '',
  value: '',
  description: '',
  orderNo: 0,
  enabled: true,
})
const modal = reactive({
  props: {
    title: '数据字典',
    visible: false,
  },
  formData: defaultFormData()
})

const open = (data: object) => {
  modal.props.title = data.id ? '修改数据字典' : '新增数据字典'
  modal.formData = {...data}
  modal.props.visible = true
}
const handleSubmit = () => {
  const {id, ...data} = modal.formData
  const fn = id ? updateDict(id, data) : createDict(data)
  fn.finally(() => {
    loadTableData()
  })
}

const loadTableData = () => {
  tableProps.data = []
  getDictsByType(view.cur).then(res => {
    tableProps.data = res.data
  })
}

const delApp = (id) => {
  deleteDict(id).finally(() => {
    loadTableData()
  })
}

watchEffect(() => {
  loadTableData()
})
</script>
