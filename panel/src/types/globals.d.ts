// Vue
declare module '*.vue' {
    import {DefineComponent} from 'vue';

    const component: DefineComponent<{}, {}, any>;
    export default component;
}

declare type ClassName = { [className: string]: any } | ClassName[] | string;

declare module '*.svg' {
    const CONTENT: string;
    export default CONTENT;
}

declare type Recordable<T = any> = Record<string, T>;


declare interface Fn<T = any, R = T> {
    (...arg: T[]): R;
}

declare interface PromiseFn<T = any, R = T> {
    (...arg: T[]): Promise<R>;
}

declare type Result<T = any> = Promise<{
    code: number;
    timestamp: number;
    message: string;
    data: T;
}>
