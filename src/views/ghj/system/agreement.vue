<!-- 政策协议 -->
<template>
    <div>
        <el-card shadow="never" class="!border-none">
            <el-tabs v-model="activeTab">
                <el-tab-pane label="关于我们" name="about_us">
                    <editor v-model="formData.about_us" :height="500" />
                </el-tab-pane>
                <el-tab-pane label="用户协议" name="user_agreement">
                    <editor v-model="formData.user_agreement" :height="500" />
                </el-tab-pane>
                <el-tab-pane label="隐私政策" name="privacy_policy">
                    <editor v-model="formData.privacy_policy" :height="500" />
                </el-tab-pane>
            </el-tabs>
        </el-card>
        <footer-btns>
            <el-button type="primary" @click="handleSubmit">保存</el-button>
        </footer-btns>
    </div>
</template>

<script lang="ts" setup name="ghjSystemAgreement">
import { getAgreement, setAgreement } from '@/api/ghj/system'
import feedback from '@/utils/feedback'

const activeTab = ref('about_us')

// 表单数据
const formData = reactive<any>({
    about_us: '',
    user_agreement: '',
    privacy_policy: ''
})

// 获取政策协议
const getData = async () => {
    const data: any = await getAgreement()
    for (const key in formData) {
        //@ts-ignore
        formData[key] = data[key] ?? formData[key]
    }
}

// 保存政策协议
const handleSubmit = async () => {
    await setAgreement(formData)
    feedback.msgSuccess('保存成功')
    getData()
}

getData()
</script>

<style lang="scss" scoped></style>
