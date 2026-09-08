<!-- 角色管理 -->
<template>
    <div>
        <el-card class="!border-none" shadow="never">
            <el-form class="mb-[-16px]" :model="queryParams" :inline="true">
                <el-form-item class="w-[280px]" label="角色名称">
                    <el-input
                        v-model="queryParams.name"
                        placeholder="请输入角色名称"
                        clearable
                        @keyup.enter="resetPage"
                    />
                </el-form-item>
                <el-form-item label="添加时间">
                    <daterange-picker
                        v-model:startTime="queryParams.start_time"
                        v-model:endTime="queryParams.end_time"
                    />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="resetPage">查询</el-button>
                    <el-button @click="resetParams">重置</el-button>
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
                        <el-button type="primary" @click="handleAdd">添加角色</el-button>
                    </template>
                    <el-form
                        ref="formRef"
                        :model="formData"
                        label-width="100px"
                        :rules="formRules"
                    >
                        <el-form-item label="角色名称" prop="name">
                            <el-input
                                v-model="formData.name"
                                placeholder="请输入角色名称"
                                maxlength="20"
                                clearable
                            />
                        </el-form-item>
                        <el-form-item label="角色说明" prop="desc">
                            <el-input
                                v-model="formData.desc"
                                type="textarea"
                                :rows="3"
                                maxlength="100"
                                show-word-limit
                                placeholder="请输入角色说明"
                            />
                        </el-form-item>
                        <el-form-item label="权限配置" prop="permissions">
                            <div class="flex-1">
                                <el-tree
                                    ref="treeRef"
                                    :data="permissionTree"
                                    node-key="id"
                                    show-checkbox
                                    default-expand-all
                                    :props="{ label: 'label', children: 'children' }"
                                />
                                <div v-if="mode === 'edit'" class="form-tips">
                                    修改后该角色下所有管理员账号权限同步更新
                                </div>
                            </div>
                        </el-form-item>
                    </el-form>
                </popup>
            </div>
            <el-table class="mt-4" size="large" v-loading="pager.loading" :data="pager.lists">
                <el-table-column label="角色ID" prop="id" min-width="100" />
                <el-table-column label="角色名称" prop="name" min-width="160" />
                <el-table-column
                    label="角色说明"
                    prop="desc"
                    min-width="240"
                    show-overflow-tooltip
                />
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

<script lang="ts" setup name="ghjSystemRole">
import type { FormInstance } from 'element-plus'

import { getRoleList, roleAdd, roleDelete, roleEdit } from '@/api/ghj/system'
import Popup from '@/components/popup/index.vue'
import { usePaging } from '@/hooks/usePaging'
import feedback from '@/utils/feedback'

const queryParams = reactive({
    name: '',
    start_time: '',
    end_time: ''
})

const { pager, getLists, resetPage, resetParams } = usePaging({
    fetchFun: getRoleList,
    params: queryParams
})

// ------------------------------------------------ 权限树（本地简化配置）
const permissionTree = [
    {
        id: 'data',
        label: '数据台',
        children: [
            { id: 'data.overview', label: '经营概览' },
            { id: 'data.business', label: '业务数据' }
        ]
    },
    {
        id: 'operation',
        label: '运营管理',
        children: [
            { id: 'operation.property', label: '物业管理' },
            { id: 'operation.community', label: '小区管理' },
            { id: 'operation.order', label: '订单管理' }
        ]
    },
    {
        id: 'user',
        label: '用户管理',
        children: [
            { id: 'user.list', label: '用户列表' },
            { id: 'user.staff', label: '员工管理' }
        ]
    },
    {
        id: 'content',
        label: '内容管理',
        children: [
            { id: 'content.notice', label: '公告管理' },
            { id: 'content.activity', label: '活动管理' },
            { id: 'content.post', label: '社区动态' },
            { id: 'content.sensitive', label: '敏感词管理' }
        ]
    },
    {
        id: 'system',
        label: '系统设置',
        children: [
            { id: 'system.basic', label: '基础设置' },
            { id: 'system.sms', label: '短信设置' },
            { id: 'system.pay', label: '支付设置' },
            { id: 'system.update', label: '更新设置' },
            { id: 'system.agreement', label: '政策协议' },
            { id: 'system.role', label: '角色管理' },
            { id: 'system.admin', label: '管理员管理' }
        ]
    }
]

// ------------------------------------------------ 新增 / 编辑
const formRef = shallowRef<FormInstance>()
const popupRef = shallowRef<InstanceType<typeof Popup>>()
const treeRef = shallowRef<any>()
const mode = ref('add')
const popupTitle = computed(() => (mode.value === 'edit' ? '编辑角色' : '添加角色'))

const formData = reactive<any>({
    id: '',
    name: '',
    desc: '',
    permissions: [] as any[]
})

const formRules = {
    name: [{ required: true, message: '请输入角色名称', trigger: ['blur'] }],
    desc: [{ required: true, message: '请输入角色说明', trigger: ['blur'] }]
}

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
        desc: row.desc,
        permissions: row.permissions ?? []
    })
    popupRef.value?.open()
    nextTick(() => {
        treeRef.value?.setCheckedKeys(formData.permissions ?? [], false)
    })
}

const handleSubmit = async () => {
    await formRef.value?.validate()
    const params = {
        ...formData,
        permissions: treeRef.value?.getCheckedKeys() ?? []
    }
    if (mode.value === 'edit') {
        await roleEdit(params)
    } else {
        await roleAdd(params)
    }
    popupRef.value?.close()
    feedback.msgSuccess('保存成功')
    getLists()
}

const handleClose = () => {
    formRef.value?.resetFields()
    formData.id = ''
    formData.permissions = []
    treeRef.value?.setCheckedKeys([])
    mode.value = 'add'
}

// ------------------------------------------------ 删除
const handleDelete = async (row: any) => {
    try {
        await feedback.confirm(`确认删除角色「${row.name}」吗？`)
    } catch (error) {
        return
    }
    try {
        await roleDelete({ id: row.id })
        feedback.msgSuccess('删除成功')
        getLists()
    } catch (error: any) {
        feedback.msgError(error?.message || '删除失败')
    }
}

onActivated(() => {
    getLists()
})

getLists()
</script>

<style lang="scss" scoped></style>
