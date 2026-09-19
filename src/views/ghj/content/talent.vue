<!-- 人才库：查看已通过认证的人才、可服务类目、订单统计与人才状态 -->
<template>
    <div>
        <el-card class="!border-none" shadow="never">
            <el-form class="mb-[-16px]" :model="queryParams" :inline="true">
                <el-form-item class="w-[280px]" label="用户昵称">
                    <el-input
                        v-model="queryParams.nickname"
                        placeholder="请输入用户昵称"
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
                <el-form-item class="w-[280px]" label="认证技能">
                    <el-input
                        v-model="queryParams.skill"
                        placeholder="请输入认证技能"
                        clearable
                        @keyup.enter="resetPage"
                    />
                </el-form-item>
                <el-form-item class="w-[200px]" label="服务类目">
                    <el-select v-model="queryParams.category" placeholder="全部" clearable>
                        <el-option
                            v-for="item in categoryOptions"
                            :key="item"
                            :label="item"
                            :value="item"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item class="w-[200px]" label="人才状态">
                    <el-select v-model="queryParams.talent_status" placeholder="全部" clearable>
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
                        :fetch-fun="getTalentList"
                        :params="queryParams"
                        :page-size="pager.size"
                    />
                </el-form-item>
            </el-form>
        </el-card>
        <el-card class="!border-none mt-4" shadow="never">
            <el-table size="large" v-loading="pager.loading" :data="pager.lists">
                <el-table-column label="用户" min-width="160">
                    <template #default="{ row }">
                        <div class="flex items-center">
                            <el-avatar :src="row.avatar" :size="40" />
                            <span class="ml-2.5">{{ row.nickname }}</span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="手机号码" prop="mobile" min-width="130" />
                <el-table-column
                    label="认证技能"
                    prop="skill"
                    min-width="150"
                    show-overflow-tooltip
                />
                <el-table-column label="可服务类目" prop="category" min-width="110" />
                <el-table-column label="订单总数" prop="order_total" min-width="100" />
                <el-table-column label="进行中" prop="in_progress" min-width="90" />
                <el-table-column label="已完成" prop="completed" min-width="90" />
                <el-table-column label="已取消" prop="cancelled" min-width="90" />
                <el-table-column label="完成订单总金额" min-width="140">
                    <template #default="{ row }">
                        <span>¥{{ row.finish_amount?.toFixed(2) ?? '0.00' }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="人才状态" min-width="90">
                    <template #default="{ row }">
                        <el-switch
                            v-model="row.talent_status"
                            :active-value="1"
                            :inactive-value="0"
                            @change="handleStatusChange(row)"
                        />
                    </template>
                </el-table-column>
                <el-table-column label="添加时间" prop="create_time" min-width="170" />
                <el-table-column label="操作" width="120" fixed="right">
                    <template #default="{ row }">
                        <el-button type="primary" link @click="handleDetail(row)">人才详情</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="flex justify-end mt-4">
                <pagination v-model="pager" @change="getLists" />
            </div>
        </el-card>

        <!-- 人才详情 -->
        <popup
            ref="detailRef"
            title="人才详情"
            width="900px"
            confirm-button-text="关闭"
            :cancel-button-text="false"
        >
            <el-tabs v-model="activeTab">
                <el-tab-pane label="基础信息" name="base">
                    <div class="detail">
                        <div class="detail__item detail__item--full">
                            <span class="detail__label">人才头像：</span>
                            <el-avatar :src="detail.avatar" :size="60" />
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
                            <span class="detail__label">认证技能：</span>
                            <span>{{ detail.skill || '-' }}</span>
                        </div>
                        <div class="detail__item">
                            <span class="detail__label">服务类目：</span>
                            <span>{{ detail.category || '-' }}</span>
                        </div>
                    </div>
                </el-tab-pane>
                <el-tab-pane label="认证资料" name="cert">
                    <div class="detail">
                        <div class="detail__item detail__item--full">
                            <span class="detail__label">认证凭证：</span>
                            <image-contain
                                :src="detail.credential"
                                :width="200"
                                :height="130"
                                fit="contain"
                                class="cert-preview"
                            />
                        </div>
                        <div class="detail__item detail__item--full">
                            <span class="detail__label">认证描述：</span>
                            <span>{{ detail.desc || '-' }}</span>
                        </div>
                    </div>
                </el-tab-pane>
                <el-tab-pane label="订单信息" name="order">
                    <div class="stat-row">
                        <div class="stat-item">
                            <span class="stat-label">订单总数</span>
                            <span class="stat-value">{{ detail.order_total ?? 0 }}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">进行中</span>
                            <span class="stat-value">{{ detail.in_progress ?? 0 }}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">已完成</span>
                            <span class="stat-value">{{ detail.completed ?? 0 }}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">已取消</span>
                            <span class="stat-value">{{ detail.cancelled ?? 0 }}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">已完成订单总金额</span>
                            <span class="stat-value"
                                >¥{{ detail.finish_amount?.toFixed(2) ?? '0.00' }}</span
                            >
                        </div>
                    </div>
                    <div class="order-toolbar">
                        <el-input
                            v-model="orderKeyword"
                            placeholder="搜索订单编号 / 标题 / 下单用户"
                            clearable
                            class="order-search"
                        />
                    </div>
                    <el-table size="small" :data="filteredOrders" class="mt-4">
                        <el-table-column label="订单编号" prop="order_no" min-width="180" />
                        <el-table-column label="服务封面图" width="90">
                            <template #default="{ row }">
                                <image-contain :src="row.cover" :width="50" :height="50" fit="cover" />
                            </template>
                        </el-table-column>
                        <el-table-column
                            label="标题"
                            prop="title"
                            min-width="170"
                            show-overflow-tooltip
                        />
                        <el-table-column label="订单金额" min-width="110">
                            <template #default="{ row }">
                                <span>¥{{ row.amount?.toFixed(2) ?? '0.00' }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="下单用户" prop="user" min-width="110" />
                        <el-table-column label="订单状态" prop="status" min-width="100" />
                        <el-table-column label="订单评价" min-width="150">
                            <template #default="{ row }">
                                <el-rate
                                    v-if="row.star"
                                    :model-value="row.star"
                                    disabled
                                    size="small"
                                />
                                <span v-else>-</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="提交时间" prop="submit_time" min-width="160" />
                        <el-table-column label="完成时间" prop="finish_time" min-width="160" />
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </popup>
    </div>
</template>

<script lang="ts" setup name="ghjContentTalent">
import { getTalentDetail, getTalentList } from '@/api/ghj/content'
import Popup from '@/components/popup/index.vue'
import feedback from '@/utils/feedback'

import { usePaging } from '@/hooks/usePaging'

const queryParams = reactive({
    nickname: '',
    mobile: '',
    skill: '',
    category: '',
    talent_status: '',
    start_time: '',
    end_time: ''
})

const { pager, getLists, resetPage, resetParams } = usePaging({
    fetchFun: getTalentList,
    params: queryParams
})

// 服务类目下拉
const categoryOptions = ['陪诊', '托管', '膳食', '康复', '家政']

// 人才状态切换：禁用后该人才无法被订单关联
const handleStatusChange = (row: any) => {
    const msg = row.talent_status === 1 ? '已启用，可被订单关联' : '已禁用，无法进行订单关联'
    feedback.msgSuccess(msg)
}

// ------------------------------------------------ 人才详情
const detailRef = shallowRef<InstanceType<typeof Popup>>()
const detail = ref<any>({})
const activeTab = ref('base')

// 订单信息：本地搜索（订单编号 / 标题 / 下单用户）
const orderKeyword = ref('')
const filteredOrders = computed(() => {
    const kw = orderKeyword.value.trim()
    const orders = detail.value.orders || []
    if (!kw) return orders
    return orders.filter(
        (o: any) =>
            (o.order_no || '').includes(kw) ||
            (o.title || '').includes(kw) ||
            (o.user || '').includes(kw)
    )
})

const handleDetail = async (row: any) => {
    detail.value = {}
    activeTab.value = 'base'
    orderKeyword.value = ''
    detailRef.value?.open()
    detail.value = await getTalentDetail({ id: row.id })
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

.stat-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}
.stat-item {
    flex: 1;
    min-width: 120px;
    padding: 12px;
    border-radius: 8px;
    background: #f7f8fa;
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.stat-label {
    font-size: 12px;
    color: #909399;
}
.stat-value {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
}

.cert-preview {
    border-radius: 8px;
    border: 1px solid #eef0f3;
    background: #fafbfc;
    overflow: hidden;
}

.order-toolbar {
    display: flex;
    justify-content: flex-end;
    margin-top: 12px;
}
.order-search {
    width: 280px;
    max-width: 100%;
}
</style>
