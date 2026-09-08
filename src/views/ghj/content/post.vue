<!-- 帖子列表：查看社区帖子内容、审核状态及评论记录 -->
<template>
    <div>
        <el-card class="!border-none" shadow="never">
            <el-form class="mb-[-16px]" :model="queryParams" :inline="true">
                <el-form-item class="w-[280px]" label="帖子标题">
                    <el-input
                        v-model="queryParams.title"
                        placeholder="请输入帖子标题"
                        clearable
                        @keyup.enter="resetPage"
                    />
                </el-form-item>
                <el-form-item class="w-[280px]" label="发布人昵称">
                    <el-input
                        v-model="queryParams.nickname"
                        placeholder="请输入发布人昵称"
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
                <el-form-item class="w-[280px]" label="审核状态">
                    <el-select v-model="queryParams.audit_status" placeholder="全部" clearable>
                        <el-option
                            v-for="item in auditStatusOptions"
                            :key="item"
                            :label="item"
                            :value="item"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="提交时间">
                    <daterange-picker
                        v-model:startTime="queryParams.start_time"
                        v-model:endTime="queryParams.end_time"
                    />
                </el-form-item>
                <el-form-item label="审核时间">
                    <daterange-picker
                        v-model:startTime="queryParams.audit_start"
                        v-model:endTime="queryParams.audit_end"
                    />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="resetPage">查询</el-button>
                    <el-button @click="resetParams">重置</el-button>
                    <export-data
                        class="ml-2.5"
                        :fetch-fun="getPostList"
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
                <el-table-column label="帖子标题" prop="title" min-width="200" show-overflow-tooltip />
                <el-table-column label="所属物业" prop="property_name" min-width="180" show-overflow-tooltip />
                <el-table-column label="发布人" min-width="160">
                    <template #default="{ row }">
                        <div class="flex items-center">
                            <el-avatar :src="row.avatar" :size="40" />
                            <span class="ml-2.5">{{ row.nickname }}</span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="手机号码" prop="mobile" min-width="130" />
                <el-table-column label="审核状态" min-width="110">
                    <template #default="{ row }">
                        <el-tag :type="getAuditStatusType(row.audit_status)">
                            {{ row.audit_status }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="提交时间" prop="submit_time" min-width="170" />
                <el-table-column label="审核时间" prop="audit_time" min-width="170" />
                <el-table-column label="操作" width="180" fixed="right">
                    <template #default="{ row }">
                        <el-button type="primary" link @click="handleDetail(row)">帖子详情</el-button>
                        <el-button type="primary" link @click="handleComment(row)">评论记录</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="flex justify-end mt-4">
                <pagination v-model="pager" @change="getLists" />
            </div>
        </el-card>

        <!-- 帖子详情 -->
        <popup
            ref="detailRef"
            title="帖子详情"
            width="700px"
            confirm-button-text="关闭"
            :cancel-button-text="false"
        >
            <div class="detail">
                <div class="detail__item detail__item--full">
                    <span class="detail__label">帖子图片：</span>
                    <image-contain :src="detail.image" :width="180" :height="120" fit="cover" />
                </div>
                <div class="detail__item detail__item--full">
                    <span class="detail__label">帖子标题：</span>
                    <span>{{ detail.title || '-' }}</span>
                </div>
                <div class="detail__item detail__item--full">
                    <span class="detail__label">详情内容：</span>
                    <span>{{ detail.content || '-' }}</span>
                </div>
                <div class="detail__item">
                    <span class="detail__label">点赞数量：</span>
                    <span>{{ detail.like_count ?? '-' }}</span>
                </div>
                <div class="detail__item">
                    <span class="detail__label">评价数量：</span>
                    <span>{{ detail.comment_count ?? '-' }}</span>
                </div>
            </div>
        </popup>

        <!-- 评论记录 -->
        <popup
            ref="commentRef"
            title="评论记录"
            width="700px"
            confirm-button-text="关闭"
            :cancel-button-text="false"
        >
            <el-empty v-if="!comments.length" description="暂无评论" />
            <div v-else class="comment-list">
                <div v-for="item in comments" :key="item.id" class="comment-item">
                    <div class="comment-main">
                        <el-avatar :src="item.avatar" :size="36" />
                        <div class="comment-body">
                            <div class="comment-head">
                                <span class="comment-nickname">{{ item.nickname }}</span>
                                <span class="comment-time">{{ item.create_time }}</span>
                            </div>
                            <div class="comment-content">{{ item.content }}</div>
                        </div>
                    </div>
                    <!-- 二级评论（子回复） -->
                    <div v-if="item.replies && item.replies.length" class="comment-replies">
                        <div v-for="reply in item.replies" :key="reply.id" class="reply-item">
                            <el-avatar :src="reply.avatar" :size="28" />
                            <div class="reply-body">
                                <div class="comment-head">
                                    <span class="comment-nickname">
                                        {{ reply.nickname
                                        }}<template v-if="reply.reply_nickname">
                                            <span class="reply-arrow"> → </span
                                            >{{ reply.reply_nickname }}</template
                                        >
                                    </span>
                                    <span class="comment-time">{{ reply.create_time }}</span>
                                </div>
                                <div class="comment-content">{{ reply.content }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </popup>
    </div>
</template>

<script lang="ts" setup name="ghjContentPost">
import { getPostDetail, getPostList } from '@/api/ghj/content'
import { getPropertyOptions } from '@/api/ghj/property'
import Popup from '@/components/popup/index.vue'

import { usePaging } from '@/hooks/usePaging'

const queryParams = reactive({
    title: '',
    nickname: '',
    mobile: '',
    property_name: '',
    audit_status: '',
    start_time: '',
    end_time: '',
    audit_start: '',
    audit_end: ''
})

const { pager, getLists, resetPage, resetParams } = usePaging({
    fetchFun: getPostList,
    params: queryParams
})

// 审核状态下拉
const auditStatusOptions = ['待审核', '已通过', '已驳回']

const getAuditStatusType = (status: any) => {
    if (status === '已通过') return 'success'
    if (status === '已驳回') return 'danger'
    return 'warning'
}

// 所属物业下拉
const propertyOptions = ref<any[]>([])
const getPropertyOptionsList = async () => {
    propertyOptions.value = (await getPropertyOptions()) as any[]
}

// ------------------------------------------------ 帖子详情
const detailRef = shallowRef<InstanceType<typeof Popup>>()
const detail = ref<any>({})

const handleDetail = async (row: any) => {
    detail.value = {}
    detailRef.value?.open()
    detail.value = await getPostDetail({ id: row.id })
}

// ------------------------------------------------ 评论记录
const commentRef = shallowRef<InstanceType<typeof Popup>>()
const comments = ref<any[]>([])

const handleComment = async (row: any) => {
    comments.value = []
    commentRef.value?.open()
    const data: any = await getPostDetail({ id: row.id })
    comments.value = data?.comments || []
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

// 评论记录：父评论 + 缩进子回复
.comment-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}
.comment-item {
    padding-bottom: 16px;
    border-bottom: 1px solid #f0f0f0;
    &:last-child {
        padding-bottom: 0;
        border-bottom: none;
    }
}
.comment-main,
.reply-item {
    display: flex;
    align-items: flex-start;
}
.comment-body,
.reply-body {
    flex: 1;
    min-width: 0;
    margin-left: 10px;
}
.comment-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}
.comment-nickname {
    font-size: 13px;
    font-weight: 600;
    color: #303133;
    word-break: break-all;
}
.reply-arrow {
    font-weight: 400;
    color: #909399;
}
.comment-time {
    flex-shrink: 0;
    font-size: 12px;
    color: #909399;
}
.comment-content {
    margin-top: 2px;
    font-size: 14px;
    line-height: 22px;
    color: #606266;
    word-break: break-all;
}
.comment-replies {
    margin-top: 10px;
    margin-left: 46px; // 头像36 + 间距10，与父评论正文对齐
    padding: 10px 12px;
    border-radius: 8px;
    background: #f7f8fa;
    display: flex;
    flex-direction: column;
    gap: 10px;
}
</style>
