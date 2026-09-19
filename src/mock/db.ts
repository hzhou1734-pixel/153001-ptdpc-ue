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
const randInt = (min: number, max: number, r: () => number = rand) =>
    Math.floor(r() * (max - min + 1)) + min
const pick = <T>(arr: T[], r: () => number = rand): T => arr[randInt(0, arr.length - 1, r)]

/**
 * 按 key 生成独立且可复现的随机源
 * 说明：全局 rand 每次调用都会推进种子，导致详情类数据（订单/结算/手环等）每次打开都不一样。
 *      这里按 userId 等维度隔离随机源，保证同一对象的数据稳定不变。
 */
const makeRand = (key: string | number) => {
    let s = 9301
    const str = String(key)
    for (let i = 0; i < str.length; i++) {
        s = (s * 31 + str.charCodeAt(i) + 49297) % 233280
    }
    return () => {
        s = (s * 9301 + 49297) % 233280
        return s / 233280
    }
}

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

// 静态示例图片（public/mock-img 下按业务场景预置的 SVG），按索引确定性取值
const RESOURCE_IMGS = makeList(7, (i) => `${import.meta.env.BASE_URL}mock-img/resource/${i}.svg`)
const ACTIVITY_IMGS = makeList(7, (i) => `${import.meta.env.BASE_URL}mock-img/activity/${i}.svg`)
const WONDERFUL_IMGS = makeList(5, (i) => `${import.meta.env.BASE_URL}mock-img/wonderful/${i}.svg`)
const AVATAR_IMGS = makeList(8, (i) => `${import.meta.env.BASE_URL}mock-img/avatar/${i}.svg`)
// 人力资源：按持证类型区分的认证凭证图（职业资格证书 / 培训结业证 / 健康证 / 身份证明）
const HR_IMGS: Record<string, string> = {
    职业资格证书: `${import.meta.env.BASE_URL}mock-img/hr/zyg.svg`,
    培训结业证: `${import.meta.env.BASE_URL}mock-img/hr/jy.svg`,
    健康证: `${import.meta.env.BASE_URL}mock-img/hr/jk.svg`,
    身份证明: `${import.meta.env.BASE_URL}mock-img/hr/sf.svg`
}

/** 生成列表数据 */
function makeList<T>(count: number, factory: (i: number) => T): T[] {
    return Array.from({ length: count }, (_, i) => factory(i))
}

// 小区名称预生成：物业与小区共用同一数组，保证「物业列表-小区名称」与「小区信息」名称完全一致
const communityNames = makeList(68, () => `${pick(communityPrefix)}${pick(communityWords)}`)

// ---------------------------------------------------------------- 物业
export const propertyDb = makeList(68, (i) => {
    const name = `${pick(surnames)}${pick(given1)}${pick(propertySuffix)}`
    // 约半数物业设置了账号有效期（起止日期范围），起始不晚于今天、结束在未来 30~730 天
    const hasExpire = rand() > 0.5
    return {
        id: 10001 + i,
        community_id: 20001 + i,
        community_name: communityNames[i],
        name,
        contact: `${pick(surnames)}${pick(given1)}`,
        mobile: `1${pick(['3', '5', '7', '8', '9'])}${String(randInt(100000000, 999999999)).slice(0, 9)}`,
        account: `wy${String(10001 + i)}`,
        password: '999999',
        status: rand() > 0.15 ? 1 : 0,
        expire_start: hasExpire ? ago(randInt(0, 200)).slice(0, 10) : '',
        expire_end: hasExpire ? ago(-randInt(30, 730)).slice(0, 10) : '',
        community_count: 1,
        user_count: randInt(200, 8000),
        order_count: randInt(500, 20000),
        total_amount: randInt(100000, 9000000) / 100,
        create_time: ago(randInt(1, 400), randInt(0, 23))
    }
})

