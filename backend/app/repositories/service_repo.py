from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_, func
from typing import Optional
import uuid

from app.repositories.base import CRUDBase
from app.models.all import Category, Service
from app.schemas.service import CategoryCreate, ServiceCreate


class CategoryRepository(CRUDBase[Category, CategoryCreate, CategoryCreate]):
    async def get_all_active(self, db: AsyncSession, skip: int = 0, limit: int = 100):
        query = select(self.model).where(self.model.is_active == True).offset(skip).limit(limit)
        result = await db.execute(query)
        return result.scalars().all()

    async def count_active(self, db: AsyncSession):
        query = select(func.count()).select_from(self.model).where(self.model.is_active == True)
        result = await db.execute(query)
        return result.scalar()

class ServiceRepository(CRUDBase[Service, ServiceCreate, ServiceCreate]):
    async def get_services(
        self, 
        db: AsyncSession, 
        category_id: Optional[uuid.UUID] = None, 
        search: Optional[str] = None,
        sort: Optional[str] = None,
        skip: int = 0, 
        limit: int = 100
    ):
        query = select(self.model).where(self.model.is_active == True)
        
        if category_id:
            query = query.where(self.model.category_id == category_id)
            
        if search:
            search_filter = f"%{search}%"
            query = query.where(
                or_(
                    self.model.name.ilike(search_filter),
                    self.model.description.ilike(search_filter)
                )
            )
            
        if sort == "price_asc":
            query = query.order_by(self.model.base_price.asc())
        elif sort == "price_desc":
            query = query.order_by(self.model.base_price.desc())
        else:
            query = query.order_by(self.model.created_at.desc())
            
        query = query.offset(skip).limit(limit)
        result = await db.execute(query)
        return result.scalars().all()
        
    async def count_services(
        self,
        db: AsyncSession,
        category_id: Optional[uuid.UUID] = None,
        search: Optional[str] = None,
    ):
        query = select(func.count()).select_from(self.model).where(self.model.is_active == True)

        if category_id:
            query = query.where(self.model.category_id == category_id)

        if search:
            search_filter = f"%{search}%"
            query = query.where(
                or_(
                    self.model.name.ilike(search_filter),
                    self.model.description.ilike(search_filter),
                )
            )

        result = await db.execute(query)
        return result.scalar_one_or_none() or 0

category_repo = CategoryRepository(Category)
service_repo = ServiceRepository(Service)
