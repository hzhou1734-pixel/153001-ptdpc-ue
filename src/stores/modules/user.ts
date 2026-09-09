import { defineStore } from 'pinia'
import type { RouteRecordRaw } from 'vue-router'

import { getUserInfo, login, logout } from '@/api/user'
import { GHJ_MENU, GHJ_MENU_OVERRIDE_PATHS } from '@/config/ghjMenu'
import { TOKEN_KEY } from '@/enums/cacheEnums'
import { PageEnum } from '@/enums/pageEnum'
import router, { filterAsyncRoutes } from '@/router'
import { clearAuthInfo, getToken } from '@/utils/auth'
import cache from '@/utils/cache'

export interface UserState {
    token: string
    userInfo: Record<string, any>
    routes: RouteRecordRaw[]
    perms: string[]
}

const useUserStore = defineStore({
    id: 'user',
    state: (): UserState => ({
        token: getToken() || '',
        // 用户信息
        userInfo: {},
        // 路由
        routes: [],
        // 权限
        perms: []
    }),
    getters: {},
    actions: {
        resetState() {
            this.token = ''
            this.userInfo = {}
            this.perms = []
        },
        login(playload: any) {
            const { account, password } = playload
            return new Promise((resolve, reject) => {
                login({
                    account: account.trim(),
                    password: password
                })
                    .then((data) => {
                        this.token = data.token
                        cache.set(TOKEN_KEY, data.token)
                        resolve(data)
                    })
                    .catch((error) => {
                        reject(error)
                    })
            })
        },
        logout() {
            return new Promise((resolve, reject) => {
                logout()
                    .then(async (data) => {
                        this.token = ''
                        await router.push(PageEnum.LOGIN)
                        clearAuthInfo()
                        resolve(data)
                    })
                    .catch((error) => {
                        reject(error)
                    })
            })
        },
        getUserInfo() {
            return new Promise((resolve, reject) => {
                getUserInfo()
                    .then((data) => {
                        this.userInfo = data.user
                        this.perms = data.permissions
                        // 平台端业务菜单：过滤掉已被本地菜单替代/系统不存在的后端菜单，再合并本地顾好家菜单
                        const backendMenu = (data.menu || [])
                            .filter(
                                (item: any) =>
                                    !GHJ_MENU_OVERRIDE_PATHS.includes(item.paths) &&
                                    item.name !== '充值设置'
                            )
                            // 兜底：剔除挂在保留目录下名为「充值设置」的子菜单
                            .map((item: any) => {
                                if (item.children?.length) {
                                    item.children = item.children.filter(
                                        (child: any) => child.name !== '充值设置'
                                    )
                                }
                                return item
                            })
                            .filter((item: any) => item.type !== 'M' || item.children?.length)
                        // 本地菜单在前，保证登录后默认落地页恒为「数据台」
                        this.routes = filterAsyncRoutes([...GHJ_MENU, ...backendMenu])
                        resolve(data)
                    })
                    .catch((error) => {
                        reject(error)
                    })
            })
        }
    }
})

export default useUserStore
