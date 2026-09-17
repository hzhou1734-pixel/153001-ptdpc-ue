<template>
    <div class="login flex flex-col">
        <div class="flex-1 flex items-center justify-center">
            <div class="login-card flex rounded-md overflow-hidden">
                <div class="flex-1 h-full hidden md:inline-block">
                    <image-contain :src="loginImage" :width="400" height="100%" />
                </div>
                <div
                    class="login-form bg-body flex flex-col justify-center px-10 py-10 md:w-[400px] w-[375px] flex-none mx-auto"
                >
                    <div class="text-center text-3xl font-medium mb-8">{{ config.web_name }}</div>
                    <el-form ref="formRef" :model="formData" size="large" :rules="rules">
                        <el-form-item prop="account">
                            <el-input
                                v-model="formData.account"
                                placeholder="请输入账号"
                                @keyup.enter="handleEnter"
                            >
                                <template #prepend>
                                    <icon name="el-icon-User" size="16" />
                                </template>
                            </el-input>
                        </el-form-item>
                        <el-form-item prop="password">
                            <el-input
                                ref="passwordRef"
                                v-model="formData.password"
                                show-password
                                placeholder="请输入密码"
                                @keyup.enter="handleLogin"
                            >
                                <template #prepend>
                                    <icon name="el-icon-Lock" size="16" />
                                </template>
                            </el-input>
                        </el-form-item>
                    </el-form>
                    <div class="mb-5">
                        <el-checkbox v-model="remAccount" label="记住账号"></el-checkbox>
                    </div>
                    <el-button type="primary" size="large" :loading="isLock" @click="lockLogin">
                        登录
                    </el-button>
                </div>
            </div>
        </div>
        <layout-footer />
    </div>
</template>

<script lang="ts" setup>
import type { FormInstance, InputInstance } from 'element-plus'
import { computed, onMounted, reactive, ref, shallowRef } from 'vue'

import { ACCOUNT_KEY } from '@/enums/cacheEnums'
import { PageEnum } from '@/enums/pageEnum'
import { useLockFn } from '@/hooks/useLockFn'
import LayoutFooter from '@/layout/components/footer.vue'
import useAppStore from '@/stores/modules/app'
import useUserStore from '@/stores/modules/user'
import cache from '@/utils/cache'
import feedback from '@/utils/feedback'
import {
    clearLoginFail,
    getLoginSession,
    isLocked,
    lockedMinutesLeft,
    markLoginFail,
    remainAttempts,
    sessionKey,
    setLoginSession
} from '@/utils/loginGuard'

import loginImage from './images/login-illustration.svg'

const passwordRef = shallowRef<InputInstance>()
const formRef = shallowRef<FormInstance>()
const appStore = useAppStore()
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const remAccount = ref(false)
const config = computed(() => appStore.config)
const formData = reactive({
    account: '',
    password: ''
})
const rules = {
    account: [
        {
            required: true,
            message: '请输入账号',
            trigger: ['blur']
        }
    ],
    password: [
        {
            required: true,
            message: '请输入密码',
            trigger: ['blur']
        }
    ]
}
// 回车按键监听
const handleEnter = () => {
    if (!formData.password) {
        return passwordRef.value?.focus()
    }
    handleLogin()
}
// 本次登录会话 ID（多设备互踢检测用）
const currentSid = ref('')

// 登录处理
const handleLogin = async () => {
    await formRef.value?.validate()
    const account = formData.account
    // 冻结校验：连续错误 5 次后冻结 30 分钟，期间禁止登录
    if (isLocked(account)) {
        feedback.msgError(`账号已冻结，请在 ${lockedMinutesLeft(account)} 分钟后重试`)
        return
    }
    // 记住账号，缓存
    cache.set(ACCOUNT_KEY, {
        remember: remAccount.value,
        account: remAccount.value ? formData.account : ''
    })
    try {
        await userStore.login(formData)
    } catch (error: any) {
        const justLocked = markLoginFail(account)
        if (justLocked) {
            feedback.msgError('密码连续错误已达 5 次，账号冻结 30 分钟')
        } else {
            const remain = remainAttempts(account)
            feedback.msgError(error?.message || `账号或密码错误，还可尝试 ${remain} 次`)
        }
        return
    }
    // 登录成功：清空失败计数，并写入本次会话用于多设备互踢检测
    clearLoginFail(account)
    currentSid.value = setLoginSession(account)
    const {
        query: { redirect }
    } = route
    const path = typeof redirect === 'string' ? redirect : PageEnum.INDEX
    router.push(path)
}
const { isLock, lockFn: lockLogin } = useLockFn(handleLogin)

// 多设备互踢：同一账号在别处登录成功后，当前会话自动退出
// 说明：真实跨设备互踢需服务端会话管理；此处以 localStorage + storage 事件在同浏览器多标签页间模拟该行为
const handleStorageChange = (e: StorageEvent) => {
    const account = formData.account
    if (!account || !currentSid.value) return
    if (e.key !== sessionKey(account)) return
    const session = getLoginSession(account)
    if (session?.sid && session.sid !== currentSid.value) {
        currentSid.value = ''
        userStore.logout()
        feedback.msgError('该账号已在其他设备登录，当前登录状态已退出')
        router.push(PageEnum.LOGIN)
    }
}

onMounted(() => {
    window.addEventListener('storage', handleStorageChange)
    const value = cache.get(ACCOUNT_KEY)
    if (value?.remember) {
        remAccount.value = value.remember
        formData.account = value.account
    }
})

onUnmounted(() => {
    window.removeEventListener('storage', handleStorageChange)
})
</script>

<style lang="scss" scoped>
.login {
    background-image: url('./images/login_bg.png');
    @apply min-h-screen bg-no-repeat bg-center bg-cover;
    .login-card {
        height: 400px;
    }
}
</style>
