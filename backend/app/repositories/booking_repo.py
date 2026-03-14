from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_
from typing import Optional
import uuid

from app.repositories.base import CRUDBase
from app.models.all import Booking, BookingStatusEnum

# Dummy CreateSchemaType, we handle creation via service logic mostly.
from pydantic import BaseModel
class DummySchema(BaseModel): pass

class BookingRepository(CRUDBase[Booking, DummySchema, DummySchema]):
    
    async def get_by_idempotency_key(self, db: AsyncSession, key: str) -> Optional[Booking]:
        result = await db.execute(select(self.model).where(self.model.idempotency_key == key))
        return result.scalars().first()
        
    async def get_user_bookings(
        self, 
        db: AsyncSession, 
        customer_id: Optional[uuid.UUID] = None,
        expert_id: Optional[uuid.UUID] = None,
        skip: int = 0, 
        limit: int = 100
    ):
        query = select(self.model)
        if customer_id:
             query = query.where(self.model.customer_id == customer_id)
        if expert_id:
             query = query.where(self.model.expert_id == expert_id)
             
        query = query.order_by(self.model.created_at.desc()).offset(skip).limit(limit)
        result = await db.execute(query)
        return result.scalars().all()
        
    async def count_user_bookings(
        self, 
        db: AsyncSession, 
        customer_id: Optional[uuid.UUID] = None,
        expert_id: Optional[uuid.UUID] = None,
    ):
        from sqlalchemy import func
        query = select(func.count()).select_from(self.model)
        if customer_id:
             query = query.where(self.model.customer_id == customer_id)
        if expert_id:
             query = query.where(self.model.expert_id == expert_id)
             
        result = await db.execute(query)
        return result.scalar()

booking_repo = BookingRepository(Booking)
