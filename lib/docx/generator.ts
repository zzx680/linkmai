import {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  Header, Footer, PageNumber, PageNumberElement, PageNumberSeparator,
  convertMillimetersToTwip, PageOrientation,
} from 'docx'
import type { DocType } from '@/lib/types'

// 中国法律文书标准：A4，上下各25mm，左30mm，右25mm
const PAGE_MARGINS = {
  top: convertMillimetersToTwip(25),
  bottom: convertMillimetersToTwip(25),
  left: convertMillimetersToTwip(30),
  right: convertMillimetersToTwip(25),
}

// 三号字 = 16pt = 32 half-points；小四 = 12pt = 24 half-points
const FONT_BODY = 32       // 三号，正文
const FONT_HEADING = 32    // 三号，章节标题（加粗）
const FONT_TITLE = 36      // 小二，文书大标题
const FONT_FOOTER = 20     // 小五，页脚页码
const LINE_SPACING = 480   // 1.5 倍行距（240 = 单倍）
const FONT_FAMILY = '仿宋'
const FONT_FAMILY_TITLE = '宋体'

const TITLE_KEYWORDS = [
  '起诉状', '答辩状', '律师函', '合同', '协议书', '申请书',
  '声明书', '承诺书', '授权委托书', '通知书', '代理词', '法律意见书',
]

function isDocumentTitle(line: string, isFirst: boolean): boolean {
  if (isFirst && line.length < 50) return true
  return TITLE_KEYWORDS.some(kw => line.includes(kw)) && line.length < 40
}

function isSectionHeading(line: string): boolean {
  return (
    /^[一二三四五六七八九十]+[、．.]/.test(line) ||
    /^(第[一二三四五六七八九十百]+[条章节])/.test(line) ||
    /^【.+】$/.test(line)
  )
}

function isSignatureLine(line: string): boolean {
  return (
    /^(起诉人|答辩人|申请人|委托方|甲方|乙方|律师|代理人|签名|盖章|日期|此致|敬礼)/.test(line) ||
    /^\s*(此致|敬礼)\s*$/.test(line) ||
    /^[\s　]*(年|月|日)[\s　]*$/.test(line)
  )
}

function isPartyInfoLine(line: string): boolean {
  return /^(原告|被告|上诉人|被上诉人|申请人|被申请人|第三人|委托代理人|法定代表人)/.test(line)
}

function buildHeader(docTitle: string): Header {
  return new Header({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: docTitle,
            size: FONT_FOOTER,
            font: { name: FONT_FAMILY, eastAsia: FONT_FAMILY },
            color: '666666',
          }),
        ],
        alignment: AlignmentType.CENTER,
        border: {
          bottom: { style: 'single', size: 4, color: 'CCCCCC', space: 4 },
        },
      }),
    ],
  })
}

function buildFooter(): Footer {
  return new Footer({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            children: ['第 ', PageNumber.CURRENT, ' 页，共 ', PageNumber.TOTAL_PAGES, ' 页'],
            size: FONT_FOOTER,
            font: { name: FONT_FAMILY, eastAsia: FONT_FAMILY },
            color: '888888',
          }),
        ],
        alignment: AlignmentType.RIGHT,
        border: {
          top: { style: 'single', size: 4, color: 'CCCCCC', space: 4 },
        },
      }),
    ],
  })
}

export async function generateLegalDocx(
  title: string,
  _docType: DocType,
  content: string,
): Promise<Buffer> {
  const lines = content.split('\n')
  const children: Paragraph[] = []
  let isFirstContent = true
  let foundTitle = false

  for (const rawLine of lines) {
    const trimmed = rawLine.trim()

    // 空行
    if (!trimmed) {
      children.push(new Paragraph({ spacing: { after: 0, line: LINE_SPACING, lineRule: 'auto' } }))
      continue
    }

    // 文书大标题（居中，宋体，小二加粗）
    if (!foundTitle && isDocumentTitle(trimmed, isFirstContent)) {
      children.push(new Paragraph({
        children: [new TextRun({
          text: trimmed,
          bold: true,
          size: FONT_TITLE,
          font: { name: FONT_FAMILY_TITLE, eastAsia: FONT_FAMILY_TITLE },
        })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 480, line: LINE_SPACING, lineRule: 'auto' },
      }))
      foundTitle = true
      isFirstContent = false
      continue
    }

    // 章节标题（加粗，首行不缩进）
    if (isSectionHeading(trimmed)) {
      children.push(new Paragraph({
        children: [new TextRun({
          text: trimmed,
          bold: true,
          size: FONT_HEADING,
          font: { name: FONT_FAMILY_TITLE, eastAsia: FONT_FAMILY_TITLE },
        })],
        spacing: { before: 240, after: 120, line: LINE_SPACING, lineRule: 'auto' },
      }))
      isFirstContent = false
      continue
    }

    // 当事人信息行（不缩进，仿宋）
    if (isPartyInfoLine(trimmed)) {
      children.push(new Paragraph({
        children: [new TextRun({
          text: trimmed,
          size: FONT_BODY,
          font: { name: FONT_FAMILY, eastAsia: FONT_FAMILY },
        })],
        spacing: { after: 0, line: LINE_SPACING, lineRule: 'auto' },
      }))
      isFirstContent = false
      continue
    }

    // 落款行（右对齐，不缩进）
    if (isSignatureLine(trimmed)) {
      children.push(new Paragraph({
        children: [new TextRun({
          text: trimmed,
          size: FONT_BODY,
          font: { name: FONT_FAMILY, eastAsia: FONT_FAMILY },
        })],
        alignment: AlignmentType.RIGHT,
        spacing: { after: 0, line: LINE_SPACING, lineRule: 'auto' },
      }))
      isFirstContent = false
      continue
    }

    // 正文段落（首行缩进2字符）
    children.push(new Paragraph({
      children: [new TextRun({
        text: trimmed,
        size: FONT_BODY,
        font: { name: FONT_FAMILY, eastAsia: FONT_FAMILY },
      })],
      spacing: { after: 0, line: LINE_SPACING, lineRule: 'auto' },
      indent: { firstLine: convertMillimetersToTwip(8.5) }, // 约2个三号字宽
    }))
    isFirstContent = false
  }

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: PAGE_MARGINS,
          size: { orientation: PageOrientation.PORTRAIT },
        },
      },
      headers: { default: buildHeader(title) },
      footers: { default: buildFooter() },
      children,
    }],
  })

  return Buffer.from(await Packer.toBuffer(doc))
}
