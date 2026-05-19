import type { DocType, Case } from '@/lib/types'
import type { FormData } from './types'

// 从案件数据推断各文书类型的预填字段
export function prefillFromCase(docType: DocType, caseData: Case): FormData {
  const c = caseData
  switch (docType) {
    case 'complaint':
      return {
        ...(c.client_name ? { plaintiff_name: c.client_name } : {}),
        ...(c.opponent ? { defendant_name: c.opponent } : {}),
        ...(c.court ? { court: c.court } : {}),
        ...(c.client_phone ? { plaintiff_phone: c.client_phone } : {}),
        ...(c.description ? { facts: c.description } : {}),
      }
    case 'defense':
      return {
        ...(c.client_name ? { defendant_name: c.client_name } : {}),
        ...(c.opponent ? { plaintiff_name: c.opponent } : {}),
        ...(c.court ? { court: c.court } : {}),
        ...(c.case_number ? { case_number: c.case_number } : {}),
      }
    case 'motion':
      return {
        ...(c.client_name ? { applicant_name: c.client_name } : {}),
        ...(c.opponent ? { respondent_name: c.opponent } : {}),
        ...(c.court ? { authority: c.court } : {}),
        ...(c.case_number ? { case_number: c.case_number } : {}),
      }
    case 'lawyer_letter':
      return {
        ...(c.client_name ? { client_name: c.client_name } : {}),
        ...(c.opponent ? { recipient_name: c.opponent } : {}),
        ...(c.description ? { facts: c.description } : {}),
      }
    default:
      return {}
  }
}

export function buildStructuredPrompt(
  docType: DocType,
  formData: FormData,
  caseData?: Case,
): string {
  // 案件字段优先级：表单填写 > 案件预填
  const merged: FormData = caseData
    ? { ...prefillFromCase(docType, caseData), ...formData }
    : formData
  const builders: Partial<Record<DocType, (d: FormData) => string>> = {
    complaint: buildComplaintPrompt,
    defense: buildDefensePrompt,
    lawyer_letter: buildLawyerLetterPrompt,
    contract: buildContractPrompt,
    motion: buildMotionPrompt,
    other: buildOtherPrompt,
  }
  return (builders[docType] ?? buildOtherPrompt)(merged)
}

function arr(items: string[] | undefined, prefix = ''): string {
  if (!items?.length) return '待补充'
  return items.map((item, i) => `${prefix}${i + 1}. ${item}`).join('\n')
}

function line(data: FormData, key: string, label: string, suffix = ''): string {
  const v = data[key]
  if (!v || (typeof v === 'string' && !v.trim())) return ''
  return `${label}：${v}${suffix}`
}

function buildComplaintPrompt(d: FormData): string {
  return `请起草一份民事起诉状，具体要素如下：

【当事人信息】
${line(d, 'plaintiff_name', '原告')}${d.plaintiff_address ? `，住所：${d.plaintiff_address}` : ''}${d.plaintiff_phone ? `，联系电话：${d.plaintiff_phone}` : ''}
${line(d, 'defendant_name', '被告')}${d.defendant_address ? `，住所：${d.defendant_address}` : ''}
${line(d, 'court', '受理法院')}

【诉讼请求】
${arr(d.claims as string[] | undefined)}

【案由】${d.cause_of_action || '待确定'}
${d.amount ? `【诉讼标的金额】${d.amount}元` : ''}

【案件事实经过】
${d.facts || '待补充'}

【违约/侵权行为】
${d.breach_description || '待补充'}

${d.damages ? `【损失情况】\n${d.damages}` : ''}

【证据清单】
${arr(d.evidence as string[] | undefined)}

请严格按照中国民事诉讼文书规范起草，包含完整的标题、当事人信息、诉讼请求、事实与理由、此致法院、起诉人签名和日期等要素。引用具体法律条文时必须准确。`
}

