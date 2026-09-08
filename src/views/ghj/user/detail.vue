<!-- 用户详情：基础信息 / 订单 / 结算 / 帖子 / 资源 / 认证 / 手环 / 报名 八个维度 -->
<template>
    <div>
        <el-card class="!border-none" shadow="never">
            <div class="flex items-center">
                <el-button link @click="handleBack">
                    <span class="mr-1">&lt;</span>
                    返回
                </el-button>
                <span class="ml-4 text-base font-medium">用户详情</span>
            </div>
        </el-card>
        <el-card class="!border-none mt-4" shadow="never">
            <el-tabs v-model="activeTab">
                <!-- 基础信息 -->
                <el-tab-pane label="基础信息" name="base">
                    <el-descriptions :column="2" border class="mt-4">
                        <el-descriptions-item label="用户ID">
                            {{ detail.base?.id ?? '-' }}
                        </el-descriptions-item>
                        <el-descriptions-item label="头像">
                            <el-avatar :src="detail.base?.avatar" :size="50">
                                {{ getFirstChar(detail.base?.nickname) }}
                            </el-avatar>
                        </el-descriptions-item>
                        <el-descriptions-item label="昵称">
                            {{ detail.base?.nickname || '-' }}
                        </el-descriptions-item>
                        <el-descriptions-item label="手机号码">
                            {{ detail.base?.mobile || '-' }}
                        </el-descriptions-item>
                        <el-descriptions-item label="账号状态">
                            <el-tag :type="detail.base?.status == 1 ? 'success' : 'danger'">
                                {{ detail.base?.status == 1 ? '启用' : '禁用' }}
                            </el-tag>
                        </el-descriptions-item>
                        <el-descriptions-item label="注册时间">
                            {{ detail.base?.create_time || '-' }}
                        </el-descriptions-item>
                        <el-descriptions-item label="最后登录时间">
                            {{ detail.base?.login_time || '-' }}
                        </el-descriptions-item>
                        <el-descriptions-item label="订单总数量">
                            {{ detail.base?.order_count ?? 0 }}
                        </el-descriptions-item>
                        <el-descriptions-item label="消费总金额">
                            {{ formatMoney(detail.base?.total_amount) }}
                        </el-descriptions-item>
                    </el-descriptions>
                </el-tab-pane>

                <!-- 订单信息 -->
                <el-tab-pane label="订单信息" name="order">
                    <el-table class="mt-4" size="large" :data="detail.order">
                        <el-table-column label="订单编号" prop="order_sn" min-width="180" />
                        <el-table-column label="标题" prop="title" min-width="180" show-overflow-tooltip />
                        <el-table-column label="类型" prop="type" min-width="100" />
                        <el-table-column label="消费金额" min-width="120">
                            <template #default="{ row }">
                                {{ formatMoney(row.amount) }}
                            </template>
                        </el-table-column>
                        <el-table-column label="提交时间" prop="create_time" min-width="170" />
                        <el-table-column label="订单状态" prop="status" min-width="100" />
                        <template #empty>
                            <el-empty description="暂无订单数据" />
                        </template>
                    </el-table>
                </el-tab-pane>

                <!-- 结算信息 -->
                <el-tab-pane label="结算信息" name="settle">
                    <el-descriptions :column="2" border class="mt-4">
                        <el-descriptions-item label="待结算笔数">
                            {{ settleSummary.pending.count }}
                        </el-descriptions-item>
                        <el-descriptions-item label="待结算金额">
                            {{ formatMoney(settleSummary.pending.amount) }}
                        </el-descriptions-item>
                        <el-descriptions-item label="已结算笔数">
                            {{ settleSummary.settled.count }}
                        </el-descriptions-item>
                        <el-descriptions-item label="已结算金额">
                            {{ formatMoney(settleSummary.settled.amount) }}
                        </el-descriptions-item>
                    </el-descriptions>
                    <el-table class="mt-4" size="large" :data="detail.settle">
                        <el-table-column label="月份" prop="month" min-width="120" />
                        <el-table-column label="金额" min-width="120">
                            <template #default="{ row }">
                                {{ formatMoney(row.amount) }}
                            </template>
                        </el-table-column>
                        <el-table-column label="状态" prop="status" min-width="100" />
                        <el-table-column label="操作" width="120" fixed="right">
                            <template #default="{ row }">
                                <el-button
                                    v-if="row.status === '已结算'"
                                    type="primary"
                                    link
                                    @click="handleSettleDetail(row)"
                                >
                                    查看明细
                                </el-button>
                                <span v-else>-</span>
                            </template>
                        </el-table-column>
                        <template #empty>
                            <el-empty description="暂无结算数据" />
                        </template>
                    </el-table>
                </el-tab-pane>

                <!-- 帖子发布 -->
                <el-tab-pane label="帖子发布" name="post">
                    <el-table class="mt-4" size="large" :data="detail.post">
                        <el-table-column label="帖子图片" min-width="90">
                            <template #default="{ row }">
                                <el-avatar :src="row.image" :size="50" shape="square">
                                    {{ getFirstChar(row.title) }}
                                </el-avatar>
                            </template>
                        </el-table-column>
                        <el-table-column label="标题" prop="title" min-width="200" show-overflow-tooltip />
                        <el-table-column label="发布时间" prop="publish_time" min-width="170" />
                        <el-table-column label="审核时间" prop="audit_time" min-width="170" />
                        <el-table-column label="帖子状态" prop="status" min-width="100" />
                        <el-table-column label="操作" width="120" fixed="right">
                            <template #default="{ row }">
                                <el-button type="primary" link @click="handlePostDetail(row)">
                                    查看详情
                                </el-button>
                            </template>
                        </el-table-column>
                        <template #empty>
                            <el-empty description="暂无帖子数据" />
                        </template>
                    </el-table>
                </el-tab-pane>

                <!-- 资源大厅 -->
                <el-tab-pane label="资源大厅" name="resource">
                    <el-table class="mt-4" size="large" :data="detail.resource">
                        <el-table-column label="图片" min-width="90">
                            <template #default="{ row }">
                                <el-avatar :src="row.image" :size="50" shape="square">
                                    {{ getFirstChar(row.title) }}
                                </el-avatar>
                            </template>
                        </el-table-column>
                        <el-table-column label="标题" prop="title" min-width="200" show-overflow-tooltip />
                        <el-table-column label="发布时间" prop="publish_time" min-width="170" />
                        <el-table-column label="审核时间" prop="audit_time" min-width="170" />
                        <el-table-column label="资源状态" prop="status" min-width="100" />
                        <el-table-column label="操作" width="120" fixed="right">
                            <template #default="{ row }">
                                <el-button type="primary" link @click="handleResourceDetail(row)">
                                    查看详情
                                </el-button>
                            </template>
                        </el-table-column>
                        <template #empty>
                            <el-empty description="暂无资源数据" />
                        </template>
                    </el-table>
                </el-tab-pane>

                <!-- 业主认证 -->
                <el-tab-pane label="业主认证" name="auth">
                    <el-table class="mt-4" size="large" :data="detail.auth">
                        <el-table-column label="小区名称" prop="community_name" min-width="180" show-overflow-tooltip />
                        <el-table-column label="楼栋房号" prop="building" min-width="180" />
                        <el-table-column label="审核结果" prop="result" min-width="100" />
                        <el-table-column label="提交时间" prop="create_time" min-width="170" />
                        <template #empty>
                            <el-empty description="暂无业主认证数据" />
                        </template>
                    </el-table>
                </el-tab-pane>

                <!-- 健康手环 -->
                <el-tab-pane label="健康手环" name="band">
                    <el-table class="mt-4" size="large" :data="detail.band">
                        <el-table-column label="手环SN" prop="sn" min-width="160" />
                        <el-table-column label="心率" min-width="100">
                            <template #default="{ row }">
                                {{ row.heart_rate ?? '-' }}
                            </template>
                        </el-table-column>
                        <el-table-column label="血氧" min-width="100">
                            <template #default="{ row }">
                                {{ row.blood_oxygen ?? '-' }}
                            </template>
                        </el-table-column>
                        <el-table-column label="步数" prop="step" min-width="100" />
                        <el-table-column label="睡眠" prop="sleep" min-width="120" />
                        <el-table-column label="绑定时间" prop="bind_time" min-width="170" />
                        <template #empty>
                            <el-empty description="暂无手环数据" />
                        </template>
                    </el-table>
                </el-tab-pane>

                <!-- 报名记录 -->
                <el-tab-pane label="报名记录" name="join">
                    <el-table class="mt-4" size="large" :data="detail.join">
                        <el-table-column label="报名活动标题" prop="title" min-width="220" show-overflow-tooltip />
                        <el-table-column label="活动时间" prop="activity_time" min-width="170" />
                        <el-table-column label="报名时间" prop="join_time" min-width="170" />
                        <template #empty>
                            <el-empty description="暂无报名数据" />
                        </template>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>

        <!-- 结算明细 -->
        <popup
            ref="settleRef"
            title="结算明细"
            width="600px"
            confirm-button-text="关闭"
            :cancel-button-text="false"
        >
            <div class="detail">
                <div class="detail__item">
                    <span class="detail__label">月份：</span>
                    <span>{{ currentRow.month || '-' }}</span>
                </div>
                <div class="detail__item">
                    <span class="detail__label">结算金额：</span>
                    <span>{{ formatMoney(currentRow.amount) }}</span>
                </div>
                <div class="detail__item">
                    <span class="detail__label">结算状态：</span>
                    <span>{{ currentRow.status || '-' }}</span>
                </div>
                <div class="detail__item detail__item--full">
                    <span class="detail__label">明细说明：</span>
                    <span>{{ currentRow.remark || `${currentRow.month || ''} 月度订单结算` }}</span>
                </div>
            </div>
        </popup>

        <!-- 帖子详情 -->
        <popup
            ref="postRef"
            title="帖子详情"
            width="600px"
            confirm-button-text="关闭"
            :cancel-button-text="false"
        >
            <div class="detail">
                <div class="detail__item detail__item--full">
                    <span class="detail__label">标题：</span>
                    <span>{{ currentRow.title || '-' }}</span>
                </div>
                <div class="detail__item">
                    <span class="detail__label">发布时间：</span>
                    <span>{{ currentRow.publish_time || '-' }}</span>
                </div>
                <div class="detail__item">
                    <span class="detail__label">审核时间：</span>
                    <span>{{ currentRow.audit_time || '-' }}</span>
                </div>
                <div class="detail__item detail__item--full">
                    <span class="detail__label">帖子内容：</span>
                    <span>{{ currentRow.content || '暂无内容' }}</span>
                </div>
                <div class="detail__item detail__item--full">
                    <span class="detail__label">帖子评价：</span>
                    <span>{{ currentRow.comment || '暂无评价' }}</span>
                </div>
            </div>
        </popup>

        <!-- 资源详情 -->
        <popup
            ref="resourceRef"
            title="资源详情"
            width="600px"
            confirm-button-text="关闭"
            :cancel-button-text="false"
        >
            <div class="detail">
                <div class="detail__item detail__item--full">
                    <span class="detail__label">标题：</span>
                    <span>{{ currentRow.title || '-' }}</span>
                </div>
                <div class="detail__item">
                    <span class="detail__label">发布时间：</span>
                    <span>{{ currentRow.publish_time || '-' }}</span>
                </div>
                <div class="detail__item">
                    <span class="detail__label">审核时间：</span>
                    <span>{{ currentRow.audit_time || '-' }}</span>
                </div>
                <div class="detail__item detail__item--full">
                    <span class="detail__label">资源状态：</span>
                    <span>{{ currentRow.status || '-' }}</span>
                </div>
                <div class="detail__item detail__item--full">
                    <span class="detail__label">资源内容：</span>
                    <span>{{ currentRow.content || '暂无内容' }}</span>
                </div>
            </div>
        </popup>
    </div>
