export type Recordable<T = any> = Record<string, T>;

export interface Fn<T = any, R = T> {
    (...arg: T[]): R;
}

export interface PromiseFn<T = any, R = T> {
    (...arg: T[]): Promise<R>;
}

export type Result<T = any> = Promise<{
    code: number;
    timestamp: number;
    message: string;
    data: T;
}>
