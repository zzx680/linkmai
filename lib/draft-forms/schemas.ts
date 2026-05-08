import type { DocFormSchema } from './types'

export const DOC_FORM_SCHEMAS: DocFormSchema[] = [
  {
    docType: 'complaint',
    label: '起诉状',
    icon: '⚖️',
    desc: '向法院提起民事诉讼',
    steps: [
      {
        title: '当事人信息',
        description: '填写原告、被告及受理法院的基本信息',
        fields: [
          { key: 'plaintiff_name', label: '原告姓名 / 名称', type: 'text', placeholder: '如：张三 / 北京某科技有限公司', required: true, colSpan: 1 },
          { key: 'defendant_name', label: '被告姓名 / 名称', type: 'text', placeholder: '如：李四 / 上海某贸易有限公司', required: true, colSpan: 1 },
          { key: 'plaintiff_address', label: '原告住所 / 注册地', type: 'textarea', placeholder: '如：北京市朝阳区某街道某号', required: true, colSpan: 2 },
          { key: 'defendant_address', label: '被告住所 / 注册地', type: 'textarea', placeholder: '如：上海市浦东新区某路某号', required: true, colSpan: 2 },
          { key: 'plaintiff_phone', label: '原告联系电话', type: 'text', placeholder: '如：138xxxx8888', required: false, colSpan: 1 },
          { key: 'court', label: '受理法院', type: 'text', placeholder: '如：北京市朝阳区人民法院', required: true, colSpan: 1 },
        ],
      },
      {
        title: '诉讼请求',
        description: '列明向法院提出的具体请求，每条单独列项',
        fields: [
          {
            key: 'claims',
            label: '诉讼请求',
            type: 'array',
            arrayItemLabel: '请求',
            placeholder: '如：判令被告支付货款人民币50,000元',
            required: true,
            hint: '每条请求单独列项，写明具体金额或行为',
            colSpan: 2,
          },
          {
            key: 'cause_of_action',
            label: '案由',
            type: 'select',
            options: ['劳动合同纠纷', '买卖合同纠纷', '借款合同纠纷', '侵权责任纠纷', '离婚纠纷', '房屋买卖合同纠纷', '服务合同纠纷', '租赁合同纠纷', '其他'],
            required: true,
            colSpan: 1,
          },
          { key: 'amount', label: '诉讼标的金额（元）', type: 'text', placeholder: '如：50000', required: false, hint: '如涉及金钱给付，填写总金额', colSpan: 1 },
        ],
      },
      {
        title: '事实与理由',
        description: '陈述案件事实经过和法律依据',
        fields: [
          { key: 'facts', label: '案件事实经过', type: 'textarea', placeholder: '按时间顺序陈述，包括合同签订、履行、违约等关键节点...', required: true, hint: '建议按时间顺序陈述，包括合同签订、履行、违约等关键节点', colSpan: 2 },
          { key: 'breach_description', label: '违约 / 侵权行为描述', type: 'textarea', placeholder: '具体描述对方的违约行为或侵权行为...', required: true, colSpan: 2 },
          { key: 'damages', label: '损失情况', type: 'textarea', placeholder: '描述因对方行为造成的直接损失和间接损失...', required: false, colSpan: 2 },
          {
            key: 'evidence',
            label: '证据清单',
            type: 'array',
            arrayItemLabel: '证据',
            placeholder: '如：劳动合同一份',
            required: false,
            hint: '列出主要证据，如：劳动合同、工资流水、微信记录等',
            colSpan: 2,
          },
        ],
      },
    ],
  },

  {
    docType: 'defense',
    label: '答辩状',
    icon: '🛡️',
    desc: '针对原告诉请进行答辩',
    steps: [
      {
        title: '当事人信息',
        description: '填写答辩人、原告及案件基本信息',
        fields: [
          { key: 'defendant_name', label: '答辩人姓名 / 名称', type: 'text', placeholder: '如：李四', required: true, colSpan: 1 },
          { key: 'plaintiff_name', label: '原告姓名 / 名称', type: 'text', placeholder: '如：张三', required: true, colSpan: 1 },
          { key: 'defendant_address', label: '答辩人住所', type: 'textarea', placeholder: '如：上海市浦东新区某路某号', required: true, colSpan: 2 },
          { key: 'court', label: '受理法院', type: 'text', placeholder: '如：北京市朝阳区人民法院', required: true, colSpan: 1 },
          { key: 'case_number', label: '案号', type: 'text', placeholder: '如：（2024）京0105民初1234号', required: false, hint: '如已立案，填写法院案号', colSpan: 1 },
        ],
      },
      {
        title: '答辩要点',
        description: '逐条列明答辩立场和理由',
        fields: [
          { key: 'defense_summary', label: '答辩意见概述', type: 'textarea', placeholder: '如：原告诉请缺乏事实和法律依据，请求法院依法驳回...', required: true, hint: '简要说明答辩立场', colSpan: 2 },
          {
            key: 'defense_points',
            label: '答辩要点',
            type: 'array',
            arrayItemLabel: '要点',
            placeholder: '如：原告主张的劳动关系不成立，理由如下...',
            required: true,
            hint: '逐条反驳原告诉请，每条对应一个要点',
            colSpan: 2,
          },
        ],
      },
      {
        title: '事实与理由',
        description: '从答辩人角度陈述案件事实',
        fields: [
          { key: 'facts', label: '己方事实陈述', type: 'textarea', placeholder: '从答辩人角度陈述案件事实，与原告陈述形成对比...', required: true, colSpan: 2 },
          { key: 'legal_basis', label: '法律依据', type: 'textarea', placeholder: '引用支持答辩立场的法律条文，如不确定可留空由AI检索...', required: false, colSpan: 2 },
          {
            key: 'evidence',
            label: '证据清单',
            type: 'array',
            arrayItemLabel: '证据',
            placeholder: '如：劳动合同一份',
            required: false,
            colSpan: 2,
          },
        ],
      },
    ],
  },

  {
    docType: 'lawyer_letter',
    label: '律师函',
    icon: '📨',
    desc: '正式法律通知函件',
    steps: [
      {
        title: '基本信息',
        description: '填写委托方、收件方及律师事务所信息',
        fields: [
          { key: 'client_name', label: '委托方名称', type: 'text', placeholder: '如：张三 / 北京某科技有限公司', required: true, hint: '委托律师事务所发函的当事人', colSpan: 1 },
          { key: 'recipient_name', label: '收件方名称', type: 'text', placeholder: '如：李四 / 上海某贸易有限公司', required: true, colSpan: 1 },
          { key: 'recipient_address', label: '收件方地址', type: 'textarea', placeholder: '如：上海市浦东新区某路某号', required: false, colSpan: 2 },
          { key: 'law_firm', label: '律师事务所名称', type: 'text', placeholder: '如：北京某某律师事务所', required: true, colSpan: 1 },
          { key: 'lawyer_name', label: '经办律师姓名', type: 'text', placeholder: '如：王律师', required: true, colSpan: 1 },
          {
            key: 'matter_type',
            label: '事项类型',
            type: 'select',
            options: ['债务催收', '合同违约', '知识产权侵权', '劳动争议', '名誉侵权', '房产纠纷', '其他'],
            required: true,
            colSpan: 1,
          },
        ],
      },
      {
        title: '函件内容',
        description: '陈述事实、提出要求并说明法律后果',
        fields: [
          { key: 'facts', label: '事实陈述', type: 'textarea', placeholder: '客观陈述委托方与收件方之间的法律关系和争议事实...', required: true, hint: '客观陈述委托方与收件方之间的法律关系和争议事实', colSpan: 2 },
          {
            key: 'demands',
            label: '具体要求',
            type: 'array',
            arrayItemLabel: '要求',
            placeholder: '如：支付欠款人民币50,000元',
            required: true,
            hint: '明确列出要求对方履行的具体行为',
            colSpan: 2,
          },
          { key: 'deadline', label: '回复 / 履行期限', type: 'text', placeholder: '如：收函后7日内', required: true, colSpan: 1 },
          { key: 'consequences', label: '逾期后果', type: 'textarea', placeholder: '如：将依法提起诉讼，追究法律责任...', required: false, colSpan: 2 },
        ],
      },
    ],
  },

  {
    docType: 'contract',
    label: '合同',
    icon: '📋',
    desc: '起草各类商业合同',
    steps: [
      {
        title: '合同基本信息',
        description: '填写合同名称、类型及甲乙双方信息',
        fields: [
          { key: 'contract_name', label: '合同名称', type: 'text', placeholder: '如：技术服务合同', required: true, colSpan: 2 },
          {
            key: 'contract_type',
            label: '合同类型',
            type: 'select',
            options: ['劳动合同', '买卖合同', '租赁合同', '借款合同', '技术服务合同', '委托合同', '建设工程合同', '其他'],
            required: true,
            colSpan: 1,
          },
          { key: 'subject_matter', label: '合同标的', type: 'textarea', placeholder: '如：乙方为甲方提供软件开发服务，开发内容为...', required: true, hint: '合同的核心事项', colSpan: 2 },
          { key: 'party_a_name', label: '甲方名称', type: 'text', placeholder: '如：北京某科技有限公司', required: true, colSpan: 1 },
          { key: 'party_b_name', label: '乙方名称', type: 'text', placeholder: '如：上海某软件有限公司', required: true, colSpan: 1 },
          { key: 'party_a_id', label: '甲方统一社会信用代码 / 身份证号', type: 'text', placeholder: '如：91110000XXXXXXXXXX', required: false, colSpan: 1 },
          { key: 'party_b_id', label: '乙方统一社会信用代码 / 身份证号', type: 'text', placeholder: '如：91310000XXXXXXXXXX', required: false, colSpan: 1 },
        ],
      },
      {
        title: '核心条款',
        description: '填写合同金额、期限及主要权利义务',
        fields: [
          { key: 'amount', label: '合同金额 / 报酬', type: 'text', placeholder: '如：总价款100,000元，分三期支付', required: false, colSpan: 1 },
          { key: 'duration', label: '履行期限', type: 'text', placeholder: '如：自签订之日起12个月内', required: true, colSpan: 1 },
          { key: 'payment_terms', label: '付款方式', type: 'textarea', placeholder: '如：签订合同后3日内支付首付款30%，验收合格后支付尾款...', required: false, colSpan: 2 },
          {
            key: 'obligations',
            label: '主要权利义务',
            type: 'array',
            arrayItemLabel: '条款',
            placeholder: '如：甲方应按时提供开发所需资料和环境',
            required: true,
            hint: '列出双方核心权利义务，每条一项',
            colSpan: 2,
          },
        ],
      },
      {
        title: '违约与争议',
        description: '约定违约责任和争议解决方式',
        fields: [
          { key: 'breach_liability', label: '违约责任', type: 'textarea', placeholder: '如：任何一方违约，应向守约方支付合同总价款20%的违约金...', required: true, hint: '建议写明具体违约金比例或计算方式', colSpan: 2 },
          {
            key: 'dispute_resolution',
            label: '争议解决方式',
            type: 'select',
            options: ['向合同签订地法院起诉', '向被告住所地法院起诉', '提交北京仲裁委员会仲裁', '提交中国国际经济贸易仲裁委员会仲裁', '协商解决，协商不成提起诉讼'],
            required: true,
            colSpan: 1,
          },
          { key: 'confidentiality', label: '保密条款', type: 'textarea', placeholder: '如：双方对合同内容及履行过程中知悉的商业秘密负有保密义务，保密期限为...', required: false, colSpan: 2 },
          { key: 'other_terms', label: '其他约定', type: 'textarea', placeholder: '其他需要特别约定的事项...', required: false, colSpan: 2 },
        ],
      },
    ],
  },

  {
    docType: 'motion',
    label: '申请书',
    icon: '📝',
    desc: '向法院或机关提出申请',
    steps: [
      {
        title: '申请基本信息',
        description: '填写申请类型、申请人及受理机关信息',
        fields: [
          {
            key: 'motion_type',
            label: '申请书类型',
            type: 'select',
            options: ['财产保全申请书', '证据保全申请书', '先予执行申请书', '延期审理申请书', '回避申请书', '强制执行申请书', '撤诉申请书', '其他'],
            required: true,
            colSpan: 1,
          },
          { key: 'applicant_name', label: '申请人姓名 / 名称', type: 'text', placeholder: '如：张三', required: true, colSpan: 1 },
          { key: 'applicant_address', label: '申请人住所', type: 'textarea', placeholder: '如：北京市朝阳区某街道某号', required: true, colSpan: 2 },
          { key: 'respondent_name', label: '被申请人姓名 / 名称', type: 'text', placeholder: '如：李四（部分申请书无被申请人，可留空）', required: false, colSpan: 1 },
          { key: 'authority', label: '受理机关', type: 'text', placeholder: '如：北京市朝阳区人民法院', required: true, colSpan: 1 },
          { key: 'case_number', label: '关联案号', type: 'text', placeholder: '如：（2024）京0105民初1234号', required: false, colSpan: 1 },
        ],
      },
      {
        title: '申请内容',
        description: '填写申请事项和申请理由',
        fields: [
          {
            key: 'requests',
            label: '申请事项',
            type: 'array',
            arrayItemLabel: '申请事项',
            placeholder: '如：请求冻结被申请人名下银行账户中人民币50,000元',
            required: true,
            hint: '具体申请法院/机关采取的措施',
            colSpan: 2,
          },
          { key: 'reasons', label: '申请理由', type: 'textarea', placeholder: '陈述申请的事实依据和法律依据...', required: true, colSpan: 2 },
          { key: 'guarantee', label: '担保方式', type: 'textarea', placeholder: '如：申请人愿意提供等额现金担保（财产保全申请需填写）', required: false, colSpan: 2 },
        ],
      },
    ],
  },

  {
    docType: 'other',
    label: '其他文书',
    icon: '📄',
    desc: '自定义法律文书',
    steps: [
      {
        title: '文书内容',
        description: '描述需要起草的文书内容',
        fields: [
          { key: 'doc_title', label: '文书标题', type: 'text', placeholder: '如：声明书、承诺书、授权委托书...', required: true, colSpan: 2 },
          { key: 'instruction', label: '起草要求', type: 'textarea', placeholder: '详细描述文书的用途、当事人信息、主要内容和特殊要求...', required: true, hint: '描述越详细，生成质量越高', colSpan: 2 },
        ],
      },
    ],
  },
]

export function getSchemaByDocType(docType: string): DocFormSchema | undefined {
  return DOC_FORM_SCHEMAS.find(s => s.docType === docType)
}