</template>

<script lang="ts" setup name="ghjUserDetail">
import { getUserDetail } from '@/api/ghj/user'

const route = useRoute()
const router = useRouter()

const activeTab = ref('base')

const detail = reactive<any>({
    base: {},
    order: [],
    settle: [],
    post: [],
    resource: [],
    auth: [],
    band: [],
    join: []
})

const formatMoney = (val: any) =>
    `¥${Number(val ?? 0).toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`

const getFirstChar = (val: any) => String(val ?? '').slice(0, 1)

// 结算汇总：按 status 聚合
const settleSummary = computed(() => {
    const result = {
        pending: { count: 0, amount: 0 },
        settled: { count: 0, amount: 0 }
    }
    ;(detail.settle || []).forEach((item: any) => {
        const key = String(item.status).includes('已结算') ? 'settled' : 'pending'
        result[key].count += 1
        result[key].amount += Number(item.amount) || 0
    })
    return result
})

// ------------------------------------------------ 弹窗详情
const settleRef = shallowRef<any>()
const postRef = shallowRef<any>()
const resourceRef = shallowRef<any>()
const currentRow = ref<any>({})

const handleSettleDetail = (row: any) => {
    currentRow.value = row
    settleRef.value?.open()
}
const handlePostDetail = (row: any) => {
    currentRow.value = row
    postRef.value?.open()
}
const handleResourceDetail = (row: any) => {
    currentRow.value = row
    resourceRef.value?.open()
}

// ------------------------------------------------ 返回
const handleBack = () => {
    router.back()
}

// ------------------------------------------------ 数据
const getDetail = async () => {
    const res: any = await getUserDetail({ id: route.query.id })
    detail.base = res?.base || {}
    detail.order = res?.order || []
    detail.settle = res?.settle || []
    detail.post = res?.post || []
    detail.resource = res?.resource || []
    detail.auth = res?.auth || []
    detail.band = res?.band || []
    detail.join = res?.join || []
}

getDetail()
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
