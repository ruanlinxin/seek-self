<template>
  <a-space direction="vertical" style="width: 100%">
    <div>
      <a-button type="primary" @click="open(defaultFormData())">新增</a-button>
    </div>
    <a-table v-bind="tableProps">
      <template #group="{record}">
        {{ basicStore.getDictTranslate('appGroup', record.group) }}
      </template>
      <template #act="{record}">
        <a-space>
          <a-button type="text" @click="open(record)">修改</a-button>
          <a-button type="text" @click="delApp(record.id)">删除</a-button>
        </a-space>
      </template>
    </a-table>
  </a-space>
  <a-modal v-bind="modal.props" v-model:visible="modal.props.visible" @ok="handleSubmit">
    <div style="height: 400px" class="hide-scrollbar">
      <a-form ref="formRef" :model="{}">
        <a-divider orientation="left">基础</a-divider>
        <a-form-item label="应用名">
          <a-input v-model="modal.formData.name"/>
        </a-form-item>
        <a-form-item label="组件类型">
          <DictSelect type="appComponentType" v-model="modal.formData.appType"/>
        </a-form-item>
        <a-form-item label="组件key">
          <a-auto-complete :data="componentKeys" v-model="modal.formData.componentKey"/>
        </a-form-item>
        <a-form-item label="分组">
          <DictSelect type="appGroup" v-model="modal.formData.group"/>
        </a-form-item>
        <a-form-item label="介绍">
          <a-input v-model="modal.formData.description"/>
        </a-form-item>
        <a-form-item label="图标">
          <a-input v-model="modal.formData.icon"/>
        </a-form-item>
        <a-form-item label="排序">
          <a-input-number v-model="modal.formData.orderNo"/>
        </a-form-item>
        <a-form-item label="版本号">
          <a-input v-model="modal.formData.version"/>
        </a-form-item>
        <a-form-item label="入口地址">
          <a-input v-model="modal.formData.entryUrl"/>
        </a-form-item>
        <a-form-item label="启用">
          <a-switch :checked-value="1" :unchecked-value="0" v-model="modal.formData.status"/>
        </a-form-item>
        <a-form-item label="系统应用">
          <a-switch v-model="modal.formData.isSystem"/>
        </a-form-item>
        <a-form-item label="窗口">
          <a-space>
            <JSONEditor v-model="modal.formData.appExtend.window">
              配置
            </JSONEditor>
            <a-button @click="assignAppExtend('window')">填充默认值</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>
  </a-modal>
</template>
<script setup lang="ts">
import {createApp, deleteApp, getAllApp, updateApp} from "@/modules/app/api";
import {componentKeys} from "@/views";
import {JSONEditor,DictSelect} from '@/components'
import {defaultWindow} from "@/modules/app/meta";
import {getBasicStore} from "@/modules/basic/store";

const basicStore = getBasicStore()
const tableProps = reactive({
  data: [],
  columns: [
    {
      title: '应用名',
      dataIndex: 'name',
      width: 100,
    },
    {
      title: '分组',
      dataIndex: 'group',
      slotName: 'group',
      width: 100,
    },
    {
      title: '介绍',
      dataIndex: 'description',
      width: 100,
    },
    {
      title: '图标',
      dataIndex: 'icon',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
    },
    {
      title: '排序',
      dataIndex: 'orderNo',
      width: 100,
    },
    {
      title: '版本号',
      dataIndex: 'version',
      width: 100,
    },
    {
      title: '入口地址',
      dataIndex: 'entryUrl',
      width: 100,
    },
    {
      title: '是否系统应用',
      dataIndex: 'isSystem',
      width: 100,
    },
    {
      title: '操作',
      fixed: 'right',
      slotName: 'act',
      align: 'center',
    },
  ]
})
//
const formRef = ref()
const defaultAppExtend = () => ({
  window: {...defaultWindow}
})
const defaultFormData = () => ({
  name: "",
  appType: "native",
  componentKey: "",
  description: "",
  entryUrl: "",
  group: "",
  icon: "",
  isSystem: false,
  orderNo: 0,
  status: 0,
  version: "1",
  appExtend: defaultAppExtend(),
})

const assignAppExtend = (key: string) => {
  const data = defaultAppExtend()
  if (key in data) {
    const source = modal.formData.appExtend
    //  @ts-ignore
    if (!source[key]) source[key] = {}
    //  @ts-ignore
    Object.entries(data[key]).forEach(([k, v]) => {
      //  @ts-ignore
      source[key][k] = source[key][k] ?? v
    })
  }
}
const modal = reactive({
  props: {
    title: '应用管理',
    visible: false,
  },
  formData: defaultFormData()
})

const open = (data: object) => {
  modal.formData = {...data}
  modal.props.visible = true
}
const handleSubmit = () => {
  const {id, ...data} = modal.formData
  const fn = id ? updateApp(id, data) : createApp(data)
  fn.finally(() => {
    loadTableData()
  })
}

const loadTableData = () => {
  tableProps.data = []
  getAllApp().then(res => {
    tableProps.data = res.data
  })
}

const delApp = (id) => {
  deleteApp(id).finally(() => {
    loadTableData()
  })
}


onMounted(() => {
  loadTableData()
})
</script>
