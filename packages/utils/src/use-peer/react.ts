import { useEffect, useRef, useState, useCallback } from 'react';
import { PeerManager, PeerOptions, PeerState, EventType, EventListener } from './index';
import type { SeekSelf } from '@seek-self/types';

/**
 * React Hook 适配器
 * 将 PeerManager 包装为 React Hook
 */
export function usePeer(options: PeerOptions = {}): SeekSelf.Utils.Peer.HookReturn {
  const managerRef = useRef<PeerManager | null>(null);
  const [state, setState] = useState<PeerState>({
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

  // 初始化 PeerManager
  useEffect(() => {
    managerRef.current = new PeerManager(options);
    const manager = managerRef.current;

    // 状态同步事件监听器
    const stateUpdateListener: EventListener = () => {
      setState(manager.getState());
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
      manager.on(event, stateUpdateListener);
    });

    // 初始状态同步
    setState(manager.getState());

    // 清理函数
    return () => {
      stateEvents.forEach(event => {
        manager.off(event, stateUpdateListener);
      });
      manager.cleanup();
      managerRef.current = null;
    };
  }, []); // 空依赖数组，只在组件挂载时执行

  // 包装 PeerManager 方法
  const initialize = useCallback(async (customId?: string) => {
    if (managerRef.current) {
      await managerRef.current.initialize(customId);
    }
  }, []);

  const connect = useCallback(async (targetPeerId: string, metadata?: Record<string, any>) => {
    if (managerRef.current) {
      await managerRef.current.connect(targetPeerId, metadata);
    }
  }, []);

  const disconnect = useCallback((peerId?: string) => {
    if (managerRef.current) {
      managerRef.current.disconnect(peerId);
    }
  }, []);

  const cleanup = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.cleanup();
    }
  }, []);

  const sendMessage = useCallback(async <T = any>(
    peerId: string,
    content: T,
    type?: SeekSelf.Utils.Peer.MessageType,
    options?: {
      priority?: SeekSelf.Utils.Peer.Message['priority'];
      requiresAck?: boolean;
      metadata?: Record<string, any>;
    }
  ) => {
    if (managerRef.current) {
      await managerRef.current.sendMessage(peerId, content, type, options);
    }
  }, []);

  const broadcastMessage = useCallback(async <T = any>(content: T, type?: SeekSelf.Utils.Peer.MessageType) => {
    if (managerRef.current) {
      await managerRef.current.broadcastMessage(content, type);
    }
  }, []);

  const sendAck = useCallback((messageId: string, peerId: string, status: SeekSelf.Utils.Peer.Message['ackStatus']) => {
    // 发送确认消息的实现
    if (managerRef.current) {
      managerRef.current.sendMessage(peerId, { messageId, status }, 'system');
    }
  }, []);

  const sendFile = useCallback(async (peerId: string, file: File | Blob, onProgress?: (progress: number) => void) => {
    if (managerRef.current) {
      await managerRef.current.sendFile(peerId, file, onProgress);
    }
  }, []);

  const startCall = useCallback(async (peerId: string, mediaConfig?: SeekSelf.Utils.Peer.MediaConfig) => {
    if (managerRef.current) {
      await managerRef.current.startCall(peerId, mediaConfig);
    }
  }, []);

  const answerCall = useCallback(async (mediaConfig?: SeekSelf.Utils.Peer.MediaConfig) => {
    if (managerRef.current) {
      await managerRef.current.answerCall(mediaConfig);
    }
  }, []);

  const rejectCall = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.rejectCall();
    }
  }, []);

  const endCall = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.endCall();
    }
  }, []);

  const toggleMedia = useCallback((type: 'audio' | 'video', enabled?: boolean) => {
    if (managerRef.current) {
      managerRef.current.toggleMedia(type, enabled);
    }
  }, []);

  // 事件系统
  const on = useCallback(<T = any>(eventType: EventType, listener: EventListener<T>) => {
    if (managerRef.current) {
      managerRef.current.on(eventType, listener);
    }
  }, []);

  const off = useCallback(<T = any>(eventType: EventType, listener: EventListener<T>) => {
    if (managerRef.current) {
      managerRef.current.off(eventType, listener);
    }
  }, []);

  const emit = useCallback(<T = any>(eventType: EventType, data: T, peerId?: string) => {
    if (managerRef.current) {
      managerRef.current.emit(eventType, data);
    }
  }, []);

  // 工具方法
  const getConnectionStatus = useCallback((peerId: string) => {
    return managerRef.current?.getConnectionStatus(peerId) || null;
  }, []);

  const isConnectedTo = useCallback((peerId: string) => {
    return managerRef.current?.isConnectedTo(peerId) || false;
  }, []);

  const getConnectedPeers = useCallback(() => {
    return managerRef.current?.getConnectedPeers() || [];
  }, []);

  const getLatency = useCallback((peerId: string) => {
    return managerRef.current?.getLatency(peerId) || null;
  }, []);

  const clearMessages = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.clearMessages();
      setState(prev => ({ ...prev, messages: [] }));
    }
  }, []);

  const clearErrors = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.clearErrors();
      setState(prev => ({ ...prev, errors: [] }));
    }
  }, []);

  const getStats = useCallback(() => {
    return managerRef.current?.getStats() || {
      totalConnections: 0,
      activeConnections: 0,
      messagesSent: 0,
      messagesReceived: 0,
      bytesTransferred: 0
    };
  }, []);

  return {
    state,
    initialize,
    connect,
    disconnect,
    cleanup,
    sendMessage,
    broadcastMessage,
    sendAck,
    sendFile,
    startCall,
    answerCall,
    rejectCall,
    endCall,
    toggleMedia,
    on,
    off,
    emit,
    getConnectionStatus,
    isConnectedTo,
    getConnectedPeers,
    getLatency,
    clearMessages,
    clearErrors,
    getStats
  };
}

export default usePeer;
