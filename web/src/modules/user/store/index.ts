import {defineStore} from 'pinia';
import {token} from '@seek-self/utils'
import {store} from '@/store';
import {getUserInfo} from "@/modules/user/api";

export const defaultProfile = () => ({
    userId: '',
    nickname: '',
    avatar: '',
    gender: 0,
    birth: '',
    bio: ''
})
export const useUserStore = defineStore('user', () => {
    const curToken = ref()
    const profile = ref(defaultProfile())
    watchEffect(() => {
        const t = curToken.value
        if (t) {
            getUserInfo().then(res => {
                profile.value = res.data.profile as typeof profile.value
            }).catch(() => {
                token.remove()
                curToken.value = null
                profile.value = defaultProfile()
            })
        } else {
            profile.value = defaultProfile()
        }
    })
    const info = reactive({
        // 生日 年-月-日
        birth: '1996-06-12',
        // 性别 0 女 1 男
        sex: 1,
    })
    const setToken = (t: string) => {
        token.set(t)
        curToken.value = t
    }
    const logout = () => {
        token.remove()
        curToken.value = null
        profile.value = defaultProfile()
    }
    const startToken = token.get()
    if (startToken) {
        curToken.value = startToken
    }
    return {
        token: curToken,
        info,
        profile,
        setToken,
        logout,
    }
})

export const getUserStore = () => {
    return useUserStore(store);
}
