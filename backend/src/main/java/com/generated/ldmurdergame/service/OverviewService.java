package com.generated.ldmurdergame.service;

import java.util.List;
import org.springframework.stereotype.Service;
import com.generated.ldmurdergame.model.FeatureItem;
import com.generated.ldmurdergame.model.KpiItem;
import com.generated.ldmurdergame.model.OperationRecord;
import com.generated.ldmurdergame.model.OverviewResponse;

@Service
public class OverviewService {
  public OverviewResponse getOverview() {
    return new OverviewResponse(
      "剧本杀门店运营管理系统",
      "ldmurdergame",
      "面向剧本杀线下门店，提供剧本库管理、场次排期、玩家组局、DM排班和会员运营等一站式门店运营工具。",
      List.of(new FeatureItem(1, "剧本库与DM管理", "录入剧本信息（名称、类型、难度、时长、人数、主持人DM要求），上传剧本封面与简介，关联专属DM主持人，支持按标签筛选与搜索。", "已上线", "88%"),
        new FeatureItem(2, "场次排期与拼车位", "门店设置每日开放场次时段（如14:00场、19:00场），每场显示已报名人数和剩余空位，玩家可单人报名加入拼车位或自行组满局。", "排期中", "31 单"),
        new FeatureItem(3, "玩家组局与角色分配", "满局后DM可为玩家分配角色，支持随机分配与手动调整，系统记录每次组局玩家名单与角色分配结果。", "巡检中", "10 项"),
        new FeatureItem(4, "会员积分与等级体系", "注册会员消费积累积分，设置等级规则（如青铜/白银/黄金/钻石），不同等级享受折扣与优先拼车位权益，积分可兑换周边或抵扣费用。", "优化中", "4 级"),
        new FeatureItem(5, "营收与上座率分析", "管理员查看每日/周/月营收报表、各剧本上座率排行、DM带本场次与评分统计，支持导出营业数据。", "可导出", "28 条")),
      List.of(new KpiItem("今日处理", "98", "+12%", "primary"),
        new KpiItem("预约/订单", "31", "+8%", "warm"),
        new KpiItem("履约率", "91%", "+3%", "cool"),
        new KpiItem("待处理", "6", "需跟进", "neutral")),
      List.of(new OperationRecord("ldmurdergame-1", "剧本库与DM管理", "运营组", "已上线", "88%", "高"),
        new OperationRecord("ldmurdergame-2", "场次排期与拼车位", "管理员", "排期中", "31 单", "中"),
        new OperationRecord("ldmurdergame-3", "玩家组局与角色分配", "服务台", "巡检中", "10 项", "低"),
        new OperationRecord("ldmurdergame-4", "会员积分与等级体系", "财务组", "优化中", "4 级", "高"),
        new OperationRecord("ldmurdergame-5", "营收与上座率分析", "审核组", "可导出", "28 条", "中"))
    );
  }
}
