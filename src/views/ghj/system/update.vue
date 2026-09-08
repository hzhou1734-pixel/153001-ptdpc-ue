<!-- 更新设置 -->
<template>
    <div>
        <el-card shadow="never" class="!border-none">
            <el-form ref="formRef" :rules="rules" :model="formData" label-width="140px">
                <div class="text-xl font-medium mb-[20px]">更新设置</div>
                <el-form-item label="APP最新版本号" prop="app_version">
                    <div class="w-80">
                        <el-input
                            v-model.trim="formData.app_version"
                            placeholder="请输入APP最新版本号，如 1.0.0"
                            maxlength="20"
                            clearable
                        />
                    </div>
                </el-form-item>
                <el-form-item label="热更新包链接" prop="hot_update_url">
                    <div class="w-80">
                        <el-input
                            v-model.trim="formData.hot_update_url"
                            placeholder="请输入热更新包下载链接"
                            clearable
                        />
                        <div class="form-tips">请填写完整的 https 下载地址，APP 启动后将拉取该包热更新</div>
                    </div>
                </el-form-item>
                <el-form-item label="是否强制更新" prop="force">
                    <div>
                        <el-switch v-model="formData.force" :active-value="1" :inactive-value="0" />
                        <div class="form-tips">
                            开启后用户必须更新到最新版本才能继续使用，关闭则用户可忽略更新
                        </div>
                    </div>
                </el-form-item>
                <el-form-item label="更新说明" prop="remark">
                    <div class="w-80">
                        <el-input
                            v-model="formData.remark"
                            type="textarea"
                            :rows="5"
                            maxlength="200"
                            show-word-limit
                            placeholder="请输入更新说明，将展示在APP更新弹窗中"
                        />
                    </div>
                </el-form-item>
            </el-form>
        </el-card>
        <footer-btns>
            <el-button type="primary" @click="handleSubmit">保存</el-button>
        </footer-btns>
    </div>
</template>

<script lang="ts" setup name="ghjSystemUpdate">
import type { FormInstance } from 'element-plus'

import { getUpdateSetting, setUpdateSetting } from '@/api/ghj/system'
import feedback from '@/utils/feedback'

const formRef = shallowRef<FormInstance>()

// 表单数据
const formData = reactive<any>({
    app_version: '',
    hot_update_url: '',
    force: 0,
    remark: ''
})

// 表单验证
const rules = {
    app_version: [
        {
            required: true,
            message: '请输入APP最新版本号',
            trigger: ['blur']
        }
    ]
}

// 获取更新设置
const getData = async () => {
    const data: any = await getUpdateSetting()
    for (const key in formData) {
        //@ts-ignore
        formData[key] = data[key] ?? formData[key]
    }
    formData.force = Number(formData.force)
}

// 保存更新设置
const handleSubmit = async () => {
    await formRef.value?.validate()
    await setUpdateSetting(formData)
    feedback.msgSuccess('保存成功')
    getData()
}

getData()
</script>

<style lang="scss" scoped></style>
