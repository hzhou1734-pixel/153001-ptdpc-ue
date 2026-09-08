<template>
    <div v-show="modelValue">
        <div v-if="type == 'image'">
            <el-image-viewer
                v-if="previewLists.length"
                :url-list="previewLists"
                hide-on-click-modal
                @close="handleClose"
            />
        </div>
        <div v-if="type == 'video'">
            <el-dialog v-model="visible" width="740px" title="视频预览" :before-close="handleClose">
                <div class="aspect-video overflow-hidden">
                    <video class="size-full" controls>
                        <source :src="normalizedUrl" type="video/mp4" />
                    </video>
                </div>
            </el-dialog>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { normalizeImageUrl } from '@/utils/util'

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    url: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        default: 'image'
    }
})
const emit = defineEmits<{
    (event: 'update:modelValue', value: boolean): void
}>()

const playerRef = shallowRef()

const visible = computed({
    get() {
        return props.modelValue
    },

    set(value) {
        emit('update:modelValue', value)
    }
})

const handleClose = () => {
    emit('update:modelValue', false)
}

const previewLists = ref<any[]>([])

// 后端图片域名 https 不可用，统一转成站内路径走本地代理
const normalizedUrl = computed(() => normalizeImageUrl(props.url))

watch(
    () => props.modelValue,
    (value) => {
        if (value) {
            nextTick(() => {
                previewLists.value = [normalizedUrl.value]
                playerRef.value?.play()
            })
        } else {
            nextTick(() => {
                previewLists.value = []
                playerRef.value?.pause()
            })
        }
    }
)
</script>
