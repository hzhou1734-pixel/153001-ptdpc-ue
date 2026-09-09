/**
 * 顾好家平台端菜单配置
 * 说明：平台端业务菜单（数据台 / 运营管理 / 用户管理 / 内容管理 / 系统设置）
 *      后端菜单暂未下发，这里以本地配置动态注册，字段结构与后端菜单保持一致。
 * 字段：type M=目录 C=菜单；is_show=1 显示 0 隐藏；component 对应 src/views 下组件路径
 */
export interface GhjMenuItem {
    type: 'M' | 'C'
    name: string
    paths: string
    component?: string
    icon?: string
    is_show?: number
    perms?: string
    children?: GhjMenuItem[]
}

export const GHJ_MENU: GhjMenuItem[] = [
    {
        type: 'M',
        name: '数据台',
        paths: 'data',
        icon: 'local-icon-shuju',
        is_show: 1,
        children: [
            { type: 'C', name: '数据总览', paths: 'overview', component: 'ghj/data/overview', is_show: 1 },
            { type: 'C', name: '业务总览', paths: 'business', component: 'ghj/data/business', is_show: 1 }
        ]
    },
    {
        type: 'M',
        name: '运营管理',
        paths: 'property',
        icon: 'local-icon-guanli',
        is_show: 1,
        children: [
            { type: 'C', name: '物业列表', paths: 'list', component: 'ghj/property/list', is_show: 1 },
            {
                type: 'C',
                name: '小区列表',
                paths: 'community',
                component: 'ghj/property/community',
                is_show: 1
            }
        ]
    },
    {
        type: 'M',
        name: '用户管理',
        paths: 'user',
        icon: 'local-icon-user_guanli',
        is_show: 1,
        children: [
            { type: 'C', name: '用户列表', paths: 'list', component: 'ghj/user/list', is_show: 1 },
            { type: 'C', name: '用户详情', paths: 'detail', component: 'ghj/user/detail', is_show: 0 },
            { type: 'C', name: '员工列表', paths: 'staff', component: 'ghj/user/staff', is_show: 1 }
        ]
    },
    {
        type: 'M',
        name: '内容管理',
        paths: 'content',
        icon: 'local-icon-huodongguanli',
        is_show: 1,
        children: [
            { type: 'C', name: '帖子列表', paths: 'post', component: 'ghj/content/post', is_show: 1 },
            {
                type: 'C',
                name: '资源大厅',
                paths: 'resource',
                component: 'ghj/content/resource',
                is_show: 1
            },
            {
                type: 'C',
                name: '敏感词库',
                paths: 'sensitive',
                component: 'ghj/content/sensitive',
                is_show: 1
            },
            {
                type: 'C',
                name: '报名活动',
                paths: 'activity',
                component: 'ghj/content/activity',
                is_show: 1
            },
            { type: 'C', name: '社区通知', paths: 'notice', component: 'ghj/content/notice', is_show: 1 },
            {
                type: 'C',
                name: '精彩内容',
                paths: 'wonderful',
                component: 'ghj/content/wonderful',
                is_show: 1
            }
        ]
    },
    {
        type: 'M',
        name: '系统设置',
        paths: 'system',
        icon: 'local-icon-shezhi',
        is_show: 1,
        children: [
            { type: 'C', name: '基础设置', paths: 'basic', component: 'ghj/system/basic', is_show: 1 },
            { type: 'C', name: '短信设置', paths: 'sms', component: 'ghj/system/sms', is_show: 1 },
            { type: 'C', name: '支付设置', paths: 'pay', component: 'ghj/system/pay', is_show: 1 },
            { type: 'C', name: '更新设置', paths: 'update', component: 'ghj/system/update', is_show: 1 },
            {
                type: 'C',
                name: '政策协议',
                paths: 'agreement',
                component: 'ghj/system/agreement',
                is_show: 1
            },
            { type: 'C', name: '角色管理', paths: 'role', component: 'ghj/system/role', is_show: 1 },
            { type: 'C', name: '管理员管理', paths: 'admin', component: 'ghj/system/admin', is_show: 1 }
        ]
    }
]

/** 被本地菜单替代、需要从后端菜单中过滤掉的顶层路径（setting=后端「系统设置」，由本地底部「系统设置」system 替代；recharge=「充值设置」，系统无此功能，直接剔除） */
export const GHJ_MENU_OVERRIDE_PATHS = ['workbench', 'consumer', 'permission', 'setting', 'recharge']
