import { defineStore } from 'pinia'

import { getConfig } from '@/api/app'
import { normalizeImageUrl } from '@/utils/util'

// 需要规范化地址的图片字段（后端返回 https 域名不可用，统一转站内路径走本地代理）
const IMAGE_KEYS = [
    'web_favicon',
    'web_logo',
    'login_image',
    'h5_favicon',
    'shop_logo',
    'pc_logo',
    'pc_ico'
]

interface AppSate {
    config: Record<string, any>
    isMobile: boolean
    isCollapsed: boolean
    isRouteShow: boolean
}

const useAppStore = defineStore({
    id: 'app',
    state: (): AppSate => {
        return {
            config: {},
            isMobile: true,
            isCollapsed: false,
            isRouteShow: true
        }
    },
    actions: {
        getImageUrl(url: string) {
            if (!url) return url
            // 后端上传目录统一走站内路径，规避 https 域名不可用
            const normalized = normalizeImageUrl(url)
            if (normalized !== url) return normalized
            return url.indexOf('http') ? `${this.config.oss_domain}${url}` : url
        },
        getConfig() {
            return new Promise((resolve, reject) => {
                getConfig()
                    .then((data) => {
                        // 图片字段规范化，保证登录页广告图、favicon、logo 等能正常加载
                        IMAGE_KEYS.forEach((key) => {
                            if (data?.[key]) {
                                data[key] = normalizeImageUrl(data[key])
                            }
                        })
                        this.config = data
                        resolve(data)
                    })
                    .catch((err) => {
                        reject(err)
                    })
            })
        },
        setMobile(value: boolean) {
            this.isMobile = value
        },
        toggleCollapsed(toggle?: boolean) {
            this.isCollapsed = toggle ?? !this.isCollapsed
        },
        refreshView() {
            this.isRouteShow = false
            nextTick(() => {
                this.isRouteShow = true
            })
        }
    }
})

export default useAppStore
