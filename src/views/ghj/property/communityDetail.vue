<!-- 小区详情：基础信息 / 订单信息（托管、膳食、陪诊、生活帮手 四类订单） -->
<template>
    <div>
        <el-card class="!border-none" shadow="never">
            <div class="flex items-center">
                <el-button link @click="handleBack">
                    <span class="mr-1">&lt;</span>
                    返回
                </el-button>
                <span class="ml-4 text-base font-medium">小区详情</span>
            </div>
        </el-card>

        <el-card class="!border-none mt-4" shadow="never">
            <el-tabs v-model="activeTab">
                <!-- 基础信息 -->
                <el-tab-pane label="基础信息" name="base">
                    <el-descriptions :column="2" border class="mt-4">
                        <el-descriptions-item label="小区ID">{{ base.id ?? '-' }}</el-descriptions-item>
                        <el-descriptions-item label="小区名称">{{ base.name || '-' }}</el-descriptions-item>
                        <el-descriptions-item label="所属物业">{{ base.property_name || '-' }}</el-descriptions-item>
                        <el-descriptions-item label="所属物业ID">{{ base.property_id ?? '-' }}</el-descriptions-item>
                        <el-descriptions-item label="建成年份">{{ base.build_year ?? '-' }}</el-descriptions-item>
                        <el-descriptions-item label="楼栋数">{{ base.building_count ?? '-' }}</el-descriptions-item>
                        <el-descriptions-item label="总户数">{{ base.house_count ?? '-' }}</el-descriptions-item>
                        <el-descriptions-item label="已认证户数">{{ base.auth_house_count ?? '-' }}</el-descriptions-item>
                        <el-descriptions-item label="详细地址">{{ getFullAddress(base) }}</el-descriptions-item>
                        <el-descriptions-item label="创建时间">{{ base.create_time || '-' }}</el-descriptions-item>
                    </el-descriptions>
                </el-tab-pane>

                <!-- 订单信息：托管 / 膳食 / 陪诊 / 生活帮手 四类 -->
                <el-tab-pane label="订单信息" name="order">
                    <div class="flex items-center mt-4">
                        <span class="mr-2 text-sm text-tx-secondary">订单类型</span>
                        <el-select v-model="orderType" placeholder="全部类型" clearable class="w-[200px]">
                            <el-option v-for="t in ORDER_TYPES" :key="t" :label="t" :value="t" />
                        </el-select>
                        <span class="ml-6 text-sm text-tx-secondary">
                            订单总数：<span class="text-base font-medium text-tx-primary">{{ filteredOrders.length }}</span>
                        </span>
                    </div>
                    <el-table class="mt-4" size="large" :data="filteredOrders">
                        <el-table-column label="订单编号" prop="order_sn" min-width="180" />
                        <el-table-column label="标题" prop="title" min-width="200" show-overflow-tooltip />
                        <el-table-column label="类型" prop="type" min-width="110" />
                        <el-table-column label="消费金额" min-width="130">
                            <template #default="{ row }">{{ formatMoney(row.amount) }}</template>
                        </el-table-column>
                        <el-table-column label="提交时间" prop="create_time" min-width="170" />
                        <el-table-column label="订单状态" prop="status" min-width="110" />
                        <template #empty>
                            <el-empty description="暂无订单数据" />
                        </template>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>
    </div>
</template>

<script lang="ts" setup name="ghjCommunityDetail">
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { getCommunityDetail, getCommunityOrderList } from '@/api/ghj/property'

const route = useRoute()
const router = useRouter()

const ORDER_TYPES = ['托管', '膳食', '陪诊', '生活帮手']
const activeTab = ref('base')
const base = reactive<any>({})
const orders = ref<any[]>([])
const orderType = ref('')

const formatMoney = (val: any) =>
    `¥${Number(val ?? 0).toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`

// 拼接省市区 + 详细地址
const getFullAddress = (row: any) => {
    if (!row) return '-'
    const arr = [row.province, row.city, row.district, row.address].filter((i) => !!i)
    return arr.join('') || '-'
}

// 按所选类型筛选订单
const filteredOrders = computed(() =>
    orderType.value ? orders.value.filter((i) => i.type === orderType.value) : orders.value
)

const handleBack = () => router.back()

const getDetail = async () => {
    const id = route.query.id
    const [detailRes, orderRes] = await Promise.all([
        getCommunityDetail({ id }),
        getCommunityOrderList({ community_id: id })
    ])
    Object.assign(base, detailRes || {})
    orders.value = (orderRes as any[]) || []
}

getDetail()
</script>
