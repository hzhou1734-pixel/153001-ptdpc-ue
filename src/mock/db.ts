/**
 * 顾好家平台端 Mock 数据层
 * 说明：后端业务接口尚未就绪，平台端业务模块（物业/小区/用户/内容等）统一走本地 Mock。
 *      接口层见 src/api/ghj/*.ts，后端就绪后只需把 api 中的 mock 调用替换为 request 调用即可。
 */

// 简易可复现随机数（保证每次刷新数据一致）
let seed = 20260908
const rand = () => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
}
const randInt = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min
const pick = <T>(arr: T[]): T => arr[randInt(0, arr.length - 1)]

const surnames = '王李张刘陈杨黄赵吴周徐孙马朱胡林郭何高罗郑梁谢宋唐许韩冯邓曹彭曾肖田董袁潘蒋蔡余杜叶程苏魏吕丁任沈姚卢姜崔钟谭陆汪范金石廖贾夏韦付方白邹孟熊秦邱江尹薛闫段雷侯龙史陶黎贺顾毛郝龚邵万钱严覃武戴莫孔向汤'.split(
    ''
)
const given1 = '伟芳娜秀英敏静丽强磊洋艳勇军杰娟涛明超霞平刚桂英华文玉梅红萍鹏辉建华飞燕霖晨曦雪松柏梓轩浩然子涵欣怡雨欣思远梦琪家豪嘉怡宇航若曦天佑一鸣志强晓东'.split(
    ''
)

const propertySuffix = ['物业管理有限公司', '物业服务有限公司', '社区服务有限公司', '物业集团有限公司']
const cityNames = ['长沙市', '株洲市', '湘潭市', '衡阳市', '岳阳市', '常德市', '郴州市', '永州市']
const districtNames = ['岳麓区', '芙蓉区', '天心区', '开福区', '雨花区', '望城区']
const communityWords = ['家园', '小区', '花园', '雅苑', '新城', '公馆', '华府', '名都', '里', '府邸', '嘉园', '映像']
const communityPrefix = ['金色', '阳光', '翡翠', '海棠', '春晓', '锦绣', '万科', '碧桂', '恒大', '中海', '保利', '龙湖', '绿城', '金科', '美的', '卓越', '时代', '星河', '云顶', '香樟']

