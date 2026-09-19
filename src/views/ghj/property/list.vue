<!-- 物业列表：物业公司账号管理，支持新增/编辑物业、启用禁用账号、重置登录密码 -->
<template>
    <div>
        <el-card class="!border-none" shadow="never">
            <el-form class="mb-[-16px]" :model="queryParams" :inline="true">
                <el-form-item class="w-[280px]" label="物业信息">
                    <el-input
                        v-model="queryParams.keyword"
                        placeholder="物业ID/公司名称/联系人姓名/手机号"
                        clearable
                        @keyup.enter="resetPage"
                    />
                </el-form-item>
                <el-form-item class="w-[280px]" label="账号状态">
                    <el-select v-model="queryParams.status" placeholder="全部" clearable>
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
                        :fetch-fun="getPropertyList"
                        :params="queryParams"
                        :page-size="pager.size"
                    />
                </el-form-item>
            </el-form>
        </el-card>
        <el-card class="!border-none mt-4" shadow="never">
            <div>
                <popup
                    ref="popupRef"
                    :title="popupTitle"
                    :async="true"
                    width="600px"
                    @confirm="handleSubmit"
                    @close="handleClose"
                >
                    <template #trigger>
                        <el-button type="primary" @click="handleAdd">添加物业</el-button>
                    </template>
                    <el-form
                        ref="formRef"
                        :model="formData"
                        label-width="100px"
                        :rules="formRules"
                    >
                        <el-form-item v-if="mode === 'edit'" label="物业ID">
                            <el-input :model-value="formData.id" disabled />
                        </el-form-item>
                        <el-form-item label="公司名称" prop="name">
                            <el-input
                                v-model="formData.name"
                                placeholder="请输入公司名称"
                                clearable
                            />
                        </el-form-item>
                        <el-form-item label="联系人姓名" prop="contact">
                            <el-input
                                v-model="formData.contact"
                                placeholder="请输入联系人姓名"
                                clearable
                            />
                        </el-form-item>
                        <el-form-item label="手机号" prop="mobile">
                            <el-input
                                v-model="formData.mobile"
                                placeholder="请输入手机号"
                                clearable
                            />
                        </el-form-item>
                        <el-form-item label="登录账号" prop="account">
                            <el-input
                                v-model="formData.account"
                                placeholder="请输入登录账号"
                                clearable
                            />
                        </el-form-item>
                        <el-form-item label="登录密码" prop="password">
                            <el-input
                                v-model="formData.password"
                                :placeholder="mode === 'edit' ? '不填则不修改密码' : '请输入登录密码'"
                                clearable
                                show-password
                            />
                        </el-form-item>
                        <el-form-item label="账号状态" prop="status">
                            <el-radio-group v-model="formData.status">
                                <el-radio :value="1">启用</el-radio>
                                <el-radio :value="0">禁用</el-radio>
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item label="账号有效期">
                            <div>
                                <el-date-picker
                                    v-model="expireRange"
                                    type="daterange"
                                    range-separator="至"
                                    start-placeholder="开始日期"
                                    end-placeholder="结束日期"
                                    value-format="YYYY-MM-DD"
                                    :clearable="true"
                                />
                                <div class="form-tips">超期限后自动关停线上运营权限</div>
                            </div>
                        </el-form-item>
                    </el-form>
                </popup>
            </div>
            <el-table class="mt-4" size="large" v-loading="pager.loading" :data="pager.lists">
                <el-table-column label="物业ID" prop="id" min-width="100" />
                <el-table-column label="公司名称" prop="name" min-width="180" show-overflow-tooltip />
                <el-table-column label="联系人姓名" prop="contact" min-width="120" />
                <el-table-column label="手机号" prop="mobile" min-width="120" />
                <el-table-column label="小区名称" prop="community_name" min-width="160" show-overflow-tooltip />
                <el-table-column label="用户总数" prop="user_count" min-width="110" />
                <el-table-column label="总订单数" prop="order_count" min-width="110" />
                <el-table-column label="累计交易额" min-width="140">
                    <template #default="{ row }">
                        {{ formatMoney(row.total_amount) }}
                    </template>
                </el-table-column>
                <el-table-column label="账号状态" min-width="100">
                    <template #default="{ row }">
                        <el-switch
                            :model-value="row.status"
                            :active-value="1"
                            :inactive-value="0"
                            @change="handleStatusChange($event, row)"
                        />
                    </template>
                </el-table-column>
                <el-table-column label="添加时间" prop="create_time" min-width="160" />
                <el-table-column label="操作" width="240" fixed="right">
                    <template #default="{ row }">
                        <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
                        <el-button type="success" link @click="handleCommunity(row)">小区信息</el-button>
                        <el-button type="danger" link @click="handleResetPwd(row)">
                            重置密码
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="flex justify-end mt-4">
                <pagination v-model="pager" @change="getLists" />
            </div>
        </el-card>

        <!-- 小区信息（一物业一小区，点击查看所属小区详情） -->
        <popup
            ref="communityRef"
            title="小区信息"
            width="600px"
            confirm-button-text="关闭"
            :cancel-button-text="false"
        >
            <div class="detail">
                <div class="detail__item">
                    <span class="detail__label">小区ID：</span>
                    <span>{{ communityDetail.id || '-' }}</span>
                </div>
                <div class="detail__item">
                    <span class="detail__label">小区名称：</span>
                    <span>{{ communityDetail.name || '-' }}</span>
                </div>
                <div class="detail__item">
                    <span class="detail__label">所属物业：</span>
                    <span>{{ communityDetail.property_name || '-' }}</span>
                </div>
                <div class="detail__item">
                    <span class="detail__label">建成年份：</span>
                    <span>{{ communityDetail.build_year || '-' }}</span>
                </div>
                <div class="detail__item detail__item--full">
                    <span class="detail__label">详细地址：</span>
                    <span>{{ getFullAddress(communityDetail) }}</span>
                </div>
                <div class="detail__item">
                    <span class="detail__label">总栋数：</span>
                    <span>{{ communityDetail.building_count ?? '-' }}</span>
                </div>
                <div class="detail__item">
                    <span class="detail__label">总户数：</span>
                    <span>{{ communityDetail.house_count ?? '-' }}</span>
                </div>
                <div class="detail__item">
                    <span class="detail__label">已认证户数：</span>
                    <span>{{ communityDetail.auth_house_count ?? '-' }}</span>
                </div>
                <div class="detail__item">
                    <span class="detail__label">创建时间：</span>
                    <span>{{ communityDetail.create_time || '-' }}</span>
                </div>
            </div>
        </popup>
    </div>
