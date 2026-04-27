import type OpenAI from 'openai'

export const tools: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'search_legal_database',
      description: '检索法律法规、司法解释、典型案例。当需要引用具体法条或判例时调用。',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: '检索关键词，如"劳动合同解除 经济补偿"' },
          search_type: {
            type: 'string',
            enum: ['statute', 'case', 'regulation', 'all'],
            description: 'statute=法律法规, case=判例, regulation=司法解释, all=全部',
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'save_document_draft',
      description: '将起草完成的文书保存到数据库。文书内容完整后调用一次。',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: '文书标题，如"原告张三诉被告李四劳动合同纠纷起诉状"' },
          doc_type: {
            type: 'string',
            enum: ['complaint', 'defense', 'contract', 'lawyer_letter', 'motion', 'other'],
          },
          content: { type: 'string', description: '文书正文，使用规范的法律文书格式' },
          case_id: { type: 'string', description: '关联案件 ID' },
        },
        required: ['title', 'doc_type', 'content', 'case_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_document_template',
      description: '获取指定类型文书的标准格式模板，起草前调用以了解格式要求。',
      parameters: {
        type: 'object',
        properties: {
          doc_type: {
            type: 'string',
            enum: ['complaint', 'defense', 'contract', 'lawyer_letter', 'motion'],
          },
        },
        required: ['doc_type'],
      },
    },
  },
]

export const DOC_TEMPLATES: Record<string, string> = {
  complaint: `民事起诉状

原告：[姓名]，[性别]，[出生日期]，[民族]，[住址]，联系电话：[电话]
被告：[姓名/名称]，[住址/注册地]

诉讼请求：
一、[具体请求1]
二、[具体请求2]

事实与理由：
[详细陈述案件事实，引用相关法律依据]

此致
[受理法院]

附：证据清单
1. [证据1]
2. [证据2]

起诉人：[签名]
[日期]`,

  defense: `民事答辩状

答辩人：[姓名]，[基本信息]
原告：[姓名]

答辩意见：
一、[答辩要点1]
二、[答辩要点2]

综上所述，请求法院依法驳回原告的诉讼请求。

此致
[受理法院]

答辩人：[签名]
[日期]`,

  lawyer_letter: `律师函

[收件方名称]：

本所受[委托方]委托，就[事项]向贵方发出本律师函。

一、事实陈述
[事实描述]

二、法律依据
[相关法律条文]

三、律师意见及要求
[具体要求，设定期限]

请贵方在收到本函后[X]日内予以回复，否则本所将依法采取进一步法律措施。

[律师事务所名称]
律师：[姓名]
日期：[日期]`,

  contract: `[合同名称]

甲方：[名称]，[统一社会信用代码/身份证号]
乙方：[名称]，[统一社会信用代码/身份证号]

根据《中华人民共和国民法典》等相关法律法规，甲乙双方经平等协商，就[合同事项]达成如下协议：

第一条 [条款标题]
[条款内容]

第二条 [条款标题]
[条款内容]

第三条 违约责任
[违约条款]

第四条 争议解决
如发生争议，双方应协商解决；协商不成，提交[仲裁机构/法院]解决。

第五条 其他
本合同一式两份，甲乙双方各执一份，自双方签字（盖章）之日起生效。

甲方（签章）：          乙方（签章）：
日期：                  日期：`,

  motion: `[申请书/动议标题]

申请人：[基本信息]
被申请人：[基本信息]（如有）

申请事项：
[具体申请内容]

申请理由：
[事实与法律依据]

此致
[受理机关]

申请人：[签名]
[日期]`,
}
