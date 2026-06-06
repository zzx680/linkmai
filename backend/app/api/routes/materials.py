from uuid import UUID, uuid4

from fastapi import APIRouter

from app.schemas.materials import (
    MaterialCreate,
    MaterialOut,
    MaterialVerify,
    UploadTokenOut,
    UploadTokenRequest,
)

router = APIRouter()

MOCK_USER_ID = UUID("00000000-0000-0000-0000-000000000001")


@router.post("/upload-token", response_model=UploadTokenOut)
def create_upload_token(payload: UploadTokenRequest) -> UploadTokenOut:
    object_key = f"cases/{payload.case_id}/{payload.material_type}/{payload.file_name}"
    return UploadTokenOut(
        upload_url=f"https://oss.example.com/{object_key}",
        object_key=object_key,
    )


@router.post("", response_model=MaterialOut)
def create_material(payload: MaterialCreate) -> MaterialOut:
    return MaterialOut(
        id=uuid4(),
        user_id=MOCK_USER_ID,
        case_id=payload.case_id,
        material_type=payload.material_type,
        file_id=payload.file_id,
        status="ocr_pending",
    )


@router.get("/case/{case_id}", response_model=list[MaterialOut])
def list_case_materials(case_id: UUID) -> list[MaterialOut]:
    return [
        MaterialOut(
            id=UUID("20000000-0000-0000-0000-000000000001"),
            user_id=MOCK_USER_ID,
            case_id=case_id,
            material_type="accident_certificate",
            status="verified",
            ocr_result={"responsibility": "other_party_full"},
        ),
        MaterialOut(
            id=UUID("20000000-0000-0000-0000-000000000002"),
            user_id=MOCK_USER_ID,
            case_id=case_id,
            material_type="medical_invoice",
            status="need_more",
        ),
    ]


@router.patch("/{material_id}/verify", response_model=MaterialOut)
def verify_material(material_id: UUID, payload: MaterialVerify) -> MaterialOut:
    return MaterialOut(
        id=material_id,
        user_id=MOCK_USER_ID,
        case_id=UUID("10000000-0000-0000-0000-000000000001"),
        material_type="medical_invoice",
        status=payload.status,
        ocr_result=payload.corrected_fields,
    )

