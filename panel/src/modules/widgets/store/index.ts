import {defineStore} from 'pinia';
import {store} from '@/store';

export const useWidgetsStore = defineStore('widgets', () => {

    return {}
})

export const getWidgetsStore = () => {
    return useWidgetsStore(store);
}
