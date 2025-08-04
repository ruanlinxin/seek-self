<template>
  <div class="avatar" @click="handleClick">
    <a-avatar v-if="avatarUrl" :image-url="avatarUrl"></a-avatar>
    <a-avatar v-else>{{ avatarText }}</a-avatar>
    <a-modal v-bind="modalProps" v-model:visible="modalProps.visible">
      <template v-if="modalProps.visible">
        <UserProfile v-if="userStore.profile.userId" @close="modalProps.visible = false"/>
        <LoginRegister v-else @close="modalProps.visible = false"/>
      </template>
    </a-modal>
  </div>
</template>
<script setup lang="ts">
import {getUserStore} from "@/modules/user/store";
import {getAsyncComponent} from "@/views";

const LoginRegister = getAsyncComponent('loginRegister')
const UserProfile = getAsyncComponent('userProfile')

const userStore = getUserStore()
const avatarText = computed(() => (userStore.profile.nickname || '请登录').substring(0, 4))
const avatarUrl = computed(() => userStore.profile.avatar)
const modalProps = reactive({
  title: null,
  visible: false,
  footer: null,
  top: '200px',
  simple: true,
  alignCenter: false,
})

const handleClick = () => {
  if (userStore.profile.userId) {
    modalProps.title = '用户信息'
    modalProps.visible = true
  } else {
    modalProps.title = null
    modalProps.visible = true
  }
}
</script>
<style scoped lang="less">
.avatar {
  > * {
    cursor: pointer;
  }
}
</style>
