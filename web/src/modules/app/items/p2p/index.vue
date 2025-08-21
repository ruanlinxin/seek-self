<template>
  <div class="p2p-chat">
    <div class="header">
      <a-space>
        <icon-connection />
        <h2>P2P 聊天</h2>
      </a-space>
      
      <a-card class="status-card" size="small">
        <a-descriptions :column="2" size="mini">
          <a-descriptions-item label="我的ID">
            <a-typography-text 
              :code="true" 
              :copyable="peerId ? { text: peerId } : false"
              style="font-size: 12px;"
            >
              {{ peerId || '连接中...' }}
            </a-typography-text>
          </a-descriptions-item>
          
          <a-descriptions-item label="状态">
            <a-tag 
              :color="state.status === 'ready' ? 'green' : state.status === 'error' ? 'red' : 'orange'"
              size="small"
            >
              {{ connectionStatus }}
            </a-tag>
          </a-descriptions-item>
          
          <a-descriptions-item label="连接数">
            <a-statistic 
              :value="connectionCount" 
              :value-style="{ fontSize: '14px' }"
            />
          </a-descriptions-item>
          
          <a-descriptions-item label="消息数">
            <a-statistic 
              :value="messageCount" 
              :value-style="{ fontSize: '14px' }"
            />
          </a-descriptions-item>
        </a-descriptions>
      </a-card>
    </div>
    
    <div class="connection-section">
      <a-input 
        v-model="view.targetId" 
        placeholder="请输入对方的节点ID"
        class="target-input"
        :disabled="state.status !== 'ready'"
        @keyup.enter="connect"
      >
        <template #prefix>
          <icon-connection />
        </template>
      </a-input>
      
      <a-button 
        @click="connect" 
        :disabled="isConnected || !view.targetId.trim() || state.status !== 'ready'"
        type="primary"
        :loading="state.status === 'initializing'"
      >
        <template #icon>
          <icon-connection />
        </template>
        {{ isConnected ? '已连接' : '连接' }}
      </a-button>
      
      <a-button 
        @click="disconnect" 
        :disabled="!isConnected"
        status="danger"
      >
        <template #icon>
          <icon-disconnection />
        </template>
        断开连接
      </a-button>
    </div>

    <div class="chat-container">
      <div class="messages" ref="messagesRef">
        <div 
          v-for="(item, index) in view.messages" 
          :key="index"
          :class="['message', item.type]"
        >
          <div class="message-time">{{ formatTime(item.timestamp) }}</div>
          <div class="message-content">
            <!-- 文本消息 -->
            <div v-if="item.messageType === 'text'">{{ item.content }}</div>
            
            <!-- 文件传输申请 -->
            <div v-else-if="item.messageType === 'file-request'" class="file-request">
              <div class="file-info">
                <div class="file-name">{{ item.fileName }}</div>
                <div class="file-size">{{ formatFileSize(item.fileSize) }}</div>
              </div>
              <div class="file-actions">
                <a-button 
                  @click="acceptFileTransfer(item)" 
                  size="mini" 
                  type="primary"
                >
                  接受
                </a-button>
                <a-button 
                  @click="rejectFileTransfer(item)" 
                  size="mini" 
                  status="danger"
                >
                  拒绝
                </a-button>
              </div>
            </div>
            
            <!-- 文件传输进度 -->
            <div v-else-if="item.messageType === 'file-transfer'" class="file-transfer">
              <div class="file-info">
                <div class="file-name">{{ item.fileName }}</div>
                <div class="file-size">{{ formatFileSize(item.fileSize) }}</div>
              </div>
              <div class="transfer-progress">
                <a-progress 
                  :percent="item.progress || 0" 
                  :status="item.progress === 100 ? 'success' : 'normal'"
                  size="small"
                />
                <div class="progress-text">
                  {{ item.progress || 0 }}% - {{ formatFileSize(item.transferred || 0) }} / {{ formatFileSize(item.fileSize) }}
                </div>
              </div>
              <div class="file-actions" v-if="item.progress === 100 && item.fileData">
                <a-button 
                  @click="downloadFile(item)" 
                  size="mini" 
                  type="primary"
                >
                  下载文件
                </a-button>
              </div>
            </div>
            
            <!-- 系统消息 -->
            <div v-else-if="item.messageType === 'system'" class="system-message">
              {{ item.content }}
            </div>
          </div>
        </div>
      </div>
      
      <div class="input-section">
        <a-input 
          v-model="view.input" 
          placeholder="输入消息..."
          @keyup.enter="sendMessage"
          :disabled="!isConnected"
          allow-clear
        >
          <template #prefix>
            <icon-send />
          </template>
        </a-input>
        
        <a-button 
          @click="sendMessage" 
          :disabled="!isConnected || !view.input.trim()"
          type="primary"
        >
          <template #icon>
            <icon-send />
          </template>
          发送
        </a-button>
        
        <div class="file-upload-wrapper">
          <input
            ref="fileInput"
            type="file"
            class="file-input"
            @change="handleFileSelect"
            :disabled="!isConnected"
            multiple
          />
          <a-button 
            @click="triggerFileSelect"
            :disabled="!isConnected"
            class="file-button"
          >
            <template #icon>
              <icon-attachment />
            </template>
            文件
          </a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, computed, onMounted, onUnmounted, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconAttachment, IconSend } from '@arco-design/web-vue/es/icon'
