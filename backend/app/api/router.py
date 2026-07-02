from fastapi import APIRouter

from app.api.routes import auth, cases, claims, documents, health, materials, orders, users

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(cases.router, prefix="/cases", tags=["cases"])
api_router.include_router(materials.router, prefix="/materials", tags=["materials"])
api_router.include_router(claims.router, prefix="/claims", tags=["claims"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
