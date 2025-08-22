import { ref, reactive, onMounted, onUnmounted, computed } from 'vue';
import { PeerManager, PeerOptions, PeerState, EventType, EventListener } from '@seek-self/utils';
import { createLogger } from '@seek-self/utils';
import { default as Peer } from 'peerjs';

// 全局单例实例
let globalManager: PeerManager | null = null;
let initPromise: Promise<void> | null = null;
let referenceCount = 0;
let globalOptions: PeerOptions | null = null;
const logger = createLogger('WebPeer');

/**
 * Vue Composable 适配器 (单例模式)
 * 确保全局只有一个 PeerManager 实例和 PeerID
 * 页面加载后自动建立peer连接
 */
export default function usePeer(options: PeerOptions = {}) {



  // 响应式状态
  const state = reactive<PeerState>({
    isInitialized: false,
    peerId: null,
    status: 'idle',
    isConnecting: false,
    connections: new Map(),
    messages: [],
    errors: [],
    stats: {
      totalConnections: 0,
      activeConnections: 0,
      messagesSent: 0,
      messagesReceived: 0,
      bytesTransferred: 0
    }
  });

  // 计算属性
  const isReady = computed(() => state.status === 'ready');
  const isConnecting = computed(() => state.isConnecting);
  const connectionCount = computed(() => state.connections.size);
  const messageCount = computed(() => state.messages.length);
  const errorCount = computed(() => state.errors.length);

  // 状态同步函数
  const syncState = () => {
    if (globalManager) {
      const currentState = globalManager.getState();
      // 强制同步所有状态属性
      state.isInitialized = currentState.isInitialized;
      state.peerId = currentState.peerId;
      state.status = currentState.status;
      state.isConnecting = currentState.isConnecting;
      state.connections = currentState.connections;
      state.messages = currentState.messages;
      state.errors = currentState.errors;
      state.stats = currentState.stats;
      
      logger.debug('状态已同步:', { 
        peerId: state.peerId, 
        status: state.status,
        connectionsSize: state.connections.size 
      });
    }
  };

  // 确保单例管理器
  const ensureManager = async (): Promise<void> => {
    if (!globalManager) {
      // 使用第一次传入的配置或当前配置
      const finalOptions = globalOptions || options;
      globalOptions = finalOptions;
      
      globalManager = new PeerManager(Peer, finalOptions);
      logger.info(`创建全局 Peer Manager 单例 (引用计数: ${referenceCount + 1})`);
      
      // 设置全局事件监听
      const stateEvents: EventType[] = [
        'peer:open',
        'peer:close', 
        'peer:error',
        'connection:open',
        'connection:close',
        'connection:error',
        'message:received',
        'message:sent'
      ];

      // 为所有实例同步状态
      stateEvents.forEach(event => {
        globalManager!.on(event, syncState);
      });

      // 添加自定义事件处理
      globalManager.on('peer:open', (data: any) => {
        logger.info('Peer 连接已打开:', data.peerId);
      });

      globalManager.on('peer:error', (data: any) => {
        logger.error('Peer 连接错误:', data);
      });

      globalManager.on('peer:disconnected', () => {
        logger.warn('Peer 已断开连接，尝试重连...');
      });

      globalManager.on('peer:close', () => {
        logger.info('Peer 连接已关闭');
      });

      // 自动初始化peer连接
      try {
        await globalManager.initialize();
        logger.info('Peer 自动初始化完成');
      } catch (error) {
        logger.error('Peer 自动初始化失败:', error);
      }
    }
    
    referenceCount++;
    logger.debug(`Peer Manager 引用计数增加: ${referenceCount}`);
    syncState();
  };

  // 初始化
  onMounted(async () => {
    if (!initPromise) {
      initPromise = ensureManager();
    }
    await initPromise;
    
    // 添加定时状态同步，确保状态能够及时更新
    const syncInterval = setInterval(syncState, 1000);
    
    // 在组件卸载时清理定时器
    onUnmounted(() => {
      clearInterval(syncInterval);
    });
  });

  // 清理
  onUnmounted(() => {
    referenceCount--;
    logger.debug(`Peer Manager 引用计数减少: ${referenceCount}`);
    
    // 只有当没有组件使用时才清理
    if (referenceCount <= 0 && globalManager) {
      logger.info('清理全局 Peer Manager 单例');
      globalManager.cleanup();
      globalManager = null;
      globalOptions = null;
      initPromise = null;
      referenceCount = 0;
    }
  });

  // === 连接管理 ===
  const initialize = async (customId?: string): Promise<void> => {
    if (globalManager) {
      await globalManager.initialize(customId);
    }
  };

  const connect = async (targetPeerId: string, metadata?: Record<string, any>): Promise<void> => {
    if (globalManager) {
      await globalManager.connect(targetPeerId, metadata);
    }
  };

  const disconnect = (peerId?: string): void => {
    if (globalManager) {
      globalManager.disconnect(peerId);
    }
  };

  const cleanup = (): void => {
    if (globalManager) {
      globalManager.cleanup();
    }
  };

  // === 消息功能 ===
  const sendMessage = async <T = any>(
    peerId: string,
    content: T,
    type?: 'text' | 'file' | 'system' | 'custom',
    options?: {
      priority?: 'low' | 'normal' | 'high';
      requiresAck?: boolean;
      metadata?: Record<string, any>;
    }
  ): Promise<void> => {
    if (globalManager) {
      await globalManager.sendMessage(peerId, content, type, options);
    }
  };

  const broadcastMessage = async <T = any>(content: T, type?: 'text' | 'file' | 'system' | 'custom'): Promise<void> => {
    if (globalManager) {
      await globalManager.broadcastMessage(content, type);
    }
  };

  const sendAck = (messageId: string, peerId: string, status: 'pending' | 'delivered' | 'failed'): void => {
    if (globalManager) {
      globalManager.sendMessage(peerId, { messageId, status }, 'system');
    }
  };

  // === 文件传输 ===
  const sendFile = async (peerId: string, file: File | Blob, onProgress?: (progress: number) => void): Promise<void> => {
    if (globalManager) {
      await globalManager.sendFile(peerId, file, onProgress);
    }
  };

  // === 媒体流 ===
  const startCall = async (peerId: string, mediaConfig?: { video?: boolean; audio?: boolean }): Promise<void> => {
    if (globalManager) {
      await globalManager.startCall(peerId, mediaConfig);
    }
  };

  const answerCall = async (mediaConfig?: { video?: boolean; audio?: boolean }): Promise<void> => {
    if (globalManager) {
      await globalManager.answerCall(mediaConfig);
    }
  };

  const rejectCall = (): void => {
    if (globalManager) {
      globalManager.rejectCall();
    }
  };

  const endCall = (): void => {
    if (globalManager) {
      globalManager.endCall();
    }
  };

  const toggleMedia = (type: 'audio' | 'video', enabled?: boolean): void => {
    if (globalManager) {
      globalManager.toggleMedia(type, enabled);
    }
  };

  // === 事件系统 ===
  const on = <T = any>(eventType: EventType, listener: EventListener<T>): void => {
    if (globalManager) {
      globalManager.on(eventType, listener);
    }
  };

  const off = <T = any>(eventType: EventType, listener: EventListener<T>): void => {
    if (globalManager) {
      globalManager.off(eventType, listener);
    }
  };

  const emit = <T = any>(eventType: EventType, data: T, peerId?: string): void => {
    if (globalManager) {
      globalManager.emit(eventType, data);
    }
  };

  // === 工具方法 ===
  const getConnectionStatus = (peerId: string) => {
    return globalManager?.getConnectionStatus(peerId) || null;
  };

  const isConnectedTo = (peerId: string): boolean => {
    return globalManager?.isConnectedTo(peerId) || false;
  };

  const getConnectedPeers = (): string[] => {
    return globalManager?.getConnectedPeers() || [];
  };

  const getLatency = (peerId: string): number | null => {
    return globalManager?.getLatency(peerId) || null;
  };

  const clearMessages = (): void => {
    if (globalManager) {
      globalManager.clearMessages();
      syncState();
    }
  };

  const clearErrors = (): void => {
    if (globalManager) {
      globalManager.clearErrors();
      syncState();
    }
  };

  const getStats = (): PeerState['stats'] => {
    return globalManager?.getStats() || {
      totalConnections: 0,
      activeConnections: 0,
      messagesSent: 0,
      messagesReceived: 0,
      bytesTransferred: 0
    };
  };

  // === 便捷方法 ===
  const getMessagesByPeer = (peerId: string) => {
    return computed(() => 
      state.messages.filter((msg: any) => msg.from === peerId || msg.to === peerId)
    );
  };

  const getConnectionList = computed(() => {
    const entries = Array.from(state.connections.entries()) as Array<[string, any]>;
    return entries.map(([peerId, connection]) => ({
      peerId,
      ...connection
    }));
  });

  const getErrorList = computed(() => {
    return state.errors.map((error: any, index: number) => ({
      id: index,
      message: error,
      timestamp: new Date()
    }));
  });

  // 返回 API
  return {
    // 状态
    state,
    isReady,
    isConnecting,
    connectionCount,
    messageCount,
    errorCount,
    
    // 连接管理
    initialize,
    connect,
    disconnect,
    cleanup,
    
    // 消息功能
    sendMessage,
    broadcastMessage,
    sendAck,
    
    // 文件传输
    sendFile,
    
    // 媒体流
    startCall,
    answerCall,
    rejectCall,
    endCall,
    toggleMedia,
    
    // 事件系统
    on,
    off,
    emit,
    
    // 工具方法
    getConnectionStatus,
    isConnectedTo,
    getConnectedPeers,
    getLatency,
    clearMessages,
    clearErrors,
    getStats,
    
    // 便捷方法
    getMessagesByPeer,
    getConnectionList,
    getErrorList
  };
}