import usePeer from '@/hooks/use-peer'
import { createLogger } from '@seek-self/utils'

const logger = createLogger('P2PChat')

interface FileRequest {
  id: string;
  fileName: string;
  fileSize: number;
  chunks: number;
}

interface FileChunk {
  id: string;
  chunkIndex: number;
  data: ArrayBuffer;
  isLast: boolean;
}

interface ChatMessage {
  content: string;
  type: 'sent' | 'received';
  timestamp: Date;
  messageType: 'text' | 'file-request' | 'file-transfer' | 'system';
  fileName?: string;
  fileSize?: number;
  fileData?: ArrayBuffer;
  progress?: number;
  transferred?: number;
  requestId?: string;
}

// 使用新的peer系统
const { state, connectionCount, messageCount, sendMessage: sendPeerMessage, connect: connectToPeer, broadcastMessage } = usePeer({
  debug: true,
  config: {
    host: "seek-self.leyuwangyou.fun",
    path: '/peerjs',
    secure: true,
    debug: 2
  }
})

const messagesRef = ref<HTMLElement>()
const fileInput = ref<HTMLInputElement>()

// 文件传输相关状态
const fileTransfers = reactive(new Map<string, {
  chunks: ArrayBuffer[];
  receivedChunks: number;
  totalChunks: number;
  fileName: string;
  fileSize: number;
  messageIndex: number;
}>())

// 存储待传输的文件
const pendingFiles = reactive(new Map<string, File>())

const view = reactive({
  targetId: '',
  messages: [] as ChatMessage[],
  input: '',
})

// 计算属性
const isConnected = computed(() => connectionCount.value > 0)
const peerId = computed(() => state.peerId)
const connectionStatus = computed(() => {
  switch (state.status) {
    case 'ready': return '已连接'
    case 'error': return '连接错误'
    case 'initializing': return '连接中...'
    case 'idle': return '未连接'
    default: return '未知状态'
  }
})

// 监听消息
onMounted(() => {
  logger.info('P2P聊天页面已加载')
  
  // 监听peer状态变化
  watch(() => state.status, (newStatus) => {
    logger.debug('P2P聊天组件 - Peer状态变化:', newStatus)
    console.log('P2P聊天组件 - Peer状态变化:', newStatus)
    if (newStatus === 'ready') {
      addMessage(`Peer连接已建立，ID: ${state.peerId}`, 'received', 'system')
    } else if (newStatus === 'error') {
      addMessage('Peer连接错误', 'received', 'system')
    }
  })
  
  // 监听peer ID变化
  watch(() => state.peerId, (newPeerId) => {
    logger.debug('P2P聊天组件 - Peer ID 变化:', newPeerId)
    console.log('P2P聊天组件 - Peer ID 变化:', newPeerId)
  }, { immediate: true })
  
  // 监听连接数变化
  watch(() => connectionCount.value, (newCount, oldCount) => {
    if (newCount > oldCount) {
      addMessage('新连接已建立', 'received', 'system')
    } else if (newCount < oldCount) {
      addMessage('连接已断开', 'received', 'system')
    }
  })
})

