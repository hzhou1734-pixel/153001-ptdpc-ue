import { communityDb, delay, inRange, nextId, paginate, propertyDb } from '@/mock/db'

// ---------------------------------------------------------------- 物业
export function getPropertyList(params: Record<string, any>) {
    const list = paginate(propertyDb, params, {
        keyword: (item, v) =>
            String(item.id).includes(v) ||
            item.name.includes(v) ||
            item.contact.includes(v) ||
            item.mobile.includes(v),
        start_time: (item, v) => inRange(item.create_time, v, params.end_time)
    })
    return delay(list)
}

export function getPropertyDetail(params: { id: any }) {
    return delay(propertyDb.find((i) => String(i.id) === String(params.id)) || {})
}

export function propertyAdd(params: Record<string, any>) {
    propertyDb.unshift({
        id: nextId(propertyDb),
        community_count: 0,
        user_count: 0,
        order_count: 0,
        total_amount: 0,
        create_time: new Date().toLocaleString('zh-CN', { hour12: false }),
        ...params
    })
    return delay({}, 200)
}

export function propertyEdit(params: Record<string, any>) {
    const index = propertyDb.findIndex((i) => String(i.id) === String(params.id))
    if (index > -1) propertyDb[index] = { ...propertyDb[index], ...params }
    return delay({}, 200)
}

export function propertyStatus(params: { id: any; status: any }) {
    const item = propertyDb.find((i) => String(i.id) === String(params.id))
    if (item) item.status = params.status
    return delay({}, 200)
}

export function propertyResetPwd(params: { id: any }) {
    const item = propertyDb.find((i) => String(i.id) === String(params.id))
    if (item) item.password = '999999'
    return delay({}, 200)
}

// ---------------------------------------------------------------- 小区
export function getCommunityList(params: Record<string, any>) {
    const list = paginate(communityDb, params, {
        keyword: (item, v) => String(item.id).includes(v) || item.name.includes(v),
        property_id: (item, v) => String(item.property_id) === String(v),
        start_time: (item, v) => inRange(item.create_time, v, params.end_time)
    })
    return delay(list)
}

export function getCommunityDetail(params: { id: any }) {
    return delay(communityDb.find((i) => String(i.id) === String(params.id)) || {})
}

export function getPropertyOptions() {
    return delay(propertyDb.map((i) => ({ id: i.id, name: i.name })))
}
