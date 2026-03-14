import uuid
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.repositories.base import CRUDBase
from app.models.all import ExpertEarnings
from pydantic import BaseModel

class DummySchema(BaseModel): pass

class ExpertEarningsRepository(CRUDBase[ExpertEarnings, DummySchema, DummySchema]):
    
    async def get_expert_total_earnings(self, db: AsyncSession, expert_id: uuid.UUID) -> float:
        query = select(func.sum(self.model.amount_earned)).where(self.model.expert_id == expert_id)
        result = await db.execute(query)
        return float(result.scalar_one_or_none() or 0.0)
        
    async def get_expert_earnings_history(self, db: AsyncSession, expert_id: uuid.UUID, skip: int = 0, limit: int = 100):
        query = select(self.model).where(self.model.expert_id == expert_id).order_by(self.model.created_at.desc()).offset(skip).limit(limit)
        result = await db.execute(query)
        return result.scalars().all()
        
    async def count_earnings_history(self, db: AsyncSession, expert_id: uuid.UUID):
        query = select(func.count()).select_from(self.model).where(self.model.expert_id == expert_id)
        result = await db.execute(query)
        return result.scalar()

earnings_repo = ExpertEarningsRepository(ExpertEarnings)
