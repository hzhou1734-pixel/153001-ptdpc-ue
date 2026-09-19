import {
    activityDb,
    activityRecordDb,
    delay,
    hrDb,
    inRange,
    nextId,
    noticeDb,
    paginate,
    sensitiveDb,
    talentDb,
    talentOrderDb,
    wonderfulDb
} from '@/mock/db'

// ---------------------------------------------------------------- 人力资源
export function getHrList(params: Record<string, any>) {
    const list = paginate(hrDb, params, {
        skill_title: (item, v) => item.skill_title.includes(v),
        nickname: (item, v) => item.nickname.includes(v),
        mobile: (item, v) => item.mobile.includes(v),
        category: (item, v) => item.category === v,
        audit_status: (item, v) => item.audit_status === v,
        start_time: (item, v) => inRange(item.submit_time, v, params.end_time),
        audit_start: (item, v) => inRange(item.audit_time, v, params.audit_end)
    })
    return delay(list)
}

// 审核状态统计：待审核 / 已通过 / 已驳回 / 总认证数
export function getHrStats() {
    const stat = { pending: 0, passed: 0, rejected: 0, total: hrDb.length }
    hrDb.forEach((i: any) => {
        if (i.audit_status === '待审核') stat.pending++
        else if (i.audit_status === '已通过') stat.passed++
        else if (i.audit_status === '已驳回') stat.rejected++
    })
    return delay({ ...stat })
}

// 审核操作：通过 / 驳回，写入 hrDb 审核状态
export function hrAudit(params: { id: any; audit_status: string }) {
    const item: any = hrDb.find((i) => String(i.id) === String(params.id))
    if (item) {
        item.audit_status = params.audit_status
        item.audit_time = new Date().toLocaleString('zh-CN', { hour12: false })
    }
    return delay({}, 200)
}

export function getHrDetail(params: { id: any }) {
    const hr: any = hrDb.find((i) => String(i.id) === String(params.id)) || {}
    return delay({ ...hr })
}

// ---------------------------------------------------------------- 人才库
export function getTalentList(params: Record<string, any>) {
    const list = paginate(talentDb, params, {
        nickname: (item, v) => item.nickname.includes(v),
        mobile: (item, v) => item.mobile.includes(v),
        skill: (item, v) => item.skill.includes(v),
        category: (item, v) => item.category === v,
        talent_status: (item, v) => String(item.talent_status) === String(v),
        start_time: (item, v) => inRange(item.create_time, v, params.end_time)
    })
    return delay(list)
}

export function getTalentDetail(params: { id: any }) {
    const talent: any = talentDb.find((i) => String(i.id) === String(params.id)) || {}
    return delay({ ...talent, orders: talentOrderDb(Number(params.id)) })
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

// 通知状态开关：显示 / 下架，写入 noticeDb
export function noticeStatus(params: { id: any; status: string }) {
    const item = noticeDb.find((i) => String(i.id) === String(params.id))
    if (item) item.status = params.status
    return delay({}, 200)
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

// 精彩内容状态开关：显示 / 下架，写入 wonderfulDb
export function wonderfulStatus(params: { id: any; status: string }) {
    const item = wonderfulDb.find((i) => String(i.id) === String(params.id))
    if (item) item.status = params.status
    return delay({}, 200)
}