function buildDefensePrompt(d: FormData): string {
  return `请起草一份民事答辩状，具体要素如下：

【当事人信息】
${line(d, 'defendant_name', '答辩人')}${d.defendant_address ? `，住所：${d.defendant_address}` : ''}
${line(d, 'plaintiff_name', '原告')}
${line(d, 'court', '受理法院')}
${d.case_number ? `【案号】${d.case_number}` : ''}

【答辩意见概述】
${d.defense_summary || '待补充'}

【答辩要点】
${arr(d.defense_points as string[] | undefined)}

【己方事实陈述】
${d.facts || '待补充'}

${d.legal_basis ? `【法律依据】\n${d.legal_basis}` : ''}

${(d.evidence as string[])?.length ? `【证据清单】\n${arr(d.evidence as string[])}` : ''}

请严格按照中国民事答辩状规范起草，包含完整的标题、当事人信息、答辩意见、此致法院、答辩人签名和日期等要素。`
}

function buildLawyerLetterPrompt(d: FormData): string {
  return `请起草一份律师函，具体要素如下：

【基本信息】
${line(d, 'client_name', '委托方')}
${line(d, 'recipient_name', '收件方')}${d.recipient_address ? `，地址：${d.recipient_address}` : ''}
${line(d, 'law_firm', '律师事务所')}
${line(d, 'lawyer_name', '经办律师')}
${line(d, 'matter_type', '事项类型')}

【事实陈述】
${d.facts || '待补充'}

【具体要求】
${arr(d.demands as string[] | undefined)}

${line(d, 'deadline', '回复/履行期限')}

${d.consequences ? `【逾期后果】\n${d.consequences}` : ''}

请严格按照律师函规范起草，包含完整的标题、收件方、事实陈述、法律依据、律师意见及要求、律师事务所和律师签名、日期等要素。语气应正式、专业、具有法律威慑力。`
}

function buildContractPrompt(d: FormData): string {
  return `请起草一份合同，具体要素如下：

【合同基本信息】
${line(d, 'contract_name', '合同名称')}
${line(d, 'contract_type', '合同类型')}
${d.subject_matter ? `【合同标的】\n${d.subject_matter}` : ''}

【当事人信息】
甲方：${d.party_a_name || '待填写'}${d.party_a_id ? `（${d.party_a_id}）` : ''}
乙方：${d.party_b_name || '待填写'}${d.party_b_id ? `（${d.party_b_id}）` : ''}

【核心条款】
${d.amount ? `合同金额/报酬：${d.amount}` : ''}
${line(d, 'duration', '履行期限')}
${d.payment_terms ? `【付款方式】\n${d.payment_terms}` : ''}

【主要权利义务】
${arr(d.obligations as string[] | undefined)}

【违约责任】
${d.breach_liability || '待补充'}

${d.dispute_resolution ? `【争议解决方式】${d.dispute_resolution}` : ''}
${d.confidentiality ? `【保密条款】\n${d.confidentiality}` : ''}
${d.other_terms ? `【其他约定】\n${d.other_terms}` : ''}

请严格按照中国合同法规范起草，包含完整的标题、当事人信息、合同条款（应包含但不限于上述内容）、签字盖章栏和日期等要素。条款表述应明确、无歧义。`
}

function buildMotionPrompt(d: FormData): string {
  return `请起草一份${d.motion_type || '申请书'}，具体要素如下：

【申请基本信息】
${line(d, 'motion_type', '申请书类型')}
${line(d, 'applicant_name', '申请人')}${d.applicant_address ? `，住所：${d.applicant_address}` : ''}
${d.respondent_name ? `被申请人：${d.respondent_name}` : ''}
${line(d, 'authority', '受理机关')}
${d.case_number ? `【关联案号】${d.case_number}` : ''}

【申请事项】
${arr(d.requests as string[] | undefined)}

【申请理由】
${d.reasons || '待补充'}

${d.guarantee ? `【担保方式】\n${d.guarantee}` : ''}

请严格按照中国法律文书规范起草，包含完整的标题、申请人信息、申请事项、申请理由、此致机关、申请人签名和日期等要素。`
}

function buildOtherPrompt(d: FormData): string {
  if (d.instruction && typeof d.instruction === 'string') {
    return `请起草一份${d.doc_title ? `「${d.doc_title}」` : '法律文书'}，具体要求如下：\n\n${d.instruction}`
  }
  return `请起草一份${d.doc_title ? `「${d.doc_title}」` : '法律文书'}，请严格按照中国法律文书规范起草。`
}
