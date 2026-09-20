<!-- 运营管理：陪诊服务（物业后台添加，平台仅查看 + 显示/下架） -->
<template>
    <div>
        <el-card class="!border-none" shadow="never">
            <el-form class="mb-[-16px]" :model="queryParams" :inline="true">
                <el-form-item class="w-[280px]" label="服务标题">
                    <el-input
                        v-model="queryParams.title"
                        placeholder="请输入陪诊服务标题"
                        clearable
                        @keyup.enter="resetPage"
                    />
                </el-form-item>
                <el-form-item class="w-[200px]" label="状态">
                    <el-select v-model="queryParams.status" placeholder="请选择" clearable>
                        <el-option
                            v-for="item in statusOptions"
                            :key="item"
                            :label="item"
                            :value="item"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item class="w-[220px]" label="物业公司">
                    <el-select
                        v-model="queryParams.property_name"
                        placeholder="全部"
                        clearable
                        filterable
                    >
                        <el-option
                            v-for="item in propertyOptions"
                            :key="item.id"
                            :label="item.name"
                            :value="item.name"
                        />
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
                        :fetch-fun="getEscortList"
                        :params="queryParams"
                        :page-size="pager.size"
                    />
                </el-form-item>
            </el-form>
        </el-card>
        <el-card class="!border-none mt-4" shadow="never">
            <el-table size="large" v-loading="pager.loading" :data="pager.lists">
                <el-table-column label="陪诊服务标题" min-width="240">
                    <template #default="{ row }">
                        <div class="title-cell">
                            <div class="title-cell__name">{{ row.title }}</div>
                            <div class="title-cell__sub">{{ row.subtitle }}</div>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="所属物业" prop="property_name" min-width="180" show-overflow-tooltip />
                <el-table-column label="半天价格" min-width="110">
                    <template #default="{ row }">
                        <span class="price-line">{{ row.half_price != null ? '¥' + fmt(row.half_price) : '—' }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="整天价格" min-width="110">
                    <template #default="{ row }">
                        <span class="price-line">{{ row.full_price != null ? '¥' + fmt(row.full_price) : '—' }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="状态" min-width="130">
                    <template #default="{ row }">
                        <el-switch
                            v-model="row.status"
                            inline-prompt
                            active-value="显示中"
                            inactive-value="已下架"
                            active-text="显示"
                            inactive-text="下架"
                            @change="(val) => handleStatus(row, String(val))"
                        />
                    </template>
                </el-table-column>
                <el-table-column label="推荐" prop="recommend" min-width="90" />
                <el-table-column label="添加时间" prop="create_time" min-width="170" />
                <el-table-column label="操作" width="120" fixed="right">
                    <template #default="{ row }">
                        <el-button type="primary" link @click="handleDetail(row)">查看</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="flex justify-end mt-4">
                <pagination v-model="pager" @change="getLists" />
            </div>
        </el-card>

        <!-- 服务详情 -->
        <popup
            ref="detailRef"
            title="陪诊服务详情"
            width="640px"
            confirm-button-text="关闭"
            :cancel-button-text="false"
        >
            <div class="detail" v-if="detail.id">
                <div class="detail__item detail__item--full">
                    <span class="detail__label">服务标题：</span>
                    <span>{{ detail.title || '-' }}</span>
                </div>
                <div class="detail__item">
                    <span class="detail__label">所属物业：</span>
                    <span>{{ detail.property_name || '-' }}</span>
                </div>
                <div class="detail__item">
                    <span class="detail__label">半天价格：</span>
                    <span class="price-line">{{ detail.half_price != null ? '¥' + fmt(detail.half_price) : '—' }}</span>
                </div>
                <div class="detail__item">
                    <span class="detail__label">整天价格：</span>
                    <span class="price-line">{{ detail.full_price != null ? '¥' + fmt(detail.full_price) : '—' }}</span>
                </div>
                <div class="detail__item">
                    <span class="detail__label">状态：</span>
                    <span>{{ detail.status || '-' }}</span>
                </div>
                <div class="detail__item">
                    <span class="detail__label">推荐：</span>
                    <span>{{ detail.recommend ?? '-' }}</span>
                </div>
                <div class="detail__item detail__item--full">
                    <span class="detail__label">添加时间：</span>
                    <span>{{ detail.create_time || '-' }}</span>
                </div>
                <div class="detail__item detail__item--full">
                    <span class="detail__label">详情介绍：</span>
                    <span class="detail__content" v-html="detail.content"></span>
                </div>
            </div>
        </popup>
    </div>
</template>

<script lang="ts" setup name="ghjServiceEscort">
import { escortStatus, getEscortList } from '@/api/ghj/content'
import { getPropertyOptions } from '@/api/ghj/property'
import Popup from '@/components/popup/index.vue'
import { ElMessage } from 'element-plus'

import { usePaging } from '@/hooks/usePaging'

const queryParams = reactive({
    title: '',
    property_name: '',
    status: '',
    start_time: '',
    end_time: ''
})

const { pager, getLists, resetPage, resetParams } = usePaging({
    fetchFun: getEscortList,
    params: queryParams
})

// 物业公司 / 状态下拉
const propertyOptions = ref<any[]>([])
const statusOptions = ['显示中', '已下架']

// 价格格式化：两位小数
const fmt = (v?: number | string) =>
    v === undefined || v === null || v === '' ? '-' : Number(v).toFixed(2)

// ------------------------------------------------ 服务详情
const detailRef = shallowRef<InstanceType<typeof Popup>>()
const detail = ref<any>({})

const handleDetail = async (row: any) => {
    detail.value = {}
    detailRef.value?.open()
    detail.value = { ...row }
}

// 状态开关：显示 / 下架
const handleStatus = async (row: any, status: string) => {
    await escortStatus({ id: row.id, status })
    ElMessage.success(status === '显示中' ? '陪诊服务已显示' : '陪诊服务已下架')
}

onActivated(() => {
    getLists()
})

getLists()
getPropertyOptions().then((res: any) => {
    propertyOptions.value = res
})
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
    &__content {
        display: block;
        margin-top: 4px;
        line-height: 22px;
        color: #606266;
        :deep(p) {
            margin: 0 0 6px;
        }
    }
}
.price-line {
    color: #ff7a1a;
    font-size: 13px;
}
.title-cell {
    &__name {
        font-size: 14px;
        color: #303133;
        line-height: 20px;
    }
    &__sub {
        margin-top: 2px;
        font-size: 12px;
        color: #909399;
        line-height: 18px;
    }
}
</style>
