<template>
  <div class="app-state-widget">
    <!-- 悬浮按钮 -->
    <a-button
      type="primary"
      shape="circle"
      class="floating-button"
      @click="toggleExpand"
    >
      <!-- 按钮图标 -->
      <icon-dashboard v-if="!isExpanded" />
      <icon-close v-else />
    </a-button>

    <!-- 展开的信息面板 -->
    <a-card
      v-if="isExpanded"
      class="info-panel"
      :bordered="false"
      size="small"
    >
      <template #title>
        <a-space>
          <icon-connection />
          <span>系统状态</span>
        </a-space>
      </template>

      <template #extra>
        <a-button
          type="text"
          size="mini"
          @click="toggleExpand"
        >
          <icon-close />
        </a-button>
      </template>

      <!-- 状态模块列表 -->
      <a-space direction="vertical" fill class="state-modules">
        <!-- Peer 连接状态模块 -->
        <a-card class="state-module" size="mini" :bordered="false">
          <template #title>
            <a-space>
              <icon-wifi />
              <span>P2P 连接</span>
            </a-space>
          </template>

          <a-descriptions
            :column="1"
            size="mini"
            layout="inline-horizontal"
            :label-style="{ width: '80px' }"
          >
            <a-descriptions-item label="状态">
              <a-tag :color="statusColor" size="small">
                {{ statusText }}
              </a-tag>
            </a-descriptions-item>

                          <a-descriptions-item label="节点ID" v-if="peerData.peerId">
                <div class="peer-id-container">
                  <a-tooltip :content="peerData.peerId">
                    <a-typography-text
                      :code="true"
                      class="peer-id-text"
                    >
                      {{ truncatedPeerId }}
                    </a-typography-text>
                  </a-tooltip>
                  <a-button
                    type="text"
                    size="mini"
                    @click="copyToClipboard(peerData.peerId)"
                    class="copy-button"
                  >
                    <icon-copy v-if="!copied" />
                    <icon-check v-else style="color: var(--color-success-6)" />
                  </a-button>
                </div>
              </a-descriptions-item>

            <a-descriptions-item label="连接数">
              <a-statistic
                :value="peerData.connectionCount"
                :value-style="{ fontSize: '14px' }"
              />
            </a-descriptions-item>

            <a-descriptions-item label="消息数">
              <a-statistic
                :value="peerData.messageCount"
                :value-style="{ fontSize: '14px' }"
              />
            </a-descriptions-item>

            <a-descriptions-item label="错误数" v-if="peerData.errorCount > 0">
              <a-statistic
                :value="peerData.errorCount"
                :value-style="{ fontSize: '14px', color: 'var(--color-danger-6)' }"
              />
            </a-descriptions-item>
          </a-descriptions>
        </a-card>

        <!-- 可扩展的其他状态模块 -->
        <!-- 例如：数据库连接、API状态等 -->
        <template v-for="module in additionalModules" :key="module.name">
          <a-card class="state-module" size="mini" :bordered="false">
            <template #title>
              <a-space>
                <component :is="module.icon" />
                <span>{{ module.title }}</span>
              </a-space>
            </template>

            <a-descriptions
              :column="1"
              size="mini"
              layout="inline-horizontal"
              :label-style="{ width: '80px' }"
            >
              <a-descriptions-item
                v-for="item in module.data"
                :key="item.label"
                :label="item.label"
              >
                <component
                  :is="item.component"
                  v-bind="item.props"
                >
                  {{ item.value }}
                </component>
              </a-descriptions-item>
            </a-descriptions>
          </a-card>
        </template>
      </a-space>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'
import {
  IconDashboard,
  IconClose,
  IconWifi,
  IconCopy,
  IconCheck
} from '@arco-design/web-vue/es/icon'
import usePeer from '@/hooks/use-peer'

// 状态模块接口定义
interface StateModule {
  name: string
  title: string
  icon: string
  data: Array<{
    label: string
    value: any
    component?: string
    props?: Record<string, any>
  }>
}

// 使用peer hook获取数据 - 不传入配置，使用全局单例的状态
const { state, connectionCount, messageCount, errorCount } = usePeer()

// 添加调试日志
watch(() => state.peerId, (newPeerId) => {
  console.log('State组件 - Peer ID 变化:', newPeerId)
}, { immediate: true })

watch(() => state.status, (newStatus) => {
  console.log('State组件 - 状态变化:', newStatus)
}, { immediate: true })

// 组件状态
const isExpanded = ref(false)
const copied = ref(false)

// Peer数据封装
const peerData = computed(() => ({
  status: state.status,
  peerId: state.peerId,
  connectionCount: connectionCount.value,
  messageCount: messageCount.value,
  errorCount: errorCount.value
}))

