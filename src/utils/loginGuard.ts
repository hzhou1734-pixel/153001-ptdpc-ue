/**
 * 登录安全守卫（前端模拟实现）
 *
 * 需求：
 * 1. 输入密码连续错误 5 次，冻结 30 分钟禁止登录；可在管理后台手动解除账号冻结。
 * 2. 管理员账号禁止多设备同时登录：同一账号在 A 设备先登录，B 设备登录成功后，A 设备自动退出。
 *
 * 说明：当前平台端业务数据为本地 Mock，冻结计数与登录会话同样以 localStorage 模拟。
 *      接入真实后端后，冻结状态应由服务端下发，多设备互踢依赖服务端会话管理，
 *      届时只需替换本文件内部的读写实现，调用方无需改动。
 */
const FAIL_PREFIX = 'ghj_login_fail_'
const SESSION_PREFIX = 'ghj_session_'

/** 连续错误次数阈值 */
export const MAX_FAIL_COUNT = 5
/** 冻结时长（毫秒） */
export const LOCK_DURATION = 30 * 60 * 1000

interface FailRecord {
    count: number
    lockUntil: number
}

const failKey = (account: string) => `${FAIL_PREFIX}${account}`
export const sessionKey = (account: string) => `${SESSION_PREFIX}${account}`

export function getFailRecord(account: string): FailRecord {
    if (!account) return { count: 0, lockUntil: 0 }
    try {
        const raw = localStorage.getItem(failKey(account))
        return raw ? (JSON.parse(raw) as FailRecord) : { count: 0, lockUntil: 0 }
    } catch {
        return { count: 0, lockUntil: 0 }
    }
}

/** 账号是否处于冻结中 */
export function isLocked(account: string) {
    return getFailRecord(account).lockUntil > Date.now()
}

/** 剩余冻结分钟数（向上取整） */
export function lockedMinutesLeft(account: string) {
    const { lockUntil } = getFailRecord(account)
    if (lockUntil <= Date.now()) return 0
    return Math.ceil((lockUntil - Date.now()) / 60000)
}

/** 剩余可尝试次数 */
export function remainAttempts(account: string) {
    const { count, lockUntil } = getFailRecord(account)
    if (lockUntil > Date.now()) return 0
    return Math.max(0, MAX_FAIL_COUNT - count)
}

/** 记录一次登录失败；返回是否本次触发了冻结 */
export function markLoginFail(account: string) {
    if (!account) return false
    const record = getFailRecord(account)
    // 冻结期已过则重新计数
    const count = record.lockUntil > Date.now() ? record.count : record.count + 1
    const lockUntil = count >= MAX_FAIL_COUNT ? Date.now() + LOCK_DURATION : record.lockUntil
    localStorage.setItem(failKey(account), JSON.stringify({ count, lockUntil }))
    return count >= MAX_FAIL_COUNT
}

/** 登录成功：清空失败记录 */
export function clearLoginFail(account: string) {
    if (!account) return
    localStorage.removeItem(failKey(account))
}

/** 管理后台手动解除账号冻结 */
export function unlockAccount(account: string) {
    if (!account) return
    localStorage.removeItem(failKey(account))
}

/** 写入本次登录会话，返回会话 ID（用于多设备互踢检测） */
export function setLoginSession(account: string) {
    if (!account) return ''
    const sid = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    localStorage.setItem(sessionKey(account), JSON.stringify({ sid, ts: Date.now() }))
    return sid
}

export function getLoginSession(account: string) {
    if (!account) return null
    try {
        const raw = localStorage.getItem(sessionKey(account))
        return raw ? JSON.parse(raw) : null
    } catch {
        return null
    }
}
