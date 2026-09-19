<!-- 员工列表：员工数据由物业管理后台维护，平台端仅支持查看 -->
<template>
    <div>
        <el-alert
            class="!mb-4"
            type="info"
            :closable="false"
            show-icon
            title="所有员工数据由物业管理后台维护，平台后台仅查看，不做添加修改等维护操作"
        />
        <el-card class="!border-none" shadow="never">
            <el-form class="mb-[-16px]" :model="queryParams" :inline="true">
                <el-form-item class="w-[280px]" label="员工信息">
                    <el-input
                        v-model="queryParams.keyword"
                        placeholder="员工ID/昵称/手机号码"
                        clearable
                        @keyup.enter="resetPage"
                    />
                </el-form-item>
                <el-form-item class="w-[280px]" label="所属物业">
                    <el-select
                        v-model="queryParams.property_id"
                        placeholder="全部"
                        clearable
                        filterable
                    >
                        <el-option
                            v-for="item in propertyOptions"
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
                <el-form-item label="添加时间">
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
                        :fetch-fun="getStaffList"
                        :params="queryParams"
                        :page-size="pager.size"
                    />
                </el-form-item>
            </el-form>
        </el-card>
        <el-card class="!border-none mt-4" shadow="never">
            <el-table size="large" v-loading="pager.loading" :data="pager.lists">
                <el-table-column label="员工ID" prop="id" min-width="100" />
                <el-table-column label="头像" min-width="90">
                    <template #default="{ row }">
                        <el-avatar :src="row.avatar" :size="50">
                            {{ getFirstChar(row.nickname) }}
                        </el-avatar>
                    </template>
                </el-table-column>
                <el-table-column label="昵称" prop="nickname" min-width="120" show-overflow-tooltip />
                <el-table-column label="手机号码" prop="mobile" min-width="130" />
                <el-table-column label="所属小区" prop="community_name" min-width="160" show-overflow-tooltip />
                <el-table-column label="账号状态" min-width="100">
                    <template #default="{ row }">
                        <el-tag :type="row.status == 1 ? 'success' : 'danger'">
                            {{ row.status == 1 ? '启用' : '禁用' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="添加时间" prop="create_time" min-width="170" />
                <el-table-column label="操作" width="120" fixed="right">
                    <template #default="{ row }">
                        <el-button type="primary" link @click="handleDetail(row)">详情</el-button>
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

        <!-- 员工详情 -->
        <popup
            ref="detailRef"
            title="员工详情"
            width="600px"
            confirm-button-text="关闭"
            :cancel-button-text="false"
        >
            <div class="detail">
                <div class="detail__item">
                    <span class="detail__label">员工ID：</span>
                    <span>{{ detail.id || '-' }}</span>
                </div>
                <div class="detail__item">
                    <span class="detail__label">头像：</span>
                    <el-avatar :src="detail.avatar" :size="50">
                        {{ getFirstChar(detail.nickname) }}
                    </el-avatar>
                </div>
                <div class="detail__item">
                    <span class="detail__label">昵称：</span>
                    <span>{{ detail.nickname || '-' }}</span>
                </div>
                <div class="detail__item">
                    <span class="detail__label">手机号码：</span>
                    <span>{{ detail.mobile || '-' }}</span>
                </div>
                <div class="detail__item">
                    <span class="detail__label">所属小区：</span>
                    <span>{{ detail.community_name || '-' }}</span>
                </div>
                <div class="detail__item">
                    <span class="detail__label">账号状态：</span>
                    <el-tag :type="detail.status == 1 ? 'success' : 'danger'">
                        {{ detail.status == 1 ? '启用' : '禁用' }}
                    </el-tag>
                </div>
                <div class="detail__item">
                    <span class="detail__label">添加时间：</span>
                    <span>{{ detail.create_time || '-' }}</span>
                </div>
            </div>
        </popup>
    </div>
</template>

<script lang="ts" setup name="ghjUserStaff">
import { getStaffDetail, getStaffList } from '@/api/ghj/user'
import { getPropertyOptions } from '@/api/ghj/property'

import { usePaging } from '@/hooks/usePaging'

const queryParams = reactive({
    keyword: '',
    property_id: '',
    status: '',
    start_time: '',
    end_time: ''
})

const { pager, getLists, resetPage, resetParams } = usePaging({
    fetchFun: getStaffList,
    params: queryParams
})

const getFirstChar = (val: any) => String(val ?? '').slice(0, 1)

// 所属物业下拉
const propertyOptions = ref<any[]>([])
const getPropertyOptionsList = async () => {
    propertyOptions.value = (await getPropertyOptions()) as any[]
}

// ------------------------------------------------ 员工详情
const detailRef = shallowRef<any>()
const detail = ref<any>({})

const handleDetail = async (row: any) => {
    detail.value = {}
    detailRef.value?.open()
    detail.value = await getStaffDetail({ id: row.id })
}

onActivated(() => {
    getLists()
})

getPropertyOptionsList()
getLists()
</script>

<style scoped lang="scss">
.detail {
    display: flex;
    flex-wrap: wrap;
    line-height: 28px;
    &__item {
        width: 50%;
        padding: 4px 0;
        font-size: 14px;
        color: #303133;
        word-break: break-all;
    }
    &__label {
        color: #909399;
    }
}
</style>
