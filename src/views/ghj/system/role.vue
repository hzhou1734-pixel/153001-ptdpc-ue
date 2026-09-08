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

// ------------------------------------------------ 权限树（模块 → 页面 → 操作 三级结构）
// 说明：操作节点严格对照各页面实际存在的功能生成，页面没有的操作不出现在权限树中
// 操作类型：view=查看 export=导出 add=添加 edit=编辑 delete=删除 resetPwd=重置密码 status=启用禁用
const permissionTree = [
    {
        id: 'data',
        label: '数据台',
        children: [
            // 纯展示页，无任何操作节点
            { id: 'data.overview', label: '数据总览' },
            { id: 'data.business', label: '业务总览', children: [
                { id: 'data.business.view', label: '查看' },
                { id: 'data.business.export', label: '导出' }
            ] }
        ]
    },
    {
        id: 'operation',
        label: '运营管理',
        children: [
            { id: 'operation.property', label: '物业列表', children: [
                { id: 'operation.property.view', label: '查看' },
                { id: 'operation.property.export', label: '导出' },
                { id: 'operation.property.add', label: '添加' },
                { id: 'operation.property.edit', label: '编辑' },
                { id: 'operation.property.resetPwd', label: '重置密码' },
                { id: 'operation.property.status', label: '启用禁用' }
            ] },
            { id: 'operation.community', label: '小区列表', children: [
                { id: 'operation.community.view', label: '查看' },
                { id: 'operation.community.export', label: '导出' }
            ] }
        ]
    },
    {
        id: 'user',
        label: '用户管理',
        children: [
            { id: 'user.list', label: '用户列表', children: [
                { id: 'user.list.view', label: '查看' },
                { id: 'user.list.export', label: '导出' },
                { id: 'user.list.status', label: '启用禁用' }
            ] },
            // 纯查看页，无任何操作节点
            { id: 'user.detail', label: '用户详情' },
            { id: 'user.staff', label: '员工列表', children: [
                { id: 'user.staff.view', label: '查看' },
                { id: 'user.staff.export', label: '导出' }
            ] }
        ]
    },
    {
        id: 'content',
        label: '内容管理',
        children: [
            { id: 'content.post', label: '帖子列表', children: [
                { id: 'content.post.view', label: '查看' },
                { id: 'content.post.export', label: '导出' }
            ] },
            { id: 'content.resource', label: '资源大厅', children: [
                { id: 'content.resource.view', label: '查看' },
                { id: 'content.resource.export', label: '导出' }
            ] },
            { id: 'content.sensitive', label: '敏感词库', children: [
                { id: 'content.sensitive.view', label: '查看' },
                { id: 'content.sensitive.add', label: '添加' },
                { id: 'content.sensitive.edit', label: '编辑' },
                { id: 'content.sensitive.delete', label: '删除' },
                { id: 'content.sensitive.status', label: '启用禁用' }
            ] },
            { id: 'content.activity', label: '报名活动', children: [
                { id: 'content.activity.view', label: '查看' },
                { id: 'content.activity.export', label: '导出' }
            ] },
            { id: 'content.notice', label: '社区通知', children: [
                { id: 'content.notice.view', label: '查看' },
                { id: 'content.notice.export', label: '导出' }
            ] },
            { id: 'content.wonderful', label: '精彩内容', children: [
                { id: 'content.wonderful.view', label: '查看' },
                { id: 'content.wonderful.export', label: '导出' }
            ] }
        ]
    },
    {
        id: 'system',
        label: '系统设置',
        children: [
            // 以下均为保存型设置页：仅 查看 + 编辑（保存）
            { id: 'system.basic', label: '基础设置', children: [
                { id: 'system.basic.view', label: '查看' },
                { id: 'system.basic.edit', label: '编辑' }
            ] },
            { id: 'system.sms', label: '短信设置', children: [
                { id: 'system.sms.view', label: '查看' },
                { id: 'system.sms.edit', label: '编辑' }
            ] },
            { id: 'system.pay', label: '支付设置', children: [
                { id: 'system.pay.view', label: '查看' },
                { id: 'system.pay.edit', label: '编辑' }
            ] },
            { id: 'system.update', label: '更新设置', children: [
                { id: 'system.update.view', label: '查看' },
                { id: 'system.update.edit', label: '编辑' }
            ] },
            { id: 'system.agreement', label: '政策协议', children: [
                { id: 'system.agreement.view', label: '查看' },
                { id: 'system.agreement.edit', label: '编辑' }
            ] },
            { id: 'system.role', label: '角色管理', children: [
                { id: 'system.role.view', label: '查看' },
                { id: 'system.role.add', label: '添加' },
                { id: 'system.role.edit', label: '编辑' },
                { id: 'system.role.delete', label: '删除' }
            ] },
            { id: 'system.admin', label: '管理员管理', children: [
                { id: 'system.admin.view', label: '查看' },
                { id: 'system.admin.export', label: '导出' },
                { id: 'system.admin.add', label: '添加' },
                { id: 'system.admin.edit', label: '编辑' },
                { id: 'system.admin.delete', label: '删除' }
            ] }
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
