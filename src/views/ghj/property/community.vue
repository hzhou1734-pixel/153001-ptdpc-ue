<!-- 小区列表：小区由物业管理后台维护，平台仅支持查看，可查看小区完整详情 -->
<template>
    <div>
        <el-alert
            class="!mb-4"
            type="info"
            :closable="false"
            show-icon
            title="小区由物业管理后台维护，平台对小区信息仅查看，不做维护"
        />
        <el-card class="!border-none" shadow="never">
            <el-form class="mb-[-16px]" :model="queryParams" :inline="true">
                <el-form-item class="w-[280px]" label="小区信息">
                    <el-input
                        v-model="queryParams.keyword"
                        placeholder="小区ID/小区名称"
                        clearable
                        @keyup.enter="resetPage"
                    />
                </el-form-item>
                <el-form-item class="w-[280px]" label="所属物业">
                    <el-select v-model="queryParams.property_id" placeholder="全部" clearable filterable>
                        <el-option
                            v-for="item in propertyOptions"
                            :key="item.id"
                            :label="item.name"
                            :value="item.id"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item class="w-[280px]" label="城市">
                    <el-select v-model="queryParams.city" placeholder="全部" clearable>
                        <el-option v-for="item in cityOptions" :key="item" :label="item" :value="item" />
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
                        :fetch-fun="getCommunityList"
                        :params="queryParams"
                        :page-size="pager.size"
                    />
                </el-form-item>
            </el-form>
        </el-card>
        <el-card class="!border-none mt-4" shadow="never">
            <el-table size="large" v-loading="pager.loading" :data="pager.lists">
                <el-table-column label="小区ID" prop="id" min-width="100" />
                <el-table-column label="小区名称" prop="name" min-width="160" show-overflow-tooltip />
                <el-table-column label="所属物业" prop="property_name" min-width="180" show-overflow-tooltip />
                <el-table-column label="详细地址" min-width="240" show-overflow-tooltip>
                    <template #default="{ row }">
                        {{ getFullAddress(row) }}
                    </template>
                </el-table-column>
                <el-table-column label="建成年份" prop="build_year" min-width="100" />
                <el-table-column label="总户数" prop="house_count" min-width="100" />
                <el-table-column label="已认证户数" prop="auth_house_count" min-width="110" />
                <el-table-column label="创建时间" prop="create_time" min-width="160" />
                <el-table-column label="操作" width="100" fixed="right">
                    <template #default="{ row }">
                        <el-button type="primary" link @click="handleDetail(row)">小区详情</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="flex justify-end mt-4">
                <pagination v-model="pager" @change="getLists" />
            </div>
        </el-card>

        <!-- 小区详情 -->
        <popup
            ref="detailRef"
            title="小区详情"
            width="600px"
            confirm-button-text="关闭"
            :cancel-button-text="false"
        >
            <div class="detail">
                <div class="detail__item">
                    <span class="detail__label">小区ID：</span>
                    <span>{{ detail.id || '-' }}</span>
                </div>
                <div class="detail__item">
                    <span class="detail__label">小区名称：</span>
                    <span>{{ detail.name || '-' }}</span>
                </div>
                <div class="detail__item">
                    <span class="detail__label">所属物业：</span>
                    <span>{{ detail.property_name || '-' }}</span>
                </div>
                <div class="detail__item">
                    <span class="detail__label">建成年份：</span>
                    <span>{{ detail.build_year || '-' }}</span>
                </div>
                <div class="detail__item detail__item--full">
                    <span class="detail__label">详细地址：</span>
                    <span>{{ getFullAddress(detail) }}</span>
                </div>
                <div class="detail__item">
                    <span class="detail__label">总栋数：</span>
                    <span>{{ detail.building_count ?? '-' }}</span>
                </div>
                <div class="detail__item">
                    <span class="detail__label">总户数：</span>
                    <span>{{ detail.house_count ?? '-' }}</span>
                </div>
                <div class="detail__item">
                    <span class="detail__label">已认证户数：</span>
                    <span>{{ detail.auth_house_count ?? '-' }}</span>
                </div>
                <div class="detail__item">
                    <span class="detail__label">创建时间：</span>
                    <span>{{ detail.create_time || '-' }}</span>
                </div>
            </div>
        </popup>
    </div>
</template>

<script lang="ts" setup name="ghjPropertyCommunity">
import { getCommunityDetail, getCommunityList, getPropertyOptions } from '@/api/ghj/property'
import Popup from '@/components/popup/index.vue'

import { usePaging } from '@/hooks/usePaging'

const queryParams = reactive({
    keyword: '',
    property_id: '',
    city: '',
    start_time: '',
    end_time: ''
})

const { pager, getLists, resetPage, resetParams } = usePaging({
    fetchFun: getCommunityList,
    params: queryParams
})

// 城市下拉（与物业端维护的城市保持一致）
const cityOptions = ['长沙市', '株洲市', '湘潭市', '衡阳市', '岳阳市', '常德市', '郴州市', '永州市']

// 所属物业下拉
const propertyOptions = ref<any[]>([])
const getPropertyOptionsList = async () => {
    propertyOptions.value = (await getPropertyOptions()) as any[]
}

// 拼接省市区 + 详细地址
const getFullAddress = (row: any) => {
    if (!row) return '-'
    const arr = [row.province, row.city, row.district, row.address].filter((i) => !!i)
    return arr.join('') || '-'
}

// ------------------------------------------------ 小区详情
const detailRef = shallowRef<InstanceType<typeof Popup>>()
const detail = ref<any>({})

const handleDetail = async (row: any) => {
    detail.value = {}
    detailRef.value?.open()
    detail.value = await getCommunityDetail({ id: row.id })
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
