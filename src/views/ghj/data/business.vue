<!-- 业务总览：按时间范围统计各业务类型（陪诊/托管/膳食/生活服务帮手）的订单数、交易额、取消订单数、有效金额；生活服务帮手平台不收费、金额仅显示 -->
<template>
    <div>
        <el-card class="!border-none" shadow="never">
            <el-form class="mb-[-16px]" :model="queryParams" :inline="true">
                <el-form-item label="时间范围">
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
                        :fetch-fun="getBusiness"
                        :params="queryParams"
                        :page-size="pager.size"
                    />
                </el-form-item>
            </el-form>
        </el-card>
        <el-card class="!border-none mt-4" shadow="never">
            <div class="summary">
                <div class="summary__item">
                    <div class="summary__label">订单总数</div>
                    <div class="summary__value">{{ formatNumber(pager.extend.total_order) }}</div>
                </div>
                <div class="summary__item">
                    <div class="summary__label">交易总额</div>
                    <div class="summary__value" style="color: #ef4444">
                        {{ formatMoney(pager.extend.total_amount) }}
                    </div>
                </div>
                <div class="summary__item">
                    <div class="summary__label">取消订单数量</div>
                    <div class="summary__value" style="color: #f59e0b">
                        {{ formatNumber(pager.extend.total_cancel) }}
                    </div>
                </div>
                <div class="summary__item">
                    <div class="summary__label">有效总金额</div>
                    <div class="summary__value" style="color: #2bc4a0">
                        {{ formatMoney(pager.extend.total_valid) }}
                    </div>
                </div>
            </div>
            <div class="summary-tip">
                注：交易总额 / 有效总金额 仅统计平台收费业务；生活服务帮手订单（平台不收费）未计入。
            </div>
        </el-card>
        <el-card class="!border-none mt-4" shadow="never">
            <div class="helper-note">
                <div class="helper-note__head">
                    <span class="card-bar"></span>
                    <span class="helper-note__title">生活服务帮手订单</span>
                    <el-tag size="small" type="info" effect="plain">平台不收费 · 金额仅显示</el-tag>
                </div>
                <div class="helper-note__body">
                    <div class="helper-note__item">
                        <div class="helper-note__label">订单总数</div>
                        <div class="helper-note__value">{{ formatNumber(helperBiz?.order_total) }}</div>
                    </div>
                    <div class="helper-note__item">
                        <div class="helper-note__label">金额（仅为显示）</div>
                        <div class="helper-note__value helper-note__value--muted">
                            {{ formatMoney(helperBiz?.amount_total) }}
                        </div>
                    </div>
                </div>
                <div class="helper-note__remark">
                    注：该类订单平台不收取费用，订单金额仅为展示用途，不计入平台交易额与结算额。
                </div>
            </div>
        </el-card>
        <el-card class="!border-none mt-4" shadow="never">
            <el-table size="large" v-loading="pager.loading" :data="pager.lists">
                <el-table-column label="业务类型" prop="type" min-width="120" />
                <el-table-column label="订单总数" prop="order_total" min-width="120" />
                <el-table-column label="交易总额" min-width="140">
                    <template #default="{ row }">
                        <span>{{ formatMoney(row.amount_total) }}</span>
                        <el-tag v-if="row.feeFree" size="small" type="info" effect="plain" class="ml-1"
                            >仅显示</el-tag
                        >
                    </template>
                </el-table-column>
                <el-table-column label="取消订单数量" prop="cancel_total" min-width="120" />
                <el-table-column label="有效总金额" min-width="140">
                    <template #default="{ row }">
                        <span v-if="row.feeFree" style="color: #909399">—（平台不收费）</span>
                        <span v-else>{{ formatMoney(row.valid_amount) }}</span>
                    </template>
                </el-table-column>
            </el-table>
            <div class="flex justify-end mt-4">
                <pagination v-model="pager" @change="getLists" />
            </div>
        </el-card>
    </div>
</template>

<script lang="ts" setup name="ghjDataBusiness">
import { getBusiness } from '@/api/ghj/data'
import { usePaging } from '@/hooks/usePaging'

const queryParams = reactive({
    start_time: '',
    end_time: ''
})

const { pager, getLists, resetPage, resetParams } = usePaging({
    fetchFun: getBusiness,
    params: queryParams
})

// 生活服务帮手订单（平台不收费、金额仅显示）
const helperBiz = computed<any>(() => pager.lists.find((i: any) => i.feeFree) || {})

const formatNumber = (val: any) => Number(val ?? 0).toLocaleString('zh-CN')

const formatMoney = (val: any) =>
    `¥${Number(val ?? 0).toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`

onActivated(() => {
    getLists()
})

getLists()
</script>

<style scoped lang="scss">
.card-bar {
    display: inline-block;
    width: 4px;
    height: 16px;
    margin-right: 8px;
    border-radius: 2px;
    background-color: #2bc4a0;
}
.summary {
    display: flex;
    flex-wrap: wrap;
    &__item {
        flex: 1;
        min-width: 160px;
        padding: 0 16px;
        border-right: 1px solid #f0f2f5;
        &:last-child {
            border-right: none;
        }
    }
    &__label {
        font-size: 13px;
        color: #909399;
    }
    &__value {
        margin-top: 8px;
        font-size: 22px;
        font-weight: 600;
        color: #303133;
        word-break: break-all;
    }
    &-tip {
        margin-top: 14px;
        font-size: 12px;
        color: #909399;
        line-height: 1.6;
    }
}
.helper-note {
    &__head {
        display: flex;
        align-items: center;
        .helper-note__title {
            margin: 0 8px;
            font-size: 15px;
            font-weight: 500;
            color: #303133;
        }
    }
    &__body {
        display: flex;
        flex-wrap: wrap;
        margin-top: 16px;
    }
    &__item {
        flex: 1;
        min-width: 160px;
        padding: 0 16px;
        border-right: 1px solid #f0f2f5;
        &:last-child {
            border-right: none;
        }
    }
    &__label {
        font-size: 13px;
        color: #909399;
    }
    &__value {
        margin-top: 8px;
        font-size: 22px;
        font-weight: 600;
        color: #303133;
        word-break: break-all;
        &--muted {
            color: #909399;
        }
    }
    &__remark {
        margin-top: 16px;
        padding: 10px 12px;
        font-size: 12px;
        color: #b45309;
        background-color: #fffbeb;
        border: 1px solid #fde68a;
        border-radius: 6px;
        line-height: 1.6;
    }
}
</style>
