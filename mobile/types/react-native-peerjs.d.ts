declare module 'react-native-peerjs' {
  class Peer {
    constructor(id?: string, options?: any);
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
  export default Peer;
}