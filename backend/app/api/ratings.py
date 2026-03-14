import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db_session, RoleChecker
from app.models.all import User
from app.schemas.transaction import RatingCreate, RatingSchema
from app.services.rating_service import RatingService

router = APIRouter(prefix="/ratings", tags=["Ratings"])

@router.post("", response_model=RatingSchema, status_code=status.HTTP_201_CREATED)
async def create_rating(
    data: RatingCreate,
    db: AsyncSession = Depends(get_db_session),
    user: User = Depends(RoleChecker(["ROLE_CUSTOMER"]))
):
    """
    Rate an expert for a past booking.
    """
    service = RatingService(db)
    return await service.create_rating(user, data)
