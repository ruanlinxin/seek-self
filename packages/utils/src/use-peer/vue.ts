import { ref, reactive, onMounted, onUnmounted, computed } from 'vue';
import { PeerManager, PeerOptions, PeerState, EventType, EventListener } from './index';
import type { SeekSelf } from '@seek-self/types';

/**
 * Vue Composable 适配器
 * 将 PeerManager 包装为 Vue Composable
 */
export function usePeer(options: PeerOptions = {}) {
  let manager: PeerManager | null = null;

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
    if (manager) {
      const currentState = manager.getState();
      Object.assign(state, currentState);
    }
  };

  // 初始化
  onMounted(() => {
    manager = new PeerManager(options);

    // 状态同步事件监听器
    const stateUpdateListener: EventListener = () => {
      syncState();
    };

    // 监听所有状态变更事件
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

    stateEvents.forEach(event => {
      manager!.on(event, stateUpdateListener);
    });

    // 初始状态同步
    syncState();
  });

  // 清理
  onUnmounted(() => {
    if (manager) {
      manager.cleanup();
      manager = null;
    }
  });

  // === 连接管理 ===
  const initialize = async (customId?: string): Promise<void> => {
    if (manager) {
      await manager.initialize(customId);
    }
  };

  const connect = async (targetPeerId: string, metadata?: Record<string, any>): Promise<void> => {
    if (manager) {
      await manager.connect(targetPeerId, metadata);
    }
  };

  const disconnect = (peerId?: string): void => {
    if (manager) {
      manager.disconnect(peerId);
    }
  };

  const cleanup = (): void => {
    if (manager) {
      manager.cleanup();
    }
  };

  // === 消息功能 ===
  const sendMessage = async <T = any>(
    peerId: string,
    content: T,
    type?: SeekSelf.Utils.Peer.MessageType,
    options?: {
      priority?: SeekSelf.Utils.Peer.Message['priority'];
      requiresAck?: boolean;
      metadata?: Record<string, any>;
    }
  ): Promise<void> => {
    if (manager) {
      await manager.sendMessage(peerId, content, type, options);
    }
  };

  const broadcastMessage = async <T = any>(content: T, type?: SeekSelf.Utils.Peer.MessageType): Promise<void> => {
    if (manager) {
      await manager.broadcastMessage(content, type);
    }
  };

  const sendAck = (messageId: string, peerId: string, status: SeekSelf.Utils.Peer.Message['ackStatus']): void => {
    if (manager) {
      manager.sendMessage(peerId, { messageId, status }, 'system');
    }
  };

  // === 文件传输 ===
  const sendFile = async (peerId: string, file: File | Blob, onProgress?: (progress: number) => void): Promise<void> => {
    if (manager) {
      await manager.sendFile(peerId, file, onProgress);
    }
  };

  // === 媒体流 ===
  const startCall = async (peerId: string, mediaConfig?: SeekSelf.Utils.Peer.MediaConfig): Promise<void> => {
    if (manager) {
      await manager.startCall(peerId, mediaConfig);
    }
  };

  const answerCall = async (mediaConfig?: SeekSelf.Utils.Peer.MediaConfig): Promise<void> => {
    if (manager) {
      await manager.answerCall(mediaConfig);
    }
  };

  const rejectCall = (): void => {
    if (manager) {
      manager.rejectCall();
    }
  };

  const endCall = (): void => {
    if (manager) {
      manager.endCall();
    }
  };

  const toggleMedia = (type: 'audio' | 'video', enabled?: boolean): void => {
    if (manager) {
      manager.toggleMedia(type, enabled);
    }
  };

  // === 事件系统 ===
  const on = <T = any>(eventType: EventType, listener: EventListener<T>): void => {
    if (manager) {
      manager.on(eventType, listener);
    }
  };

  const off = <T = any>(eventType: EventType, listener: EventListener<T>): void => {
    if (manager) {
      manager.off(eventType, listener);
    }
  };

  const emit = <T = any>(eventType: EventType, data: T, peerId?: string): void => {
    if (manager) {
      manager.emit(eventType, data);
    }
  };

  // === 工具方法 ===
  const getConnectionStatus = (peerId: string): SeekSelf.Utils.Peer.ConnectionStatus | null => {
    return manager?.getConnectionStatus(peerId) || null;
  };

  const isConnectedTo = (peerId: string): boolean => {
    return manager?.isConnectedTo(peerId) || false;
  };

  const getConnectedPeers = (): string[] => {
    return manager?.getConnectedPeers() || [];
  };

  const getLatency = (peerId: string): number | null => {
    return manager?.getLatency(peerId) || null;
  };

  const clearMessages = (): void => {
    if (manager) {
      manager.clearMessages();
      syncState();
    }
  };

  const clearErrors = (): void => {
    if (manager) {
      manager.clearErrors();
      syncState();
    }
  };

  const getStats = (): PeerState['stats'] => {
    return manager?.getStats() || {
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
      state.messages.filter(msg => msg.from === peerId || msg.to === peerId)
    );
  };

  const getConnectionList = computed(() => {
    return Array.from(state.connections.entries()).map(([peerId, connection]) => ({
      peerId,
      ...connection
    }));
  });

  const getErrorList = computed(() => {
    return state.errors.map((error, index) => ({
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

export default usePeer;
