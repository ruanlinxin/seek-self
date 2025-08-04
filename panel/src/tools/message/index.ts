import {Message} from '@arco-design/web-vue';

export default {
    error(text: string) {
        return Message.error(text)
    },
    success(text: string) {
        return Message.success(text)
    },
}
