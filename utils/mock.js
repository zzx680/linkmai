const caseSummary = {
  id: "case_001",
  title: "追尾事故 · 上海浦东",
  plate: "沪A****",
  status: "待补材料",
  currentStage: "上传材料",
  riskLevel: "中",
  nextAction: "上传医疗发票和病历后查看赔偿金额",
  nextActionTime: "预计 2 分钟",
  progress: 46,
  materialCompleteness: 46,
  estimateRange: "¥18,600 - ¥24,300",
  unlocked: ["案件已创建", "材料清单"],
  pendingCount: 5,
  documentReadyCount: 3,
  highRiskReason: "存在医疗材料缺口和误工证明不确定项，建议生成前人工复核。"
};

const productSteps = [
  { label: "开始处理事故", shortLabel: "建案", status: "done" },
  { label: "上传材料", shortLabel: "材料", status: "active" },
  { label: "查看赔偿金额", shortLabel: "赔偿", status: "ready" },
  { label: "生成处理材料", shortLabel: "文书", status: "idle" },
  { label: "跟踪结果", shortLabel: "跟踪", status: "idle" }
];

const mainActions = [
  { label: "开始处理事故", desc: "创建案件并确认事故信息", path: "/pages/login/index", type: "primary" },
  { label: "上传材料", desc: "补齐病历、发票、责任材料", path: "/pages/materials/index/index" },
  { label: "查看赔偿", desc: "查看当前材料下的赔偿区间", path: "/pages/claim/report/index" },
  { label: "生成文书", desc: "生成理赔、调解、诉讼草稿", path: "/pages/documents/index/index" }
];

const tasks = [
  { title: "开始处理事故", status: "已完成" },
  { title: "上传材料", status: "需补充" },
  { title: "查看赔偿金额", status: "可查看" },
  { title: "生成处理材料", status: "部分可生成" },
  { title: "跟踪结果", status: "未开始" }
];

const materials = [
  {
    group: "事故责任",
    items: [
      { name: "事故认定书", purpose: "确认双方责任比例，影响赔偿比例和沟通对象。", status: "已通过" },
      { name: "交警调解记录", purpose: "补充事故经过，后续申请调解时可作为依据。", status: "未上传" }
    ]
  },
  {
    group: "医疗材料",
    items: [
      { name: "病历", purpose: "判断伤情、治疗经过和是否涉及误工、护理、营养费。", status: "需补充" },
      { name: "医疗发票", purpose: "核算医疗费，缺失会让赔偿区间偏保守。", status: "未上传" },
      { name: "费用清单", purpose: "核对医疗费用明细，减少保险审核争议。", status: "未上传" },
      { name: "诊断证明", purpose: "辅助确认休息、护理或营养建议。", status: "未上传" }
    ]
  },
  {
    group: "收入与误工",
    items: [
      { name: "收入证明", purpose: "用于计算误工费，缺失时只能按临时区间估算。", status: "未上传" },
      { name: "误工证明", purpose: "确认误工天数，影响误工费金额。", status: "未上传" },
      { name: "工资流水", purpose: "证明收入连续性，提高误工费测算可信度。", status: "需补充" }
    ]
  },
  {
    group: "车辆损失",
    items: [
      { name: "定损单", purpose: "确认车辆维修损失的基础金额。", status: "已通过" },
      { name: "维修发票", purpose: "证明实际维修支出，影响车辆损失确认。", status: "未上传" },
      { name: "车辆受损照片", purpose: "说明受损位置和事故关联性。", status: "无法识别" }
    ]
  },
  {
    group: "身份与保险",
    items: [
      { name: "身份证", purpose: "用于确认当事人身份，生成文书草稿时需要核对。", status: "未上传" },
      { name: "驾驶证", purpose: "用于确认驾驶资格和事故主体信息。", status: "已通过" },
      { name: "行驶证", purpose: "用于确认车辆登记信息和车辆主体。", status: "未上传" },
      { name: "保险单", purpose: "用于确认保险公司、保额和理赔路径。", status: "需补充" }
    ]
  }
];

