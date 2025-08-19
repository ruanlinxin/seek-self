import {createPinia} from 'pinia';

const store = createPinia();

export * from '@/modules/basic/store';
export * from '@/modules/widgets/store'
export * from '@/modules/user/store'
export * from '@/modules/app/store'
export * from '@/modules/desktop/store'


export {store};
export default store;

export const usePersistedState = (_name: string) => {
    const name = `store-${_name}`
    const getState = () => {
        try {
            return JSON.parse(localStorage.getItem(name))
        } catch (e) {
            return {}
        }
    }
    const syncState = (data: Record<string, any>) => {
        return localStorage.setItem(name, JSON.stringify(data))
    }
    return {
        getState,
        syncState
    }
}
