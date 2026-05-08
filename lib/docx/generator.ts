import {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  convertInchesToTwip, PageOrientation,
} from 'docx'
import type { DocType } from '@/lib/types'

const PAGE_MARGINS = {
  top: convertInchesToTwip(1),
  bottom: convertInchesToTwip(1),
  left: convertInchesToTwip(1.25),
  right: convertInchesToTwip(1.25),
}

const TITLE_KEYWORDS = ['起诉状', '答辩状', '律师函', '合同', '协议书', '申请书', '声明书', '承诺书', '授权委托书', '通知书']

function isDocumentTitle(line: string, isFirst: boolean): boolean {
  if (isFirst) return true
  return TITLE_KEYWORDS.some(kw => line.includes(kw)) && line.length < 40
}

function isSectionHeading(line: string): boolean {
  return /^[一二三四五六七八九十]+[、．.]/.test(line) || /^(第[一二三四五六七八九十]+[条章节])/.test(line)
}

function isSignatureLine(line: string): boolean {
  return /^(起诉人|答辩人|申请人|委托方|甲方|乙方|律师|签名|盖章|日期|年|月|日)/.test(line) || /^[ \t]*(此致|敬礼)/.test(line)
}

export async function generateLegalDocx(
  title: string,
  _docType: DocType,
  content: string,
): Promise<Buffer> {
  const lines = content.split('\n')
  const children: Paragraph[] = []
  let isFirstContent = true

  for (const rawLine of lines) {
    const trimmed = rawLine.trim()

    if (!trimmed) {
      children.push(new Paragraph({ spacing: { after: 80 } }))
      continue
    }

    if (isDocumentTitle(trimmed, isFirstContent)) {
      children.push(new Paragraph({
        children: [new TextRun({
          text: trimmed,
          bold: true,
          size: 32,
          font: { name: '宋体', eastAsia: '宋体' },
        })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
      }))
      isFirstContent = false
      continue
    }

    if (isSectionHeading(trimmed)) {
      children.push(new Paragraph({
        children: [new TextRun({
          text: trimmed,
          bold: true,
          size: 24,
          font: { name: '宋体', eastAsia: '宋体' },
        })],
        spacing: { before: 160, after: 80 },
        indent: { firstLine: convertInchesToTwip(0.28) },
      }))
      isFirstContent = false
      continue
    }

    if (isSignatureLine(trimmed)) {
      children.push(new Paragraph({
        children: [new TextRun({
          text: trimmed,
          size: 24,
          font: { name: '宋体', eastAsia: '宋体' },
        })],
        alignment: AlignmentType.RIGHT,
        spacing: { after: 40 },
      }))
      isFirstContent = false
      continue
    }

    // Normal paragraph
    children.push(new Paragraph({
      children: [new TextRun({
        text: trimmed,
        size: 24,
        font: { name: '宋体', eastAsia: '宋体' },
      })],
      spacing: { line: 360, lineRule: 'auto' },
      indent: { firstLine: convertInchesToTwip(0.28) },
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
      children,
    }],
  })

  return Buffer.from(await Packer.toBuffer(doc))
}
