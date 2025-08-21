// 第三方模块类型声明

declare module 'react-native-peerjs' {
  export default class Peer {
    constructor(id?: string, options?: any);
    connect(id: string, options?: any): any;
    call(id: string, stream: MediaStream): any;
    on(event: string, callback: (...args: any[]) => void): void;
    destroy(): void;
    id: string;
  }
}

declare module 'peerjs' {
  export default class Peer {
    constructor(id?: string, options?: any);
    connect(id: string, options?: any): any;
    call(id: string, stream: MediaStream): any;
    on(event: string, callback: (...args: any[]) => void): void;
    destroy(): void;
    id: string;
  }
}
