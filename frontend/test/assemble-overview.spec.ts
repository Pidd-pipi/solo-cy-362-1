import { describe, expect, it } from "vitest";
import { assembleOverview, createFallbackOverview } from "../src/state/dashboard";
import { fallbackOverviewSource as S } from "../src/data/workbench";
import type {
  FeatureItem,
  KpiItem,
  OperationRecord,
  OverviewResponse,
} from "../src/types";

// 深拷贝一份在线负载，避免被测代码之外的共享引用干扰断言。
function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

// 逐字段比对某个业务对象，失败时指出具体列表、下标与字段名。
function expectFeature(actual: FeatureItem, expected: FeatureItem, where: string) {
  expect(actual.id, `${where}.id`).toBe(expected.id);
  expect(actual.title, `${where}.title`).toBe(expected.title);
  expect(actual.description, `${where}.description`).toBe(expected.description);
  expect(actual.status, `${where}.status`).toBe(expected.status);
  expect(actual.metric, `${where}.metric`).toBe(expected.metric);
}

function expectKpi(actual: KpiItem, expected: KpiItem, where: string) {
  expect(actual.label, `${where}.label`).toBe(expected.label);
  expect(actual.value, `${where}.value`).toBe(expected.value);
  expect(actual.trend, `${where}.trend`).toBe(expected.trend);
  expect(actual.tone, `${where}.tone`).toBe(expected.tone);
}

function expectRecord(actual: OperationRecord, expected: OperationRecord, where: string) {
  expect(actual.key, `${where}.key`).toBe(expected.key);
  expect(actual.name, `${where}.name`).toBe(expected.name);
  expect(actual.owner, `${where}.owner`).toBe(expected.owner);
  expect(actual.status, `${where}.status`).toBe(expected.status);
  expect(actual.metric, `${where}.metric`).toBe(expected.metric);
  expect(actual.priority, `${where}.priority`).toBe(expected.priority);
}

