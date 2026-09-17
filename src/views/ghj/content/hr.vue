<!-- 人力资源：查看用户提交的技能认证、审核状态及认证凭证 -->
<template>
    <div>
        <el-card class="!border-none" shadow="never">
            <el-form class="mb-[-16px]" :model="queryParams" :inline="true">
                <el-form-item class="w-[280px]" label="技能标题">
                    <el-input
                        v-model="queryParams.skill_title"
                        placeholder="请输入认证技能标题"
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
                <el-form-item class="w-[200px]" label="审核状态">
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
                        :fetch-fun="getHrList"
                        :params="queryParams"
                        :page-size="pager.size"
                    />
                </el-form-item>
            </el-form>
        </el-card>
        <el-card class="!border-none mt-4" shadow="never">
            <el-table size="large" v-loading="pager.loading" :data="pager.lists">
                <el-table-column
                    label="认证技能标题"
                    prop="skill_title"
                    min-width="180"
                    show-overflow-tooltip
                />
                <el-table-column label="提交用户" min-width="160">
                    <template #default="{ row }">
                        <div class="flex items-center">
                            <el-avatar :src="row.avatar" :size="40" />
                            <span class="ml-2.5">{{ row.nickname }}</span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="手机号码" prop="mobile" min-width="130" />
                <el-table-column label="认证凭证" min-width="100">
                    <template #default="{ row }">
                        <image-contain :src="row.credential" :width="60" :height="60" fit="cover" />
                    </template>
                </el-table-column>
                <el-table-column label="提交时间" prop="submit_time" min-width="170" />
                <el-table-column label="审核状态" min-width="110">
                    <template #default="{ row }">
                        <el-tag :type="getAuditStatusType(row.audit_status)">
                            {{ row.audit_status }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="审核时间" prop="audit_time" min-width="170" />
                <el-table-column label="操作" width="120" fixed="right">
                    <template #default="{ row }">
                        <el-button type="primary" link @click="handleDetail(row)">认证详情</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="flex justify-end mt-4">
                <pagination v-model="pager" @change="getLists" />
            </div>
        </el-card>

        <!-- 认证详情 -->
        <popup
            ref="detailRef"
            title="认证详情"
            width="700px"
            confirm-button-text="关闭"
            :cancel-button-text="false"
        >
            <div class="detail">
                <div class="detail__item detail__item--full">
                    <span class="detail__label">提交用户：</span>
                    <span>{{ detail.nickname || '-' }}（{{ detail.mobile || '-' }}）</span>
                </div>
                <div class="detail__item detail__item--full">
                    <span class="detail__label">认证技能标题：</span>
                    <span>{{ detail.skill_title || '-' }}</span>
                </div>
                <div class="detail__item detail__item--full">
                    <span class="detail__label">技能信息：</span>
                    <span>{{ detail.skill || '-' }}</span>
                </div>
                <div class="detail__item detail__item--full">
                    <span class="detail__label">详情描述：</span>
                    <span>{{ detail.desc || '-' }}</span>
                </div>
                <div class="detail__item detail__item--full">
                    <span class="detail__label">认证凭证：</span>
                    <image-contain :src="detail.credential" :width="180" :height="120" fit="cover" />
                </div>
                <div class="detail__item">
                    <span class="detail__label">审核状态：</span>
                    <span>{{ detail.audit_status || '-' }}</span>
                </div>
                <div class="detail__item">
                    <span class="detail__label">审核时间：</span>
                    <span>{{ detail.audit_time || '-' }}</span>
                </div>
            </div>
        </popup>
    </div>
</template>

<script lang="ts" setup name="ghjContentHr">
import { getHrDetail, getHrList } from '@/api/ghj/content'
import Popup from '@/components/popup/index.vue'

import { usePaging } from '@/hooks/usePaging'

const queryParams = reactive({
    skill_title: '',
    nickname: '',
    mobile: '',
    audit_status: '',
    start_time: '',
    end_time: '',
    audit_start: '',
    audit_end: ''
})

const { pager, getLists, resetPage, resetParams } = usePaging({
    fetchFun: getHrList,
    params: queryParams
})

// 审核状态下拉
const auditStatusOptions = ['待审核', '已通过', '已驳回']

const getAuditStatusType = (status: any) => {
    if (status === '已通过') return 'success'
    if (status === '已驳回') return 'danger'
    return 'warning'
}

// ------------------------------------------------ 认证详情
const detailRef = shallowRef<InstanceType<typeof Popup>>()
const detail = ref<any>({})

const handleDetail = async (row: any) => {
    detail.value = {}
    detailRef.value?.open()
    detail.value = await getHrDetail({ id: row.id })
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