</template>

<script lang="ts" setup name="ghjPropertyList">
import type { FormInstance } from 'element-plus'

import {
    getCommunityDetail,
    getPropertyList,
    propertyAdd,
    propertyEdit,
    propertyResetPwd,
    propertyStatus
} from '@/api/ghj/property'
import Popup from '@/components/popup/index.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

import { usePaging } from '@/hooks/usePaging'

const queryParams = reactive({
    keyword: '',
    status: '',
    start_time: '',
    end_time: ''
})

const { pager, getLists, resetPage, resetParams } = usePaging({
    fetchFun: getPropertyList,
    params: queryParams
})

const formatMoney = (val: any) =>
    `¥${Number(val ?? 0).toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`

// ------------------------------------------------ 新增 / 编辑
const formRef = shallowRef<FormInstance>()
const popupRef = shallowRef<InstanceType<typeof Popup>>()
const mode = ref('add')
const popupTitle = computed(() => (mode.value === 'edit' ? '编辑物业' : '添加物业'))

const formData = reactive<any>({
    id: '',
    name: '',
    contact: '',
    mobile: '',
    account: '',
    password: '',
    status: 1,
    expire_start: '',
    expire_end: ''
})

// 账号有效期范围选择器的中间态，提交时拆回 expire_start / expire_end
// （any：el-date-picker 的 modelValue 联合类型不含 null，直接标 [string, string] | null 会报 TS2322）
const expireRange = ref<any>(null)

