<!-- 报名活动：查看物业发布的报名活动及报名记录 -->
<template>
    <div>
        <el-card class="!border-none" shadow="never">
            <el-form class="mb-[-16px]" :model="queryParams" :inline="true">
                <el-form-item class="w-[280px]" label="活动标题">
                    <el-input
                        v-model="queryParams.title"
                        placeholder="请输入活动标题"
                        clearable
                        @keyup.enter="resetPage"
                    />
                </el-form-item>
                <el-form-item class="w-[280px]" label="所属物业">
                    <el-select v-model="queryParams.property_name" placeholder="全部" clearable filterable>
                        <el-option
                            v-for="item in propertyOptions"
                            :key="item.id"
                            :label="item.name"
                            :value="item.name"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="创建时间">
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
                        :fetch-fun="getActivityList"
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
                <el-table-column label="活动标题" prop="title" min-width="200" show-overflow-tooltip />
                <el-table-column label="所属物业" prop="property_name" min-width="180" show-overflow-tooltip />
                <el-table-column label="报名人数/人数上限" min-width="160">
                    <template #default="{ row }">
                        {{ row.join_count ?? 0 }}/{{ row.limit_count ?? 0 }}
                    </template>
                </el-table-column>
                <el-table-column label="创建时间" prop="create_time" min-width="170" />
                <el-table-column label="操作" width="180" fixed="right">
                    <template #default="{ row }">
                        <el-button type="primary" link @click="handleDetail(row)">报名详情</el-button>
                        <el-button type="primary" link @click="handleRecord(row)">报名记录</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="flex justify-end mt-4">
                <pagination v-model="pager" @change="getLists" />
            </div>
        </el-card>

        <!-- 报名详情 -->
        <popup
            ref="detailRef"
            title="报名详情"
            width="700px"
            confirm-button-text="关闭"
            :cancel-button-text="false"
        >
            <div class="detail">
                <div class="detail__item detail__item--full">
                    <span class="detail__label">活动标题：</span>
                    <span>{{ detail.title || '-' }}</span>
                </div>
                <div class="detail__item detail__item--full">
                    <span class="detail__label">活动封面：</span>
                    <image-contain :src="detail.image" :width="180" :height="120" fit="cover" />
                </div>
                <div class="detail__item detail__item--full">
                    <span class="detail__label">详情内容：</span>
                    <span>{{ detail.content || '-' }}</span>
                </div>
                <div class="detail__item">
                    <span class="detail__label">活动时间：</span>
                    <span class="detail__time">{{ detail.activity_time || '-' }}</span>
                </div>
                <div class="detail__item">
                    <span class="detail__label">报名截止时间：</span>
                    <span class="detail__time">{{ detail.signup_deadline || '-' }}</span>
                </div>
                <div class="detail__item detail__item--full">
                    <span class="detail__label">创建时间：</span>
                    <span>{{ detail.create_time || '-' }}</span>
                </div>
            </div>
        </popup>

        <!-- 报名记录 -->
        <popup
            ref="recordRef"
            title="报名记录"
            width="800px"
            confirm-button-text="关闭"
            :cancel-button-text="false"
        >
            <el-table size="large" :data="records">
                <el-table-column label="报名人头像" width="100">
                    <template #default="{ row }">
                        <el-avatar :src="row.avatar" :size="50" />
                    </template>
                </el-table-column>
                <el-table-column label="报名人昵称" prop="nickname" min-width="140" />
                <el-table-column label="手机号码" prop="mobile" min-width="140" />
                <el-table-column label="提交报名时间" prop="join_time" min-width="170" />
            </el-table>
        </popup>
    </div>
</template>

<script lang="ts" setup name="ghjContentActivity">
import { getActivityDetail, getActivityList } from '@/api/ghj/content'
import { getPropertyOptions } from '@/api/ghj/property'
import Popup from '@/components/popup/index.vue'

import { usePaging } from '@/hooks/usePaging'

const queryParams = reactive({
    title: '',
    property_name: '',
    start_time: '',
    end_time: ''
})

const { pager, getLists, resetPage, resetParams } = usePaging({
    fetchFun: getActivityList,
    params: queryParams
})

// 所属物业下拉
const propertyOptions = ref<any[]>([])
const getPropertyOptionsList = async () => {
    propertyOptions.value = (await getPropertyOptions()) as any[]
}

// ------------------------------------------------ 报名详情
const detailRef = shallowRef<InstanceType<typeof Popup>>()
const detail = ref<any>({})

const handleDetail = async (row: any) => {
    detail.value = {}
    detailRef.value?.open()
    detail.value = await getActivityDetail({ id: row.id })
}

// ------------------------------------------------ 报名记录
const recordRef = shallowRef<InstanceType<typeof Popup>>()
const records = ref<any[]>([])

const handleRecord = async (row: any) => {
    records.value = []
    recordRef.value?.open()
    const data: any = await getActivityDetail({ id: row.id })
    records.value = data?.records || []
}

onActivated(() => {
    getLists()
})

getPropertyOptionsList()
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
    &__time {
        color: #1c7ed6;
        font-weight: 600;
        letter-spacing: 0.3px;
    }
}
</style>