// 状态计算属性
const badgeStatus = computed(() => {
  switch (state.status) {
    case 'ready': return 'success'
    case 'error': return 'danger'
    case 'initializing': return 'processing'
    default: return 'default'
  }
})

const statusColor = computed(() => {
  switch (state.status) {
    case 'ready': return 'green'
    case 'error': return 'red'
    case 'initializing': return 'orange'
    default: return 'gray'
  }
})

const statusText = computed(() => {
  switch (state.status) {
    case 'ready': return '已连接'
    case 'error': return '连接错误'
    case 'initializing': return '连接中'
    case 'idle': return '未连接'
    default: return '未知'
  }
})

const isConnecting = computed(() => state.status === 'initializing')

// 截断的 Peer ID 显示
const truncatedPeerId = computed(() => {
  if (!peerData.value.peerId) return ''
  const peerId = peerData.value.peerId
  if (peerId.length <= 12) return peerId
  return `${peerId.slice(0, 6)}...${peerId.slice(-4)}`
})

// 其他状态模块（可扩展）
const additionalModules = ref<StateModule[]>([
  // 示例：可以添加其他状态模块
  // {
  //   name: 'database',
  //   title: '数据库连接',
  //   icon: 'icon-storage',
  //   data: [
  //     { label: '状态', value: '正常', component: 'a-tag', props: { color: 'green' } },
  //     { label: '延迟', value: '12ms', component: 'a-typography-text' }
  //   ]
  // }
])

// 方法
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    copied.value = true
    Message.success('已复制到剪贴板')
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    Message.error('复制失败')
    console.error('复制失败:', err)
  }
}

// 对外暴露的API（供其他模块注册状态）
const registerStateModule = (module: StateModule) => {
  additionalModules.value.push(module)
}

const unregisterStateModule = (name: string) => {
  const index = additionalModules.value.findIndex(module => module.name === name)
  if (index > -1) {
    additionalModules.value.splice(index, 1)
  }
}

// 导出供其他组件使用的方法
defineExpose({
  registerStateModule,
  unregisterStateModule
})
</script>

<style scoped>
.app-state-widget {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

/* 悬浮按钮 */
.floating-button {
  position: relative !important;
  width: 30px !important;
  height: 30px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.floating-button:hover {
  transform: scale(1.05) !important;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2) !important;
}





/* 信息面板 */
.info-panel {
  position: absolute !important;
  bottom: 70px !important;
  right: 0 !important;
  width: 320px !important;
  max-height: 80vh !important;
  overflow-y: auto !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
  animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 状态模块 */
.state-modules {
  width: 100%;
}

.state-module {
  background: var(--color-bg-2) !important;
  border: 1px solid var(--color-border-2) !important;
  border-radius: 6px !important;
  transition: all 0.2s ease !important;
}

.state-module:hover {
  border-color: var(--color-border-3) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}

/* 描述列表样式调整 */
:deep(.arco-descriptions-item-label) {
  font-weight: 500 !important;
  color: var(--color-text-2) !important;
}

:deep(.arco-descriptions-item-value) {
  justify-content: flex-end !important;
}

/* 统计数字样式 */
:deep(.arco-statistic-content) {
  color: var(--color-text-1) !important;
}

/* 代码文本样式 */
:deep(.arco-typography-code) {
  background: var(--color-fill-2) !important;
  padding: 2px 6px !important;
  border-radius: 4px !important;
  font-size: 12px !important;
}

/* Peer ID 容器 */
.peer-id-container {
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
  min-width: 0 !important;
}

.peer-id-text {
  flex-shrink: 0 !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
}

.copy-button {
  flex-shrink: 0 !important;
}

/* 标签样式调整 */
:deep(.arco-tag) {
  border: none !important;
  font-weight: 500 !important;
}

/* 按钮样式调整 */
:deep(.arco-btn-text) {
  color: var(--color-text-3) !important;
}

:deep(.arco-btn-text:hover) {
  color: var(--color-primary-6) !important;
  background: var(--color-primary-light-1) !important;
}

/* 卡片标题样式 */
:deep(.arco-card-header-title) {
  font-weight: 600 !important;
  font-size: 14px !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-state-widget {
    bottom: 16px !important;
    right: 16px !important;
  }

  .info-panel {
    width: 280px !important;
    bottom: 60px !important;
  }

  .floating-button {
    width: 48px !important;
    height: 48px !important;
  }
}

/* 滚动条样式 */
.info-panel::-webkit-scrollbar {
  width: 4px;
}

.info-panel::-webkit-scrollbar-track {
  background: var(--color-fill-2);
  border-radius: 2px;
}

.info-panel::-webkit-scrollbar-thumb {
  background: var(--color-fill-4);
  border-radius: 2px;
}

.info-panel::-webkit-scrollbar-thumb:hover {
  background: var(--color-fill-3);
}
</style>
