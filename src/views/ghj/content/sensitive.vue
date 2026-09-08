<!-- 敏感词库：平台维护敏感词，用于帖子、资源大厅、评价回复的内容检测 -->
<template>
    <div>
        <el-card class="!border-none" shadow="never">
            <el-form class="mb-[-16px]" :model="queryParams" :inline="true">
                <el-form-item class="w-[280px]" label="敏感词">
                    <el-input
                        v-model="queryParams.keyword"
                        placeholder="敏感词ID/敏感词名称"
                        clearable
                        @keyup.enter="resetPage"
                    />
                </el-form-item>
                <el-form-item class="w-[280px]" label="状态">
                    <el-select v-model="queryParams.status" placeholder="全部" clearable>
                        <el-option label="启用" :value="1" />
                        <el-option label="禁用" :value="0" />
                    </el-select>
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
                    width="500px"
                    @confirm="handleSubmit"
                    @close="handleClose"
                >
                    <template #trigger>
                        <el-button type="primary" @click="handleAdd">添加敏感词</el-button>
                    </template>
                    <el-form ref="formRef" :model="formData" label-width="100px" :rules="formRules">
                        <el-form-item v-if="mode === 'edit'" label="敏感词ID">
                            <el-input :model-value="formData.id" disabled />
                        </el-form-item>
                        <el-form-item label="敏感词名称" prop="name">
                            <el-input
                                v-model="formData.name"
                                placeholder="请输入敏感词名称"
                                clearable
                            />
                        </el-form-item>
                        <el-form-item label="状态" prop="status">
                            <el-radio-group v-model="formData.status">
                                <el-radio :value="1">启用</el-radio>
                                <el-radio :value="0">禁用</el-radio>
                            </el-radio-group>
                        </el-form-item>
                        <div class="form-tips">
                            添加的敏感词用于系统发布帖子、资源大厅内容、用户评价回复时进行敏感词检测，涉及敏感词内容则无法发布
                        </div>
                    </el-form>
                </popup>
            </div>
            <el-table class="mt-4" size="large" v-loading="pager.loading" :data="pager.lists">
                <el-table-column label="敏感词ID" prop="id" min-width="120" />
                <el-table-column label="敏感词名称" prop="name" min-width="200" show-overflow-tooltip />
                <el-table-column label="状态" min-width="100">
                    <template #default="{ row }">
                        <el-switch
                            :model-value="Number(row.status)"
                            :active-value="1"
                            :inactive-value="0"
                            @change="handleStatusChange($event, row)"
                        />
                    </template>
                </el-table-column>
                <el-table-column label="添加时间" prop="create_time" min-width="170" />
                <el-table-column label="操作" width="120" fixed="right">
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

<script lang="ts" setup name="ghjContentSensitive">
import type { FormInstance } from 'element-plus'

import {
    getSensitiveList,
    sensitiveAdd,
    sensitiveDelete,
    sensitiveEdit,
    sensitiveStatus
} from '@/api/ghj/content'
import Popup from '@/components/popup/index.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

import { usePaging } from '@/hooks/usePaging'

const queryParams = reactive({
    keyword: '',
    status: '',
    start_time: '',
    end_time: ''
})

const { pager, getLists, resetPage, resetParams } = usePaging({
    fetchFun: getSensitiveList,
    params: queryParams
})

// ------------------------------------------------ 新增 / 编辑
const formRef = shallowRef<FormInstance>()
const popupRef = shallowRef<InstanceType<typeof Popup>>()
const mode = ref('add')
const popupTitle = computed(() => (mode.value === 'edit' ? '编辑敏感词' : '添加敏感词'))

const formData = reactive<any>({
    id: '',
    name: '',
    status: 1
})

const formRules = {
    name: [{ required: true, message: '请输入敏感词名称', trigger: ['blur'] }]
}

const handleAdd = () => {
    mode.value = 'add'
}

const handleEdit = (row: any) => {
    mode.value = 'edit'
    formData.id = row.id
    formData.name = row.name
    formData.status = Number(row.status)
    popupRef.value?.open()
}

const handleSubmit = async () => {
    await formRef.value?.validate()
    if (mode.value === 'edit') {
        await sensitiveEdit(formData)
    } else {
        await sensitiveAdd(formData)
    }
    popupRef.value?.close()
    ElMessage.success('操作成功')
    getLists()
}

const handleClose = () => {
    formRef.value?.resetFields()
    formData.id = ''
    mode.value = 'add'
}

// ------------------------------------------------ 启用 / 禁用
const handleStatusChange = async (val: any, row: any) => {
    try {
        if (Number(val) === 0) {
            await ElMessageBox.confirm(
                '禁用后该敏感词不再参与内容检测，确认禁用吗？',
                '禁用提示',
                {
                    confirmButtonText: '确认禁用',
                    cancelButtonText: '取消',
                    type: 'warning'
                }
            )
        }
        await sensitiveStatus({ id: row.id, status: val })
        ElMessage.success(Number(val) === 1 ? '已启用' : '已禁用')
        getLists()
    } catch (error) {
        // 取消操作
    }
}

// ------------------------------------------------ 删除
const handleDelete = async (row: any) => {
    try {
        await ElMessageBox.confirm(`确认删除敏感词「${row.name}」吗？`, '删除提示', {
            confirmButtonText: '确认删除',
            cancelButtonText: '取消',
            type: 'warning'
        })
        await sensitiveDelete({ id: row.id })
        ElMessage.success('删除成功')
        getLists()
    } catch (error) {
        // 取消操作
    }
}

onActivated(() => {
    getLists()
})

getLists()
</script>
