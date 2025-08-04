<template>
  <a-modal v-bind="modalProps" v-model:visible="modalProps.visible" @open="handleOpen">
    <a-tabs>
      <a-tab-pane key="all" title="所有工具">
        <div class="tools-modal-content hide-scrollbar">
          <div class="tools-group" v-for="{type,list} in groupTools" :key="type">
            <div class="tools-group-name">{{ basicStore.getDictTranslate('appGroup', type) || '-' }}</div>
            <div class="tools-group-list">
              <ToolItem v-for="item in list" @click="handleClick(item)" @toggle-star="handleToggleStar(item)"
                        :star="item.favoriteAt" :name="item.name" :icon="item.icon"/>
            </div>
          </div>
        </div>
      </a-tab-pane>
      <a-tab-pane key="favorite" title="我的收藏">
        <div class="tools-modal-content hide-scrollbar">
          <div class="tools-group" v-for="{type,list} in favList" :key="type">
            <div class="tools-group-name">{{ basicStore.getDictTranslate('appGroup', type) || '-' }}</div>
            <div class="tools-group-list">
              <ToolItem v-for="item in list" @click="handleClick(item)" @toggle-star="handleToggleStar(item)"
                        :star="item.favoriteAt" :name="item.name" :icon="item.icon"/>
            </div>
          </div>
          <a-empty v-if="favList.length === 0"></a-empty>
        </div>
      </a-tab-pane>
      <a-tab-pane key="history" title="最近使用">
        <div class="tools-modal-content hide-scrollbar">
          <a-empty v-if="historyList.length === 0"></a-empty>
          <div class="tools-group-list" v-else>
            <ToolItem
                v-for="item in historyList"
                @click="handleClick(item)"
                @toggle-star="handleToggleStar(item)"
                :star="item.favoriteAt"
                :name="item.name"
                :icon="item.icon"/>
          </div>
        </div>
      </a-tab-pane>
    </a-tabs>
  </a-modal>
</template>
<script setup lang="ts">
import {getDesktopStore, getAppsStore, getBasicStore} from "@/store";
import {App} from "@/modules/app/type";
import ToolItem from './tool-item.vue'

const basicStore = getBasicStore()
const desktopStore = getDesktopStore()
const appStore = getAppsStore()
const modalProps = computed(() => desktopStore.toolsModal.modalProps)
const toGroup = (data: App.entity[]) => {
  const res: Record<string, {
    type: string,
    list: App.entity[]
  }> = {}
  data.forEach(item => {
    const {group: t} = item
    if (!res[t]) res[t] = {type: t, list: []}
    res[t].list.push(item)
  })
  return Object.values(res)
}
const groupTools = computed(() => {
  return toGroup(appStore.appList)
})
const favList = computed(() => {
  return toGroup(appStore.appList.filter(item => item.favoriteAt))
})

const historyList = computed(() => {
  return appStore.appList.filter(item => item.usedAt).sort((a, b) => new Date(b.usedAt).getTime() - new Date(a.usedAt).getTime())
})

const handleOpen = () => {
  appStore.loadAppList()
}
const handleClick = (item: App.entity) => {
  appStore.open(item)
  desktopStore.toolsModal.close()
}
const handleToggleStar = (item: App.entity) => {
  appStore.toggleStar(item)
}
</script>
<style scoped lang="less">
.tools-modal-content {
  height: calc(100vh - 200px);
  overflow: auto;

  .tools-group-name {
    width: 100%;
    font-weight: bold;
    margin-bottom: 6px;
    padding-left: 20px;
  }

  .tools-group-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, 100px);
    grid-auto-rows: 100px;
    gap: 20px;
    justify-content: center;
  }

}
</style>