// 编辑时密码留空表示不修改
const formRules = computed(() => ({
    name: [{ required: true, message: '请输入公司名称', trigger: ['blur'] }],
    contact: [{ required: true, message: '请输入联系人姓名', trigger: ['blur'] }],
    mobile: [{ required: true, message: '请输入手机号', trigger: ['blur'] }],
    account: [{ required: true, message: '请输入登录账号', trigger: ['blur'] }],
    password:
        mode.value === 'add'
            ? [{ required: true, message: '请输入登录密码', trigger: ['blur'] }]
            : []
}))

const setFormData = (data: Record<string, any>) => {
    Object.keys(formData).forEach((key) => {
        if (data[key] !== null && data[key] !== undefined) {
            formData[key] = data[key]
        }
    })
}

const handleAdd = () => {
    mode.value = 'add'
}

const handleEdit = (row: Record<string, any>) => {
    mode.value = 'edit'
    setFormData({
        id: row.id,
        name: row.name,
        contact: row.contact,
        mobile: row.mobile,
        account: row.account ?? '',
        status: Number(row.status),
        expire_start: row.expire_start ?? '',
        expire_end: row.expire_end ?? ''
    })
    expireRange.value =
        formData.expire_start && formData.expire_end
            ? [formData.expire_start, formData.expire_end]
            : null
    formData.password = ''
    popupRef.value?.open()
}

const handleSubmit = async () => {
    await formRef.value?.validate()
    // 范围选择器值拆回起止字段；清空范围则两个有效期字段一并置空
    formData.expire_start = expireRange.value?.[0] ?? ''
    formData.expire_end = expireRange.value?.[1] ?? ''
    if (mode.value === 'edit') {
        await propertyEdit(formData)
    } else {
        await propertyAdd(formData)
    }
    popupRef.value?.close()
    ElMessage.success('操作成功')
    getLists()
}

const handleClose = () => {
    formRef.value?.resetFields()
    formData.id = ''
    formData.password = ''
    formData.expire_start = ''
    formData.expire_end = ''
    expireRange.value = null
    mode.value = 'add'
}

// ------------------------------------------------ 启用 / 禁用
const handleStatusChange = async (val: any, row: any) => {
    try {
        if (Number(val) === 0) {
            await ElMessageBox.confirm(
                '禁用后该账号下所有小区不允许再提交新订单，确认禁用吗？',
                '禁用提示',
                {
                    confirmButtonText: '确认禁用',
                    cancelButtonText: '取消',
                    type: 'warning'
                }
            )
        }
        await propertyStatus({ id: row.id, status: val })
        row.status = val
        ElMessage.success(Number(val) === 1 ? '已启用' : '已禁用')
        getLists()
    } catch (error) {
        // 取消操作
    }
}

// ------------------------------------------------ 重置密码
const handleResetPwd = async (row: any) => {
    try {
        await ElMessageBox.confirm(
            `确认将「${row.name}」的登录密码重置为 999999 吗？`,
            '重置密码',
            {
                confirmButtonText: '确认重置',
                cancelButtonText: '取消',
                type: 'warning'
            }
        )
        await propertyResetPwd({ id: row.id })
        ElMessage.success('密码已重置为 999999')
    } catch (error) {
        // 取消操作
    }
}

onActivated(() => {
    getLists()
})

// ------------------------------------------------ 小区信息（一物业一小区，点击查看所属小区详情）
const communityRef = shallowRef<InstanceType<typeof Popup>>()
const communityDetail = ref<any>({})

// 拼接省市区 + 详细地址
const getFullAddress = (row: any) => {
    if (!row) return '-'
    const arr = [row.province, row.city, row.district, row.address].filter((i) => !!i)
    return arr.join('') || '-'
}

const handleCommunity = async (row: any) => {
    communityDetail.value = {}
    communityRef.value?.open()
    if (row.community_id) {
        communityDetail.value = await getCommunityDetail({ id: row.community_id })
    }
}

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
