<template>
  <a-form ref="formRef" key="register" layout="vertical" size="large" :rules="rules" :model="view.formData">
    <a-tabs v-model:active-key="tab" @change="handleTabChange">
      <a-tab-pane key="login" title="登录" destroy-on-hide>
        <a-form-item label="邮箱" field="username" validate-trigger="blur">
          <a-input v-model="view.formData.username" type="newpassword"/>
        </a-form-item>
        <a-form-item label="密码" field="password" validate-trigger="blur">
          <a-input-password v-model="view.formData.password" type="newpassword"/>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" long @click="handleLogin">登录</a-button>
        </a-form-item>
      </a-tab-pane>
      <a-tab-pane key="register" title="注册" destroy-on-hide>
        <a-form-item label="邮箱" field="username" validate-trigger="blur">
          <a-input v-model="view.formData.username" type="newpassword"/>
        </a-form-item>
        <a-form-item label="密码" field="password" validate-trigger="blur">
          <a-input-password v-model="view.formData.password" type="newpassword"/>
        </a-form-item>
        <a-form-item label="再次输入密码" field="_password" validate-trigger="blur" :rules="_passwordRules">
          <a-input-password v-model="view.formData._password" type="newpassword"/>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" long @click="handleRegister">提交注册</a-button>
        </a-form-item>
      </a-tab-pane>
    </a-tabs>
  </a-form>
</template>
<script setup lang="ts">
import { 
  loginUser,registerUser
} from '@seek-self/api/src/user'
import {pick} from 'lodash'
import {message} from "@/tools";
import {getUserStore} from "@/modules/user/store";


const emit = defineEmits(['close'])

const userStore = getUserStore()

const tab = ref('login')
const formRef = ref()
const defaultForm = () => ({
  username: '',
  password: '',
  _password: ''
})
const rules = {
  username: [{required: true, message: '邮箱不能为空'}],
  password: [{required: true, message: '密码不能为空'}],
}
const _passwordRules = [
  {
    required: true,
    message: '请再次输入密码',
  },
  {
    validator(_: string, cb: Fn) {
      const {password: a, _password: b} = view.formData
      if (a && (a !== b)) {
        cb('两次输入的密码不一致')
      }
      return Promise.resolve()
    }
  }
]
const view = reactive({
  formData: defaultForm(),
})
const handleTabChange = () => {
  view.formData = defaultForm()
}
const handleLogin = () => {
  formRef.value.validateField(['password', 'username']).then((err?: object) => {
    if (!err) {
      const data = pick(view.formData, ['password', 'username'])
      loginUser(data).then(res => {
        userStore.setToken(res.data.access_token)
        message.success('登录成功')
        emit('close')
      })
    }
  })
}
const handleRegister = () => {
  formRef.value.validate().then((err?: object) => {
    if (!err) {
      const data = pick(view.formData, ['password', 'username'])
      registerUser(data).then(res => {
        tab.value = 'login'
        message.success('注册成功')
      })
    }
  })
}

</script>
<style scoped lang="less">
:deep(.arco-tabs-nav-tab) {
  justify-content: center;
}
</style>
