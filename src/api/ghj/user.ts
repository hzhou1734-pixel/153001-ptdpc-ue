import {
    delay,
    inRange,
    paginate,
    staffDb,
    userAuthDb,
    userBandDb,
    userCoinDb,
    userDb,
    userJoinDb,
    userOrderDb,
    userSettleDb,
    userTalentDb
} from '@/mock/db'

// ---------------------------------------------------------------- 用户
export function getUserLists(params: Record<string, any>) {
    const list = paginate(userDb, params, {
        keyword: (item, v) =>
            String(item.id).includes(v) || item.nickname.includes(v) || item.mobile.includes(v),
        start_time: (item, v) => inRange(item.create_time, v, params.end_time),
        login_start: (item, v) => inRange(item.login_time, v, params.login_end)
    })
    return delay(list)
}

export function getUserDetail(params: { id: any }) {
    const user = userDb.find((i) => String(i.id) === String(params.id)) || {}
    return delay({
        base: user,
        order: userOrderDb(Number(params.id)),
        settle: userSettleDb(),
        coin: userCoinDb(Number(params.id)),
        talent: userTalentDb(),
        auth: userAuthDb(),
        band: userBandDb(),
        join: userJoinDb()
    })
}

export function userStatus(params: { id: any; status: any }) {
    const item = userDb.find((i) => String(i.id) === String(params.id))
    if (item) item.status = params.status
    return delay({}, 200)
}

// ---------------------------------------------------------------- 员工
export function getStaffList(params: Record<string, any>) {
    const list = paginate(staffDb, params, {
        keyword: (item, v) =>
            String(item.id).includes(v) || item.nickname.includes(v) || item.mobile.includes(v),
        property_id: (item, v) => String(item.property_id) === String(v),
        start_time: (item, v) => inRange(item.create_time, v, params.end_time)
    })
    return delay(list)
}

export function getStaffDetail(params: { id: any }) {
    return delay(staffDb.find((i) => String(i.id) === String(params.id)) || {})
}
