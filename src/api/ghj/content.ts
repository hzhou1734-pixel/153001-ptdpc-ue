import {
    activityDb,
    activityRecordDb,
    delay,
    inRange,
    nextId,
    noticeDb,
    paginate,
    postCommentDb,
    postDb,
    resourceDb,
    sensitiveDb,
    wonderfulDb
} from '@/mock/db'

// ---------------------------------------------------------------- 帖子
export function getPostList(params: Record<string, any>) {
    const list = paginate(postDb, params, {
        title: (item, v) => item.title.includes(v),
        nickname: (item, v) => item.nickname.includes(v),
        property_name: (item, v) => item.property_name.includes(v),
        property_id: (item, v) => item.property_name.includes(v),
        audit_status: (item, v) => item.audit_status === v,
        start_time: (item, v) => inRange(item.submit_time, v, params.end_time),
        audit_start: (item, v) => inRange(item.audit_time, v, params.audit_end)
    })
    return delay(list)
}

export function getPostDetail(params: { id: any }) {
    const post: any = postDb.find((i) => String(i.id) === String(params.id)) || {}
    return delay({ ...post, comments: postCommentDb(Number(params.id)) })
}

// ---------------------------------------------------------------- 资源大厅
export function getResourceList(params: Record<string, any>) {
    const list = paginate(resourceDb, params, {
        title: (item, v) => item.title.includes(v),
        nickname: (item, v) => item.nickname.includes(v),
        property_name: (item, v) => item.property_name.includes(v),
        audit_status: (item, v) => item.audit_status === v,
        start_time: (item, v) => inRange(item.submit_time, v, params.end_time),
        audit_start: (item, v) => inRange(item.audit_time, v, params.audit_end)
    })
    return delay(list)
}

export function getResourceDetail(params: { id: any }) {
    return delay(resourceDb.find((i) => String(i.id) === String(params.id)) || {})
}

// ---------------------------------------------------------------- 敏感词
export function getSensitiveList(params: Record<string, any>) {
    const list = paginate(sensitiveDb, params, {
        keyword: (item, v) => String(item.id).includes(v) || item.name.includes(v),
        status: (item, v) => String(item.status) === String(v),
        start_time: (item, v) => inRange(item.create_time, v, params.end_time)
    })
    return delay(list)
}

export function sensitiveAdd(params: Record<string, any>) {
    if (sensitiveDb.some((i) => i.name === params.name)) {
        throw new Error('敏感词名称已存在')
    }
    sensitiveDb.unshift({
        id: nextId(sensitiveDb),
        create_time: new Date().toLocaleString('zh-CN', { hour12: false }),
        ...params
    })
    return delay({}, 200)
}

export function sensitiveEdit(params: Record<string, any>) {
    if (sensitiveDb.some((i) => i.name === params.name && String(i.id) !== String(params.id))) {
        throw new Error('敏感词名称已存在')
    }
    const index = sensitiveDb.findIndex((i) => String(i.id) === String(params.id))
    if (index > -1) sensitiveDb[index] = { ...sensitiveDb[index], ...params }
    return delay({}, 200)
}

export function sensitiveStatus(params: { id: any; status: any }) {
    const item = sensitiveDb.find((i) => String(i.id) === String(params.id))
    if (item) item.status = params.status
    return delay({}, 200)
}

export function sensitiveDelete(params: { id: any }) {
    const index = sensitiveDb.findIndex((i) => String(i.id) === String(params.id))
    if (index > -1) sensitiveDb.splice(index, 1)
    return delay({}, 200)
}

// ---------------------------------------------------------------- 报名活动
export function getActivityList(params: Record<string, any>) {
    const list = paginate(activityDb, params, {
        title: (item, v) => item.title.includes(v),
        property_name: (item, v) => item.property_name.includes(v),
        property_id: (item, v) => item.property_name.includes(v),
        start_time: (item, v) => inRange(item.create_time, v, params.end_time)
    })
    return delay(list)
}

export function getActivityDetail(params: { id: any }) {
    const activity: any = activityDb.find((i) => String(i.id) === String(params.id)) || {}
    return delay({ ...activity, records: activityRecordDb(Number(params.id)) })
}

// ---------------------------------------------------------------- 社区通知
export function getNoticeList(params: Record<string, any>) {
    const list = paginate(noticeDb, params, {
        title: (item, v) => item.title.includes(v),
        property_name: (item, v) => item.property_name.includes(v),
        property_id: (item, v) => item.property_name.includes(v),
        status: (item, v) => item.status === v,
        start_time: (item, v) => inRange(item.publish_time, v, params.end_time)
    })
    return delay(list)
}

export function getNoticeDetail(params: { id: any }) {
    return delay(noticeDb.find((i) => String(i.id) === String(params.id)) || {})
}

// ---------------------------------------------------------------- 精彩内容
export function getWonderfulList(params: Record<string, any>) {
    const list = paginate(wonderfulDb, params, {
        title: (item, v) => item.title.includes(v),
        property_name: (item, v) => item.property_name.includes(v),
        property_id: (item, v) => item.property_name.includes(v),
        status: (item, v) => item.status === v,
        start_time: (item, v) => inRange(item.publish_time, v, params.end_time)
    })
    return delay(list)
}

export function getWonderfulDetail(params: { id: any }) {
    return delay(wonderfulDb.find((i) => String(i.id) === String(params.id)) || {})
}
