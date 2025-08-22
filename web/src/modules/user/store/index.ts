import {defineStore} from 'pinia';
import {token} from '@seek-self/utils'
import {store} from '@/store';
import {getUserProfile, type UserProfile} from '@seek-self/api/src/user'
import {Gender} from '@seek-self/types/src/modules/user'

export const defaultProfile = (): UserProfile => ({
    userId: '',
    nickname: '',
    avatar: '',
    gender: Gender.UNKNOWN,
    birth: undefined,
    bio: ''
})
export const useUserStore = defineStore('user', () => {
    const curToken = ref()
    const profile = ref(defaultProfile())
    watchEffect(() => {
        const t = curToken.value
        if (t) {
            getUserProfile().then(res => {
                if (res.data.profile) {
                    profile.value = res.data.profile
                }
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