onUnmounted(() => {
  logger.info('P2P聊天页面已卸载')
})

const connect = async () => {
  logger.debug('尝试连接到:', view.targetId)
  if (!view.targetId.trim()) {
    Message.warning('请输入目标节点ID')
    return
  }
  
  try {
    await connectToPeer(view.targetId)
    addMessage(`正在连接到 ${view.targetId}...`, 'sent', 'system')
  } catch (error: any) {
    logger.error('连接失败:', error)
    Message.error('连接失败: ' + error.message)
    addMessage('连接失败: ' + error.message, 'sent', 'system')
  }
}

const disconnect = () => {
  // 这里需要实现断开连接的逻辑
  // 当前的usePeer hook还没有提供disconnect方法
  logger.debug('断开连接')
  addMessage('连接已断开', 'received', 'system')
}

const sendMessage = async () => {
  if (!view.input.trim()) {
    Message.warning('请输入消息内容')
    return
  }
  
  if (!isConnected.value) {
    Message.error('连接未建立，无法发送消息')
    addMessage('连接未建立，无法发送消息', 'sent', 'system')
    return
  }
  
  const message = view.input.trim()
  try {
    // 使用广播消息向所有连接发送
    await broadcastMessage(message, 'text')
    addMessage(message, 'sent', 'text')
    view.input = ''
    logger.debug('消息已发送:', message)
  } catch (error: any) {
    logger.error('发送消息失败:', error)
    Message.error('发送消息失败')
    addMessage('发送消息失败: ' + error.message, 'sent', 'system')
  }
}

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!isConnected.value) {
    Message.error('连接未建立，无法发送文件')
    addMessage('连接未建立，无法发送文件', 'sent', 'system')
    return
  }
  
  const files = target.files
  if (!files || files.length === 0) return
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    
    // 文件大小限制 (100MB)
    if (file.size > 100 * 1024 * 1024) {
      Message.warning(`文件 "${file.name}" 大小超过限制 (100MB)`)
      addMessage(`文件 "${file.name}" 大小超过限制 (100MB)`, 'sent', 'system')
      continue
    }

    // 发送文件传输申请
    const requestId = generateId()
    const fileRequest: FileRequest = {
      id: requestId,
      fileName: file.name,
      fileSize: file.size,
      chunks: Math.ceil(file.size / (64 * 1024)) // 64KB chunks
    }
    
    const message = addMessage('', 'sent', 'file-request')
    message.fileName = file.name
    message.fileSize = file.size
    message.requestId = requestId
    
    // 存储文件引用
    pendingFiles.set(requestId, file)
    
    try {
      // 使用广播发送文件请求
      await broadcastMessage({
        type: 'file-request',
        ...fileRequest
      }, 'file')
      logger.debug('文件请求已发送:', file.name)
    } catch (error: any) {
      logger.error('发送文件申请失败:', error)
      Message.error('发送文件申请失败')
      addMessage('发送文件申请失败: ' + error.message, 'sent', 'system')
      pendingFiles.delete(requestId)
    }
  }
  
  // 清理input值，允许重复选择同一文件
  if (target) {
    target.value = ''
  }
}

const triggerFileSelect = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const handleFileRequest = (data: FileRequest) => {
  const message = addMessage('', 'received', 'file-request')
  message.fileName = data.fileName
  message.fileSize = data.fileSize
  message.requestId = data.id
  logger.debug('收到文件请求:', data.fileName)
}

