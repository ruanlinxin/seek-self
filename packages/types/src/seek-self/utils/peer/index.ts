/**
 * SeekSelf.Utils.Peer 命名空间
 * 包含所有 P2P 通信相关的类型定义
 */

declare namespace SeekSelf.Utils.Peer {
  /**
   * PeerJS 配置接口
   */
  interface Config {
    /** PeerJS 服务器主机地址 */
    host?: string;
    /** PeerJS 服务器端口 */
    port?: number;
    /** PeerJS 服务器路径 */
    path?: string;
    /** API 密钥 */
    key?: string;
    /** 调试级别 0-3 */
    debug?: number;
    /** 是否使用 HTTPS */
    secure?: boolean;
    /** 自定义 ICE 服务器 */
    config?: {
      iceServers?: RTCIceServer[];
    };
  }

  /**
   * 连接状态枚举
   */
  type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error' | 'closed';

  /**
   * Peer 连接信息
   */
  interface Connection {
    /** 连接 ID */
    id: string;
    /** 连接实例 */
    connection: any;
    /** 连接状态 */
    status: ConnectionStatus;
    /** 连接建立时间 */
    connectedAt?: Date;
    /** 最后活跃时间 */
    lastSeen?: Date;
    /** 连接元数据 */
    metadata?: Record<string, any>;
    /** 连接延迟 (ms) */
    latency?: number;
  }

  /**
   * 消息类型枚举
   */
  type MessageType = 
    | 'text'           // 文本消息
    | 'file'           // 文件传输
    | 'image'          // 图片消息
    | 'audio'          // 音频消息
    | 'video'          // 视频消息
    | 'system'         // 系统消息
    | 'heartbeat'      // 心跳消息
    | 'sync'           // 数据同步
    | 'task'           // 任务相关
    | 'notification'   // 通知消息
    | 'custom';        // 自定义消息

  /**
   * 消息接口
   */
  interface Message<T = any> {
    /** 消息唯一标识 */
    id: string;
    /** 消息类型 */
    type: MessageType;
    /** 消息内容 */
    content: T;
    /** 发送时间 */
    timestamp: Date;
    /** 发送方 Peer ID */
    from: string;
    /** 接收方 Peer ID (可选，广播消息无此字段) */
    to?: string;
    /** 消息元数据 */
    metadata?: Record<string, any>;
    /** 消息优先级 */
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    /** 是否需要确认 */
    requiresAck?: boolean;
    /** 确认状态 */
    ackStatus?: 'pending' | 'delivered' | 'read' | 'failed';
  }

  /**
   * 文件消息内容
   */
  interface FileContent {
    /** 文件名 */
    name: string;
    /** 文件大小 (字节) */
    size: number;
    /** MIME 类型 */
    type: string;
    /** 文件数据 (Base64 编码) */
    data: string;
    /** 文件 Hash */
    hash?: string;
    /** 传输进度 */
    progress?: number;
  }

  /**
   * 媒体流配置
   */
  interface MediaConfig {
    /** 是否启用视频 */
    video?: boolean | MediaTrackConstraints;
    /** 是否启用音频 */
    audio?: boolean | MediaTrackConstraints;
    /** 视频质量配置 */
    videoQuality?: 'low' | 'medium' | 'high' | 'hd';
    /** 音频质量配置 */
    audioQuality?: 'low' | 'medium' | 'high';
  }

  /**
   * 通话状态
   */
  type CallStatus = 'idle' | 'calling' | 'ringing' | 'connected' | 'ended' | 'failed';

  /**
   * 通话信息
   */
  interface Call {
    /** 通话 ID */
    id: string;
    /** 对方 Peer ID */
    peerId: string;
    /** 通话状态 */
    status: CallStatus;
    /** 是否为发起方 */
    isInitiator: boolean;
    /** 开始时间 */
    startTime?: Date;
    /** 结束时间 */
    endTime?: Date;
    /** 通话时长 (秒) */
    duration?: number;
    /** 本地媒体流 */
    localStream?: MediaStream;
    /** 远程媒体流 */
    remoteStream?: MediaStream;
    /** 媒体配置 */
    mediaConfig?: MediaConfig;
  }

  /**
   * Peer 状态
   */
  type PeerStatus = 'idle' | 'initializing' | 'ready' | 'connecting' | 'error' | 'closed';

  /**
   * Peer 完整状态
   */
  interface State {
    /** 是否已初始化 */
    isInitialized: boolean;
    /** 当前 Peer ID */
    peerId: string | null;
    /** Peer 状态 */
    status: PeerStatus;
    /** 是否正在连接 */
    isConnecting: boolean;
    /** 连接列表 */
    connections: Map<string, Connection>;
    /** 消息历史 */
    messages: Message[];
    /** 错误列表 */
    errors: string[];
    /** 当前通话 */
    currentCall?: Call;
    /** 网络统计 */
    stats?: {
      /** 总连接数 */
      totalConnections: number;
      /** 活跃连接数 */
      activeConnections: number;
      /** 发送消息数 */
      messagesSent: number;
      /** 接收消息数 */
      messagesReceived: number;
      /** 数据传输量 (字节) */
      bytesTransferred: number;
    };
  }