const now = new Date()
const pad = (n: number) => String(n).padStart(2, '0')
const fmt = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(
        d.getMinutes()
    )}:${pad(d.getSeconds())}`
const ago = (days: number, hours = 0) =>
    fmt(new Date(now.getTime() - days * 86400000 - hours * 3600000))

export const GHJ_STATUS = { NORMAL: 1, DISABLE: 0 }

/** 生成列表数据 */
function makeList<T>(count: number, factory: (i: number) => T): T[] {
    return Array.from({ length: count }, (_, i) => factory(i))
}

// ---------------------------------------------------------------- 物业
export const propertyDb = makeList(68, (i) => {
    const name = `${pick(surnames)}${pick(given1)}${pick(propertySuffix)}`
    // 约半数物业设置了账号有效期（起止日期范围），起始不晚于今天、结束在未来 30~730 天
    const hasExpire = rand() > 0.5
    return {
        id: 10001 + i,
        name,
        contact: `${pick(surnames)}${pick(given1)}`,
        mobile: `1${pick(['3', '5', '7', '8', '9'])}${String(randInt(100000000, 999999999)).slice(0, 9)}`,
        account: `wy${String(10001 + i)}`,
        password: '999999',
        status: rand() > 0.15 ? 1 : 0,
        expire_start: hasExpire ? ago(randInt(0, 200)).slice(0, 10) : '',
        expire_end: hasExpire ? ago(-randInt(30, 730)).slice(0, 10) : '',
        community_count: randInt(1, 12),
        user_count: randInt(200, 8000),
        order_count: randInt(500, 20000),
        total_amount: randInt(100000, 9000000) / 100,
        create_time: ago(randInt(1, 400), randInt(0, 23))
    }
})

// ---------------------------------------------------------------- 小区
export const communityDb = makeList(136, (i) => {
    const p = propertyDb[randInt(0, propertyDb.length - 1)]
    const totalHouse = randInt(200, 3000)
    return {
        id: 20001 + i,
        name: `${pick(communityPrefix)}${pick(communityWords)}`,
        property_id: p.id,
        property_name: p.name,
        province: '湖南省',
        city: pick(cityNames),
        district: pick(districtNames),
        address: `${pick(districtNames)}${pick(['雷锋大道', '金星路', '桐梓坡路', '万家丽路', '芙蓉中路', '湘江中路'])}${randInt(
            1,
            999
        )}号`,
        build_year: 2000 + randInt(0, 25),
        building_count: randInt(4, 40),
        house_count: totalHouse,
        auth_house_count: Math.floor(totalHouse * (0.3 + rand() * 0.6)),
        create_time: ago(randInt(1, 300), randInt(0, 23))
    }
})

// ---------------------------------------------------------------- 用户
export const userDb = makeList(260, (i) => {
    const nickname = `${pick(surnames)}${pick(given1)}`
    const status = rand() > 0.1 ? 1 : 0
    return {
        id: 30001 + i,
        avatar: '',
        nickname,
        mobile: `1${pick(['3', '5', '7', '8', '9'])}${String(randInt(100000000, 999999999)).slice(0, 9)}`,
        status,
        create_time: ago(randInt(1, 500), randInt(0, 23)),
        login_time: ago(randInt(0, 30), randInt(0, 23)),
        order_count: randInt(0, 120),
        total_amount: randInt(0, 5000000) / 100,
        settle_amount: randInt(0, 3000000) / 100,
        community_name: pick(communityDb).name
    }
})

// 用户：订单信息
export const userOrderDb = (userId: number) =>
    makeList(randInt(3, 10), (i) => ({
        id: 40001 + i,
        order_sn: `NO${userId}${String(randInt(100000, 999999))}`,
        title: pick([
            '上门陪诊服务',
            '老人日间托管',
            '社区营养膳食配送',
            '健康监测手环绑定',
            '陪同就医全程服务',
            '术后康复陪护'
        ]),
        type: pick(['托管', '报餐', '陪诊']),
        amount: randInt(1000, 200000) / 100,
        create_time: ago(randInt(0, 120)),
        status: pick(['待服务', '服务中', '已完成', '已取消'])
    }))

// 用户：结算信息
export const userSettleDb = () =>
    makeList(randInt(2, 8), (i) => ({
        id: 50001 + i,
        month: `2026-${pad(randInt(1, 8))}`,
        amount: randInt(10000, 800000) / 100,
        status: pick(['待结算', '已结算'])
    }))

// 用户：业主认证
export const userAuthDb = () =>
    makeList(randInt(1, 4), (i) => ({
        id: 60001 + i,
        community_name: pick(communityDb).name,
        building: `${randInt(1, 30)}栋${randInt(1, 6)}单元${randInt(101, 2808)}`,
        result: pick(['审核中', '已通过', '已驳回']),
        create_time: ago(randInt(1, 200))
    }))

// 用户：健康手环
export const userBandDb = () =>
    makeList(randInt(1, 3), (i) => ({
        id: 70001 + i,
        sn: `BAND${randInt(10000000, 99999999)}`,
        heart_rate: randInt(60, 110),
        blood_oxygen: randInt(90, 100),
        step: randInt(1000, 20000),
        sleep: `${randInt(4, 9)}.${randInt(0, 9)}小时`,
        bind_time: ago(randInt(1, 300))
    }))

// ---------------------------------------------------------------- 员工
export const staffDb = makeList(96, (i) => {
    const c = pick(communityDb)
    return {
        id: 80001 + i,
        avatar: '',
        nickname: `${pick(surnames)}${pick(given1)}`,
        mobile: `1${pick(['3', '5', '7', '8', '9'])}${String(randInt(100000000, 999999999)).slice(0, 9)}`,
        property_id: c.property_id,
        property_name: c.property_name,
        community_name: c.name,
        status: rand() > 0.12 ? 1 : 0,
        create_time: ago(randInt(1, 300))
    }
})

// ---------------------------------------------------------------- 内容：帖子
export const postDb = makeList(72, (i) => {
    const u = pick(userDb)
    const c = pick(communityDb)
    return {
        id: 90001 + i,
        image: '',
        title: pick([
            '小区停车位改造建议',
            '周末邻里义诊活动通知',
            '楼下早餐店推荐',
            '楼道灯坏了谁来修',
            '社区健身器材使用感受',
            '老人手机课堂报名啦',
            '宠物便便箱位置建议'
        ]),
        property_name: c.property_name,
        avatar: '',
        nickname: u.nickname,
        mobile: u.mobile,
        audit_status: pick(['待审核', '已通过', '已驳回']),
        submit_time: ago(randInt(0, 60)),
        audit_time: ago(randInt(0, 50)),
        like_count: randInt(0, 800),
        comment_count: randInt(0, 200),
        content: `这是帖子详情内容示例（#${i + 1}）。社区生活需要大家共同参与，欢迎邻居们在评论区留言交流，共建和谐社区环境。`
    }
})

