import { ApiResponse } from '@seek-self/types';
export * from './request'
export * from './token'
// 仅导出核心 PeerJS 功能和 React Hook，避免 Vue 依赖问题
export { 
  PeerManager, 
  useReactPeer,
  type PeerConfig,
  type PeerConnection,
  type PeerMessage,
  type PeerState,
  type PeerOptions,
  type ConnectionStatus,
  type MessageType,
  type EventType,
  type EventListener
} from './use-peer'

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}


export function createApiResponse<T>(
  success: boolean,
  data?: T,
  error?: string,
  message?: string
): ApiResponse<T> {
  const response: ApiResponse<T> = {
    success
  };

  if (data !== undefined) {
    response.data = data;
  }

  if (error !== undefined) {
    response.error = error;
  }

  if (message !== undefined) {
    response.message = message;
  }

  return response;
}

export function calculatePagination(
  total: number,
  page: number,
  limit: number
): {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  offset: number;
} {
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;

  return {
    page,
    limit,
    total,
    totalPages,
    offset
  };
}
