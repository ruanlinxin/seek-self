<template>
  <div class="p2p-chat">
    <div class="header">
      <h2>P2P 聊天</h2>
      <div class="my-id">我的ID: {{ id || '连接中...' }}</div>
    </div>

    <div class="connection-section">
      <a-input
        v-model="view.targetId"
        placeholder="请输入对方的ID"
        class="target-input"
      />
      <a-button
        @click="connect"
        :disabled="isConnected || !view.targetId"
        type="primary"
      >
        {{ isConnected ? '已连接' : '连接' }}
      </a-button>
      <a-button
        @click="disconnect"
        :disabled="!isConnected"
        status="danger"
      >
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
        />
        <a-button
          @click="sendMessage"
          :disabled="!isConnected || !view.input.trim()"
          type="primary"
        >
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
            文件
          </a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePeer } from "@/hooks";
import { nextTick } from 'vue';

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

interface Message {
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

const id = ref<string | null>(null);
const isConnected = ref(false);
const currentConnection = ref<any>(null);
const messagesRef = ref<HTMLElement>();
const fileInput = ref<HTMLInputElement>();

// 文件传输相关状态
const fileTransfers = reactive(new Map<string, {
  chunks: ArrayBuffer[];
  receivedChunks: number;
  totalChunks: number;
  fileName: string;
  fileSize: number;
  messageIndex: number;
}>());

// 存储待传输的文件
const pendingFiles = reactive(new Map<string, File>());

const view = reactive({
  targetId: '',
  messages: [] as Message[],
  input: '',
});

const p = usePeer({
  onOpen(_id) {
    id.value = _id;
    addMessage('Peer连接已建立，ID: ' + _id, 'received', 'system');
  },
  onError(error) {
    console.error('Peer错误:', error);
    addMessage('Peer连接错误: ' + error.message, 'received', 'system');
  },
  onDisconnected() {
    addMessage('Peer连接断开，正在重连...', 'received', 'system');
  }
});

// 监听连接请求
p.on('connection', function(conn) {
  console.log('收到连接请求:', conn.peer);
  handleConnection(conn);
});

const connect = () => {
  console.log('connect', view.targetId);
  if (!view.targetId.trim()) return;

  const conn = p.connect(view.targetId);
  handleConnection(conn);
};

const handleConnection = (conn: any) => {
  currentConnection.value = conn;

  conn.on('open', function() {
    console.log('连接已建立');
    isConnected.value = true;
    addMessage('连接已建立', 'received', 'system');
  });

  conn.on('data', function(data) {
    console.log('收到数据:', data);

    if (data.type === 'file-request') {
      handleFileRequest(data);
    } else if (data.type === 'file-chunk') {
      handleFileChunk(data);
    } else if (data.type === 'file-accept') {
      handleFileAccept(data);
    } else if (data.type === 'file-reject') {
      handleFileReject(data);
    } else {
      addMessage(data, 'received', 'text');
    }
  });

  conn.on('close', function() {
    console.log('连接已关闭');
    isConnected.value = false;
    currentConnection.value = null;
    addMessage('连接已断开', 'received', 'system');
  });

  conn.on('error', function(err) {
    console.error('连接错误:', err);
    isConnected.value = false;
    currentConnection.value = null;
    addMessage('连接错误: ' + err.message, 'received', 'system');
  });
};

const disconnect = () => {
  if (currentConnection.value) {
    currentConnection.value.close();
    currentConnection.value = null;
    isConnected.value = false;
  }
};

// 检查连接是否可用
const isConnectionReady = () => {
  return isConnected.value && currentConnection.value && currentConnection.value.open;
};

const sendMessage = () => {
  if (!view.input.trim() || !isConnectionReady()) {
    if (!isConnectionReady()) {
      addMessage('连接未建立，无法发送消息', 'sent', 'system');
    }
    return;
  }

  const message = view.input.trim();
  try {
    currentConnection.value.send(message);
    addMessage(message, 'sent', 'text');
    view.input = '';
  } catch (error) {
    console.error('发送消息失败:', error);
    addMessage('发送消息失败: ' + error.message, 'sent', 'system');
  }
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!isConnectionReady()) {
    addMessage('连接未建立，无法发送文件', 'sent', 'system');
    return;
  }

  const files = target.files;
  if (!files || files.length === 0) return;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    // 文件大小限制 (100MB)
    if (file.size > 100 * 1024 * 1024) {
      addMessage(`文件 "${file.name}" 大小超过限制 (100MB)`, 'sent', 'system');
      continue;
    }

    // 发送文件传输申请
    const requestId = generateId();
    const fileRequest: FileRequest = {
      id: requestId,
      fileName: file.name,
      fileSize: file.size,
      chunks: Math.ceil(file.size / (64 * 1024)) // 64KB chunks
    };

    const message = addMessage('', 'sent', 'file-request');
    message.fileName = file.name;
    message.fileSize = file.size;
    message.requestId = requestId;

    // 存储文件引用
    pendingFiles.set(requestId, file);

    try {
      currentConnection.value.send({
        type: 'file-request',
        ...fileRequest
      });
    } catch (error) {
      console.error('发送文件申请失败:', error);
      addMessage('发送文件申请失败: ' + error.message, 'sent', 'system');
      pendingFiles.delete(requestId);
    }
  }

  // 清理input值，允许重复选择同一文件
  if (target) {
    target.value = '';
  }
};

const triggerFileSelect = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

const handleFileRequest = (data: FileRequest) => {
  const message = addMessage('', 'received', 'file-request');
  message.fileName = data.fileName;
  message.fileSize = data.fileSize;
  message.requestId = data.id;
};

