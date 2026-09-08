<!-- 资源大厅：查看邻里闲置资源发布内容与审核状态 -->
<template>
    <div>
        <el-card class="!border-none" shadow="never">
            <el-form class="mb-[-16px]" :model="queryParams" :inline="true">
                <el-form-item class="w-[280px]" label="资源标题">
                    <el-input
                        v-model="queryParams.title"
                        placeholder="请输入资源标题"
                        clearable
                        @keyup.enter="resetPage"
                    />
                </el-form-item>
                <el-form-item class="w-[280px]" label="发布人昵称">
                    <el-input
                        v-model="queryParams.nickname"
                        placeholder="请输入发布人昵称"
                        clearable
                        @keyup.enter="resetPage"
                    />
                </el-form-item>
                <el-form-item class="w-[280px]" label="手机号码">
                    <el-input
                        v-model="queryParams.mobile"
                        placeholder="请输入手机号码"
                        clearable
                        @keyup.enter="resetPage"
                    />
                </el-form-item>
                <el-form-item class="w-[280px]" label="审核状态">
                    <el-select v-model="queryParams.audit_status" placeholder="全部" clearable>
                        <el-option
                            v-for="item in auditStatusOptions"
                            :key="item"
                            :label="item"
                            :value="item"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="提交时间">
                    <daterange-picker
                        v-model:startTime="queryParams.start_time"
                        v-model:endTime="queryParams.end_time"
                    />
                </el-form-item>
                <el-form-item label="审核时间">
                    <daterange-picker
                        v-model:startTime="queryParams.audit_start"
                        v-model:endTime="queryParams.audit_end"
                    />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="resetPage">查询</el-button>
                    <el-button @click="resetParams">重置</el-button>
                    <export-data
                        class="ml-2.5"
                        :fetch-fun="getResourceList"
                        :params="queryParams"
                        :page-size="pager.size"
                    />
                </el-form-item>
            </el-form>
        </el-card>
        <el-card class="!border-none mt-4" shadow="never">
            <el-table size="large" v-loading="pager.loading" :data="pager.lists">
                <el-table-column label="封面图" width="100">
                    <template #default="{ row }">
                        <image-contain :src="row.image" :width="60" :height="60" fit="cover" />
                    </template>
                </el-table-column>
                <el-table-column label="资源标题" prop="title" min-width="200" show-overflow-tooltip />
                <el-table-column label="所属物业" prop="property_name" min-width="180" show-overflow-tooltip />
                <el-table-column label="发布人" min-width="160">
                    <template #default="{ row }">
                        <div class="flex items-center">
                            <el-avatar :src="row.avatar" :size="40" />
                            <span class="ml-2.5">{{ row.nickname }}</span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="手机号码" prop="mobile" min-width="130" />
                <el-table-column label="审核状态" min-width="110">
                    <template #default="{ row }">
                        <el-tag :type="getAuditStatusType(row.audit_status)">
                            {{ row.audit_status }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="提交时间" prop="submit_time" min-width="170" />
                <el-table-column label="审核时间" prop="audit_time" min-width="170" />
                <el-table-column label="操作" width="120" fixed="right">
                    <template #default="{ row }">
                        <el-button type="primary" link @click="handleDetail(row)">资源详情</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="flex justify-end mt-4">
                <pagination v-model="pager" @change="getLists" />
            </div>
        </el-card>

        <!-- 资源详情 -->
        <popup
            ref="detailRef"
            title="资源详情"
            width="700px"
            confirm-button-text="关闭"
            :cancel-button-text="false"
        >
            <div class="detail">
                <div class="detail__item detail__item--full">
                    <span class="detail__label">资源图片：</span>
                    <image-contain :src="detail.image" :width="180" :height="120" fit="cover" />
                </div>
                <div class="detail__item detail__item--full">
                    <span class="detail__label">资源标题：</span>
                    <span>{{ detail.title || '-' }}</span>
                </div>
                <div class="detail__item detail__item--full">
                    <span class="detail__label">详情内容：</span>
                    <span>{{ detail.content || '-' }}</span>
                </div>
            </div>
        </popup>
    </div>
</template>

<script lang="ts" setup name="ghjContentResource">
import { getResourceDetail, getResourceList } from '@/api/ghj/content'
import Popup from '@/components/popup/index.vue'

import { usePaging } from '@/hooks/usePaging'

const queryParams = reactive({
    title: '',
    nickname: '',
    mobile: '',
    audit_status: '',
    start_time: '',
    end_time: '',
    audit_start: '',
    audit_end: ''
})

const { pager, getLists, resetPage, resetParams } = usePaging({
    fetchFun: getResourceList,
    params: queryParams
})

// 审核状态下拉
const auditStatusOptions = ['待审核', '已通过', '已驳回']

const getAuditStatusType = (status: any) => {
    if (status === '已通过') return 'success'
    if (status === '已驳回') return 'danger'
    return 'warning'
}

// ------------------------------------------------ 资源详情
const detailRef = shallowRef<InstanceType<typeof Popup>>()
const detail = ref<any>({})

const handleDetail = async (row: any) => {
    detail.value = {}
    detailRef.value?.open()
    detail.value = await getResourceDetail({ id: row.id })
}

onActivated(() => {
    getLists()
})

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
        &--full {
            width: 100%;
        }
    }
    &__label {
        color: #909399;
    }
}
</style>
