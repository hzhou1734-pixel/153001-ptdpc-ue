<!-- 基础设置 -->
<template>
    <div>
        <el-card shadow="never" class="!border-none">
            <el-form ref="formRef" :rules="rules" :model="formData" label-width="120px">
                <div class="text-xl font-medium mb-[20px]">基础设置</div>
                <el-form-item label="系统名称" prop="system_name">
                    <div class="w-80">
                        <el-input
                            v-model.trim="formData.system_name"
                            placeholder="请输入系统名称"
                            maxlength="30"
                            show-word-limit
                            clearable
                        />
                    </div>
                </el-form-item>
                <el-form-item label="系统LOGO" prop="logo">
                    <div>
                        <material-picker v-model="formData.logo" :limit="1" />
                        <div class="form-tips">建议尺寸：200*200像素，支持jpg，jpeg，png格式</div>
                    </div>
                </el-form-item>
                <el-form-item label="用户默认头像" prop="default_avatar">
                    <div>
                        <material-picker v-model="formData.default_avatar" :limit="1" />
                        <div class="form-tips">
                            用户未上传头像时默认展示，建议尺寸：200*200像素，支持jpg，jpeg，png格式
                        </div>
                    </div>
                </el-form-item>
            </el-form>
        </el-card>
        <footer-btns>
            <el-button type="primary" @click="handleSubmit">保存</el-button>
        </footer-btns>
    </div>
</template>

<script lang="ts" setup name="ghjSystemBasic">
import type { FormInstance } from 'element-plus'

import { getBasicSetting, setBasicSetting } from '@/api/ghj/system'
import feedback from '@/utils/feedback'

const formRef = shallowRef<FormInstance>()

// 表单数据
const formData = reactive({
    system_name: '',
    logo: '',
    default_avatar: ''
})

// 表单验证
const rules = {
    system_name: [
        {
            required: true,
            message: '请输入系统名称',
            trigger: ['blur']
        }
    ]
}

// 获取基础设置
const getData = async () => {
    const data: any = await getBasicSetting()
    for (const key in formData) {
        //@ts-ignore
        formData[key] = data[key] ?? formData[key]
    }
}

// 保存基础设置
const handleSubmit = async () => {
    await formRef.value?.validate()
    await setBasicSetting(formData)
    feedback.msgSuccess('保存成功')
    getData()
}

getData()
</script>

<style lang="scss" scoped></style>
