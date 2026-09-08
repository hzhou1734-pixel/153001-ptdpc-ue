<!-- 支付设置 -->
<template>
    <div>
        <el-card shadow="never" class="!border-none">
            <el-form ref="formRef" :rules="rules" :model="formData" label-width="140px">
                <el-tabs v-model="activeTab">
                    <!-- 微信支付 -->
                    <el-tab-pane label="微信支付" name="wx">
                        <div class="text-xl font-medium mb-[20px]">微信支付</div>
                        <el-form-item label="商户号" prop="wx_mch_id">
                            <div class="w-80">
                                <el-input
                                    v-model.trim="formData.wx_mch_id"
                                    placeholder="请输入微信支付商户号"
                                    clearable
                                />
                            </div>
                        </el-form-item>
                        <el-form-item label="商户密钥" prop="wx_key">
                            <div class="w-80">
                                <el-input
                                    v-model.trim="formData.wx_key"
                                    placeholder="请输入微信支付商户密钥"
                                    clearable
                                />
                                <div class="form-tips">微信商户平台设置的 APIv3 密钥</div>
                            </div>
                        </el-form-item>
                        <el-form-item label="支付证书" prop="wx_cert">
                            <div class="w-80">
                                <el-input
                                    v-model.trim="formData.wx_cert"
                                    placeholder="请输入支付证书文件路径"
                                    clearable
                                />
                                <div class="form-tips">
                                    可填写证书在服务器上的文件路径，或使用素材库上传后填入文件地址
                                </div>
                            </div>
                        </el-form-item>
                        <el-form-item label="启用状态" prop="wx_status">
                            <div>
                                <el-switch
                                    v-model="formData.wx_status"
                                    :active-value="1"
                                    :inactive-value="0"
                                />
                                <div class="form-tips">
                                    启用后用户可使用微信支付下单，关闭后该支付方式不可见
                                </div>
                            </div>
                        </el-form-item>
                    </el-tab-pane>
                    <!-- 支付宝 -->
                    <el-tab-pane label="支付宝" name="ali">
                        <div class="text-xl font-medium mb-[20px]">支付宝</div>
                        <el-form-item label="商户号(AppId)" prop="ali_app_id">
                            <div class="w-80">
                                <el-input
                                    v-model.trim="formData.ali_app_id"
                                    placeholder="请输入支付宝AppId"
                                    clearable
                                />
                            </div>
                        </el-form-item>
                        <el-form-item label="商户密钥" prop="ali_key">
                            <div class="w-80">
                                <el-input
                                    v-model.trim="formData.ali_key"
                                    placeholder="请输入支付宝商户密钥"
                                    clearable
                                />
                            </div>
                        </el-form-item>
                        <el-form-item label="支付证书" prop="ali_cert">
                            <div class="w-80">
                                <el-input
                                    v-model.trim="formData.ali_cert"
                                    placeholder="请输入支付证书文件路径"
                                    clearable
                                />
                                <div class="form-tips">
                                    可填写证书在服务器上的文件路径，或使用素材库上传后填入文件地址
                                </div>
                            </div>
                        </el-form-item>
                        <el-form-item label="启用状态" prop="ali_status">
                            <div>
                                <el-switch
                                    v-model="formData.ali_status"
                                    :active-value="1"
                                    :inactive-value="0"
                                />
                                <div class="form-tips">
                                    启用后用户可使用支付宝下单，关闭后该支付方式不可见
                                </div>
                            </div>
                        </el-form-item>
                    </el-tab-pane>
                </el-tabs>
            </el-form>
        </el-card>
        <footer-btns>
            <el-button type="primary" @click="handleSubmit">保存</el-button>
        </footer-btns>
    </div>
</template>

<script lang="ts" setup name="ghjSystemPay">
import type { FormInstance } from 'element-plus'

import { getPaySetting, setPaySetting } from '@/api/ghj/system'
import feedback from '@/utils/feedback'

const formRef = shallowRef<FormInstance>()
const activeTab = ref('wx')

// 表单数据
const formData = reactive<any>({
    wx_mch_id: '',
    wx_key: '',
    wx_cert: '',
    wx_status: 0,
    ali_app_id: '',
    ali_key: '',
    ali_cert: '',
    ali_status: 0
})

// 表单验证
const rules = {
    wx_mch_id: [
        {
            required: true,
            message: '请输入微信支付商户号',
            trigger: ['blur']
        }
    ],
    wx_key: [
        {
            required: true,
            message: '请输入微信支付商户密钥',
            trigger: ['blur']
        }
    ],
    ali_app_id: [
        {
            required: true,
            message: '请输入支付宝AppId',
            trigger: ['blur']
        }
    ],
    ali_key: [
        {
            required: true,
            message: '请输入支付宝商户密钥',
            trigger: ['blur']
        }
    ]
}

// 获取支付设置
const getData = async () => {
    const data: any = await getPaySetting()
    for (const key in formData) {
        //@ts-ignore
        formData[key] = data[key] ?? formData[key]
    }
    formData.wx_status = Number(formData.wx_status)
    formData.ali_status = Number(formData.ali_status)
}

// 保存支付设置
const handleSubmit = async () => {
    await formRef.value?.validate()
    await setPaySetting(formData)
    feedback.msgSuccess('保存成功')
    getData()
}

getData()
</script>

<style lang="scss" scoped></style>
