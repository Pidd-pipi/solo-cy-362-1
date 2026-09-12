import { fallbackOverviewSource } from "../data/workbench";
import type {
  FeatureItem,
  KpiItem,
  OperationRecord,
  OverviewResponse,
} from "../types";

// 运营总览数据装配的唯一入口：在线接口响应与本地兜底内容都经此转换为
// 页面展示模型。字段调整只需收敛到这一处，页面结构与对外接口保持不变。
//
// 回退规则：接口缺失的内容沿用本地样例，已返回的有效字段保留。
// - 标量字段：在线值为有效非空字符串时保留，否则取样例同名字段；
// - 列表字段：在线值为非空数组时按「业务标识」与样例逐项匹配（功能 id、
//   任务 key、KPI label），项内缺失字段取同一业务对象的样例值，接口调整
//   列表顺序也不会串用其他对象的内容；无标识或匹配不到时回落到同位置样例；
//   列表整体缺失或为空数组时，整表沿用本地样例。
export function assembleOverview(source: unknown): OverviewResponse {
  const data = (source ?? {}) as Partial<OverviewResponse>;

  return {
    appName: mergeText(data.appName, fallbackOverviewSource.appName),
    appCode: mergeText(data.appCode, fallbackOverviewSource.appCode),
    description: mergeText(data.description, fallbackOverviewSource.description),
    features: mergeList(data.features, fallbackOverviewSource.features, featureKey, mergeFeature),
    kpis: mergeList(data.kpis, fallbackOverviewSource.kpis, kpiKey, mergeKpi),
    records: mergeList(data.records, fallbackOverviewSource.records, recordKey, mergeRecord),
  };
}

// 页面兜底：兜底内容本身也经过同一装配流程，只保留 workbench 中的一份。
export function createFallbackOverview(): OverviewResponse {
  return assembleOverview(fallbackOverviewSource);
}

// 在线标量有效（非空字符串）时保留，否则沿用样例值。
function mergeText(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() !== "" ? value : fallback;
}

// 列表缺失或为空时整表沿用样例；非空时逐项按业务标识匹配样例，
// 匹配不到再回落到同位置样例；输出长度以在线列表为准。
function mergeList<T>(
  value: unknown,
  fallbackItems: T[],
  keyOf: (entry: unknown) => string,
  mergeItem: (item: unknown, fallback: T | undefined) => T
): T[] {
  if (!Array.isArray(value) || value.length === 0) {
    return fallbackItems;
  }
  const sampleByKey = new Map<string, T>();
  for (const sample of fallbackItems) {
    const key = keyOf(sample);
    if (key) {
      sampleByKey.set(key, sample);
    }
  }
  return value.map((item, index) => {
    // 有业务标识：只与同一业务对象的样例合并；标识在样例中不存在说明是
    // 新对象，不拿其他对象的样例填充。无标识时才回落到同位置样例。
    const key = keyOf(item);
    const matched = key ? sampleByKey.get(key) : fallbackItems[index];
    return mergeItem(item, matched);
  });
}

function featureKey(entry: unknown): string {
  const id = (entry as Partial<FeatureItem>)?.id;
  return typeof id === "number" ? String(id) : "";
}

function kpiKey(entry: unknown): string {
  const label = (entry as Partial<KpiItem>)?.label;
  return typeof label === "string" ? label.trim() : "";
}

function recordKey(entry: unknown): string {
  const key = (entry as Partial<OperationRecord>)?.key;
  return typeof key === "string" ? key.trim() : "";
}

function mergeFeature(source: unknown, fallback?: FeatureItem): FeatureItem {
  const data = (source ?? {}) as Partial<FeatureItem>;
  return {
    id: typeof data.id === "number" ? data.id : fallback?.id ?? 0,
    title: mergeText(data.title, fallback?.title ?? ""),
    description: mergeText(data.description, fallback?.description ?? ""),
    status: mergeText(data.status, fallback?.status ?? ""),
    metric: mergeText(data.metric, fallback?.metric ?? ""),
  };
}

function mergeKpi(source: unknown, fallback?: KpiItem): KpiItem {
  const data = (source ?? {}) as Partial<KpiItem>;
  return {
    label: mergeText(data.label, fallback?.label ?? ""),
    value: mergeText(data.value, fallback?.value ?? ""),
    trend: mergeText(data.trend, fallback?.trend ?? ""),
    tone: mergeText(data.tone, fallback?.tone ?? ""),
  };
}

function mergeRecord(source: unknown, fallback?: OperationRecord): OperationRecord {
  const data = (source ?? {}) as Partial<OperationRecord>;
  return {
    key: mergeText(data.key, fallback?.key ?? ""),
    name: mergeText(data.name, fallback?.name ?? ""),
    owner: mergeText(data.owner, fallback?.owner ?? ""),
    status: mergeText(data.status, fallback?.status ?? ""),
    metric: mergeText(data.metric, fallback?.metric ?? ""),
    priority: mergeText(data.priority, fallback?.priority ?? ""),
  };
}
