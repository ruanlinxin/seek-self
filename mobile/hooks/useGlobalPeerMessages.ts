import { useEffect, useState, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useReactPeer } from '@seek-self/utils';

interface PeerMessage {
  id: string;
  senderId: string;
  message: string;
  timestamp: string;
  type: 'message' | 'connection' | 'system';
}

interface MessageModalState {
  visible: boolean;
  title: string;
  message: string;
  senderId?: string;
  timestamp?: string;
  type: 'message' | 'connection' | 'system';
}

export function useGlobalPeerMessages() {
  const { state: peerState, initialize, on, off, cleanup } = useReactPeer({
    debug: true,
    autoConnect: false,
  });

  const [modalState, setModalState] = useState<MessageModalState>({
    visible: false,
    title: '',
    message: '',
    type: 'message',
  });

  const [messageHistory, setMessageHistory] = useState<PeerMessage[]>([]);
  const appState = useRef(AppState.currentState);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
  const wasConnectedBeforeBackground = useRef(false);

  // 初始化 PeerJS
  useEffect(() => {
    initialize().catch(error => {
      console.error('Failed to initialize peer:', error);
    });
  }, [initialize]);

  // 应用状态变化监听
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      console.log('App state changed from', appState.current, 'to', nextAppState);
      
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // 从后台回到前台
        console.log('App has come to the foreground!');
        
        // 如果之前有连接且现在断开了，尝试重连
        if (wasConnectedBeforeBackground.current && peerState.status !== 'ready') {
          console.log('Attempting to reconnect after returning from background');
          
          // 延迟重连，给系统一些时间恢复网络
          reconnectTimer.current = setTimeout(() => {
            initialize().catch(error => {
              console.error('Failed to reconnect after background:', error);
            });
          }, 2000);
        }
        
      } else if (nextAppState.match(/inactive|background/)) {
        // 进入后台
        console.log('App has gone to the background');
        
        // 记录当前连接状态
        wasConnectedBeforeBackground.current = peerState.status === 'ready';
        
        // 清理重连定时器
        if (reconnectTimer.current) {
          clearTimeout(reconnectTimer.current);
          reconnectTimer.current = null;
        }
        
        // 优雅地关闭连接，避免报错
        try {
          if (peerState.status === 'ready') {
            console.log('Gracefully closing peer connection before background');
            // 不完全关闭，只是标记状态
            // cleanup(); // 注释掉完全清理，避免报错
          }
        } catch (error) {
          console.log('Error during background cleanup:', error);
        }
      }
      
      appState.current = nextAppState;
    };

    // 注册应用状态监听
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // 清理函数
    return () => {
      subscription?.remove();
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
    };
  }, [peerState.status, initialize]);

  // 添加消息到历史记录
  const addToHistory = (message: PeerMessage) => {
    setMessageHistory(prev => [message, ...prev].slice(0, 100)); // 只保留最新100条
  };

  // 显示消息弹窗
  const showMessage = (
    title: string,
    message: string,
    senderId?: string,
    type: 'message' | 'connection' | 'system' = 'message'
  ) => {
    const timestamp = new Date().toLocaleString('zh-CN');
    
    setModalState({
      visible: true,
      title,
      message,
      senderId,
      timestamp,
      type,
    });

    // 添加到历史记录
    if (senderId) {
      addToHistory({
        id: Date.now().toString(),
        senderId,
        message,
        timestamp,
        type,
      });
    }
  };

  // 关闭弹窗
  const closeModal = () => {
    setModalState(prev => ({ ...prev, visible: false }));
  };

  // 事件监听
  useEffect(() => {
    const handleMessage = (data: any) => {
      console.log('收到消息:', data);
      
      // 直接转换成 JSON 字符串显示
      const messageContent = data ? JSON.stringify(data, null, 2) : '无消息内容';
      const senderId = (data && typeof data === 'object') ? 
        (data.senderId || data.from || data.peerId || '未知发送者') : '未知发送者';
      
      showMessage(
        '📨 收到新消息',
        messageContent,
        String(senderId),
        'message'
      );
    };

    const handleConnectionOpen = (data: any) => {
      console.log('新设备连接:', data);
      const deviceId = data?.peerId || data?.connectionId || '未知设备';
      showMessage(
        '🔗 设备已连接',
        `设备已成功连接\n\n详细信息:\n${JSON.stringify(data, null, 2)}`,
        String(deviceId),
        'connection'
      );
    };

    const handleConnectionClose = (data: any) => {
      console.log('设备断开:', data);
      const deviceId = data?.peerId || data?.connectionId || '未知设备';
      showMessage(
        '📱 设备已断开',
        `设备已断开连接\n\n详细信息:\n${JSON.stringify(data, null, 2)}`,
        String(deviceId),
        'connection'
      );
    };

    const handlePeerError = (data: any) => {
      console.log('Peer 错误:', data);
      
      // 如果应用在后台，不显示错误弹窗
      if (appState.current.match(/background/)) {
        console.log('App is in background, suppressing error notification');
        return;
      }
      
      // 检查是否是网络断开相关的错误
      const isNetworkError = data?.type === 'network' || 
                           data?.type === 'disconnected' || 
                           data?.message?.includes('Lost connection') ||
                           data?.message?.includes('disconnected');
                           
      if (isNetworkError) {
        console.log('Network error detected, will attempt auto-reconnect');
        // 网络错误不显示弹窗，等待自动重连
        return;
      }
      
      const errorMessage = `连接出现问题\n\n详细信息:\n${JSON.stringify(data, null, 2)}`;
      
      showMessage(
        '❌ 连接错误',
        errorMessage,
        undefined,
        'system'
      );
    };

    const handlePeerOpen = (data: any) => {
      console.log('Peer 连接成功:', data);
      const peerId = data?.peerId || '未知ID';
      showMessage(
        '✅ 连接成功',
        `您的在线ID: ${peerId}\n\n详细信息:\n${JSON.stringify(data, null, 2)}`,
        undefined,
        'system'
      );
    };

    // 注册事件监听器
    on('message:received', handleMessage);
    on('connection:open', handleConnectionOpen);
    on('connection:close', handleConnectionClose);
    on('peer:error', handlePeerError);
    on('peer:open', handlePeerOpen);

    // 清理函数
    return () => {
      off('message:received', handleMessage);
      off('connection:open', handleConnectionOpen);
      off('connection:close', handleConnectionClose);
      off('peer:error', handlePeerError);
      off('peer:open', handlePeerOpen);
    };
  }, [on, off]);

  return {
    peerState,
    modalState,
    messageHistory,
    closeModal,
    showMessage,
    initialize,
  };
}
