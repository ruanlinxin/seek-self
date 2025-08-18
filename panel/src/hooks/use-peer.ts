import Peerjs from 'peerjs'

interface Options {
    onOpen?(id: string): void
    onError?(error: any): void
    onDisconnected?(): void
}

export default function usePeer(options?: Options) {
    const res = new Peerjs('',{
        debug: 2, // 启用调试日志
        host: "seek-self.leyuwangyou.fun",
        path: '/peerjs',
        // host: "localhost",
        // port:10000,
        // path: '/peerjs',
    })

    res.on('open', function (id) {
        console.log('My peer ID is: ' + id);
        options?.onOpen?.(id)
    });

    res.on('error', function (error) {
        console.error('Peer connection error:', error);
        options?.onError?.(error);
    });

    res.on('disconnected', function () {
        console.log('Peer disconnected, attempting to reconnect...');
        options?.onDisconnected?.();
        // 尝试重连
        res.reconnect();
    });

    res.on('close', function () {
        console.log('Peer connection closed');
    });

    return res
}
