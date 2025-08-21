import type { SeekSelf } from '@seek-self/types';
import { createLogger, logger } from '../logger';

// 类型别名，使用统一的类型定义
export type PeerConfig = SeekSelf.Utils.Peer.Config;
export type PeerConnection = SeekSelf.Utils.Peer.Connection;
export type PeerMessage<T = any> = SeekSelf.Utils.Peer.Message<T>;
export type PeerState = SeekSelf.Utils.Peer.State;
export type PeerOptions = SeekSelf.Utils.Peer.HookOptions;
export type ConnectionStatus = SeekSelf.Utils.Peer.ConnectionStatus;
export type MessageType = SeekSelf.Utils.Peer.MessageType;
export type EventType = SeekSelf.Utils.Peer.EventType;
export type EventListener<T = any> = SeekSelf.Utils.Peer.EventListener<T>;

// Peer实例接口
export interface PeerInstance {
  id?: string;
  open: boolean;
  destroyed: boolean;
  disconnected: boolean;
  on(event: string, handler: (...args: any[]) => void): void;
  off(event: string, handler: (...args: any[]) => void): void;
  connect(peerId: string, options?: any): any;
  call(peerId: string, stream: MediaStream): any;
  destroy(): void;
  disconnect(): void;
  reconnect(): void;
}

/**
 * 事件发射器 - 框架无关的事件系统
 */
class EventEmitter<T = any> {
  private listeners: Map<string, EventListener<T>[]> = new Map();

  on(event: string, listener: EventListener<T>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  off(event: string, listener: EventListener<T>): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(listener);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  emit(event: string, data: T): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener({
            type: event as EventType,
            data,
            timestamp: new Date()
          });
        } catch (error) {
          // 使用全局logger，因为这里无法访问实例logger
          logger.error(`Error in event listener for ${event}: ${error}`);
        }
      });
    }
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

/**
 * 框架无关的 PeerJS 管理类
 * 支持 Web、React Native 和桌面应用之间的 P2P 通信
 */
export class PeerManager extends EventEmitter {
  private peer: PeerInstance | null = null;
  private mediaStream: MediaStream | null = null;
  private currentCall: any = null;
  private options: PeerOptions;
  private state: PeerState;
  private logger = createLogger('PeerManager');
  private PeerClass: any = null;

  constructor(PeerClass: any, options: PeerOptions = {}) {
    super();
    this.PeerClass = PeerClass;
    this.options = {
      config: {},
      autoConnect: false,
      enableDataChannels: true,
      enableMediaStreams: false,
      debug: false,
      heartbeatInterval: 30000,
      connectionTimeout: 10000,
      maxReconnectAttempts: 3,
      reconnectInterval: 5000,
      messageHistoryLimit: 1000,
      ...options
    };

    this.state = {
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
    };

    if (this.options.autoConnect) {
      this.initialize();
    }
  }

  /**
   * 静态工厂方法 - 用于创建带有Peer类的实例
   */
  static async create(options: PeerOptions = {}): Promise<PeerManager> {
    // 这个方法现在只提供向后兼容性
    // 实际使用中应该传入具体的Peer类
    throw new Error('请使用构造函数并传入Peer类: new PeerManager(PeerClass, options)');
  }

  /**
   * 获取当前状态
   */
  getState(): PeerState {
    return { ...this.state };
  }