const acceptFileTransfer = async (message: ChatMessage) => {
  if (!message.requestId || !isConnected.value) {
    Message.error('连接未建立，无法接受文件')
    addMessage('连接未建立，无法接受文件', 'received', 'system')
    return
  }
  
  try {
    // 发送接受响应
    await broadcastMessage({
      type: 'file-accept',
      requestId: message.requestId
    }, 'file')
    
    // 更新消息为传输状态
    message.messageType = 'file-transfer'
    message.progress = 0
    message.transferred = 0
    
    // 初始化文件传输状态
    fileTransfers.set(message.requestId, {
      chunks: [],
      receivedChunks: 0,
      totalChunks: Math.ceil(message.fileSize! / (64 * 1024)),
      fileName: message.fileName!,
      fileSize: message.fileSize!,
      messageIndex: view.messages.indexOf(message)
    })
    
    logger.debug('文件传输已接受:', message.fileName)
    Message.success('文件传输已接受')
  } catch (error: any) {
    logger.error('接受文件传输失败:', error)
    Message.error('接受文件传输失败')
    addMessage('接受文件传输失败: ' + error.message, 'received', 'system')
  }
}

const rejectFileTransfer = async (message: ChatMessage) => {
  if (!message.requestId || !isConnected.value) {
    Message.error('连接未建立，无法拒绝文件')
    addMessage('连接未建立，无法拒绝文件', 'received', 'system')
    return
  }
  
  try {
    // 发送拒绝响应
    await broadcastMessage({
      type: 'file-reject',
      requestId: message.requestId
    }, 'file')
    
    // 更新消息
    message.messageType = 'system'
    message.content = '文件传输被拒绝'
    
    logger.debug('文件传输已拒绝:', message.fileName)
    Message.info('文件传输已拒绝')
  } catch (error: any) {
    logger.error('拒绝文件传输失败:', error)
    Message.error('拒绝文件传输失败')
    addMessage('拒绝文件传输失败: ' + error.message, 'received', 'system')
  }
}

const handleFileAccept = (data: { requestId: string }) => {
  // 找到对应的消息并开始传输
  const message = view.messages.find(m => m.requestId === data.requestId)
  if (message) {
    message.messageType = 'file-transfer'
    message.progress = 0
    message.transferred = 0
    
    // 开始读取并发送文件
    startFileTransfer(message)
  }
}

const handleFileReject = (data: { requestId: string }) => {
  const message = view.messages.find(m => m.requestId === data.requestId)
  if (message) {
    message.messageType = 'system'
    message.content = '对方拒绝了文件传输'
  }
}

const startFileTransfer = async (message: ChatMessage) => {
  const file = pendingFiles.get(message.requestId!)
  if (!file) {
    message.messageType = 'system'
    message.content = '文件传输失败：文件不存在'
    return
  }
  
  const chunkSize = 64 * 1024 // 64KB
  const totalChunks = Math.ceil(file.size / chunkSize)
  
  try {
    for (let i = 0; i < totalChunks; i++) {
      // 检查连接状态
      if (!isConnected.value) {
        message.messageType = 'system'
        message.content = '文件传输失败：连接已断开'
        pendingFiles.delete(message.requestId!)
        return
      }
      
      const start = i * chunkSize
      const end = Math.min(start + chunkSize, file.size)
      const chunk = file.slice(start, end)
      
      // 读取文件块
      const arrayBuffer = await chunk.arrayBuffer()
      
      const fileChunk: FileChunk = {
        id: message.requestId!,
        chunkIndex: i,
        data: arrayBuffer,
        isLast: i === totalChunks - 1
      }
      
      try {
        await broadcastMessage({
          type: 'file-chunk',
          ...fileChunk
        }, 'file')
      } catch (error: any) {
        logger.error('发送文件块失败:', error)
        message.messageType = 'system'
        message.content = '文件传输失败：发送数据失败'
        pendingFiles.delete(message.requestId!)
        return
      }
      
      // 更新进度
      message.progress = Math.round(((i + 1) / totalChunks) * 100)
      message.transferred = end
      
      // 添加小延迟避免阻塞
      await new Promise(resolve => setTimeout(resolve, 10))
    }
    
    // 清理文件引用
    pendingFiles.delete(message.requestId!)
    logger.debug('文件传输完成:', message.fileName)
    
  } catch (error: any) {
    logger.error('文件传输错误:', error)
    message.messageType = 'system'
    message.content = '文件传输失败：' + error.message
    pendingFiles.delete(message.requestId!)
  }
}