// 帖子评论
export const postCommentDb = (postId: number) =>
    makeList(randInt(2, 9), (i) => ({
        id: 100001 + i,
        post_id: postId,
        nickname: `${pick(surnames)}${pick(given1)}`,
        content: pick([
            '说得太对了，支持！',
            '我也遇到同样的问题',
            '物业什么时候处理一下',
            '感谢分享，已收藏',
            '希望能尽快改进'
        ]),
        create_time: ago(randInt(0, 30))
    }))

// ---------------------------------------------------------------- 内容：资源大厅
export const resourceDb = makeList(58, (i) => {
    const u = pick(userDb)
    const c = pick(communityDb)
    return {
        id: 110001 + i,
        image: '',
        title: pick([
            '闲置婴儿车一台',
            '搬家纸箱免费自取',
            '儿童绘本交换',
            '全新轮椅借用',
            '二手空调转让',
            '电动工具短期借用',
            '宠物寄养互助'
        ]),
        property_name: c.property_name,
        avatar: '',
        nickname: u.nickname,
        mobile: u.mobile,
        audit_status: pick(['待审核', '已通过', '已驳回']),
        submit_time: ago(randInt(0, 60)),
        audit_time: ago(randInt(0, 50)),
        content: `资源详情内容示例（#${i + 1}）：物品九成新，位于小区内可自提，联系方式见发布人手机号，非诚勿扰。`
    }
})

// ---------------------------------------------------------------- 内容：敏感词
export const sensitiveDb = makeList(36, (i) => ({
    id: 120001 + i,
    name: pick(['赌博', '贷款', '加微信', '刷单', '低价出售', '私彩', '代开发票', '兼职日结', '博彩', '违法代办']),
    status: rand() > 0.2 ? 1 : 0,
    create_time: ago(randInt(1, 200))
}))

// ---------------------------------------------------------------- 内容：报名活动
export const activityDb = makeList(28, (i) => {
    const c = pick(communityDb)
    const limit = randInt(20, 300)
    return {
        id: 130001 + i,
        image: '',
        title: pick([
            '社区中秋晚会报名',
            '老年人智能手机课堂',
            '亲子手工DIY活动',
            '社区健康义诊预约',
            '邻里运动会报名',
            '暑期儿童托管报名',
            '社区植树节活动'
        ]),
        property_name: c.property_name,
        join_count: Math.floor(limit * rand()),
        limit_count: limit,
        create_time: ago(randInt(1, 120)),
        content: `活动详情内容示例（#${i + 1}）：活动时间、地点及注意事项详见正文，名额有限，报满即止。`
    }
})

