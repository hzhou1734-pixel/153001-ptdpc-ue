<!-- 管理员管理 -->
<template>
    <div>
        <el-card class="!border-none" shadow="never">
            <el-form class="mb-[-16px]" :model="queryParams" :inline="true">
                <el-form-item class="w-[280px]" label="管理员账号">
                    <el-input
                        v-model="queryParams.name"
                        placeholder="请输入管理员账号"
                        clearable
                        @keyup.enter="resetPage"
                    />
                </el-form-item>
                <el-form-item class="w-[280px]" label="登录账号">
                    <el-input
                        v-model="queryParams.account"
                        placeholder="请输入登录账号"
                        clearable
                        @keyup.enter="resetPage"
                    />
                </el-form-item>
                <el-form-item class="w-[280px]" label="所属角色">
                    <el-select v-model="queryParams.role_id" placeholder="全部" clearable>
                        <el-option
                            v-for="item in roleOptions"
                            :key="item.id"
                            :label="item.name"
                            :value="item.id"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item class="w-[280px]" label="账号状态">
                    <el-select v-model="queryParams.status" placeholder="全部" clearable>
                        <el-option label="启用" :value="1" />
                        <el-option label="禁用" :value="0" />
                    </el-select>
                </el-form-item>
                <el-form-item label="创建时间">
                    <daterange-picker
                        v-model:startTime="queryParams.start_time"
                        v-model:endTime="queryParams.end_time"
                    />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="resetPage">查询</el-button>
                    <el-button @click="resetParams">重置</el-button>
                    <export-data
                        class="ml-2.5"
                        :fetch-fun="getAdminList"
                        :params="queryParams"
                        :page-size="pager.size"
                    />
                </el-form-item>
            </el-form>
        </el-card>
        <el-card class="!border-none mt-4" shadow="never">
            <div>
                <popup
                    ref="popupRef"
                    :title="popupTitle"
                    :async="true"
                    width="600px"
                    @confirm="handleSubmit"
                    @close="handleClose"
                >
                    <template #trigger>
                        <el-button type="primary" @click="handleAdd">添加管理员</el-button>
                    </template>
                    <el-form
                        ref="formRef"
                        :model="formData"
                        label-width="100px"
                        :rules="formRules"
                    >
                        <el-form-item label="管理员账号" prop="name">
                            <el-input
                                v-model="formData.name"
                                placeholder="请输入管理员账号"
                                maxlength="20"
                                clearable
                            />
                        </el-form-item>
                        <el-form-item label="登录账号" prop="account">
                            <el-input
                                v-model="formData.account"
                                placeholder="请输入登录账号"
                                maxlength="20"
                                clearable
                            />
                        </el-form-item>
                        <el-form-item label="登录密码" prop="password">
                            <el-input
                                v-model="formData.password"
                                :placeholder="mode === 'edit' ? '留空则不修改密码' : '请输入登录密码'"
                                clearable
                                show-password
                            />
                        </el-form-item>
                        <el-form-item label="所属角色" prop="role_id">
                            <el-select
                                v-model="formData.role_id"
                                class="flex-1"
                                placeholder="请选择所属角色"
                            >
                                <el-option
                                    v-for="item in roleOptions"
                                    :key="item.id"
                                    :label="item.name"
                                    :value="item.id"
                                />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="账号状态" prop="status">
                            <div>
                                <el-radio-group v-model="formData.status">
                                    <el-radio :value="1">启用</el-radio>
                                    <el-radio :value="0">禁用</el-radio>
                                </el-radio-group>
                                <div class="form-tips">
                                    账号状态为启用时可正常登录管理后台；禁用时无法登录
                                </div>
                            </div>
                        </el-form-item>
                    </el-form>
                </popup>
            </div>
            <el-table class="mt-4" size="large" v-loading="pager.loading" :data="pager.lists">
                <el-table-column label="管理员账号" prop="name" min-width="160" />
                <el-table-column label="登录账号" prop="account" min-width="160" />
                <el-table-column label="所属角色" prop="role_name" min-width="160" />
                <el-table-column label="账号状态" min-width="100">
                    <template #default="{ row }">
                        <el-tag :type="row.status == 1 ? 'success' : 'danger'">
                            {{ row.status == 1 ? '启用' : '禁用' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="创建时间" prop="create_time" min-width="180" />
                <el-table-column label="操作" width="160" fixed="right">
                    <template #default="{ row }">
                        <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
                        <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="flex justify-end mt-4">
                <pagination v-model="pager" @change="getLists" />
            </div>
        </el-card>
    </div>
</template>

<script lang="ts" setup name="ghjSystemAdmin">
import type { FormInstance } from 'element-plus'

import { adminAdd, adminDelete, adminEdit, getAdminList, getRoleOptions } from '@/api/ghj/system'
import Popup from '@/components/popup/index.vue'
import { usePaging } from '@/hooks/usePaging'
import feedback from '@/utils/feedback'

const queryParams = reactive({
    name: '',
    account: '',
    role_id: '',
    status: '',
    start_time: '',
    end_time: ''
})

const { pager, getLists, resetPage, resetParams } = usePaging({
    fetchFun: getAdminList,
    params: queryParams
})

// ------------------------------------------------ 角色下拉
const roleOptions = ref<any[]>([])
const getRoleOptionsFun = async () => {
    roleOptions.value = (await getRoleOptions()) as any[]
}

// ------------------------------------------------ 新增 / 编辑
const formRef = shallowRef<FormInstance>()
const popupRef = shallowRef<InstanceType<typeof Popup>>()
const mode = ref('add')
const popupTitle = computed(() => (mode.value === 'edit' ? '编辑管理员' : '添加管理员'))

const formData = reactive<any>({
    id: '',
    name: '',
    account: '',
    password: '',
    role_id: '',
    status: 1
})

const formRules = computed(() => ({
    name: [{ required: true, message: '请输入管理员账号', trigger: ['blur'] }],
    account: [{ required: true, message: '请输入登录账号', trigger: ['blur'] }],
    password:
        mode.value === 'add'
            ? [{ required: true, message: '请输入登录密码', trigger: ['blur'] }]
            : [],
    role_id: [{ required: true, message: '请选择所属角色', trigger: ['change'] }]
}))

const setFormData = (data: Record<string, any>) => {
    Object.keys(formData).forEach((key) => {
        if (data[key] !== null && data[key] !== undefined) {
            formData[key] = data[key]
        }
    })
}

const handleAdd = () => {
    mode.value = 'add'
}

const handleEdit = (row: Record<string, any>) => {
    mode.value = 'edit'
    setFormData({
        id: row.id,
        name: row.name,
        account: row.account,
        role_id: row.role_id === '' || row.role_id === null ? '' : Number(row.role_id),
        status: Number(row.status)
    })
    formData.password = ''
    popupRef.value?.open()
}

const handleSubmit = async () => {
    await formRef.value?.validate()
    if (mode.value === 'edit') {
        await adminEdit(formData)
    } else {
        await adminAdd(formData)
    }
    popupRef.value?.close()
    feedback.msgSuccess('保存成功')
    getLists()
}

const handleClose = () => {
    formRef.value?.resetFields()
    formData.id = ''
    formData.password = ''
    formData.role_id = ''
    formData.status = 1
    mode.value = 'add'
}

// ------------------------------------------------ 删除
const handleDelete = async (row: any) => {
    try {
        await feedback.confirm(`确认删除管理员「${row.name}」吗？`)
    } catch (error) {
        return
    }
    try {
        await adminDelete({ id: row.id })
        feedback.msgSuccess('删除成功')
        getLists()
    } catch (error: any) {
        feedback.msgError(error?.message || '删除失败')
    }
}

onActivated(() => {
    getLists()
})

getRoleOptionsFun()
getLists()
</script>

<style lang="scss" scoped></style>