const acceptFileTransfer = (message: Message) => {
  if (!message.requestId || !isConnectionReady()) {
    addMessage('连接未建立，无法接受文件', 'received', 'system');
    return;
  }

  try {
    // 发送接受响应
    currentConnection.value.send({
      type: 'file-accept',
      requestId: message.requestId
    });

    // 更新消息为传输状态
    message.messageType = 'file-transfer';
    message.progress = 0;
    message.transferred = 0;

    // 初始化文件传输状态
    fileTransfers.set(message.requestId, {
      chunks: [],
      receivedChunks: 0,
      totalChunks: Math.ceil(message.fileSize! / (64 * 1024)),
      fileName: message.fileName!,
      fileSize: message.fileSize!,
      messageIndex: view.messages.indexOf(message)
    });
  } catch (error) {
    console.error('接受文件传输失败:', error);
    addMessage('接受文件传输失败: ' + error.message, 'received', 'system');
  }
};

const rejectFileTransfer = (message: Message) => {
  if (!message.requestId || !isConnectionReady()) {
    addMessage('连接未建立，无法拒绝文件', 'received', 'system');
    return;
  }

  try {
    // 发送拒绝响应
    currentConnection.value.send({
      type: 'file-reject',
      requestId: message.requestId
    });

    // 更新消息
    message.messageType = 'system';
    message.content = '文件传输被拒绝';
  } catch (error) {
    console.error('拒绝文件传输失败:', error);
    addMessage('拒绝文件传输失败: ' + error.message, 'received', 'system');
  }
};

const handleFileAccept = (data: { requestId: string }) => {
  // 找到对应的消息并开始传输
  const message = view.messages.find(m => m.requestId === data.requestId);
  if (message) {
    message.messageType = 'file-transfer';
    message.progress = 0;
    message.transferred = 0;

    // 开始读取并发送文件
    startFileTransfer(message);
  }
};

const handleFileReject = (data: { requestId: string }) => {
  const message = view.messages.find(m => m.requestId === data.requestId);
  if (message) {
    message.messageType = 'system';
    message.content = '对方拒绝了文件传输';
  }
};

const startFileTransfer = async (message: Message) => {
  const file = pendingFiles.get(message.requestId!);
  if (!file) {
    message.messageType = 'system';
    message.content = '文件传输失败：文件不存在';
    return;
  }

  const chunkSize = 64 * 1024; // 64KB
  const totalChunks = Math.ceil(file.size / chunkSize);

  try {
    for (let i = 0; i < totalChunks; i++) {
      // 检查连接状态
      if (!isConnectionReady()) {
        message.messageType = 'system';
        message.content = '文件传输失败：连接已断开';
        pendingFiles.delete(message.requestId!);
        return;
      }

      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);

      // 读取文件块
      const arrayBuffer = await chunk.arrayBuffer();

      const fileChunk: FileChunk = {
        id: message.requestId!,
        chunkIndex: i,
        data: arrayBuffer,
        isLast: i === totalChunks - 1
      };

      try {
        currentConnection.value.send({
          type: 'file-chunk',
          ...fileChunk
        });
      } catch (error) {
        console.error('发送文件块失败:', error);
        message.messageType = 'system';
        message.content = '文件传输失败：发送数据失败';
        pendingFiles.delete(message.requestId!);
        return;
      }

      // 更新进度
      message.progress = Math.round(((i + 1) / totalChunks) * 100);
      message.transferred = end;

      // 添加小延迟避免阻塞
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    // 清理文件引用
    pendingFiles.delete(message.requestId!);

  } catch (error) {
    console.error('文件传输错误:', error);
    message.messageType = 'system';
    message.content = '文件传输失败：' + error.message;
    pendingFiles.delete(message.requestId!);
  }
};

const handleFileChunk = (data: FileChunk) => {
  const transfer = fileTransfers.get(data.id);
  if (!transfer) return;

  // 存储数据块
  transfer.chunks[data.chunkIndex] = data.data;
  transfer.receivedChunks++;

  // 更新进度
  const message = view.messages[transfer.messageIndex];
  if (message) {
    message.progress = Math.round((transfer.receivedChunks / transfer.totalChunks) * 100);
    message.transferred = Math.min(transfer.receivedChunks * 64 * 1024, transfer.fileSize);

    // 检查是否接收完成
    if (data.isLast && transfer.receivedChunks === transfer.totalChunks) {
      // 合并所有数据块
      const totalSize = transfer.chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
      const mergedData = new ArrayBuffer(totalSize);
      const uint8Array = new Uint8Array(mergedData);

      let offset = 0;
      for (const chunk of transfer.chunks) {
        uint8Array.set(new Uint8Array(chunk), offset);
        offset += chunk.byteLength;
      }

      message.fileData = mergedData;
      message.content = '文件传输完成';

      // 清理传输状态
      fileTransfers.delete(data.id);
    }
  }
};

const addMessage = (content: string, type: 'sent' | 'received', messageType: 'text' | 'file-request' | 'file-transfer' | 'system' = 'text'): Message => {
  const message: Message = {
    content,
    type,
    timestamp: new Date(),
    messageType
  };

  view.messages.push(message);

  // 自动滚动到底部
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight;
    }
  });

  return message;
};

const downloadFile = (message: Message) => {
  if (!message.fileData) return;

  const blob = new Blob([message.fileData]);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = message.fileName || 'download';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
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
  text-align: center;
  margin-bottom: 20px;
}

.my-id {
  background: #f0f0f0;
  padding: 8px 12px;
  border-radius: 4px;
  font-family: monospace;
  margin-top: 8px;
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
