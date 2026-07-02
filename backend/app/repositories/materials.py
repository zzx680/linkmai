from uuid import UUID

from sqlalchemy.orm import Session

from app.db.models import File, Material


class MaterialRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_file(self, file: File) -> File:
        self.db.add(file)
        self.db.flush()
        return file

    def get_file_owned(self, file_id: UUID, user_id: UUID) -> File | None:
        return self.db.query(File).filter(File.id == file_id, File.owner_user_id == user_id).one_or_none()

    def create(self, material: Material) -> Material:
        self.db.add(material)
        self.db.flush()
        return material

    def get_owned(self, material_id: UUID, user_id: UUID) -> Material | None:
        return self.db.query(Material).filter(Material.id == material_id, Material.user_id == user_id).one_or_none()

    def list_for_case(self, case_id: UUID, user_id: UUID) -> list[Material]:
        return (
            self.db.query(Material)
            .filter(Material.case_id == case_id, Material.user_id == user_id)
            .order_by(Material.created_at.desc())
            .all()
        )
