from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models import File, Material, User
from app.repositories.materials import MaterialRepository
from app.schemas.materials import MaterialCreate, MaterialVerify, UploadTokenRequest
from app.services.cases import CaseService


MATERIAL_STATUSES = {"uploaded", "ocr_pending", "ocr_done", "verified", "rejected", "need_more"}


class MaterialService:
    def __init__(self, db: Session):
        self.db = db
        self.materials = MaterialRepository(db)
        self.cases = CaseService(db)

    def create_upload_token(self, payload: UploadTokenRequest, user: User) -> tuple[str, str, File]:
        self.cases.get_case(payload.case_id, user)
        bucket = settings.aliyun_oss_bucket or "local-dev"
        object_key = f"cases/{payload.case_id}/{payload.material_type}/{payload.file_name}"
        file = File(
            owner_user_id=user.id,
            case_id=payload.case_id,
            bucket=bucket,
            object_key=object_key,
            file_name=payload.file_name,
            mime_type=payload.mime_type,
            size=payload.size,
        )
        self.materials.create_file(file)
        self.db.commit()
        self.db.refresh(file)
        return f"https://oss.example.com/{object_key}", object_key, file

    def create_material(self, payload: MaterialCreate, user: User) -> Material:
        self.cases.get_case(payload.case_id, user)
        if payload.file_id and self.materials.get_file_owned(payload.file_id, user.id) is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="file not found")
        material = Material(
            user_id=user.id,
            case_id=payload.case_id,
            material_type=payload.material_type,
            file_id=payload.file_id,
            status="ocr_pending",
        )
        self.materials.create(material)
        self.db.commit()
        self.db.refresh(material)
        return material

    def list_case_materials(self, case_id: UUID, user: User) -> list[Material]:
        self.cases.get_case(case_id, user)
        return self.materials.list_for_case(case_id, user.id)

    def update_material(self, material_id: UUID, payload: MaterialVerify, user: User) -> Material:
        if payload.status not in MATERIAL_STATUSES:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="invalid material status")
        material = self.materials.get_owned(material_id, user.id)
        if material is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="material not found")
        material.status = payload.status
        material.ocr_result_json = payload.corrected_fields
        self.db.commit()
        self.db.refresh(material)
        return material
