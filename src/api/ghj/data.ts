import { businessDb, delay, overviewDb } from '@/mock/db'

// 数据总览
export function getOverview() {
    return delay({
        property: overviewDb.property,
        community: overviewDb.community,
        user: overviewDb.user,
        order: overviewDb.order,
        amount: overviewDb.amount,
        settle: overviewDb.settle
    })
}

// 业务总览
export function getBusiness(params?: Record<string, any>) {
    const factor = params?.start_time ? 0.6 + Math.random() * 0.8 : 1
    const lists = businessDb.map((item) => ({
        ...item,
        order_total: Math.round(item.order_total * factor),
        amount_total: Number((item.amount_total * factor).toFixed(2)),
        cancel_total: Math.round(item.cancel_total * factor),
        valid_amount: Number((item.valid_amount * factor).toFixed(2))
    }))
    return delay({
        count: lists.length,
        lists,
        extend: {
            total_order: lists.reduce((s, i) => s + i.order_total, 0),
            total_amount: Number(lists.reduce((s, i) => s + i.amount_total, 0).toFixed(2)),
            total_cancel: lists.reduce((s, i) => s + i.cancel_total, 0),
            total_valid: Number(lists.reduce((s, i) => s + i.valid_amount, 0).toFixed(2))
        }
    })
}