export const activityRecordDb = (activityId: number) =>
    makeList(randInt(3, 12), (i) => ({
        id: 140001 + i,
        activity_id: activityId,
        avatar: '',
        nickname: `${pick(surnames)}${pick(given1)}`,
        mobile: `1${pick(['3', '5', '7', '8', '9'])}${String(randInt(100000000, 999999999)).slice(0, 9)}`,
        join_time: ago(randInt(0, 60))
    }))

// 用户报名记录
export const userJoinDb = () =>
    makeList(randInt(1, 6), (i) => ({
        id: 150001 + i,
        title: pick(activityDb).title,
        activity_time: ago(-randInt(1, 60)),
        join_time: ago(randInt(1, 90))
    }))

// ---------------------------------------------------------------- 内容：社区通知
export const noticeDb = makeList(46, (i) => {
    const c = pick(communityDb)
    return {
        id: 160001 + i,
        title: pick([
            '关于小区停水的通知',
            '电梯检修通知',
            '物业费缴纳提醒',
            '冬季供暖时间安排',
            '消防设施年检通知',
            '关于开展爱国卫生运动的通知'
        ]),
        property_name: c.property_name,
        status: pick(['显示中', '已下架']),
        publish_time: ago(randInt(0, 90)),
        content: `通知详情内容示例（#${i + 1}）：请各位业主相互转告，如有疑问请联系物业服务中心，联系电话 0731-8888xxxx。`
    }
})

// ---------------------------------------------------------------- 内容：精彩内容
export const wonderfulDb = makeList(34, (i) => {
    const c = pick(communityDb)
    return {
        id: 170001 + i,
        image: '',
        title: pick([
            '社区达人：退休教师的第二课堂',
            '邻里互助：一场及时雨',
            '最美阳台评选结果出炉',
            '社区志愿服务队风采',
            '老物件里的社区记忆'
        ]),
        property_name: c.property_name,
        status: pick(['显示中', '已下架']),
        publish_time: ago(randInt(0, 90)),
        content: `<p>精彩内容详情示例（#${i + 1}）</p><p>这里有社区里的温暖故事，记录邻里之间的互助与陪伴。</p>`
    }
})

// ---------------------------------------------------------------- 系统：角色 / 管理员
export const roleDb = [
    { id: 1, name: '超级管理员', desc: '拥有平台端全部功能权限', create_time: ago(400) },
    { id: 2, name: '运营专员', desc: '负责运营管理、内容审核相关功能', create_time: ago(300) },
    { id: 3, name: '财务专员', desc: '负责数据台、财务结算相关功能', create_time: ago(200) },
    { id: 4, name: '客服专员', desc: '负责用户信息查看与内容审核', create_time: ago(120) },
    { id: 5, name: '物业对接人', desc: '仅可查看物业与小区相关数据', create_time: ago(60) }
]

export const adminDb = makeList(14, (i) => ({
    id: 180001 + i,
    name: `${pick(surnames)}${pick(given1)}`,
    account: `admin${100 + i}`,
    role_id: pick(roleDb).id,
    role_name: '',
    status: rand() > 0.15 ? 1 : 0,
    create_time: ago(randInt(1, 300))
}))
adminDb.forEach((item: any) => {
    item.role_name = roleDb.find((r) => r.id === item.role_id)?.name || '-'
})

