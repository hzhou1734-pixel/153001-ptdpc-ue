<!-- 用户列表：平台端 C 端用户账号管理，支持按注册/登录时间筛选、启用禁用账号、查看用户详情 -->
<template>
    <div>
        <el-card class="!border-none" shadow="never">
            <el-form class="mb-[-16px]" :model="queryParams" :inline="true">
                <el-form-item class="w-[280px]" label="用户信息">
                    <el-input
                        v-model="queryParams.keyword"
                        placeholder="用户ID/昵称/手机号码"
                        clearable
                        @keyup.enter="resetPage"
                    />
                </el-form-item>
                <el-form-item class="w-[280px]" label="账号状态">
                    <el-select v-model="queryParams.status" placeholder="全部" clearable>
                        <el-option label="启用" :value="1" />
                        <el-option label="禁用" :value="0" />
                    </el-select>
                </el-form-item>
                <el-form-item label="注册时间">
                    <daterange-picker
                        v-model:startTime="queryParams.start_time"
                        v-model:endTime="queryParams.end_time"
                    />
                </el-form-item>
                <el-form-item label="最后登录时间">
                    <daterange-picker
                        v-model:startTime="queryParams.login_start"
                        v-model:endTime="queryParams.login_end"
                    />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="resetPage">查询</el-button>
                    <el-button @click="resetParams">重置</el-button>
                    <export-data
                        class="ml-2.5"
                        :fetch-fun="getUserLists"
                        :params="queryParams"
                        :page-size="pager.size"
                    />
                </el-form-item>
            </el-form>
        </el-card>
        <el-card class="!border-none mt-4" shadow="never">
            <el-table size="large" v-loading="pager.loading" :data="pager.lists">
                <el-table-column label="用户ID" prop="id" min-width="100" />
                <el-table-column label="头像" min-width="90">
                    <template #default="{ row }">
                        <el-avatar :src="row.avatar" :size="50">
                            {{ getFirstChar(row.nickname) }}
                        </el-avatar>
                    </template>
                </el-table-column>
                <el-table-column label="昵称" prop="nickname" min-width="120" show-overflow-tooltip />
                <el-table-column label="手机号码" prop="mobile" min-width="130" />
                <el-table-column label="顾好家币" prop="coin" min-width="110" />
                <el-table-column label="账号状态" min-width="100">
                    <template #default="{ row }">
                        <el-switch
                            :model-value="row.status"
                            :active-value="1"
                            :inactive-value="0"
                            @change="handleStatusChange($event, row)"
                        />
                    </template>
                </el-table-column>
                <el-table-column label="注册时间" prop="create_time" min-width="170" />
                <el-table-column label="最后登录时间" prop="login_time" min-width="170" />
                <el-table-column label="操作" width="100" fixed="right">
                    <template #default="{ row }">
                        <el-button type="primary" link>
                            <router-link
                                :to="{
                                    path: '/user/detail',
                                    query: {
                                        id: row.id
                                    }
                                }"
                            >
                                详情
                            </router-link>
                        </el-button>
                    </template>
                </el-table-column>
                <template #empty>
                    <el-empty description="暂无数据" />
                </template>
            </el-table>
            <div class="flex justify-end mt-4">
                <pagination v-model="pager" @change="getLists" />
            </div>
        </el-card>
    </div>
</template>

<script lang="ts" setup name="ghjUserList">
import { getUserLists, userStatus } from '@/api/ghj/user'
import { ElMessage, ElMessageBox } from 'element-plus'

import { usePaging } from '@/hooks/usePaging'

const queryParams = reactive({
    keyword: '',
    status: '',
    start_time: '',
    end_time: '',
    login_start: '',
    login_end: ''
})

const { pager, getLists, resetPage, resetParams } = usePaging({
    fetchFun: getUserLists,
    params: queryParams
})

const getFirstChar = (val: any) => String(val ?? '').slice(0, 1)

// ------------------------------------------------ 启用 / 禁用
const handleStatusChange = async (val: any, row: any) => {
    try {
        if (Number(val) === 0) {
            await ElMessageBox.confirm('禁用后该账号无法登录 APP，确认禁用吗？', '禁用提示', {
                confirmButtonText: '确认禁用',
                cancelButtonText: '取消',
                type: 'warning'
            })
        }
        await userStatus({ id: row.id, status: val })
        row.status = val
        ElMessage.success(Number(val) === 1 ? '已启用' : '已禁用')
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
