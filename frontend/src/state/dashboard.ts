import { fallbackOverviewSource } from "../data/workbench";
import type {
  FeatureItem,
  KpiItem,
  OperationRecord,
  OverviewResponse,
} from "../types";

// 运营总览数据装配的唯一入口：在线接口响应与本地兜底内容都经此转换为
// 页面展示模型。字段调整只需收敛到这一处，页面结构与对外接口保持不变。
export function assembleOverview(source: unknown): OverviewResponse {
  const data = (source ?? {}) as Partial<OverviewResponse>;

  return {
    appName: text(data.appName, fallbackOverviewSource.appName),
    appCode: text(data.appCode, fallbackOverviewSource.appCode),
    description: text(data.description, fallbackOverviewSource.description),
    features: list(data.features, assembleFeature),
    kpis: list(data.kpis, assembleKpi),
    records: list(data.records, assembleRecord),
  };
}

// 页面兜底：兜底内容本身也经过同一装配流程，只保留 workbench 中的一份。
export function createFallbackOverview(): OverviewResponse {
  return assembleOverview(fallbackOverviewSource);
}

function text(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() !== "" ? value : fallback;
}

function list<T>(value: unknown, item: (entry: unknown) => T): T[] {
  return Array.isArray(value) ? value.map(item) : [];
}

function assembleFeature(source: unknown): FeatureItem {
  const data = (source ?? {}) as Partial<FeatureItem>;
  return {
    id: typeof data.id === "number" ? data.id : 0,
    title: text(data.title, ""),
    description: text(data.description, ""),
    status: text(data.status, ""),
    metric: text(data.metric, ""),
  };
}

function assembleKpi(source: unknown): KpiItem {
  const data = (source ?? {}) as Partial<KpiItem>;
  return {
    label: text(data.label, ""),
    value: text(data.value, ""),
    trend: text(data.trend, ""),
    tone: text(data.tone, ""),
  };
}

function assembleRecord(source: unknown): OperationRecord {
  const data = (source ?? {}) as Partial<OperationRecord>;
  return {
    key: text(data.key, ""),
    name: text(data.name, ""),
    owner: text(data.owner, ""),
    status: text(data.status, ""),
    metric: text(data.metric, ""),
    priority: text(data.priority, ""),
  };
}