  /**
   * Hook 配置选项
   */
  interface HookOptions {
    /** PeerJS 配置 */
    config?: Config;
    /** 是否自动连接 */
    autoConnect?: boolean;
    /** 是否启用数据通道 */
    enableDataChannels?: boolean;
    /** 是否启用媒体流 */
    enableMediaStreams?: boolean;
    /** 是否启用调试模式 */
    debug?: boolean;
    /** 心跳间隔 (毫秒) */
    heartbeatInterval?: number;
    /** 连接超时时间 (毫秒) */
    connectionTimeout?: number;
    /** 最大重连次数 */
    maxReconnectAttempts?: number;
    /** 重连间隔 (毫秒) */
    reconnectInterval?: number;
    /** 消息历史限制 */
    messageHistoryLimit?: number;
  }

  /**
   * 事件类型
   */
  type EventType = 
    | 'peer:open'           // Peer 初始化完成
    | 'peer:close'          // Peer 关闭
    | 'peer:error'          // Peer 错误
    | 'connection:open'     // 连接建立
    | 'connection:close'    // 连接关闭
    | 'connection:error'    // 连接错误
    | 'message:received'    // 消息接收
    | 'message:sent'        // 消息发送
    | 'file:progress'       // 文件传输进度
    | 'file:complete'       // 文件传输完成
    | 'call:incoming'       // 来电
    | 'call:answered'       // 通话接听
    | 'call:ended'          // 通话结束
    | 'stream:added'        // 媒体流添加
    | 'stream:removed';     // 媒体流移除

  /**
   * 事件数据
   */
  interface EventData<T = any> {
    /** 事件类型 */
    type: EventType;
    /** 事件数据 */
    data: T;
    /** 事件时间 */
    timestamp: Date;
    /** 相关 Peer ID */
    peerId?: string;
  }

  /**
   * 事件监听器
   */
  type EventListener<T = any> = (event: EventData<T>) => void;

  /**
   * Hook 返回值接口
   */
  interface HookReturn {
    /** 当前状态 */
    state: State;
    
    // === 连接管理 ===
    /** 初始化 Peer */
    initialize: (customId?: string) => Promise<void>;
    /** 连接到指定 Peer */
    connect: (targetPeerId: string, metadata?: Record<string, any>) => Promise<void>;
    /** 断开连接 */
    disconnect: (peerId?: string) => void;
    /** 清理资源 */
    cleanup: () => void;
    
    // === 消息功能 ===
    /** 发送消息 */
    sendMessage: <T = any>(peerId: string, content: T, type?: MessageType, options?: {
      priority?: Message['priority'];
      requiresAck?: boolean;
      metadata?: Record<string, any>;
    }) => Promise<void>;
    /** 广播消息 */
    broadcastMessage: <T = any>(content: T, type?: MessageType) => Promise<void>;
    /** 发送确认 */
    sendAck: (messageId: string, peerId: string, status: Message['ackStatus']) => void;
    
    // === 文件传输 ===
    /** 发送文件 */
    sendFile: (peerId: string, file: File | Blob, onProgress?: (progress: number) => void) => Promise<void>;
    
    // === 媒体流 ===
    /** 发起通话 */
    startCall: (peerId: string, mediaConfig?: MediaConfig) => Promise<void>;
    /** 接听通话 */
    answerCall: (mediaConfig?: MediaConfig) => Promise<void>;
    /** 拒绝通话 */
    rejectCall: () => void;
    /** 结束通话 */
    endCall: () => void;
    /** 切换媒体状态 */
    toggleMedia: (type: 'audio' | 'video', enabled?: boolean) => void;
    
    // === 事件系统 ===
    /** 添加事件监听器 */
    on: <T = any>(eventType: EventType, listener: EventListener<T>) => void;
    /** 移除事件监听器 */
    off: <T = any>(eventType: EventType, listener: EventListener<T>) => void;
    /** 触发事件 */
    emit: <T = any>(eventType: EventType, data: T, peerId?: string) => void;
    
    // === 工具方法 ===
    /** 获取连接状态 */
    getConnectionStatus: (peerId: string) => ConnectionStatus | null;
    /** 检查是否已连接 */
    isConnectedTo: (peerId: string) => boolean;
    /** 获取已连接的 Peer 列表 */
    getConnectedPeers: () => string[];
    /** 获取连接延迟 */
    getLatency: (peerId: string) => number | null;
    /** 清空消息历史 */
    clearMessages: () => void;
    /** 清空错误列表 */
    clearErrors: () => void;
    /** 获取网络统计 */
    getStats: () => State['stats'];
  }

  /**
   * 错误类型
   */
  interface PeerError {
    /** 错误代码 */
    code: string;
    /** 错误消息 */
    message: string;
    /** 错误类型 */
    type: 'network' | 'peer' | 'media' | 'permission' | 'unknown';
    /** 相关 Peer ID */
    peerId?: string;
    /** 错误时间 */
    timestamp: Date;
    /** 原始错误对象 */
    originalError?: any;
  }

  /**
   * 数据同步接口
   */
  interface SyncData<T = any> {
    /** 数据类型 */
    type: string;
    /** 数据版本 */
    version: number;
    /** 数据内容 */
    data: T;
    /** 同步时间 */
    timestamp: Date;
    /** 数据 Hash */
    hash: string;
  }

  /**
   * 任务协作接口
   */
  interface TaskSync {
    /** 任务 ID */
    taskId: string;
    /** 操作类型 */
    action: 'create' | 'update' | 'delete' | 'complete';
    /** 任务数据 */
    taskData: any;
    /** 操作者 ID */
    userId: string;
    /** 操作时间 */
    timestamp: Date;
  }
}

// 导出命名空间
export = SeekSelf.Utils.Peer;
export as namespace SeekSelfUtilsPeer;
