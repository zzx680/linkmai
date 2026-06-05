const caseSummary = {
  id: "case_001",
  title: "追尾事故 · 上海浦东",
  plate: "沪A****",
  status: "待补材料",
  riskLevel: "中",
  nextAction: "上传医疗发票和病历",
  nextActionTime: "预计 2 分钟",
  progress: 62,
  estimateRange: "¥18,600 - ¥24,300"
};

const tasks = [
  { title: "事故信息", status: "已完成" },
  { title: "责任信息", status: "已完成" },
  { title: "医疗材料", status: "待补充" },
  { title: "赔偿测算", status: "可生成" },
  { title: "文书材料", status: "未生成" }
];

const materials = [
  {
    group: "事故责任",
    items: [
      { name: "事故认定书", purpose: "用于确认责任比例", status: "已通过" },
      { name: "交警调解记录", purpose: "用于补充处理经过", status: "未上传" }
    ]
  },
  {
    group: "医疗材料",
    items: [
      { name: "病历", purpose: "用于判断伤情和赔偿项目", status: "需补充" },
      { name: "医疗发票", purpose: "用于计算医疗费", status: "未上传" },
      { name: "费用清单", purpose: "用于核对医疗费用明细", status: "未上传" }
    ]
  },
  {
    group: "收入与误工",
    items: [
      { name: "收入证明", purpose: "用于计算误工费", status: "未上传" },
      { name: "误工证明", purpose: "用于确认误工天数", status: "未上传" }
    ]
  },
  {
    group: "车辆损失",
    items: [
      { name: "定损单", purpose: "用于计算车辆维修损失", status: "已通过" },
      { name: "维修发票", purpose: "用于确认实际支出", status: "未上传" }
    ]
  }
];

const claimItems = [
  {
    name: "医疗费",
    amount: "¥8,200",
    evidence: "已有部分发票",
    detail: "按已上传票据金额汇总，缺少费用清单时结果可能偏低。"
  },
  {
    name: "误工费",
    amount: "¥6,000",
    evidence: "缺收入证明",
    detail: "按误工天数和收入材料测算，当前使用临时区间。"
  },
  {
    name: "护理费",
    amount: "¥2,400",
    evidence: "需确认护理天数",
    detail: "根据就医材料和护理天数估算。"
  },
  {
    name: "交通费",
    amount: "¥300",
    evidence: "建议补充票据",
    detail: "按就医往返交通支出估算。"
  },
  {
    name: "车辆损失",
    amount: "¥7,800",
    evidence: "已有定损单",
    detail: "按定损单和维修材料估算。"
  }
];

const products = [
  {
    sku: "report",
    name: "测算报告",
    price: "¥29",
    desc: "赔偿项目拆分、金额区间测算、缺失材料清单"
  },
  {
    sku: "claim_pack",
    name: "理赔材料包",
    price: "¥89",
    desc: "测算报告、理赔沟通稿、证据目录、理赔函草稿"
  },
  {
    sku: "manual_review",
    name: "人工复核",
    price: "¥299 起",
    desc: "专业人员查看材料，标记风险点并给出处理建议"
  }
];

module.exports = {
  caseSummary,
  tasks,
  materials,
  claimItems,
  products
};