describe("assembleOverview 运营总览数据装配", () => {
  it("场景1 完整数据：在线完整负载逐字段保留，不被样例覆盖", () => {
    // 与样例每个字段都不同的完整在线负载，用于证明完整数据原样透传。
    const online: OverviewResponse = {
      appName: "在线总览",
      appCode: "online-code",
      description: "在线描述",
      features: [
        { id: 101, title: "在线特性A", description: "在线描述A", status: "在线状态A", metric: "1%" },
        { id: 102, title: "在线特性B", description: "在线描述B", status: "在线状态B", metric: "2%" },
      ],
      kpis: [
        { label: "在线指标A", value: "11", trend: "↑1", tone: "primary" },
        { label: "在线指标B", value: "22", trend: "↑2", tone: "warm" },
      ],
      records: [
        { key: "online-1", name: "在线模块A", owner: "在线负责人A", status: "在线态A", metric: "1 单", priority: "高" },
        { key: "online-2", name: "在线模块B", owner: "在线负责人B", status: "在线态B", metric: "2 单", priority: "低" },
      ],
    };

    const result = assembleOverview(clone(online));

    expect(result.appName, "appName").toBe(online.appName);
    expect(result.appCode, "appCode").toBe(online.appCode);
    expect(result.description, "description").toBe(online.description);
    expect(result.features, "features 长度").toHaveLength(online.features.length);
    expect(result.kpis, "kpis 长度").toHaveLength(online.kpis.length);
    expect(result.records, "records 长度").toHaveLength(online.records.length);
    online.features.forEach((item, i) => expectFeature(result.features[i], item, `features[${i}]`));
    online.kpis.forEach((item, i) => expectKpi(result.kpis[i], item, `kpis[${i}]`));
    online.records.forEach((item, i) => expectRecord(result.records[i], item, `records[${i}]`));
  });

  it("场景1 完整数据：负载与样例一致时输出与兜底对象完全相同", () => {
    expect(assembleOverview(clone(S))).toEqual(createFallbackOverview());
  });

  it("场景2 标量缺字段：在线标量保留，缺失/空白标量回填样例", () => {
    const result = assembleOverview({
      appName: "  ", // 空白字符串视为无效
      // appCode 缺失
      description: "在线描述保留",
      features: [],
      kpis: [],
      records: [],
    }) as OverviewResponse;

    expect(result.appName, "appName 空白应回填样例").toBe(S.appName);
    expect(result.appCode, "appCode 缺失应回填样例").toBe(S.appCode);
    expect(result.description, "description 在线有效值应保留").toBe("在线描述保留");
  });

  it("场景3 列表为空：空数组/null/类型错误的列表整表回填样例", () => {
    const result = assembleOverview({
      features: [],
      kpis: null,
      records: "not-a-list",
    }) as OverviewResponse;

    expect(result.features, "features=[] 应整表回填样例").toEqual(S.features);
    expect(result.kpis, "kpis=null 应整表回填样例").toEqual(S.kpis);
    expect(result.records, "records 类型错误应整表回填样例").toEqual(S.records);
  });

  it("场景3 列表为空：所有列表缺失且整体入参为空时等价于兜底", () => {
    expect(assembleOverview(undefined), "入参 undefined").toEqual(createFallbackOverview());
    expect(assembleOverview(null), "入参 null").toEqual(createFallbackOverview());
    expect(assembleOverview({}), "入参空对象").toEqual(createFallbackOverview());
  });

  it("场景4 列表项缺字段：有效字段保留，缺失字段按同一业务对象回填样例", () => {
    const result = assembleOverview({
      features: [{ id: 1, title: "在线改名特性" }],
      kpis: [{ label: S.kpis[0].label, value: "在线值" }],
      records: [{ key: S.records[2].key, owner: "在线负责人" }],
    }) as OverviewResponse;

    // features：仅给了 id=1 的 title，其余字段必须来自 id=1 的样例
    expect(result.features, "features 长度以在线为准").toHaveLength(1);
    expect(result.features[0].id, "features[0].id 在线保留").toBe(1);
    expect(result.features[0].title, "features[0].title 在线保留").toBe("在线改名特性");
    expect(result.features[0].description, "features[0].description 应回填 id=1 样例").toBe(S.features[0].description);
    expect(result.features[0].status, "features[0].status 应回填 id=1 样例").toBe(S.features[0].status);
    expect(result.features[0].metric, "features[0].metric 应回填 id=1 样例").toBe(S.features[0].metric);

    // kpis：label 标识命中「今日处理」，value 在线保留，trend/tone 回填该 KPI 样例
    expect(result.kpis, "kpis 长度以在线为准").toHaveLength(1);
    expect(result.kpis[0].label, "kpis[0].label").toBe(S.kpis[0].label);
    expect(result.kpis[0].value, "kpis[0].value 在线保留").toBe("在线值");
    expect(result.kpis[0].trend, "kpis[0].trend 应回填「今日处理」样例").toBe(S.kpis[0].trend);
    expect(result.kpis[0].tone, "kpis[0].tone 应回填「今日处理」样例").toBe(S.kpis[0].tone);

    // records：key=ldmurdergame-3 在线只给 owner，其余字段必须回填该任务样例
    expect(result.records, "records 长度以在线为准").toHaveLength(1);
    const r = result.records[0];
    expect(r.key, "records[0].key").toBe(S.records[2].key);
    expect(r.owner, "records[0].owner 在线保留").toBe("在线负责人");
    expect(r.name, "records[0].name 应回填 ldmurdergame-3 样例").toBe(S.records[2].name);
    expect(r.status, "records[0].status 应回填 ldmurdergame-3 样例").toBe(S.records[2].status);
    expect(r.metric, "records[0].metric 应回填 ldmurdergame-3 样例").toBe(S.records[2].metric);
    expect(r.priority, "records[0].priority 应回填 ldmurdergame-3 样例").toBe(S.records[2].priority);
  });

  it("场景4 列表项缺字段：无业务标识时回落到同位置样例", () => {
    const result = assembleOverview({
      features: [{ title: "无 id 的特性" }],
      kpis: [{ value: "无 label 的值" }],
      records: [{ name: "无 key 的模块" }],
    }) as OverviewResponse;

    expect(result.features, "features 长度").toHaveLength(1);
    expect(result.features[0].id, "features[0].id 回落同位置样例[0]").toBe(S.features[0].id);
    expect(result.features[0].title, "features[0].title 在线保留").toBe("无 id 的特性");
    expect(result.features[0].metric, "features[0].metric 回落同位置样例[0]").toBe(S.features[0].metric);

    expect(result.kpis[0].label, "kpis[0].label 回落同位置样例[0]").toBe(S.kpis[0].label);
    expect(result.kpis[0].value, "kpis[0].value 在线保留").toBe("无 label 的值");

    expect(result.records[0].key, "records[0].key 回落同位置样例[0]").toBe(S.records[0].key);
    expect(result.records[0].name, "records[0].name 在线保留").toBe("无 key 的模块");
    expect(result.records[0].owner, "records[0].owner 回落同位置样例[0]").toBe(S.records[0].owner);
  });

  it("场景5 列表顺序变化：换序后缺失字段只回填同一业务对象，不串用其他对象内容", () => {
    // features：把样例第 5 项放到第 0 位（只给 id+title），样例第 1 项放到第 1 位（只给 id）
    const result = assembleOverview({
      features: [{ id: 5, title: S.features[4].title }, { id: 1 }],
      kpis: [
        { label: S.kpis[3].label }, // 「待处理」排到第 0 位，仅给标识
        { label: S.kpis[0].label, value: "在线履约改值" },
      ],
      records: [
        { key: S.records[1].key }, // ldmurdergame-2 排到第 0 位，仅给标识
        { key: S.records[0].key, metric: "在线指标改值" },
      ],
    }) as OverviewResponse;

    // features[0] 是 id=5，缺失字段必须来自样例 id=5，严禁拿同位置（样例 id=1）的内容
    const f0 = result.features[0];
    expect(f0.id, "features[0].id").toBe(5);
    expect(f0.description, "features[0].description 必须来自 id=5 样例").toBe(S.features[4].description);
    expect(f0.status, "features[0].status 必须来自 id=5 样例").toBe(S.features[4].status);
    expect(f0.metric, "features[0].metric 必须来自 id=5 样例（28 条），不能串成 id=1 的 88%").toBe(S.features[4].metric);
    expect(f0.metric, "features[0].metric 不得串用同位置 id=1 的内容").not.toBe(S.features[0].metric);

    // features[1] 是 id=1，只给 id，title 等必须回填样例 id=1
    const f1 = result.features[1];
    expect(f1.title, "features[1].title 必须来自 id=1 样例，不能串成 id=5").toBe(S.features[0].title);
    expect(f1.metric, "features[1].metric 必须来自 id=1 样例（88%）").toBe(S.features[0].metric);
    expect(f1.metric, "features[1].metric 不得串用同位置 id=5 的内容").not.toBe(S.features[4].metric);

    // kpis 换序：第 0 位是「待处理」，缺失值回填它自己的样例（"6"），不是第 0 位样例「今日处理」的 "98"
    expect(result.kpis[0].value, "kpis[0].value 必须回填「待处理」样例（6）").toBe(S.kpis[3].value);
    expect(result.kpis[0].value, "kpis[0].value 不得串用同位置「今日处理」的 98").not.toBe(S.kpis[0].value);
    expect(result.kpis[0].trend, "kpis[0].trend 必须回填「待处理」样例").toBe(S.kpis[3].trend);
    // 第 1 位是「今日处理」，在线 value 保留，trend 回填它自己的样例
    expect(result.kpis[1].value, "kpis[1].value 在线保留").toBe("在线履约改值");
    expect(result.kpis[1].trend, "kpis[1].trend 必须回填「今日处理」样例").toBe(S.kpis[0].trend);

    // records 换序：第 0 位是 ldmurdergame-2，回填「管理员/场次排期…」，不能串成第 0 位样例的「运营组」
    const r0 = result.records[0];
    expect(r0.owner, "records[0].owner 必须来自 ldmurdergame-2 样例（管理员）").toBe(S.records[1].owner);
    expect(r0.owner, "records[0].owner 不得串用同位置 ldmurdergame-1 的运营组").not.toBe(S.records[0].owner);
    expect(r0.name, "records[0].name 必须来自 ldmurdergame-2 样例").toBe(S.records[1].name);
    expect(r0.metric, "records[0].metric 必须来自 ldmurdergame-2 样例（31 单）").toBe(S.records[1].metric);
    // 第 1 位是 ldmurdergame-1，在线 metric 保留，其余回填它自己的样例
    const r1 = result.records[1];
    expect(r1.metric, "records[1].metric 在线保留").toBe("在线指标改值");
    expect(r1.owner, "records[1].owner 必须来自 ldmurdergame-1 样例（运营组）").toBe(S.records[0].owner);
    expect(r1.priority, "records[1].priority 必须来自 ldmurdergame-1 样例（高）").toBe(S.records[0].priority);
  });

  it("场景5 列表顺序变化：样例中不存在的业务标识按新对象处理，不借用任何对象的内容", () => {
    const result = assembleOverview({
      features: [{ id: 999, title: "全新模块" }],
      kpis: [{ label: "全新指标", trend: "新趋势" }],
      records: [{ key: "brand-new", name: "全新任务" }],
    }) as OverviewResponse;

    // 新业务对象：在线字段保留，样例里没有同标识对象，缺失字段保持空，不得串用任何样例对象
    expect(result.features[0].id, "features[0].id 新对象保留").toBe(999);
    expect(result.features[0].title, "features[0].title 新对象保留").toBe("全新模块");
    expect(result.features[0].description, "features[0].description 未知对象不得借用样例").toBe("");
    expect(result.features[0].metric, "features[0].metric 未知对象不得借用样例").toBe("");

    expect(result.kpis[0].label, "kpis[0].label 新对象保留").toBe("全新指标");
    expect(result.kpis[0].trend, "kpis[0].trend 新对象保留").toBe("新趋势");
    expect(result.kpis[0].value, "kpis[0].value 未知对象不得借用样例").toBe("");
    expect(result.kpis[0].tone, "kpis[0].tone 未知对象不得借用样例").toBe("");

    expect(result.records[0].key, "records[0].key 新对象保留").toBe("brand-new");
    expect(result.records[0].name, "records[0].name 新对象保留").toBe("全新任务");
    expect(result.records[0].owner, "records[0].owner 未知对象不得借用样例").toBe("");
    expect(result.records[0].priority, "records[0].priority 未知对象不得借用样例").toBe("");
  });
});