  /**
   * 日志工具
   */
  private log(...args: any[]): void {
    if (this.options.debug) {
      this.logger.debug(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '));
    }
  }

  /**
   * 添加错误
   */
  private addError(error: string): void {
    this.state.errors.push(error);
    this.logger.error(error);
    this.emit('peer:error', { message: error, timestamp: new Date() });
  }

  /**
   * 验证Peer类是否有效
   */
  private validatePeerClass(): void {
    if (!this.PeerClass) {
      throw new Error('未提供Peer类，请在构造函数中传入Peer类');
    }
    
    // 基本验证Peer类是否是构造函数
    if (typeof this.PeerClass !== 'function') {
      throw new Error('提供的Peer类必须是构造函数');
    }
  }

  /**
   * 初始化 Peer 连接
   */
  async initialize(customId?: string): Promise<void> {
    if (this.state.isInitialized) {
      this.log('Peer 已经初始化');
      return;
    }

    this.state.status = 'initializing';
    this.emit('peer:initializing', null);

    try {
      // 验证Peer类
      this.validatePeerClass();

      const defaultConfig: PeerConfig = {
        debug: this.options.debug ? 2 : 0,
        host: "seek-self.leyuwangyou.fun",
        path: '/peerjs',
        secure: true,
        ...this.options.config
      };

      this.log('使用配置初始化:', defaultConfig);

      // 创建 Peer 实例
      this.peer = new this.PeerClass(customId || undefined, defaultConfig);
      this.setupPeerEvents();

    } catch (error) {
      const errorMsg = `初始化 peer 失败: ${error}`;
      this.addError(errorMsg);
      this.state.status = 'error';
    }
  }

  /**
   * 设置 Peer 事件监听
   */
  private setupPeerEvents(): void {
    if (!this.peer) return;

    this.peer.on('open', (id: string) => {
      this.log('Peer 已打开，ID:', id);
      this.state.isInitialized = true;
      this.state.peerId = id;
      this.state.status = 'ready';
      this.emit('peer:open', { peerId: id });
    });

    this.peer.on('error', (error: any) => {
      const errorMsg = `Peer 错误: ${error.message || error}`;
      this.addError(errorMsg);
      this.state.status = 'error';
    });

    this.peer.on('disconnected', () => {
      this.log('Peer 已断开连接');
      this.state.status = 'error';
      this.emit('peer:disconnected', null);
    });

    this.peer.on('close', () => {
      this.log('Peer 连接已关闭');
      this.state.isInitialized = false;
      this.state.peerId = null;
      this.state.status = 'idle';
      this.emit('peer:close', null);
    });

    // 监听传入连接
    if (this.options.enableDataChannels) {
      this.peer.on('connection', (conn: any) => {
        this.handleIncomingConnection(conn);
      });
    }

    // 监听传入通话
    if (this.options.enableMediaStreams) {
      this.peer.on('call', (call: any) => {
        this.handleIncomingCall(call);
      });
    }
  }

  /**
   * 处理传入连接
   */
  private handleIncomingConnection(conn: any): void {
    this.log('来自以下设备的连接:', conn.peer);
    this.setupConnectionEvents(conn);
    this.emit('connection:incoming', { peerId: conn.peer, connection: conn });
  }

  /**
   * 设置连接事件
   */
  private setupConnectionEvents(conn: any): void {
    conn.on('open', () => {
      this.log('与以下设备建立连接:', conn.peer);
      const connection: PeerConnection = {
        id: conn.peer,
        connection: conn,
        status: 'connected',
        connectedAt: new Date(),
        lastSeen: new Date()
      };

      this.state.connections.set(conn.peer, connection);
      this.state.stats!.activeConnections = this.getConnectedPeers().length;
      this.emit('connection:open', { peerId: conn.peer, connection });
    });

    conn.on('data', (data: any) => {
      this.handleReceivedMessage(conn.peer, data);
    });

    conn.on('close', () => {
      this.log('与以下设备断开连接:', conn.peer);
      this.state.connections.delete(conn.peer);
      this.state.stats!.activeConnections = this.getConnectedPeers().length;
      this.emit('connection:close', { peerId: conn.peer });
    });

    conn.on('error', (error: any) => {
      this.addError(`与 ${conn.peer} 连接出错: ${error}`);
      this.emit('connection:error', { peerId: conn.peer, error });
    });
  }

  /**
   * 处理传入通话
   */
  private handleIncomingCall(call: any): void {
    this.log('来自以下设备的通话:', call.peer);
    this.currentCall = call;
    this.emit('call:incoming', { peerId: call.peer, call });
  }

  /**
   * 处理接收到的消息
   */
  private handleReceivedMessage(fromPeerId: string, data: any): void {
    const message: PeerMessage = {
      id: Date.now().toString(),
      type: data.type || 'custom',
      content: data.content || data,
      timestamp: new Date(),
      from: fromPeerId
    };

    this.log('收到消息:', message);
    this.state.messages.push(message);
    this.state.stats!.messagesReceived++;

    // 限制消息历史长度
    if (this.state.messages.length > (this.options.messageHistoryLimit || 1000)) {
      this.state.messages.shift();
    }

    this.emit('message:received', message);
  }

  /**
   * 连接到指定 Peer
   */
  async connect(targetPeerId: string, metadata?: Record<string, any>): Promise<void> {
    if (!this.peer || !this.state.isInitialized) {
      throw new Error('Peer 未初始化');
    }

    if (this.state.connections.has(targetPeerId)) {
      this.log('已连接到:', targetPeerId);
      return;
    }

    this.state.isConnecting = true;
    this.emit('connection:connecting', { peerId: targetPeerId });

    try {
      this.log('正在连接到:', targetPeerId);
      const conn = this.peer.connect(targetPeerId, { metadata });

      const connection: PeerConnection = {
        id: targetPeerId,
        connection: conn,
        status: 'connecting',
        metadata
      };

      this.state.connections.set(targetPeerId, connection);
      this.state.stats!.totalConnections++;

      this.setupConnectionEvents(conn);

      // 连接超时处理
      const timeout = setTimeout(() => {
        if (this.state.connections.get(targetPeerId)?.status === 'connecting') {
          this.addError(`与 ${targetPeerId} 连接超时`);
          this.disconnect(targetPeerId);
        }
      }, this.options.connectionTimeout);

      conn.on('open', () => {
        clearTimeout(timeout);
        this.state.isConnecting = false;
        this.state.connections.set(targetPeerId, {
          ...connection,
          status: 'connected',
          connectedAt: new Date(),
          lastSeen: new Date()
        });
      });

    } catch (error) {
      this.state.isConnecting = false;
      throw new Error(`连接到 ${targetPeerId} 失败: ${error}`);
    }
  }

  /**
   * 断开连接
   */
  disconnect(peerId?: string): void {
    if (peerId) {
      const connection = this.state.connections.get(peerId);
      if (connection?.connection) {
        connection.connection.close();
      }
      this.state.connections.delete(peerId);
    } else {
      // 断开所有连接
      this.state.connections.forEach((conn: PeerConnection) => {
        conn.connection?.close();
      });
      this.state.connections.clear();
    }
    this.state.stats!.activeConnections = this.getConnectedPeers().length;
  }

  /**
   * 发送消息
   */
  async sendMessage<T = any>(
    peerId: string,
    content: T,
    type: MessageType = 'custom',
    options: {
      priority?: SeekSelf.Utils.Peer.Message['priority'];
      requiresAck?: boolean;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<void> {
    const connection = this.state.connections.get(peerId);
    if (!connection || connection.status !== 'connected') {
      throw new Error(`没有到 ${peerId} 的活动连接`);
    }

    const messageData = {
      type,
      content,
      timestamp: new Date().toISOString(),
      ...options
    };

    try {
      connection.connection.send(messageData);
      this.log('消息已发送到:', peerId, messageData);

      // 添加到消息历史
      const outgoingMessage: PeerMessage<T> = {
        id: Date.now().toString(),
        type,
        content,
        timestamp: new Date(),
        from: this.state.peerId || 'me',
        to: peerId,
        ...options
      };

      this.state.messages.push(outgoingMessage);
      this.state.stats!.messagesSent++;
      this.emit('message:sent', outgoingMessage);
    } catch (error) {
      throw new Error(`发送消息到 ${peerId} 失败: ${error}`);
    }
  }

  /**
   * 广播消息
   */
  async broadcastMessage<T = any>(content: T, type: MessageType = 'custom'): Promise<void> {
    const connectedPeers = this.getConnectedPeers();
    const promises = connectedPeers.map(peerId =>
      this.sendMessage(peerId, content, type)
    );
    await Promise.all(promises);
  }

  /**
   * 发送文件
   */
  async sendFile(peerId: string, file: File | Blob, onProgress?: (progress: number) => void): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const fileData: SeekSelf.Utils.Peer.FileContent = {
            name: 'name' in file ? file.name : 'unknown',
            size: file.size,
            type: file.type,
            data: reader.result as string
          };

          await this.sendMessage(peerId, fileData, 'file');
          onProgress?.(100);
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  /**
   * 发起通话
   */
  async startCall(peerId: string, mediaConfig?: SeekSelf.Utils.Peer.MediaConfig): Promise<void> {
    if (!this.options.enableMediaStreams) {
      throw new Error('媒体流未启用');
    }

    if (!this.peer) {
      throw new Error('Peer 未初始化');
    }

    try {
      const constraints = {
        video: mediaConfig?.video || true,
        audio: mediaConfig?.audio || true
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.mediaStream = stream;

      const call = this.peer.call(peerId, stream);
      this.currentCall = call;

      call.on('stream', (remoteStream: MediaStream) => {
        this.log('通话中收到远程流');
        this.emit('stream:added', { peerId, stream: remoteStream });
      });

      call.on('close', () => {
        this.log('通话已结束');
        this.currentCall = null;
        this.emit('call:ended', { peerId });
      });

      this.emit('call:started', { peerId, call });
    } catch (error) {
      throw new Error(`发起通话失败: ${error}`);
    }
  }

  /**
   * 接听通话
   */
  async answerCall(mediaConfig?: SeekSelf.Utils.Peer.MediaConfig): Promise<void> {
    if (!this.currentCall) {
      throw new Error('没有来电可接听');
    }

    try {
      const constraints = {
        video: mediaConfig?.video || true,
        audio: mediaConfig?.audio || true
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.mediaStream = stream;
      this.currentCall.answer(stream);
      this.emit('call:answered', { call: this.currentCall });
    } catch (error) {
      throw new Error(`接听通话失败: ${error}`);
    }
  }

  /**
   * 拒绝通话
   */
  rejectCall(): void {
    if (this.currentCall) {
      this.currentCall.close();
      this.currentCall = null;
      this.emit('call:rejected', null);
    }
  }

  /**
   * 结束通话
   */
  endCall(): void {
    if (this.currentCall) {
      this.currentCall.close();
      this.currentCall = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    this.emit('call:ended', null);
  }

  /**
   * 切换媒体状态
   */
  toggleMedia(type: 'audio' | 'video', enabled?: boolean): void {
    if (!this.mediaStream) return;

    const tracks = type === 'audio'
      ? this.mediaStream.getAudioTracks()
      : this.mediaStream.getVideoTracks();

    tracks.forEach(track => {
      track.enabled = enabled !== undefined ? enabled : !track.enabled;
    });

    this.emit('media:toggled', { type, enabled: tracks[0]?.enabled });
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    this.log('正在清理 peer 连接');

    // 关闭所有连接
    this.state.connections.forEach((conn: PeerConnection) => {
      conn.connection?.close();
    });

    // 结束通话
    this.endCall();

    // 关闭 Peer
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }

    // 重置状态
    this.state = {
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
    };

    this.removeAllListeners();
    this.emit('peer:cleanup', null);
  }

  // === 工具方法 ===

  getConnectionStatus(peerId: string): ConnectionStatus | null {
    return this.state.connections.get(peerId)?.status || null;
  }

  isConnectedTo(peerId: string): boolean {
    return this.state.connections.get(peerId)?.status === 'connected';
  }

  getConnectedPeers(): string[] {
    const connections = Array.from(this.state.connections.entries()) as [string, PeerConnection][];
    return connections
      .filter(([_, conn]) => conn.status === 'connected')
      .map(([peerId]) => peerId);
  }

  getLatency(_peerId: string): number | null {
    // 这里可以实现 ping 测试来获取延迟
    return null;
  }

  clearMessages(): void {
    this.state.messages = [];
  }

  clearErrors(): void {
    this.state.errors = [];
  }

  getStats(): PeerState['stats'] {
    return { ...this.state.stats };
  }
}
