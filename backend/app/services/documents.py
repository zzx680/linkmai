from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.db.models import Document, User
from app.repositories.claims import ClaimRepository
from app.repositories.documents import DocumentRepository
from app.repositories.materials import MaterialRepository
from app.services.cases import CaseService
from app.services.claims import ClaimService


DOCUMENT_TITLES = {
    "claim_letter": "理赔函",
    "negotiation_script": "协商话术",
    "mediation_application": "调解申请书",
    "compensation_detail": "赔偿明细表",
    "evidence_list": "证据目录",
    "complaint_draft": "起诉状草稿",
}


class DocumentService:
    def __init__(self, db: Session):
        self.db = db
        self.cases = CaseService(db)
        self.claims = ClaimRepository(db)
        self.materials = MaterialRepository(db)
        self.documents = DocumentRepository(db)

    def generate_document(self, case_id: UUID, document_type: str, user: User) -> Document:
        if document_type not in DOCUMENT_TITLES:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="unsupported document type")
        case = self.cases.get_case(case_id, user)
        materials = self.materials.list_for_case(case.id, user.id)
        report = self.claims.latest_for_case(case.id, user.id)
        if report is None:
            report = ClaimService(self.db).calculate_report(case.id, user)
        content = self._render(document_type, case, materials, ClaimService.to_output(report))
        document = Document(
            case_id=case.id,
            user_id=user.id,
            document_type=document_type,
            title=DOCUMENT_TITLES[document_type],
            content_redacted=content,
            status="draft",
        )
        self.documents.create(document)
        self.db.commit()
        self.db.refresh(document)
        return document

    def list_case_documents(self, case_id: UUID, user: User) -> list[Document]:
        self.cases.get_case(case_id, user)
        return self.documents.list_for_case(case_id, user.id)

    @staticmethod
    def _render(document_type: str, case, materials, report: dict) -> str:
        material_lines = "\n".join(f"- {m.material_type}：{m.status}" for m in materials) or "- 暂无已上传材料"
        item_lines = "\n".join(
            f"- {item['item_type']}：{item['amount']} 元；{item['formula']}；证据状态：{item['evidence_status']}"
            for item in report["items"]
        )
        header = "【辅助生成草稿】本文件用于交通事故自助处理中的材料整理和沟通参考，不构成确定性诉讼建议。"
        base = (
            f"{header}\n\n"
            f"案件编号：{case.case_no}\n"
            f"案件标题：{case.title}\n"
            f"事故地点：{case.accident_location or '待补充'}\n"
            f"风险等级：{case.risk_level}\n\n"
            f"材料清单：\n{material_lines}\n\n"
            f"赔偿测算：\n{item_lines}\n\n"
            f"测算区间：{report['total_min']} 元 - {report['total_max']} 元\n"
        )
        if case.risk_level == "high" and document_type == "complaint_draft":
            return f"{base}\n高风险案件已标记人工复核，起诉状草稿仅保留事实和证据梳理，不输出确定性诉讼结论。"
        templates = {
            "claim_letter": f"{base}\n请求对方或保险机构结合已提交材料，对合理损失进行核定并协商赔付。",
            "negotiation_script": f"{base}\n协商要点：先确认事故责任，再逐项核对票据、误工、护理和车辆损失，避免使用保证性表述。",
            "mediation_application": f"{base}\n申请事项：请求组织双方围绕事故责任、损失金额和赔付方式进行调解。",
            "compensation_detail": f"{base}\n以上为赔偿明细表草稿，缺失材料项需继续补充后再复核。",
            "evidence_list": f"{base}\n证据目录按材料类型、证明目的和当前核验状态整理。",
            "complaint_draft": f"{base}\n诉请草稿：请求依法核定交通事故造成的合理损失。具体诉请金额需人工复核后确定。",
        }
        return templates[document_type]
