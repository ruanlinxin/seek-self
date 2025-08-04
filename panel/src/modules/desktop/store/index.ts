import {defineStore} from 'pinia';
import {store} from '@/store';
import {ModalConfig} from "@arco-design/web-vue/es/modal/interface";

const useToolsModal = () => {
    const modalProps = reactive<ModalConfig & { visible: boolean }>({
        content: '',
        title: '工具包',
        closable: false,
        footer: null,
        simple: true,
        width: 'calc(100vw - 200px)',
        visible: false,
    })
    const modalRef = ref()
    const setRef = (ref: unknown) => {
        modalRef.value = ref
    }
    const open = () => {
        modalProps.visible = true
    }
    const close = () => {
        modalProps.visible = false
    }
    return {
        modalRef,
        modalProps,
        setRef,
        open,
        close,
    }
}


export const useDesktopStore = defineStore('desktop', () => {
    const toolsModal = useToolsModal();
    return {
        toolsModal,
    }
})

export const getDesktopStore = () => {
    return useDesktopStore(store);
}
