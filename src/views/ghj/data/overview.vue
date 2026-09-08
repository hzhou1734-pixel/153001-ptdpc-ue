<!-- 数据总览：展示物业、小区、用户、订单、交易额、结算额的今日新增 / 本月新增 / 累计数据 -->
<template>
    <div>
        <el-card class="!border-none" shadow="never">
            <template #header>
                <div class="flex items-center">
                    <span class="card-bar"></span>
                    <span class="text-base font-medium">数据总览</span>
                </div>
            </template>
            <el-row :gutter="16">
                <el-col
                    v-for="item in cards"
                    :key="item.key"
                    :xs="24"
                    :sm="12"
                    :md="8"
                    :lg="8"
                    :xl="8"
                >
                    <div class="stat-card mb-4">
                        <div class="stat-card__title">
                            <span class="stat-card__dot" :style="{ background: item.color }"></span>
                            <span>{{ item.label }}</span>
                        </div>
                        <div class="stat-card__body">
                            <div v-for="s in statItems" :key="s.key" class="stat-item">
                                <div class="stat-item__label">{{ s.label }}</div>
                                <div class="stat-item__value" :style="{ color: item.color }">
                                    {{ formatValue(item.data?.[s.key], item.money) }}
                                </div>
                            </div>
                        </div>
                    </div>
                </el-col>
            </el-row>
        </el-card>
    </div>
</template>

<script lang="ts" setup name="ghjDataOverview">
import { getOverview } from '@/api/ghj/data'

// 原始数据
const overview = ref<any>({})

// 统计维度：今日新增 / 本月新增 / 累计
const statItems = [
    { key: 'today', label: '今日新增' },
    { key: 'month', label: '本月新增' },
    { key: 'total', label: '累计' }
]

// 统计卡片
const cards = computed<any[]>(() => [
    {
        key: 'property',
        label: '物业数',
        color: '#2BC4A0',
        money: false,
        data: overview.value.property || {}
    },
    {
        key: 'community',
        label: '小区数',
        color: '#3B82F6',
        money: false,
        data: overview.value.community || {}
    },
    { key: 'user', label: '用户数', color: '#8B5CF6', money: false, data: overview.value.user || {} },
    { key: 'order', label: '订单数', color: '#F59E0B', money: false, data: overview.value.order || {} },
    {
        key: 'amount',
        label: '交易额',
        color: '#EF4444',
        money: true,
        data: overview.value.amount || {}
    },
    {
        key: 'settle',
        label: '结算额',
        color: '#10B981',
        money: true,
        data: overview.value.settle || {}
    }
])

// 金额类展示 ¥ 并保留两位小数
const formatValue = (val: any, money: boolean) => {
    const num = Number(val ?? 0)
    if (money) {
        return `¥${num.toLocaleString('zh-CN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`
    }
    return num.toLocaleString('zh-CN')
}

const getData = async () => {
    overview.value = await getOverview()
}

onActivated(() => {
    getData()
})

getData()
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
.stat-card {
    padding: 20px;
    border: 1px solid #ebeef5;
    border-radius: 8px;
    background-color: #fff;
    transition: box-shadow 0.2s;
    &:hover {
        box-shadow: 0 2px 12px 0 rgba(43, 196, 160, 0.12);
    }
    &__title {
        display: flex;
        align-items: center;
        font-size: 15px;
        font-weight: 500;
        color: #303133;
    }
    &__dot {
        width: 8px;
        height: 8px;
        margin-right: 8px;
        border-radius: 50%;
    }
    &__body {
        display: flex;
        margin-top: 18px;
    }
}
.stat-item {
    flex: 1;
    min-width: 0;
    &__label {
        font-size: 12px;
        color: #909399;
    }
    &__value {
        margin-top: 6px;
        font-size: 18px;
        font-weight: 600;
        word-break: break-all;
    }
}
</style>
