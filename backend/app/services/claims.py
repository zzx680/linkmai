from decimal import Decimal
from uuid import UUID

from sqlalchemy.orm import Session

from app.db.models import ClaimItem, ClaimReport, Material, User
from app.repositories.claims import ClaimRepository
from app.repositories.materials import MaterialRepository
from app.services.cases import CaseService


RULE_VERSION = "claim-v1"


class ClaimService:
    def __init__(self, db: Session):
        self.db = db
        self.cases = CaseService(db)
        self.claims = ClaimRepository(db)
        self.materials = MaterialRepository(db)

    def calculate_report(self, case_id: UUID, user: User) -> ClaimReport:
        case = self.cases.get_case(case_id, user)
        materials = self.materials.list_for_case(case.id, user.id)
        inputs = self._derive_inputs(case, materials)
        items_payload = self._calculate_items(inputs, materials)
        total = sum(Decimal(str(item["amount"])) for item in items_payload)
        uncertainties = self._uncertainties(items_payload, case.risk_level)
        total_min = (total * Decimal("0.85")).quantize(Decimal("0.01"))
        total_max = (total * Decimal("1.15")).quantize(Decimal("0.01"))
        output = {
            "total_min": float(total_min),
            "total_max": float(total_max),
            "items": items_payload,
            "uncertainties": uncertainties,
        }
        report = ClaimReport(
            case_id=case.id,
            user_id=user.id,
            version=self.claims.next_version(case.id, user.id),
            total_estimated_amount=total,
            confidence_level="low" if uncertainties else "medium",
            status="draft",
            calculation_input_json=inputs,
            calculation_output_json=output,
            rule_version=RULE_VERSION,
        )
        items = [
            ClaimItem(
                item_type=item["item_type"],
                amount=Decimal(str(item["amount"])),
                formula=item["formula"],
                evidence_status=item["evidence_status"],
                basis_text=item["basis_text"],
                missing_materials_json=item["missing_materials"],
            )
            for item in items_payload
        ]
        self.claims.create_report(report, items)
        self.db.commit()
        self.db.refresh(report)
        return report

    @staticmethod
    def to_output(report: ClaimReport) -> dict:
        output = report.calculation_output_json or {}
        items = output.get("items", [])
        return {
            "id": report.id,
            "case_id": report.case_id,
            "version": report.version,
            "rule_version": report.rule_version,
            "total_min": output.get("total_min", float(report.total_estimated_amount or 0)),
            "total_max": output.get("total_max", float(report.total_estimated_amount or 0)),
            "total_estimated_amount": float(report.total_estimated_amount or 0),
            "confidence_level": report.confidence_level or "low",
            "status": report.status,
            "items": items,
            "uncertainties": output.get("uncertainties", []),
            "created_at": report.created_at,
        }

    @staticmethod
    def _derive_inputs(case, materials: list[Material]) -> dict:
        ocr_values: dict[str, float] = {}
        for material in materials:
            if isinstance(material.ocr_result_json, dict):
                for key, value in material.ocr_result_json.items():
                    if isinstance(value, int | float):
                        ocr_values[key] = float(value)
        injury_factor = 1.5 if case.injury_level and "重" in case.injury_level else 1.0
        return {
            "medical_amount": ocr_values.get("medical_amount", 0),
            "lost_work_days": ocr_values.get("lost_work_days", 15 * injury_factor),
            "daily_income": ocr_values.get("daily_income", 300),
            "nursing_days": ocr_values.get("nursing_days", 7 * injury_factor),
            "nursing_daily_rate": ocr_values.get("nursing_daily_rate", 220),
            "transport_amount": ocr_values.get("transport_amount", 300),
            "nutrition_days": ocr_values.get("nutrition_days", 15 * injury_factor),
            "nutrition_daily_rate": ocr_values.get("nutrition_daily_rate", 50),
            "vehicle_damage_amount": ocr_values.get("vehicle_damage_amount", 0),
        }

    def _calculate_items(self, inputs: dict, materials: list[Material]) -> list[dict]:
        return [
            self._item("医疗费", inputs["medical_amount"], "医疗票据金额合计", materials, ["medical_invoice"], "以医疗费票据为准。"),
            self._item(
                "误工费",
                inputs["lost_work_days"] * inputs["daily_income"],
                "误工天数 × 日收入",
                materials,
                ["income_proof"],
                "按收入证明和误工天数估算。",
            ),
            self._item(
                "护理费",
                inputs["nursing_days"] * inputs["nursing_daily_rate"],
                "护理天数 × 护理日标准",
                materials,
                ["nursing_proof"],
                "按护理证明或合理护理期估算。",
            ),
            self._item("交通费", inputs["transport_amount"], "交通票据金额合计", materials, ["transport_invoice"], "按交通票据或合理往返成本估算。"),
            self._item(
                "营养费",
                inputs["nutrition_days"] * inputs["nutrition_daily_rate"],
                "营养期 × 日标准",
                materials,
                ["diagnosis_record"],
                "按医嘱、伤情和合理营养期估算。",
            ),
            self._item(
                "车辆损失",
                inputs["vehicle_damage_amount"],
                "维修票据或定损金额",
                materials,
                ["repair_invoice", "damage_assessment"],
                "以维修票据、定损单为主要依据。",
            ),
        ]

    @staticmethod
    def _item(
        item_type: str,
        amount: float,
        formula: str,
        materials: list[Material],
        required_materials: list[str],
        basis_text: str,
    ) -> dict:
        present = {material.material_type for material in materials if material.status in {"ocr_done", "verified"}}
        missing = [material_type for material_type in required_materials if material_type not in present]
        return {
            "item_type": item_type,
            "amount": round(float(amount), 2),
            "formula": formula,
            "evidence_status": "complete" if not missing else "missing",
            "basis_text": basis_text,
            "missing_materials": missing,
        }

    @staticmethod
    def _uncertainties(items: list[dict], risk_level: str) -> list[str]:
        uncertainties = []
        for item in items:
            if item["missing_materials"]:
                uncertainties.append(f"{item['item_type']}缺少材料：{', '.join(item['missing_materials'])}")
        if risk_level == "high":
            uncertainties.append("高风险案件需人工复核，测算结果仅作材料整理和沟通参考。")
        return uncertainties
