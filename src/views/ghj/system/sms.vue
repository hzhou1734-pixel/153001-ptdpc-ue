<!-- 短信设置 -->
<template>
    <div>
        <el-card shadow="never" class="!border-none">
            <el-form ref="formRef" :rules="rules" :model="formData" label-width="190px">
                <div class="text-xl font-medium mb-[20px]">短信设置</div>
                <el-form-item label="阿里云AccessKeyId" prop="ali_key">
                    <div class="w-80">
                        <el-input
                            v-model.trim="formData.ali_key"
                            placeholder="请输入阿里云AccessKeyId"
                            clearable
                        />
                    </div>
                </el-form-item>
                <el-form-item label="阿里云AccessKeySecret" prop="ali_secret">
                    <div class="w-80">
                        <el-input
                            v-model.trim="formData.ali_secret"
                            placeholder="请输入阿里云AccessKeySecret"
                            clearable
                        />
                    </div>
                </el-form-item>
                <el-form-item label="短信签名" prop="sign_name">
                    <div class="w-80">
                        <el-input
                            v-model.trim="formData.sign_name"
                            placeholder="请输入短信签名"
                            maxlength="20"
                            clearable
                        />
                        <div class="form-tips">需与阿里云短信服务后台审核通过的签名保持一致</div>
                    </div>
                </el-form-item>
            </el-form>
        </el-card>
        <el-card shadow="never" class="!border-none mt-4">
            <div class="flex items-center justify-between mb-[16px]">
                <div class="text-xl font-medium">短信模板</div>
                <el-button type="primary" @click="handleAddTemplate">新增模板</el-button>
            </div>
            <el-table size="large" :data="formData.templates">
                <el-table-column label="模板名称" min-width="180">
                    <template #default="{ row }">
                        <el-input v-model="row.name" placeholder="请输入模板名称" clearable />
                    </template>
                </el-table-column>
                <el-table-column label="模板CODE" min-width="220">
                    <template #default="{ row }">
                        <el-input v-model="row.code" placeholder="请输入模板CODE" clearable />
                    </template>
                </el-table-column>
                <el-table-column label="模板内容" min-width="320">
                    <template #default="{ row }">
                        <el-input v-model="row.content" placeholder="请输入模板内容" clearable />
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="100" fixed="right">
                    <template #default="{ $index }">
                        <el-button type="danger" link @click="handleDeleteTemplate($index)">
                            删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="form-tips mt-2">
                模板内容中的变量请使用 ${code} 形式，需与阿里云审核通过的模板内容完全一致
            </div>
        </el-card>
        <footer-btns>
            <el-button type="primary" @click="handleSubmit">保存</el-button>
        </footer-btns>
    </div>
</template>

<script lang="ts" setup name="ghjSystemSms">
import type { FormInstance } from 'element-plus'

import { getSmsSetting, setSmsSetting } from '@/api/ghj/system'
import feedback from '@/utils/feedback'

const formRef = shallowRef<FormInstance>()

// 表单数据
const formData = reactive<any>({
    ali_key: '',
    ali_secret: '',
    sign_name: '',
    templates: []
})

// 表单验证
const rules = {
    ali_key: [
        {
            required: true,
            message: '请输入阿里云AccessKeyId',
            trigger: ['blur']
        }
    ],
    ali_secret: [
        {
            required: true,
            message: '请输入阿里云AccessKeySecret',
            trigger: ['blur']
        }
    ],
    sign_name: [
        {
            required: true,
            message: '请输入短信签名',
            trigger: ['blur']
        }
    ]
}

// 新增模板行
const handleAddTemplate = () => {
    formData.templates.push({
        id: '',
        name: '',
        code: '',
        content: ''
    })
}

// 删除模板行
const handleDeleteTemplate = (index: number) => {
    formData.templates.splice(index, 1)
}

// 获取短信设置
const getData = async () => {
    const data: any = await getSmsSetting()
    formData.ali_key = data.ali_key ?? ''
    formData.ali_secret = data.ali_secret ?? ''
    formData.sign_name = data.sign_name ?? ''
    formData.templates = data.templates ?? []
}

// 保存短信设置
const handleSubmit = async () => {
    await formRef.value?.validate()
    for (const item of formData.templates) {
        if (!item.name || !item.code || !item.content) {
            feedback.msgError('请完整填写短信模板的名称、CODE与内容')
            return
        }
    }
    await setSmsSetting(formData)
    feedback.msgSuccess('保存成功')
    getData()
}

getData()
</script>

<style lang="scss" scoped></style>
