export default {
    LoginRegister: () => import('@/desktop/side/avatar/login-register.vue'),
    UserProfile: () => import('@/desktop/side/avatar/user-profile.vue'),
    AppManager: () => import('./app-manage/index.vue'),
    DataDictionary: () => import('./data-dictionary/index.vue'),
    P2P: () => import('./p2p/index.vue'),
    RandomChar: () => import('./random-char/index.vue'),
    Questionnaire: () => import('./questionnaire/index.vue'),
}
