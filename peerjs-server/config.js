module.exports = {
  // 服务器配置
  port: parseInt(process.env.PEERJS_PORT) || 9000,
  host: '0.0.0.0',
  
  // 安全配置
  key: process.env.PEERJS_KEY || 'seek-self-peerjs-key',
  allow_discovery: process.env.PEERJS_ALLOW_DISCOVERY === 'true',
  
  // 连接配置
  concurrent_limit: parseInt(process.env.PEERJS_CONCURRENT_LIMIT) || 5000,
  alive_timeout: parseInt(process.env.PEERJS_ALIVE_TIMEOUT) || 60000,
  
  // 代理和 S2S 配置
  proxied: process.env.PEERJS_PROXY === 'true',
  s2s: process.env.PEERJS_S2S === 'true',
  
  // 调试配置
  debug: process.env.PEERJS_DEBUG === 'true',
  
  // 日志配置
  log_level: process.env.PEERJS_LOG_LEVEL || 'info',
  
  // 跨域配置
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  
  // 心跳配置
  heartbeat_interval: 25000,
  heartbeat_timeout: 5000,
  
  // 清理配置
  cleanup_interval: 60000,
  cleanup_timeout: 30000
}