// ---------------------------------------------------------------- 系统设置
export const settingDb = {
    basic: {
        system_name: '顾好家社区服务平台',
        logo: '',
        default_avatar: ''
    },
    sms: {
        ali_key: 'LTAI5tQxKxxxxxxxxxxx',
        ali_secret: 'nRk9xxxxxxxxxxxxxxxxxxxxx',
        sign_name: '顾好家',
        templates: [
            { id: 1, name: '登录验证码', code: 'SMS_200700001', content: '您的验证码为${code}，5分钟内有效。' },
            { id: 2, name: '订单通知', code: 'SMS_200700002', content: '您有新的订单${order_sn}，请及时处理。' }
        ]
    },
    pay: {
        wx_mch_id: '1900000109',
        wx_key: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        wx_cert: '',
        wx_status: 1,
        ali_app_id: '2021003100000000',
        ali_key: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        ali_cert: '',
        ali_status: 1
    },
    update: {
        app_version: '1.0.0',
        hot_update_url: 'https://ghj.example.com/hot-update/v1.0.0.zip',
        force: 0,
        remark: '优化社区服务体验，修复已知问题'
    },
    agreement: {
        about_us: '<p>顾好家是由践行未来打造的社区生活服务平台，整合陪诊、托管、膳食等社区服务资源，让居家生活更安心。</p>',
        user_agreement: '<p>一、服务条款的接受</p><p>二、用户账号与认证</p><p>三、服务内容与规范</p><p>四、责任与免责</p>',
        privacy_policy: '<p>一、我们收集的信息</p><p>二、信息的使用</p><p>三、信息的共享与公开</p><p>四、信息安全</p>'
    }
}

// ---------------------------------------------------------------- 统计数据
const statBase = {
    property: { today: 2, month: 26, total: 68 },
    community: { today: 5, month: 63, total: 136 },
    user: { today: 128, month: 3260, total: 128960 },
    order: { today: 486, month: 12480, total: 486320 },
    amount: { today: 58620.5, month: 1586420.8, total: 58620480.6 },
    settle: { today: 12680.0, month: 386420.5, total: 12680420.3 }
}

export const overviewDb = statBase

export const businessDb = [
    { type: '陪诊业务', order_total: 12860, amount_total: 3864200.0, cancel_total: 860, valid_amount: 3682400.0 },
    { type: '托管业务', order_total: 9640, amount_total: 2860400.0, cancel_total: 420, valid_amount: 2760200.0 },
    { type: '膳食业务', order_total: 24860, amount_total: 1860400.0, cancel_total: 1240, valid_amount: 1680200.0 }
]

// ---------------------------------------------------------------- 工具函数
/** 模拟网络请求 */
export function delay<T>(data: T, ms = 260): Promise<T> {
    return new Promise((resolve) => setTimeout(() => resolve(data), ms))
}

/** 分页 + 关键字筛选 */
export function paginate<T extends Record<string, any>>(
    source: T[],
    params: Record<string, any> = {},
    matchers: Record<string, (item: T, value: any) => boolean> = {}
) {
    const { page_no = 1, page_size = 15 } = params
    let list = [...source]
    Object.keys(params).forEach((key) => {
        const value = params[key]
        if (value === '' || value === undefined || value === null) return
        if (key === 'page_no' || key === 'page_size' || key === 'export') return
        if (matchers[key]) {
            list = list.filter((item) => matchers[key](item, value))
        } else if (typeof value === 'string' || typeof value === 'number') {
            list = list.filter((item) => String(item[key] ?? '').includes(String(value)))
        }
    })
    const count = list.length
    const start = (Number(page_no) - 1) * Number(page_size)
    return { count, lists: list.slice(start, start + Number(page_size)) }
}

/** 时间范围筛选 */
export function inRange(time: string, start?: string, end?: string) {
    if (!start && !end) return true
    const t = new Date(time.replace(/-/g, '/')).getTime()
    if (start && t < new Date(String(start).replace(/-/g, '/')).getTime()) return false
    if (end) {
        const e = new Date(String(end).replace(/-/g, '/')).getTime()
        if (t > e + 86399000) return false
    }
    return true
}

/** 新增 ID */
export function nextId(list: any[]) {
    return Math.max(0, ...list.map((i) => Number(i.id) || 0)) + 1
}

export { pick, randInt, rand }