const claimItems = [
  {
    name: "医疗费",
    amount: "¥8,200 - ¥10,600",
    evidence: "已有部分发票",
    detail: "按已上传票据金额汇总，缺少费用清单时结果可能偏低。",
    missingImpact: "缺医疗发票和费用清单，医疗费上限暂按保守区间。"
  },
  {
    name: "误工费",
    amount: "¥4,800 - ¥6,800",
    evidence: "缺收入证明",
    detail: "按误工天数和收入材料测算，当前使用临时区间。",
    missingImpact: "缺收入证明和工资流水，误工费可能被保险方压低。"
  },
  {
    name: "护理费",
    amount: "¥1,800 - ¥2,800",
    evidence: "需确认护理天数",
    detail: "根据就医材料和护理天数估算。",
    missingImpact: "缺诊断证明或护理建议，护理天数需要人工确认。"
  },
  {
    name: "交通费",
    amount: "¥200 - ¥500",
    evidence: "建议补充票据",
    detail: "按就医往返交通支出估算。",
    missingImpact: "缺交通票据时通常只能按合理范围估算。"
  },
  {
    name: "营养费",
    amount: "¥600 - ¥1,200",
    evidence: "缺医嘱",
    detail: "结合伤情、治疗记录和医嘱建议估算。",
    missingImpact: "缺营养建议时，金额区间不宜给得过高。"
  },
  {
    name: "车辆损失",
    amount: "¥7,000 - ¥8,200",
    evidence: "已有定损单",
    detail: "按定损单和维修材料估算。",
    missingImpact: "缺维修发票时，最终确认金额可能低于定损金额。"
  }
];

const missingImpacts = [
  { material: "医疗发票", impact: "医疗费只能按已上传票据和保守区间估算。" },
  { material: "收入证明", impact: "误工费无法确认稳定收入，区间会变宽。" },
  { material: "诊断证明", impact: "护理费、营养费是否支持需要进一步确认。" },
  { material: "维修发票", impact: "车辆损失可能只能按定损单暂估。" }
];

const products = [
  {
    sku: "report",
    name: "测算报告",
    price: "¥29",
    desc: "赔偿项目拆分、金额区间测算、缺失材料清单",
    includes: ["赔偿项目拆分", "金额区间测算", "缺失材料清单"],
    excludes: ["人工审核", "正式律师意见", "代为沟通"]
  },
  {
    sku: "claim_pack",
    name: "理赔材料包",
    price: "¥89",
    badge: "推荐",
    desc: "测算报告、理赔沟通稿、证据目录、理赔函草稿",
    includes: ["测算报告", "理赔沟通稿", "证据目录", "理赔函草稿"],
    excludes: ["赔偿结果承诺", "律师代理", "法院提交"]
  },
  {
    sku: "manual_review",
    name: "人工复核",
    price: "¥299 起",
    desc: "专业人员查看材料，标记风险点并给出处理建议",
    includes: ["材料复核", "风险点标记", "下一步建议"],
    excludes: ["诉讼代理", "结果承诺", "保险公司内部审核"]
  }
];

const documentDrafts = [
  {
    name: "理赔函",
    use: "发送给保险公司或责任方，说明事故、损失和赔偿请求。",
    materialStatus: "材料基本齐",
    status: "可生成",
    action: "生成草稿"
  },
  {
    name: "协商话术",
    use: "用于电话或微信沟通，帮助你表达诉求和回应常见压价。",
    materialStatus: "材料基本齐",
    status: "可生成",
    action: "生成草稿"
  },
  {
    name: "调解申请书",
    use: "用于向交警、人民调解组织或相关机构申请调解。",
    materialStatus: "缺交警调解记录",
    status: "需补充",
    action: "去补材料"
  },
  {
    name: "赔偿明细表",
    use: "把医疗费、误工费、护理费、交通费等项目整理成清单。",
    materialStatus: "缺医疗发票",
    status: "需补充",
    action: "去补材料"
  },
  {
    name: "证据目录",
    use: "整理事故责任、医疗、收入、车辆损失等证据材料。",
    materialStatus: "材料基本齐",
    status: "可生成",
    action: "生成草稿"
  },
  {
    name: "起诉状草稿",
    use: "争议无法协商时，用于准备诉讼方向的基础草稿。",
    materialStatus: "建议人工复核",
    status: "需复核",
    action: "人工复核"
  }
];

const profileRows = [
  { label: "我的订单", value: "1 个服务包" },
  { label: "人工复核记录", value: "暂无" },
  { label: "联系客服", value: "服务时间 9:00-18:00" },
  { label: "用户协议", path: "/pages/legal/terms/index" },
  { label: "隐私政策", path: "/pages/legal/privacy/index" },
  { label: "数据删除", value: "可删除案件材料" }
];

module.exports = {
  caseSummary,
  stages: productSteps,
  productSteps,
  mainActions,
  tasks,
  materials,
  claimItems,
  missingImpacts,
  products,
  documentDrafts,
  profileRows
};
