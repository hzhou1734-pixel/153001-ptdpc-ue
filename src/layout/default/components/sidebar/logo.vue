<template>
    <div class="logo" @click="handleClick">
        <image-contain
            :width="szie"
            :height="szie"
            :src="logoSrc"
            @error="handleLogoError"
        />
        <transition name="title-width">
            <div
                v-show="showTitle"
                class="logo-title overflow-hidden whitespace-nowrap"
                :class="{ 'text-white': theme == ThemeEnum.DARK }"
                :style="{ left: `${szie + 16}px` }"
            >
                <overflow-tooltip
                    :content="title || config.web_name"
                    :teleported="true"
                    placement="bottom"
                    overflo-type="unset"
                >
                </overflow-tooltip>
            </div>
        </transition>
    </div>
</template>

<script setup lang="ts">
import { ThemeEnum } from '@/enums/appEnums'
import useAppStore from '@/stores/modules/app'
import guhaojiaIcon from '@/assets/images/guhaojia-icon.png'

defineProps({
    szie: { type: Number, default: 34 },
    title: { type: String },
    theme: { type: String },
    showTitle: { type: Boolean, default: true }
})
const appStore = useAppStore()
const config = computed(() => appStore.config)
const router = useRouter()

// 后端下发的网站 logo（已规范化地址）
const backendLogo = computed(() => config.value?.web_logo || '')
// 后端 logo 为空或加载失败时，回退到本地顾好家图标，保证侧边栏不破图
const useFallback = ref(false)
const logoSrc = computed(() => (!useFallback.value && backendLogo.value) || guhaojiaIcon)
const handleLogoError = () => {
    useFallback.value = true
}
// 后端 logo 地址变化时重置回退状态
watch(backendLogo, () => {
    useFallback.value = false
})

const handleClick = () => {
    router.push('/')
}
</script>
<style lang="scss" scoped>
.logo {
    height: var(--navbar-height);
    overflow: hidden;
    cursor: pointer;
    user-select: none;
    @apply flex items-center p-2 relative;
    .logo-title {
        width: 70%;
        position: absolute;
        @apply text-xl;
    }

    .title-width-enter-active {
        opacity: 0;
        transition: all 0.3s ease-out;
    }

    .title-width-leave-active {
        transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
    }

    .title-width-enter-from,
    .title-width-leave-to {
        width: 0;
        opacity: 0;
    }
}
</style>
