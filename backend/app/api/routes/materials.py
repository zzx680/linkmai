from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.models import Material, User
from app.db.session import get_db
from app.schemas.materials import (
    MaterialCreate,
    MaterialOut,
    MaterialVerify,
    UploadTokenOut,
    UploadTokenRequest,
)
from app.services.materials import MaterialService

router = APIRouter()


def to_material_out(material: Material) -> MaterialOut:
    return MaterialOut(
        id=material.id,
        user_id=material.user_id,
        case_id=material.case_id,
        material_type=material.material_type,
        file_id=material.file_id,
        status=material.status,
        ocr_result=material.ocr_result_json,
        created_at=material.created_at,
    )


@router.post("/upload-token", response_model=UploadTokenOut)
def create_upload_token(
    payload: UploadTokenRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UploadTokenOut:
    upload_url, object_key, file = MaterialService(db).create_upload_token(payload, current_user)
    return UploadTokenOut(
        upload_url=upload_url,
        object_key=object_key,
        file_id=file.id,
    )


@router.post("", response_model=MaterialOut)
def create_material(
    payload: MaterialCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MaterialOut:
    material = MaterialService(db).create_material(payload, current_user)
    return to_material_out(material)


@router.get("/case/{case_id}", response_model=list[MaterialOut])
def list_case_materials(
    case_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[MaterialOut]:
    materials = MaterialService(db).list_case_materials(case_id, current_user)
    return [to_material_out(material) for material in materials]


@router.patch("/{material_id}/verify", response_model=MaterialOut)
def verify_material(
    material_id: UUID,
    payload: MaterialVerify,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MaterialOut:
    material = MaterialService(db).update_material(material_id, payload, current_user)
    return to_material_out(material)
