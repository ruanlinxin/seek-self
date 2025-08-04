export class ResponseDto<T> {
  code: number;
  message: string;
  data: T;
  timestamp: number;

  constructor(code: number, message: string, data: T) {
    this.code = code;
    this.message = message;
    this.data = data;
    this.timestamp = Date.now();
  }

  static success<T>(data: T, message = '操作成功'): ResponseDto<T> {
    return new ResponseDto<T>(200, message, data);
  }

  static error<T>(message = '操作失败', code = 500, data?: T): ResponseDto<T> {
    return new ResponseDto<T>(code, message, data);
  }
} 