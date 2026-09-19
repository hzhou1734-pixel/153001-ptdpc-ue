<!-- 人力资源：服务人员技能认证审核中心（按服务类目 + 持证类型匹配业务场景） -->
<template>
    <div>
        <!-- 页头 -->
        <div class="hr-header">
            <div class="hr-header__title">
                <span class="hr-header__bar" />
                服务人员技能认证审核
            </div>
            <div class="hr-header__desc">
                社区服务提供者提交资质认证，平台核验持证类型与凭证材料，审核通过后纳入人才库接单。
            </div>
        </div>

        <!-- 统计卡 -->
        <div class="stat-cards">
            <div class="stat-card" v-for="s in statCards" :key="s.key">
                <div class="stat-card__icon" :style="{ background: s.bg, color: s.color }">
                    <span class="stat-card__dot" :style="{ background: s.color }" />
                </div>
                <div class="stat-card__body">
                    <div class="stat-card__label">{{ s.label }}</div>
                    <div class="stat-card__value" :style="{ color: s.color }">{{ stats[s.key] }}</div>
                </div>
            </div>
        </div>

        <el-card class="!border-none mt-4" shadow="never">
            <el-form class="mb-[-16px]" :model="queryParams" :inline="true">
                <el-form-item class="w-[200px]" label="认证角色">
                    <el-input
                        v-model="queryParams.skill_title"
                        placeholder="请输入认证角色"
                        clearable
                        @keyup.enter="resetPage"
                    />
                </el-form-item>
                <el-form-item class="w-[200px]" label="申请人昵称">
                    <el-input
                        v-model="queryParams.nickname"
                        placeholder="请输入申请人昵称"
                        clearable
                        @keyup.enter="resetPage"
                    />
                </el-form-item>
                <el-form-item class="w-[180px]" label="手机号码">
                    <el-input
                        v-model="queryParams.mobile"
                        placeholder="请输入手机号码"
                        clearable
                        @keyup.enter="resetPage"
                    />
                </el-form-item>
                <el-form-item class="w-[160px]" label="审核状态">
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
                <el-table-column label="申请人" min-width="180">
                    <template #default="{ row }">
                        <div class="flex items-center">
                            <el-avatar :src="row.avatar" :size="40" />
                            <div class="ml-2.5 leading-tight">
                                <div class="font-medium text-[#303133]">{{ row.nickname }}</div>
                                <div class="text-xs text-[#909399]">{{ row.mobile }}</div>
                            </div>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column
                    label="认证角色"
                    prop="role"
                    min-width="150"
                    show-overflow-tooltip
                />
                <el-table-column label="持证类型" min-width="120">
                    <template #default="{ row }">
                        <span class="cert-tag">{{ row.cert_type }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="认证凭证" min-width="90">
                    <template #default="{ row }">
                        <div class="cred-thumb">
                            <image-contain :src="row.credential" :width="56" :height="40" fit="cover" />
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="提交时间" prop="submit_time" min-width="170" />
                <el-table-column label="审核状态" min-width="100">
                    <template #default="{ row }">
                        <el-tag :type="getAuditStatusType(row.audit_status)" effect="light">
                            {{ row.audit_status }}
                        </el-tag>
                    </template>
                </el-table-column>
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
            width="760px"
            :confirm-button-text="false"
            :cancel-button-text="'关闭'"
        >
            <div v-if="detail.id" class="hr-detail">
                <div class="hr-detail__head">
                    <el-avatar :src="detail.avatar" :size="56" />
                    <div class="hr-detail__head-info">
                        <div class="hr-detail__name">{{ detail.nickname }}</div>
                        <div class="hr-detail__sub">
                            {{ detail.role }}
                        </div>
                    </div>
                    <el-tag
                        :type="getAuditStatusType(detail.audit_status)"
                        effect="dark"
                        class="hr-detail__status"
                        >{{ detail.audit_status }}</el-tag
                    >
                </div>

                <div class="hr-detail__section">
                    <div class="hr-detail__section-title">基础信息</div>
                    <div class="hr-detail__grid">
                        <div class="hr-detail__item">
                            <span class="hr-detail__label">手机号码</span>
                            <span>{{ detail.mobile || '-' }}</span>
                        </div>
                        <div class="hr-detail__item">
                            <span class="hr-detail__label">所属社区</span>
                            <span>{{ detail.community_name || '-' }}</span>
                        </div>
                        <div class="hr-detail__item">
                            <span class="hr-detail__label">从业年限</span>
                            <span>{{ detail.experience_years ?? '-' }} 年</span>
                        </div>
                        <div class="hr-detail__item">
                            <span class="hr-detail__label">提交时间</span>
                            <span>{{ detail.submit_time || '-' }}</span>
                        </div>
                    </div>
                </div>

                <div class="hr-detail__section">
                    <div class="hr-detail__section-title">认证信息</div>
                    <div class="hr-detail__grid">
                        <div class="hr-detail__item">
                            <span class="hr-detail__label">认证角色</span>
                            <span>{{ detail.role || '-' }}</span>
                        </div>
                        <div class="hr-detail__item">
                            <span class="hr-detail__label">持证类型</span>
                            <span class="cert-tag">{{ detail.cert_type || '-' }}</span>
                        </div>
                        <div class="hr-detail__item hr-detail__item--full">
                            <span class="hr-detail__label">证书编号</span>
                            <span class="font-mono">{{ detail.cert_no || '-' }}</span>
                        </div>
                        <div class="hr-detail__item hr-detail__item--full">
                            <span class="hr-detail__label">详情描述</span>
                            <span>{{ detail.desc || '-' }}</span>
                        </div>
                    </div>
                </div>

                <div class="hr-detail__section">
                    <div class="hr-detail__section-title">资质凭证</div>
                    <div class="cred-preview">
                        <image-contain :src="detail.credential" :width="320" :height="210" fit="contain" />
                    </div>
                    <div class="hr-detail__cred-cap">
                        {{ detail.cert_type }} · 证书编号 {{ detail.cert_no }}
                    </div>
                </div>

                <div class="hr-detail__footer">
                    <div class="hr-detail__audit-time">
                        审核时间：{{ detail.audit_time || '尚未审核' }}
                    </div>
                    <div class="hr-detail__actions">
                        <el-button
                            type="success"
                            :disabled="detail.audit_status === '已通过'"
                            @click="handleAudit(detail, '已通过')"
                            >通过认证</el-button
                        >
                        <el-button
                            type="danger"
                            plain
                            :disabled="detail.audit_status === '已驳回'"
                            @click="handleAudit(detail, '已驳回')"
                            >驳回认证</el-button
                        >
                    </div>
                </div>
            </div>
        </popup>
    </div>
</template>

<script lang="ts" setup name="ghjContentHr">
import { getHrDetail, getHrList, getHrStats, hrAudit } from '@/api/ghj/content'
import Popup from '@/components/popup/index.vue'
import feedback from '@/utils/feedback'

import { usePaging } from '@/hooks/usePaging'

const queryParams = reactive({
    skill_title: '',
    nickname: '',
    mobile: '',
    audit_status: '',
    start_time: '',
    end_time: ''
})

const { pager, getLists, resetPage, resetParams } = usePaging({
    fetchFun: getHrList,
    params: queryParams
})

const auditStatusOptions = ['待审核', '已通过', '已驳回']

const getAuditStatusType = (status: any) => {
    if (status === '已通过') return 'success'
    if (status === '已驳回') return 'danger'
    return 'warning'
}

// ------------------------------------------------ 统计卡
const stats = reactive<Record<string, number>>({ pending: 0, passed: 0, rejected: 0, total: 0 })
const statCards = [
    { key: 'pending', label: '待审核', color: '#F59F00', bg: '#FFF7E6' },
    { key: 'passed', label: '已通过', color: '#0CA678', bg: '#E6F8F2' },
    { key: 'rejected', label: '已驳回', color: '#F03E3E', bg: '#FDECEC' },
    { key: 'total', label: '总认证数', color: '#1C7ED6', bg: '#E7F1FB' }
]
const getStats = async () => {
    const res: any = await getHrStats()
    Object.assign(stats, res)
}

// ------------------------------------------------ 认证详情
const detailRef = shallowRef<InstanceType<typeof Popup>>()
const detail = ref<any>({})

const handleDetail = async (row: any) => {
    detail.value = {}
    detailRef.value?.open()
    detail.value = await getHrDetail({ id: row.id })
}

// 审核操作
const handleAudit = async (row: any, status: string) => {
    await hrAudit({ id: row.id, audit_status: status })
    feedback.msgSuccess(status === '已通过' ? '已通过该人员的资质认证' : '已驳回该人员的资质认证')
    detailRef.value?.close()
    getLists()
    getStats()
}

onActivated(() => {
    getLists()
    getStats()
})

getLists()
getStats()
</script>

<style scoped lang="scss">
.hr-header {
    margin-bottom: 16px;
    &__title {
        display: flex;
        align-items: center;
        font-size: 20px;
        font-weight: 700;
        color: #1d2129;
    }
    &__bar {
        display: inline-block;
        width: 4px;
        height: 18px;
        border-radius: 2px;
        margin-right: 10px;
        background: linear-gradient(180deg, #20c997, #12b886);
    }
    &__desc {
        margin-top: 6px;
        font-size: 13px;
        color: #909399;
        line-height: 1.6;
    }
}

.stat-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
}
.stat-card {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 18px 20px;
    border-radius: 12px;
    background: #fff;
    border: 1px solid #eef0f3;
    box-shadow: 0 2px 10px rgba(31, 35, 41, 0.04);
    &__icon {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    &__dot {
        width: 14px;
        height: 14px;
        border-radius: 50%;
    }
    &__label {
        font-size: 13px;
        color: #909399;
    }
    &__value {
        font-size: 26px;
        font-weight: 700;
        line-height: 1.2;
    }
}

.cert-tag {
    display: inline-flex;
    align-items: center;
    padding: 2px 10px;
    border-radius: 6px;
    font-size: 13px;
    color: #5a6573;
    background: #f2f3f5;
    line-height: 20px;
}
.cred-thumb {
    width: 56px;
    height: 40px;
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid #eef0f3;
    background: #fafbfc;
}

.hr-detail {
    &__head {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 16px 18px;
        border-radius: 12px;
        margin-bottom: 4px;
        background: #e9f7f1;
    }
    &__head-info {
        flex: 1;
    }
    &__name {
        font-size: 16px;
        font-weight: 700;
        color: #1d2129;
    }
    &__sub {
        font-size: 13px;
        color: #5a6573;
        margin-top: 2px;
    }
    &__status {
        align-self: flex-start;
    }
    &__section {
        padding: 16px 4px;
        border-top: 1px solid #f2f3f5;
    }
    &__section-title {
        position: relative;
        padding-left: 10px;
        margin-bottom: 12px;
        font-size: 14px;
        font-weight: 600;
        color: #1d2129;
        &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 3px;
            width: 3px;
            height: 14px;
            border-radius: 2px;
            background: #20c997;
        }
    }
    &__grid {
        display: flex;
        flex-wrap: wrap;
    }
    &__item {
        width: 50%;
        display: flex;
        align-items: baseline;
        gap: 8px;
        padding: 6px 0;
        font-size: 14px;
        color: #303133;
        word-break: break-all;
        &--full {
            width: 100%;
        }
    }
    &__label {
        flex: none;
        width: 72px;
        color: #909399;
    }
    &__cred-cap {
        margin-top: 8px;
        font-size: 12px;
        color: #909399;
        text-align: center;
    }
    &__footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 16px;
        border-top: 1px solid #f2f3f5;
    }
    &__audit-time {
        font-size: 13px;
        color: #909399;
    }
    &__actions {
        display: flex;
        gap: 10px;
    }
}
.cred-preview {
    width: 320px;
    max-width: 100%;
    margin: 0 auto;
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid #eef0f3;
    background: #fafbfc;
}

.font-mono {
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    letter-spacing: 0.3px;
}

@media (max-width: 768px) {
    .stat-cards {
        grid-template-columns: repeat(2, 1fr);
    }
    .hr-detail__item {
        width: 100%;
    }
}
</style>
