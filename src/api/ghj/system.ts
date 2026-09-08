import { adminDb, delay, nextId, paginate, roleDb, settingDb } from '@/mock/db'

// ---------------------------------------------------------------- 基础设置
export function getBasicSetting() {
    return delay({ ...settingDb.basic })
}
export function setBasicSetting(params: Record<string, any>) {
    Object.assign(settingDb.basic, params)
    return delay({}, 200)
}

// ---------------------------------------------------------------- 短信设置
export function getSmsSetting() {
    return delay(JSON.parse(JSON.stringify(settingDb.sms)))
}
export function setSmsSetting(params: Record<string, any>) {
    Object.assign(settingDb.sms, params)
    return delay({}, 200)
}

// ---------------------------------------------------------------- 支付设置
export function getPaySetting() {
    return delay({ ...settingDb.pay })
}
export function setPaySetting(params: Record<string, any>) {
    Object.assign(settingDb.pay, params)
    return delay({}, 200)
}

// ---------------------------------------------------------------- 更新设置
export function getUpdateSetting() {
    return delay({ ...settingDb.update })
}
export function setUpdateSetting(params: Record<string, any>) {
    Object.assign(settingDb.update, params)
    return delay({}, 200)
}

// ---------------------------------------------------------------- 政策协议
export function getAgreement() {
    return delay({ ...settingDb.agreement })
}
export function setAgreement(params: Record<string, any>) {
    Object.assign(settingDb.agreement, params)
    return delay({}, 200)
}

// ---------------------------------------------------------------- 角色管理
export function getRoleList(params: Record<string, any>) {
    const list = paginate(roleDb, params, {
        name: (item, v) => item.name.includes(v),
        start_time: (item, v) => inRangeTime(item.create_time, v, params.end_time)
    })
    return delay(list)
}

export function roleAdd(params: Record<string, any>) {
    roleDb.unshift({
        id: nextId(roleDb),
        create_time: new Date().toLocaleString('zh-CN', { hour12: false }),
        ...params
    })
    return delay({}, 200)
}

export function roleEdit(params: Record<string, any>) {
    const index = roleDb.findIndex((i) => String(i.id) === String(params.id))
    if (index > -1) roleDb[index] = { ...roleDb[index], ...params }
    return delay({}, 200)
}

export function roleDelete(params: { id: any }) {
    const used = adminDb.some((a: any) => String(a.role_id) === String(params.id))
    if (used) return Promise.reject(new Error('该角色下已有关联的管理员账号，无法删除'))
    const index = roleDb.findIndex((i) => String(i.id) === String(params.id))
    if (index > -1) roleDb.splice(index, 1)
    return delay({}, 200)
}

// ---------------------------------------------------------------- 管理员管理
export function getAdminList(params: Record<string, any>) {
    const list = paginate(adminDb, params, {
        name: (item, v) => item.name.includes(v),
        account: (item, v) => item.account.includes(v),
        role_id: (item, v) => String(item.role_id) === String(v),
        status: (item, v) => String(item.status) === String(v),
        start_time: (item, v) => inRangeTime(item.create_time, v, params.end_time)
    })
    return delay(list)
}

export function adminAdd(params: Record<string, any>) {
    const roleId = Number(params.role_id)
    adminDb.unshift({
        id: nextId(adminDb),
        role_name: roleDb.find((r) => r.id === roleId)?.name || '-',
        create_time: new Date().toLocaleString('zh-CN', { hour12: false }),
        ...params
    })
    return delay({}, 200)
}

export function adminEdit(params: Record<string, any>) {
    const index = adminDb.findIndex((i) => String(i.id) === String(params.id))
    if (index > -1) {
        adminDb[index] = {
            ...adminDb[index],
            ...params,
            role_name: roleDb.find((r) => r.id === Number(params.role_id))?.name || adminDb[index].role_name
        }
    }
    return delay({}, 200)
}

export function adminDelete(params: { id: any }) {
    const index = adminDb.findIndex((i) => String(i.id) === String(params.id))
    if (index > -1) adminDb.splice(index, 1)
    return delay({}, 200)
}

export function getRoleOptions() {
    return delay(roleDb.map((i) => ({ id: i.id, name: i.name })))
}

function inRangeTime(time: string, start?: string, end?: string) {
    if (!start && !end) return true
    const t = new Date(time.replace(/-/g, '/')).getTime()
    if (start && t < new Date(String(start).replace(/-/g, '/')).getTime()) return false
    if (end && t > new Date(String(end).replace(/-/g, '/')).getTime() + 86399000) return false
    return true
}
