import uuid
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from fastapi import HTTPException, status
from app.models.all import Rating, Booking, User, RoleEnum
from app.schemas.transaction import RatingCreate, RatingSchema
from app.core.exceptions import NotFoundException, GenericException

class RatingService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_rating(self, user: User, data: RatingCreate) -> RatingSchema:
        # Check if booking exists and belongs to customer
        result = await self.db.execute(select(Booking).where(Booking.id == data.booking_id))
        booking = result.scalars().first()
        
        if not booking:
            raise NotFoundException("Booking not found")
            
        if booking.customer_id != user.customer_profile.id:
            raise GenericException("Only the linked customer can rate this booking")

        # Check if already rated
        existing_result = await self.db.execute(select(Rating).where(Rating.booking_id == data.booking_id))
        existing_rating = existing_result.scalars().first()
        if existing_rating:
            raise GenericException("Booking has already been rated")

        # Create rating
        new_rating = Rating(
            booking_id=data.booking_id,
            score=data.score,
            comment=data.comment
        )
        self.db.add(new_rating)
        await self.db.commit()
        await self.db.refresh(new_rating)
        
        return RatingSchema.model_validate(new_rating, from_attributes=True)
