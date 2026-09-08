<!-- 业务总览：按时间范围统计各业务类型（陪诊/托管/膳食）的订单数、交易额、取消订单数、有效金额 -->
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
        </el-card>
        <el-card class="!border-none mt-4" shadow="never">
            <el-table size="large" v-loading="pager.loading" :data="pager.lists">
                <el-table-column label="业务类型" prop="type" min-width="120" />
                <el-table-column label="订单总数" prop="order_total" min-width="120" />
                <el-table-column label="交易总额" min-width="140">
                    <template #default="{ row }">
                        {{ formatMoney(row.amount_total) }}
                    </template>
                </el-table-column>
                <el-table-column label="取消订单数量" prop="cancel_total" min-width="120" />
                <el-table-column label="有效总金额" min-width="140">
                    <template #default="{ row }">
                        {{ formatMoney(row.valid_amount) }}
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
}
</style>