const handleFileChunk = (data: FileChunk) => {
  const transfer = fileTransfers.get(data.id)
  if (!transfer) return
  
  // 存储数据块
  transfer.chunks[data.chunkIndex] = data.data
  transfer.receivedChunks++
  
  // 更新进度
  const message = view.messages[transfer.messageIndex]
  if (message) {
    message.progress = Math.round((transfer.receivedChunks / transfer.totalChunks) * 100)
    message.transferred = Math.min(transfer.receivedChunks * 64 * 1024, transfer.fileSize)
    
    // 检查是否接收完成
    if (data.isLast && transfer.receivedChunks === transfer.totalChunks) {
      // 合并所有数据块
      const totalSize = transfer.chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0)
      const mergedData = new ArrayBuffer(totalSize)
      const uint8Array = new Uint8Array(mergedData)
      
      let offset = 0
      for (const chunk of transfer.chunks) {
        uint8Array.set(new Uint8Array(chunk), offset)
        offset += chunk.byteLength
      }
      
      message.fileData = mergedData
      message.content = '文件传输完成'
      
      // 清理传输状态
      fileTransfers.delete(data.id)
      logger.debug('文件接收完成:', message.fileName)
      Message.success('文件接收完成')
    }
  }
}

const addMessage = (content: string, type: 'sent' | 'received', messageType: 'text' | 'file-request' | 'file-transfer' | 'system' = 'text'): ChatMessage => {
  const message: ChatMessage = {
    content,
    type,
    timestamp: new Date(),
    messageType
  }
  
  view.messages.push(message)
  
  // 自动滚动到底部
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  })
  
  return message
}

const downloadFile = (message: ChatMessage) => {
  if (!message.fileData) {
    Message.error('文件数据不存在')
    return
  }
  
  try {
    const blob = new Blob([message.fileData])
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = message.fileName || 'download'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    logger.debug('文件下载完成:', message.fileName)
    Message.success('文件下载完成')
  } catch (error: any) {
    logger.error('文件下载失败:', error)
    Message.error('文件下载失败')
  }
}

const generateId = () => {
  return Math.random().toString(36).substr(2, 9)
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  })
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
.p2p-chat {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.status-card {
  margin-top: 12px;
  background: var(--color-bg-2);
}

.connection-section {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  align-items: center;
}

.target-input {
  flex: 1;
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  overflow: hidden;
}

.messages {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background: #fafafa;
  max-height: 400px;
}

.message {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
}

.message.sent {
  align-items: flex-end;
}

.message.received {
  align-items: flex-start;
}

.message-time {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.message-content {
  padding: 8px 12px;
  border-radius: 8px;
  max-width: 70%;
  word-wrap: break-word;
}

.message.sent .message-content {
  background: #1890ff;
  color: white;
}

.message.received .message-content {
  background: white;
  border: 1px solid #d9d9d9;
}

.system-message {
  font-style: italic;
  opacity: 0.8;
}

.file-request,
.file-transfer {
  min-width: 250px;
}

.file-info {
  margin-bottom: 8px;
}

.file-name {
  font-weight: 500;
  margin-bottom: 4px;
  word-break: break-all;
}

.file-size {
  font-size: 12px;
  opacity: 0.8;
}

.file-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.transfer-progress {
  margin-bottom: 8px;
}

.progress-text {
  font-size: 12px;
  margin-top: 4px;
  opacity: 0.8;
}

.input-section {
  display: flex;
  gap: 10px;
  padding: 16px;
  background: white;
  border-top: 1px solid #d9d9d9;
}

.input-section .arco-input {
  flex: 1;
}

.file-upload-wrapper {
  position: relative;
  display: inline-block;
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 1;
}

.file-button {
  position: relative;
  z-index: 0;
}
</style>
