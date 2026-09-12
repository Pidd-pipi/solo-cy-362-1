import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createApp, nextTick } from "vue";
import ElementPlus from "element-plus";
import App from "../src/App.vue";
import { fetchOverview } from "../src/api/client";
import { fallbackOverviewSource as S } from "../src/data/workbench";

// happy-dom 缺部分浏览器 API，Element Plus 表格会用到，测试前补齐空实现。
if (typeof globalThis.ResizeObserver === "undefined") {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
}
if (typeof globalThis.matchMedia === "undefined") {
  globalThis.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => false,
  })) as typeof matchMedia;
}

function flush(ms = 80) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      nextTick(() => {
        setTimeout(() => nextTick(resolve), ms);
      });
    }, ms);
  });
}

async function mountWithFetch(fetchImpl: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>) {
  vi.stubGlobal("fetch", vi.fn(fetchImpl));
  document.body.innerHTML = `<div id="root"></div>`;
  const host = document.getElementById("root")!;
  const app = createApp(App);
  app.use(ElementPlus);
  app.mount(host);
  await flush();
  return host.textContent!.replace(/\s+/g, " ").trim();
}

const jsonResponse = (payload: unknown) =>
  ({
    ok: true,
    status: 200,
    json: async () => payload,
  }) as Response;

describe("fetchOverview 接口请求", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("场景6 请求失败：HTTP 非 2xx 时抛出带状态码的错误", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false, status: 500 }) as Response)
    );
    await expect(fetchOverview(), "500 应被拒绝并进入页面兜底分支").rejects.toThrow(/500/);
  });

  it("场景6 请求失败：网络异常时错误向上抛出", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("network down");
      })
    );
    await expect(fetchOverview(), "网络错误应被拒绝并进入页面兜底分支").rejects.toThrow(/network down/);
  });

  it("请求成功：按 /api/overview 发起请求并原样返回 JSON 负载", async () => {
    const payload = { appName: "X" };
    const fetchMock = vi.fn(async () => jsonResponse(payload));
    vi.stubGlobal("fetch", fetchMock);

    const data = await fetchOverview();
    expect(data, "成功时返回响应 JSON").toEqual(payload);
    expect(fetchMock, "应只请求一次").toHaveBeenCalledTimes(1);
    const url = String(fetchMock.mock.calls[0][0]);
    expect(url, "请求地址应为 /api/overview").toBe("/api/overview");
  });
});

describe("运营总览页面装配（App.vue）", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  it("场景2/4 接口成功但部分字段、列表项缺字段：在线内容保留且缺失内容回填样例", async () => {
    const text = await mountWithFetch(async () =>
      jsonResponse({
        appName: "在线总览名",
        // description、appCode 缺失
        features: [
          { id: 1, title: "在线特性标题" }, // 同一业务对象仅缺字段
          ...S.features.slice(1).map((f) => ({ ...f })),
        ],
        kpis: [
          { label: S.kpis[0].label }, // 仅给业务标识，其余字段缺失
          ...S.kpis.slice(1).map((k) => ({ ...k })),
        ],
        records: S.records.map((r) => ({ ...r })),
      })
    );

    expect(text, "成功时应显示在线提示").toContain("后端服务已联通");
    expect(text, "在线 appName 应保留").toContain("在线总览名");
    expect(text, "缺失 description 应回填样例").toContain("DM排班和会员运营");
    expect(text, "features[0] 在线 title 应保留").toContain("在线特性标题");
    expect(text, "features[0] 缺失描述应回填 id=1 样例").toContain("主持人DM要求");
    expect(text, "features[0] 缺失指标应回填 id=1 样例（88%）").toContain("88%");
    expect(text, "其余功能项样例应保留").toContain("营收与上座率分析");
    expect(text, "kpis[0] 缺失数值应回填「今日处理」样例（98）").toContain("98");
    expect(text, "完整任务流行应正常渲染").toContain("审核组");
    expect(text, "成功时不应出现兜底提示").not.toContain("已加载本地运营样例");
  });

  it("场景5 接口成功但列表换序：缺失字段按业务对象回填，不串用同位置其他对象", async () => {
    const text = await mountWithFetch(async () =>
      jsonResponse({
        // ldmurdergame-2 排到第 0 行且只给 key，页面该行应显示它自己的样例负责人
        records: [{ key: S.records[1].key }, { key: S.records[0].key }],
      })
    );

    expect(text, "换序后第 0 行应显示 ldmurdergame-2 的模块名").toContain(S.records[1].name);
    expect(text, "换序后第 0 行应显示 ldmurdergame-2 的负责人（管理员）").toContain(S.records[1].owner);
    expect(text, "第 1 行应显示 ldmurdergame-1 的模块名").toContain(S.records[0].name);
    expect(text, "第 1 行应回填 ldmurdergame-1 的负责人（运营组）").toContain(S.records[0].owner);
  });

  it("场景6 请求失败（网络错误）：页面完整展示本地样例并提示已兜底", async () => {
    const text = await mountWithFetch(async () => {
      throw new TypeError("network down");
    });

    expect(text, "失败时应显示兜底提示").toContain("已加载本地运营样例");
    expect(text, "兜底样例应用名应渲染").toContain(S.appName);
    expect(text, "兜底功能区应渲染").toContain(S.features[4].title);
    expect(text, "兜底 KPI 应渲染").toContain(S.kpis[0].label);
    expect(text, "兜底任务流应渲染").toContain(S.records[0].owner);
    expect(text, "失败时不应显示在线提示").not.toContain("后端服务已联通");
  });

  it("场景6 请求失败（HTTP 500）：页面完整展示本地样例并提示已兜底", async () => {
    const text = await mountWithFetch(async () => ({ ok: false, status: 500 }) as Response);

    expect(text, "500 时应显示兜底提示").toContain("已加载本地运营样例");
    expect(text, "500 时兜底功能区应渲染").toContain("剧本库与DM管理");
    expect(text, "500 时兜底 KPI 值应渲染").toContain("91%");
    expect(text, "500 时兜底任务流应渲染").toContain("财务组");
    expect(text, "500 时不应显示在线提示").not.toContain("后端服务已联通");
  });
});
