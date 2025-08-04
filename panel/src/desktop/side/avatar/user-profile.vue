<template>
  <a-form ref="formRef" :rules="rules" layout="vertical">
    <a-tabs v-model:active-key="view.tab" @change="handleTabChange" position="left">
      <a-tab-pane key="base" title="基础信息">
        <a-form-item label="昵称" field="nickname">
          <a-input v-model="view.profile.nickname"/>
        </a-form-item>
        <a-form-item label="外链头像" field="avatar">
          <a-input v-model="view.profile.avatar"/>
        </a-form-item>
        <a-form-item label="性别" field="gender">
          <a-select
              :options="genderOptions"
              v-model="view.profile.gender"/>
        </a-form-item>
        <a-form-item label="生日" field="birth">
          <a-date-picker style="width: 100%" v-model="view.profile.birth"/>
        </a-form-item>
        <a-space style=" width: 100%; justify-content: flex-end;">
          <a-button type="primary" @click="handleSave">保存修改</a-button>
          <a-button type="outline" status="warning" @click="logout">退出登录</a-button>
        </a-space>
      </a-tab-pane>
    </a-tabs>
  </a-form>
</template>
<script setup lang="ts">

import {getUserStore} from "@/modules/user/store";
import {updateProfile} from "@/modules/user/api";
import {message} from "@/tools";

const emit = defineEmits(['close'])
const userStore = getUserStore()
const formRef = ref()
const rules = {}
const view = reactive({
  tab: 'base',
  profile: {...userStore.profile},
})
const genderOptions = [
  {value: 0, label: '未知'},
  {value: 1, label: '男'},
  {value: 2, label: '女'},
]
const handleTabChange = (key: string) => {
  switch (key) {
    case 'base':
      view.profile = {...userStore.profile}
      break
  }
}

const handleSave = () => {
  updateProfile(view.profile).then(res => {
    Object.assign(userStore.profile, view.profile)
    message.success('保存成功')
  })
}
const logout = () => {
  emit('close')
  userStore.logout()
  location.reload()
}
</script>
