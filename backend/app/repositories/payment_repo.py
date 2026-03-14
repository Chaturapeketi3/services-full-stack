from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional
import uuid

from app.repositories.base import CRUDBase
from app.models.all import Payment
from pydantic import BaseModel

class DummySchema(BaseModel): pass

class PaymentRepository(CRUDBase[Payment, DummySchema, DummySchema]):
    async def get_by_idempotency_key(self, db: AsyncSession, key: str) -> Optional[Payment]:
        result = await db.execute(select(self.model).where(self.model.idempotency_key == key))
        return result.scalars().first()
        
    async def get_by_booking_id(self, db: AsyncSession, booking_id: uuid.UUID) -> list[Payment]:
         result = await db.execute(select(self.model).where(self.model.booking_id == booking_id).order_by(self.model.created_at.desc()))
         return result.scalars().all()

payment_repo = PaymentRepository(Payment)
