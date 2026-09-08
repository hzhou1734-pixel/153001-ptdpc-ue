<!-- 社区通知：通知由物业后台发布，平台仅查看 -->
<template>
    <div>
        <el-alert
            class="!mb-4"
            type="info"
            :closable="false"
            show-icon
            title="所有通知由物业后台发布，平台后台仅查看，不做维护"
        />
        <el-card class="!border-none" shadow="never">
            <el-form class="mb-[-16px]" :model="queryParams" :inline="true">
                <el-form-item class="w-[280px]" label="通知标题">
                    <el-input
                        v-model="queryParams.title"
                        placeholder="请输入通知标题"
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
                <el-form-item class="w-[280px]" label="通知状态">
                    <el-select v-model="queryParams.status" placeholder="全部" clearable>
                        <el-option
                            v-for="item in statusOptions"
                            :key="item"
                            :label="item"
                            :value="item"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="发布时间">
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
                        :fetch-fun="getNoticeList"
                        :params="queryParams"
                        :page-size="pager.size"
                    />
                </el-form-item>
            </el-form>
        </el-card>
        <el-card class="!border-none mt-4" shadow="never">
            <el-table size="large" v-loading="pager.loading" :data="pager.lists">
                <el-table-column label="通知标题" prop="title" min-width="240" show-overflow-tooltip />
                <el-table-column label="所属物业" prop="property_name" min-width="180" show-overflow-tooltip />
                <el-table-column label="通知状态" min-width="110">
                    <template #default="{ row }">
                        <el-tag :type="row.status === '显示中' ? 'success' : 'info'">
                            {{ row.status }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="发布时间" prop="publish_time" min-width="170" />
                <el-table-column label="操作" width="120" fixed="right">
                    <template #default="{ row }">
                        <el-button type="primary" link @click="handleDetail(row)">通知详情</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="flex justify-end mt-4">
                <pagination v-model="pager" @change="getLists" />
            </div>
        </el-card>

        <!-- 通知详情 -->
        <popup
            ref="detailRef"
            title="通知详情"
            width="700px"
            confirm-button-text="关闭"
            :cancel-button-text="false"
        >
            <div class="detail">
                <div class="detail__item detail__item--full">
                    <span class="detail__label">通知标题：</span>
                    <span>{{ detail.title || '-' }}</span>
                </div>
                <div class="detail__item detail__item--full">
                    <span class="detail__label">所属物业：</span>
                    <span>{{ detail.property_name || '-' }}</span>
                </div>
                <div class="detail__item detail__item--full">
                    <span class="detail__label">详情内容：</span>
                    <span>{{ detail.content || '-' }}</span>
                </div>
                <div class="detail__item">
                    <span class="detail__label">发布时间：</span>
                    <span>{{ detail.publish_time || '-' }}</span>
                </div>
                <div class="detail__item">
                    <span class="detail__label">显示状态：</span>
                    <span>{{ detail.status || '-' }}</span>
                </div>
            </div>
        </popup>
    </div>
</template>

<script lang="ts" setup name="ghjContentNotice">
import { getNoticeDetail, getNoticeList } from '@/api/ghj/content'
import { getPropertyOptions } from '@/api/ghj/property'
import Popup from '@/components/popup/index.vue'

import { usePaging } from '@/hooks/usePaging'

const queryParams = reactive({
    title: '',
    property_name: '',
    status: '',
    start_time: '',
    end_time: ''
})

const { pager, getLists, resetPage, resetParams } = usePaging({
    fetchFun: getNoticeList,
    params: queryParams
})

// 通知状态下拉
const statusOptions = ['显示中', '已下架']

// 所属物业下拉
const propertyOptions = ref<any[]>([])
const getPropertyOptionsList = async () => {
    propertyOptions.value = (await getPropertyOptions()) as any[]
}

// ------------------------------------------------ 通知详情
const detailRef = shallowRef<InstanceType<typeof Popup>>()
const detail = ref<any>({})

const handleDetail = async (row: any) => {
    detail.value = {}
    detailRef.value?.open()
    detail.value = await getNoticeDetail({ id: row.id })
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
}
</style>