// ---------------------------------------------------------------- 小区
// 一物业一小区：小区与物业一一对应（物业 i 管辖小区 20001+i）
export const communityDb = propertyDb.map((p, i) => {
    const totalHouse = randInt(200, 3000)
    return {
        id: 20001 + i,
        name: communityNames[i],
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

// 小区：订单信息（按 communityId 确定性生成；托管 / 膳食 / 陪诊 / 生活帮手 四类）
const COMMUNITY_ORDER_TYPES = ['托管', '膳食', '陪诊', '生活帮手']
const COMMUNITY_ORDER_TITLE_MAP: Record<string, string[]> = {
    托管: ['老人日间托管', '暑期儿童托管', '术后康复陪护'],
    膳食: ['社区营养膳食配送', '老年助餐配送', '慢病调理餐配送'],
    陪诊: ['上门陪诊服务', '陪同就医全程服务', '健康监测手环绑定'],
    生活帮手: ['家政保洁收纳', '家电维修安装', '代买代办跑腿']
}
export const communityOrderDb = (communityId: number) => {
    const r = makeRand(`community-order-${communityId}`)
    return makeList(randInt(6, 18, r), (i) => {
        const type = pick(COMMUNITY_ORDER_TYPES, r)
        return {
            id: 400001 + i,
            order_sn: `NO${communityId}${String(randInt(100000, 999999, r))}`,
            title: pick(COMMUNITY_ORDER_TITLE_MAP[type], r),
            type,
            amount: randInt(1000, 200000, r) / 100,
            create_time: ago(randInt(0, 120, r)),
            status: pick(['待服务', '服务中', '已完成', '已取消'], r)
        }
    })
}

// ---------------------------------------------------------------- 用户
export const userDb = makeList(260, (i) => {
    const nickname = `${pick(surnames)}${pick(given1)}`
    const status = rand() > 0.1 ? 1 : 0
    return {
        id: 30001 + i,
        avatar: AVATAR_IMGS[i % AVATAR_IMGS.length],
        nickname,
        mobile: `1${pick(['3', '5', '7', '8', '9'])}${String(randInt(100000000, 999999999)).slice(0, 9)}`,
        status,
        create_time: ago(randInt(1, 500), randInt(0, 23)),
        login_time: ago(randInt(0, 30), randInt(0, 23)),
        order_count: randInt(0, 120),
        total_amount: randInt(0, 5000000) / 100,
        settle_amount: randInt(0, 3000000) / 100,
        coin: randInt(0, 5000),
        community_name: pick(communityDb).name
    }
})

// 用户：订单信息（按 userId 确定性生成；托管 / 报餐 / 陪诊三类标题与类型联动）
const ORDER_TYPE_MAP: Record<string, string[]> = {
    托管: ['老人日间托管', '暑期儿童托管', '术后康复陪护'],
    报餐: ['社区营养膳食配送', '老年助餐配送', '慢病调理餐配送'],
    陪诊: ['上门陪诊服务', '陪同就医全程服务', '健康监测手环绑定']
}
export const userOrderDb = (userId: number) => {
    const r = makeRand(`order-${userId}`)
    return makeList(randInt(3, 10, r), (i) => {
        const type = pick(['托管', '报餐', '陪诊'], r)
        return {
            id: 40001 + i,
            order_sn: `NO${userId}${String(randInt(100000, 999999, r))}`,
            title: pick(ORDER_TYPE_MAP[type], r),
            type,
            amount: randInt(1000, 200000, r) / 100,
            create_time: ago(randInt(0, 120, r)),
            status: pick(['待服务', '服务中', '已完成', '已取消'], r)
        }
    })
}

// 用户：结算信息（按 userId 确定性生成，每月一份结算记录，内含该月结算明细）
export const userSettleDb = (userId: number) => {
    const r = makeRand(`settle-${userId}`)
    return makeList(randInt(3, 6, r), (i) => {
        const d = makeRand(`settle-detail-${userId}-${i}`)
        const status = pick(['待结算', '已结算'], r)
        return {
            id: 50001 + i,
            month: `2026-${pad(8 - i)}`,
            amount: randInt(10000, 800000, r) / 100,
            status,
            detail: makeList(randInt(2, 6, d), (j) => ({
                id: 51001 + j,
                order_sn: `NO${userId}${String(randInt(100000, 999999, d))}`,
                title: pick(['老人日间托管', '社区营养膳食配送', '上门陪诊服务'], d),
                amount: randInt(1000, 80000, d) / 100,
                create_time: ago(randInt(0, 120, d)),
                status: pick([status, status, '已结算'], d)
            }))
        }
    })
}

// 用户：业主认证（按 userId 确定性生成）
export const userAuthDb = (userId: number) => {
    const r = makeRand(`auth-${userId}`)
    return makeList(randInt(1, 4, r), (i) => ({
        id: 60001 + i,
        community_name: pick(communityDb, r).name,
        building: `${randInt(1, 30, r)}栋${randInt(1, 6, r)}单元${randInt(101, 2808, r)}`,
        result: pick(['审核中', '已通过', '已驳回'], r),
        create_time: ago(randInt(1, 200, r))
    }))
}

// 用户：健康手环（绑定信息 + 健康数据 + 检测数据，按 userId 确定性生成）
export const userBandDb = (userId: number) => {
    const r = makeRand(`band-${userId}`)
    return makeList(1, (i) => {
        const t = makeRand(`band-test-${userId}`)
        return {
            id: 70001 + i,
            sn: `BAND${randInt(10000000, 99999999, r)}`,
            bind_time: ago(randInt(1, 300, r)),
            // 健康数据
            heart_rate: randInt(60, 110, r),
            blood_oxygen: randInt(90, 100, r),
            step: randInt(1000, 20000, r),
            sleep: `${randInt(4, 9, r)}.${randInt(0, 9, r)}小时`,
            // 检测数据
            test_list: makeList(randInt(3, 6, t), (j) => ({
                id: 71001 + j,
                name: pick(['血压检测', '血糖检测', '体脂检测', '心电检测', '体温检测'], t),
                value: `${randInt(60, 180, t)}`,
                unit: pick(['mmHg', 'mmol/L', '%', 'bpm', '℃'], t),
                result: pick(['正常', '正常', '偏高', '偏低'], t),
                test_time: ago(randInt(0, 60, t), randInt(0, 23, t))
            }))
        }
    })
}

// ---------------------------------------------------------------- 员工
export const staffDb = makeList(96, (i) => {
    const c = pick(communityDb)
    return {
        id: 80001 + i,
        avatar: AVATAR_IMGS[(i + 3) % AVATAR_IMGS.length],
        nickname: `${pick(surnames)}${pick(given1)}`,
        mobile: `1${pick(['3', '5', '7', '8', '9'])}${String(randInt(100000000, 999999999)).slice(0, 9)}`,
        property_id: c.property_id,
        property_name: c.property_name,
        community_name: c.name,
        status: rand() > 0.12 ? 1 : 0,
        create_time: ago(randInt(1, 300))
    }
})

// ---------------------------------------------------------------- 内容：人力资源（服务人员技能认证审核）
// 业务场景：社区服务人员按服务类目提交资质认证，平台审核持证类型与凭证后纳入人才库
export const HR_CATEGORIES = ['托管', '膳食', '陪诊', '生活帮手', '康复', '家政']
export const HR_CERT_TYPES = ['职业资格证书', '培训结业证', '健康证', '身份证明']
// 各服务类目对应的真实服务角色
const HR_ROLE_BY_CATEGORY: Record<string, string[]> = {
    托管: ['老人日间托管师', '暑期儿童托管师', '育儿早教师', '认知症陪伴员'],
    膳食: ['社区营养师', '老年助餐配送员', '慢病调理膳食师', '月子餐营养师'],
    陪诊: ['陪诊就医专员', '健康监测管理师', '康复陪练师', '用药提醒员'],
    生活帮手: ['家政保洁收纳师', '家电维修安装工', '代买代办跑腿员', '适老化改造师'],
    康复: ['康复理疗师', '中医推拿师', '运动康复指导员', '言语治疗师'],
    家政: ['母婴护理月嫂', '居家整理收纳师', '家电清洗技师', '宠物照料员']
}
export const hrDb = makeList(72, (i) => {
    const u = pick(userDb)
    const category = pick(HR_CATEGORIES)
    const certType = pick(HR_CERT_TYPES)
    const role = pick(HR_ROLE_BY_CATEGORY[category])
    const certNoPrefix: Record<string, string> = {
        职业资格证书: 'ZY',
        培训结业证: 'JY',
        健康证: 'JK',
        身份证明: 'SF'
    }
    return {
        id: 90001 + i,
        category,
        role,
        cert_type: certType,
        cert_no: `${certNoPrefix[certType]}2025-${String(randInt(1000, 9999)).padStart(4, '0')}-${String(
            randInt(100, 9999)
        ).padStart(4, '0')}`,
        skill_title: role,
        avatar: AVATAR_IMGS[(i + 1) % AVATAR_IMGS.length],
        nickname: u.nickname,
        mobile: u.mobile,
        community_name: u.community_name,
        credential: HR_IMGS[certType],
        skill: role,
        experience_years: randInt(1, 12),
        desc: `认证详情（#${i + 1}）：本人持有${certType}，具备${role}相关服务资质，拥有${randInt(
            1,
            12
        )}年社区实操经验，可接受平台派单，服务区域为所在社区周边。`,
        audit_status: pick(['待审核', '已通过', '已驳回']),
        submit_time: ago(randInt(0, 60)),
        audit_time: ago(randInt(0, 50))
    }
})

// 用户：顾好家币明细（按所属物业维度展示余额与变动记录，余额由明细按时间倒序累计）
export const userCoinDb = (userId: number) => {
    const r = makeRand(`coin-${userId}`)
    const list = makeList(randInt(4, 10, r), (i) => ({
        id: 190001 + i,
        property_name: pick(communityDb, r).property_name,
        change: (r() > 0.5 ? 1 : -1) * randInt(10, 500, r),
        balance: 0,
        remark: pick(['订单消费', '服务奖励', '活动赠送', '提现扣除'], r),
        create_time: ago(randInt(0, 200, r))
    }))
    // 列表按时间倒序（最新在前），余额从最新一条往前累计推导
    list.sort((a, b) => (a.create_time < b.create_time ? 1 : -1))
    let cursor = randInt(200, 5000, r)
    list.forEach((item: any) => {
        item.balance = cursor
        cursor = Math.max(0, cursor - item.change)
    })
    return list
}

// 用户：人才中心（认证的人才类型 / 资质证件 / 审核状态 / 历史接单，按 userId 确定性生成）
export const userTalentDb = (userId: number) => {
    const r = makeRand(`talent-${userId}`)
    return {
        talent_type: pick(['陪诊员', '托管员', '膳食配送员', '康复理疗师', '家政服务员'], r),
        credential: RESOURCE_IMGS[randInt(0, RESOURCE_IMGS.length - 1, r)],
        audit_status: pick(['审核中', '已通过', '已驳回'], r),
        audit_time: ago(randInt(0, 60, r)),
        order_history: makeList(randInt(2, 8, r), (i) => ({
            id: 200001 + i,
            title: pick(['上门陪诊服务', '老人日间托管', '社区营养膳食配送', '康复理疗服务'], r),
            amount: randInt(1000, 200000, r) / 100,
            status: pick(['已完成', '已取消', '服务中'], r),
            create_time: ago(randInt(0, 150, r))
        }))
    }
}

// ---------------------------------------------------------------- 内容：人才库（通过认证的人才）
export const talentDb = makeList(58, (i) => {
    const u = pick(userDb)
    const category = pick(HR_CATEGORIES)
    const certType = pick(HR_CERT_TYPES)
    const certNoPrefix: Record<string, string> = {
        职业资格证书: 'ZY',
        培训结业证: 'JY',
        健康证: 'JK',
        身份证明: 'SF'
    }
    const inProgress = randInt(0, 20)
    const completed = randInt(0, 120)
    const cancelled = randInt(0, 30)
    return {
        id: 110001 + i,
        avatar: AVATAR_IMGS[(i + 2) % AVATAR_IMGS.length],
        nickname: u.nickname,
        mobile: u.mobile,
        skill: pick(['居家养老陪护', '母婴护理月嫂', '专业陪诊就医', '社区营养膳食', '康复理疗推拿', '家政保洁收纳']),
        category,
        role: pick(HR_ROLE_BY_CATEGORY[category]),
        cert_type: certType,
        cert_no: `${certNoPrefix[certType]}2025-${String(randInt(1000, 9999)).padStart(4, '0')}-${String(
            randInt(100, 9999)
        ).padStart(4, '0')}`,
        community_name: pick(communityNames),
        credential: HR_IMGS[certType],
        experience_years: randInt(1, 12),
        desc: `认证详情（#${i + 1}）：本人持有${certType}，具备${pick(
            HR_ROLE_BY_CATEGORY[category]
        )}相关服务资质，拥有${randInt(1, 12)}年社区实操经验，可接受平台派单，服务区域为所在社区周边。`,
        order_total: inProgress + completed + cancelled,
        in_progress: inProgress,
        completed: completed,
        cancelled: cancelled,
        finish_amount: completed * randInt(800, 5000) / 10,
        talent_status: rand() > 0.15 ? 1 : 0,
        create_time: ago(randInt(1, 300))
    }
})

// 人才：订单信息（统计 + 订单列表）
export const talentOrderDb = (talentId: number) =>
    makeList(randInt(3, 10), (i) => {
        const status = pick(['待接单', '服务中', '已完成', '已取消'])
        return {
            id: 210001 + i,
            order_no: `GJ${randInt(100000000000, 999999999999)}`,
            cover: ACTIVITY_IMGS[i % ACTIVITY_IMGS.length],
            title: pick(['上门陪诊服务', '老人日间托管', '社区营养膳食配送', '康复理疗服务', '家政保洁服务']),
            amount: randInt(1000, 200000) / 100,
            user: `${pick(surnames)}${pick(given1)}`,
            status,
            // 仅已完成订单有评星（1-5 星，偏好评）
            star: status === '已完成' ? pick([5, 5, 5, 4, 4, 4, 3, 2]) : 0,
            submit_time: ago(randInt(0, 120)),
            finish_time: ago(randInt(0, 90))
        }
    })

// ---------------------------------------------------------------- 内容：敏感词
export const sensitiveDb = makeList(36, (i) => ({
    id: 120001 + i,
    name: [
        '赌博', '博彩', '私彩', '彩票代购', '贷款', '借款', '套现', '信用卡代办',
        '加微信', '加V', '扫码进群', '刷单', '兼职日结', '高薪兼职', '点赞返现',
        '低价出售', '低价代购', '免税代购', '代开发票', '代办证件', '违法代办',
        '代考', '刷信誉', '刷好评', '外挂', '代练', '账号出售', '回收游戏币',
        '裸聊', '约炮', '一夜情', '代孕', '办证刻章', '麻醉药品', '枪支', '管制刀具'
    ][i],
    status: rand() > 0.2 ? 1 : 0,
    create_time: ago(randInt(1, 200))
}))

// ---------------------------------------------------------------- 内容：报名活动
export const activityDb = makeList(28, (i) => {
    const c = pick(communityDb)
    const limit = randInt(20, 300)
    return {
        id: 130001 + i,
        image: ACTIVITY_IMGS[i % ACTIVITY_IMGS.length],
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
        activity_time: ago(-randInt(10, 60), 9),
        signup_deadline: ago(-randInt(2, 9), 18),
        create_time: ago(randInt(1, 120)),
        content: `活动详情内容示例（#${i + 1}）：活动时间、地点及注意事项详见正文，名额有限，报满即止。`
    }
})

export const activityRecordDb = (activityId: number) =>
    makeList(randInt(3, 12), (i) => ({
        id: 140001 + i,
        activity_id: activityId,
        avatar: AVATAR_IMGS[(i + 5) % AVATAR_IMGS.length],
        nickname: `${pick(surnames)}${pick(given1)}`,
        mobile: `1${pick(['3', '5', '7', '8', '9'])}${String(randInt(100000000, 999999999)).slice(0, 9)}`,
        join_time: ago(randInt(0, 60))
    }))

// 用户报名记录（按 userId 确定性生成）
export const userJoinDb = (userId: number) => {
    const r = makeRand(`join-${userId}`)
    return makeList(randInt(1, 6, r), (i) => ({
        id: 150001 + i,
        title: pick(activityDb, r).title,
        activity_time: ago(-randInt(1, 60, r)),
        join_time: ago(randInt(1, 90, r))
    }))
}

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
        image: WONDERFUL_IMGS[i % WONDERFUL_IMGS.length],
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

// 服务封面图（复用 post 系列 SVG）
const SERVICE_IMGS = makeList(7, (i) => `${import.meta.env.BASE_URL}mock-img/post/${i}.svg`)

// ---------------------------------------------------------------- 运营管理：托管服务（物业后台添加，平台仅查看 + 显示/下架）
export const boardingDb = makeList(28, (i) => {
    const c = pick(communityDb)
    const scene = pick(['老人日间托管', '暑期儿童托管', '术后康复陪护', '长者全托照护'])
    const priceDesc = pick([
        '含营养膳食、午休看护与休闲活动',
        '提供全天候生活照料与健康管理',
        '专业护工一对一陪伴，安全无忧',
        '配备适老化设施与应急医护响应'
    ])
    return {
        id: 210001 + i,
        title: `${pick(['安心', '暖心', '贴心', '专业'])}${scene}`,
        property_name: c.property_name,
        half_price: randInt(30, 120),
        full_price: randInt(80, 260),
        status: pick(['显示中', '已下架']),
        sort: randInt(0, 100),
        create_time: ago(randInt(0, 120), randInt(0, 23)),
        content: `<p>本托管服务面向社区${scene}，由属地物业${c.property_name}统一招募并管理的专业照护团队提供。</p><p>服务内容：${priceDesc}，并按需提供健康建档、用药提醒、紧急联络等增值项目。</p><p>适用人群广泛，既可满足双职工家庭的日间看护需求，也能为术后或年长居民提供有温度的陪伴式照护。</p>`
    }
})

// ---------------------------------------------------------------- 运营管理：陪诊服务（物业后台添加，平台仅查看 + 显示/下架）
// 陪诊服务固定 5 项（与用户端一致）
export const ESCORT_ITEMS: { title: string; brief: string; price: number }[] = [
    { title: '医院就诊全程陪诊', brief: '含挂号协助、问诊陪同、取药代领、报告解读', price: 199 },
    { title: '专家号预约陪诊', brief: '三甲专家号预约 · 全程陪同就诊', price: 299 },
    { title: '体检全程陪检', brief: '体检项目引导、排队取号、报告代取', price: 169 },
    { title: '夜间急诊陪诊', brief: '夜间及节假日急诊陪同就医', price: 259 },
    { title: '代取药送药上门', brief: '处方代取 · 药品配送到家', price: 59 }
]

export const escortDb = makeList(20, (i) => {
    const item = ESCORT_ITEMS[i % ESCORT_ITEMS.length]
    const c = pick(communityDb)
    return {
        id: 220001 + i,
        image: SERVICE_IMGS[i % SERVICE_IMGS.length],
        title: item.title,
        property_name: c.property_name,
        price: item.price,
        content: `<p>${item.brief}。</p><p>本服务由属地物业${c.property_name}合作的持证陪诊员提供：提前预约—资料核对—全程陪同—就诊小结反馈，确保就诊过程安全、顺畅、有人照应。</p><p>面向独居老人、孕产期女性、异地就医居民等需要协助的人群，下单后陪诊员将按约定时间上门或院内汇合。</p>`,
        status: pick(['显示中', '已下架']),
        sort: randInt(0, 100),
        create_time: ago(randInt(0, 120), randInt(0, 23))
    }
})

// ---------------------------------------------------------------- 运营管理：生活帮手（物业后台添加，平台仅查看 + 显示/隐藏）
export const helperDb = makeList(30, (i) => {
    const c = pick(communityDb)
    const desc = pick([
        '提供上门保洁、收纳整理与家电基础养护',
        '涵盖水电小修、家具安装与应急维修',
        '支持代买代办、取送件与跑腿服务'
    ])
    const title = pick(['家政保洁收纳', '家电维修安装', '代买代办跑腿'])
    return {
        id: 230001 + i,
        image: SERVICE_IMGS[i % SERVICE_IMGS.length],
        title,
        property_name: c.property_name,
        price: randInt(20, 320),
        sales: randInt(0, 5000),
        content: `<p>本生活帮手服务由属地物业${c.property_name}认证的服务人员提供，覆盖${desc}。</p><p>服务说明：明码标价、持证上门、服务后可评价，保障社区居民的日常便利与生活品质。</p>`,
        status: pick(['显示', '隐藏']),
        sort: randInt(0, 100),
        create_time: ago(randInt(0, 120), randInt(0, 23))
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
        logo: import.meta.env.BASE_URL + 'guhaojia-icon.png',
        default_avatar: AVATAR_IMGS[0]
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
    community: { today: 5, month: 63, total: 68 },
    user: { today: 128, month: 3260, total: 128960 },
    order: { today: 486, month: 12480, total: 486320 },
    amount: { today: 58620.5, month: 1586420.8, total: 58620480.6 },
    settle: { today: 12680.0, month: 386420.5, total: 12680420.3 }
}

export const overviewDb = statBase

export const businessDb = [
    { type: '陪诊业务', order_total: 12860, amount_total: 3864200.0, cancel_total: 860, valid_amount: 3682400.0 },
    { type: '托管业务', order_total: 9640, amount_total: 2860400.0, cancel_total: 420, valid_amount: 2760200.0 },
    { type: '膳食业务', order_total: 24860, amount_total: 1860400.0, cancel_total: 1240, valid_amount: 1680200.0 },
    // 生活服务帮手：平台不收取费用，订单金额仅为展示，不计入交易额与结算额
    { type: '生活服务帮手', order_total: 18520, amount_total: 2548600.0, cancel_total: 920, valid_amount: 0, feeFree: true }
]

// ---------------------------------------------------------------- 工具函数
/** 模拟网络请求 */
export function delay<T>(data: T, ms = 260): Promise<T> {
    return new Promise((resolve) => setTimeout(() => resolve(data), ms))
}

/** 导出：每次最多导出的页数 */
const EXPORT_MAX_PAGE = 200
/** 分页相关参数（不参与数据筛选） */
const RESERVED_KEYS = [
    'page_no',
    'page_size',
    'export',
    'page_type',
    'page_start',
    'page_end',
    'file_name'
]

/** 浏览器端下载 xlsx（异步加载依赖，不进入首屏包体） */
async function downloadExcel(rows: any[], columns: Record<string, string>, fileName: string) {
    try {
        const XLSX = await import('xlsx')
        const data = rows.map((row) => {
            const out: Record<string, any> = {}
            const keys = columns && Object.keys(columns).length ? Object.keys(columns) : Object.keys(row)
            keys.forEach((key) => {
                out[columns?.[key] || key] = row[key]
            })
            return out
        })
        const sheet = XLSX.utils.json_to_sheet(data.length ? data : [{}])
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, sheet, '数据')
        const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer
        const blob = new Blob([buf], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${fileName || '导出数据'}.xlsx`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (error) {
        console.warn('[mock] 导出 excel 失败', error)
    }
}

/** 导出描述：文件默认名 + 列名中文映射 */
export interface ExportMeta {
    name?: string
    columns?: Record<string, string>
}

/**
 * 分页 + 关键字筛选 + 导出
 * params.export = 1 返回导出元信息；params.export = 2 生成 xlsx 下载并返回导出区间数据
 * meta.columns 用于导出时把字段键映射为中文列名
 */
export function paginate<T extends Record<string, any>>(
    source: T[],
    params: Record<string, any> = {},
    matchers: Record<string, (item: T, value: any) => boolean> = {},
    meta: ExportMeta = {}
) {
    const { page_no = 1, page_size = 15 } = params
    let list = [...source]
    Object.keys(params).forEach((key) => {
        const value = params[key]
        if (value === '' || value === undefined || value === null) return
        if (RESERVED_KEYS.includes(key)) return
        if (matchers[key]) {
            list = list.filter((item) => matchers[key](item, value))
        } else if (typeof value === 'string' || typeof value === 'number') {
            list = list.filter((item) => String(item[key] ?? '').includes(String(value)))
        }
    })
    const count = list.length
    const size = Number(page_size)
    const exportType = Number(params.export || 0)
    const name = params.file_name || meta.name || '导出数据'

    // 打开导出弹窗：返回统计元信息
    if (exportType === 1) {
        const sum_page = Math.max(1, Math.ceil(count / size))
        return {
            count,
            lists: [],
            sum_page,
            page_size: size,
            max_page: EXPORT_MAX_PAGE,
            all_max_size: EXPORT_MAX_PAGE * size,
            file_name: name,
            page_start: 1,
            page_end: Math.min(sum_page, EXPORT_MAX_PAGE)
        }
    }
    // 确认导出：生成文件下载
    if (exportType === 2) {
        let start = 0
        let end = count
        if (Number(params.page_type) === 1) {
            const ps = Math.max(1, Number(params.page_start || 1))
            const pe = Math.max(ps, Number(params.page_end || ps))
            start = (ps - 1) * size
            end = pe * size
        }
        const exportRows = list.slice(start, Math.min(end, count))
        void downloadExcel(exportRows, meta.columns || {}, name)
        return { count, lists: exportRows }
    }
    const start = (Number(page_no) - 1) * size
    return { count, lists: list.slice(start, start + size) }
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
