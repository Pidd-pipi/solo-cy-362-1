import type { FeatureItem, KpiItem, OperationRecord } from "../types";

export const localFeatures: FeatureItem[] = [
  {
    "id": 1,
    "title": "剧本库与DM管理",
    "description": "录入剧本信息（名称、类型、难度、时长、人数、主持人DM要求），上传剧本封面与简介，关联专属DM主持人，支持按标签筛选与搜索。",
    "status": "已上线",
    "metric": "88%"
  },
  {
    "id": 2,
    "title": "场次排期与拼车位",
    "description": "门店设置每日开放场次时段（如14:00场、19:00场），每场显示已报名人数和剩余空位，玩家可单人报名加入拼车位或自行组满局。",
    "status": "排期中",
    "metric": "31 单"
  },
  {
    "id": 3,
    "title": "玩家组局与角色分配",
    "description": "满局后DM可为玩家分配角色，支持随机分配与手动调整，系统记录每次组局玩家名单与角色分配结果。",
    "status": "巡检中",
    "metric": "10 项"
  },
  {
    "id": 4,
    "title": "会员积分与等级体系",
    "description": "注册会员消费积累积分，设置等级规则（如青铜/白银/黄金/钻石），不同等级享受折扣与优先拼车位权益，积分可兑换周边或抵扣费用。",
    "status": "优化中",
    "metric": "4 级"
  },
  {
    "id": 5,
    "title": "营收与上座率分析",
    "description": "管理员查看每日/周/月营收报表、各剧本上座率排行、DM带本场次与评分统计，支持导出营业数据。",
    "status": "可导出",
    "metric": "28 条"
  }
];

export const localKpis: KpiItem[] = [
  {
    "label": "今日处理",
    "value": "98",
    "trend": "+12%",
    "tone": "primary"
  },
  {
    "label": "预约/订单",
    "value": "31",
    "trend": "+8%",
    "tone": "warm"
  },
  {
    "label": "履约率",
    "value": "91%",
    "trend": "+3%",
    "tone": "cool"
  },
  {
    "label": "待处理",
    "value": "6",
    "trend": "需跟进",
    "tone": "neutral"
  }
];

export const operationRecords: OperationRecord[] = [
  {
    "key": "ldmurdergame-1",
    "name": "剧本库与DM管理",
    "owner": "运营组",
    "status": "已上线",
    "metric": "88%",
    "priority": "高"
  },
  {
    "key": "ldmurdergame-2",
    "name": "场次排期与拼车位",
    "owner": "管理员",
    "status": "排期中",
    "metric": "31 单",
    "priority": "中"
  },
  {
    "key": "ldmurdergame-3",
    "name": "玩家组局与角色分配",
    "owner": "服务台",
    "status": "巡检中",
    "metric": "10 项",
    "priority": "低"
  },
  {
    "key": "ldmurdergame-4",
    "name": "会员积分与等级体系",
    "owner": "财务组",
    "status": "优化中",
    "metric": "4 级",
    "priority": "高"
  },
  {
    "key": "ldmurdergame-5",
    "name": "营收与上座率分析",
    "owner": "审核组",
    "status": "可导出",
    "metric": "28 条",
    "priority": "中"
  }
];
