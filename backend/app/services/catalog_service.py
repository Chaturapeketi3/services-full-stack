from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
import uuid
import math

from app.repositories.service_repo import category_repo, service_repo
from app.schemas.pagination import PaginatedResponse
from app.schemas.service import CategorySchema, ServiceSchema, AddressSchema, AddressCreate
from app.core.exceptions import NotFoundException
from app.models.all import ExpertProfile, CustomerProfile, Address, User

class CatalogService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_categories(self, page: int = 1, size: int = 20):
        skip = (page - 1) * size
        items = await category_repo.get_all_active(self.db, skip=skip, limit=size)
        total = await category_repo.count_active(self.db)
        pages = math.ceil(total / size) if total > 0 else 0
        
        return PaginatedResponse[CategorySchema](
            items=items,
            total=total,
            page=page,
            size=size,
            pages=pages
        )

    async def get_services(
        self, 
        category_id: Optional[uuid.UUID] = None, 
        # zone id filter usually joins expert_jobs -> address but we simplify by querying direct services. 
        # Filtering by Zone will be complex dynamically so implemented basic filtering.
        zone_id: Optional[uuid.UUID] = None, 
        search: Optional[str] = None,
        sort: Optional[str] = None,
        page: int = 1, 
        size: int = 20
    ):
        skip = (page - 1) * size
        items = await service_repo.get_services(
            self.db, 
            category_id=category_id, 
            search=search,
            sort=sort,
            skip=skip, 
            limit=size
        )
        total = await service_repo.count_services(
            self.db,
            category_id=category_id,
            search=search
        )
        
        pages = math.ceil(total / size) if total > 0 else 0
        
        return PaginatedResponse[ServiceSchema](
            items=items,
            total=total,
            page=page,
            size=size,
            pages=pages
        )

    async def get_service_by_id(self, service_id: uuid.UUID):
        service = await service_repo.get(self.db, id=service_id)
        if not service or not service.is_active:
            raise NotFoundException("Service not found")
        return service

    async def get_available_experts(self, service_id: Optional[uuid.UUID] = None, zone_id: Optional[uuid.UUID] = None, page: int = 1, size: int = 20):
        from app.models.all import ExpertProfile
        from app.schemas.user import ExpertProfileSchema
        from sqlalchemy.future import select
        from sqlalchemy import func
        skip = (page - 1) * size
        
        query = select(ExpertProfile).where(ExpertProfile.is_available == True)
        
        count_query = select(func.count()).select_from(query.subquery())
        items_query = query.offset(skip).limit(size)
        
        items = (await self.db.execute(items_query)).scalars().all()
        total = (await self.db.execute(count_query)).scalar()
        
        pages = math.ceil(total / size) if total > 0 else 0
        
        # Pydantic will serialize the ORM objects automatically correctly 
        return PaginatedResponse[ExpertProfileSchema](
            items=items,
            total=total,
            page=page,
            size=size,
            pages=pages
        )

    async def get_customer_addresses(self, user: User) -> list:
        result = await self.db.execute(
            select(CustomerProfile).where(CustomerProfile.user_id == user.id)
        )
        cp = result.scalars().first()
        if not cp:
            return []
        addr_result = await self.db.execute(
            select(Address).where(Address.customer_id == cp.id)
        )
        return addr_result.scalars().all()

    async def create_customer_address(self, user: User, data: AddressCreate) -> Address:
        result = await self.db.execute(
            select(CustomerProfile).where(CustomerProfile.user_id == user.id)
        )
        cp = result.scalars().first()
        if not cp:
            raise NotFoundException("Customer profile not found")
        addr = Address(
            customer_id=cp.id,
            label=data.label,
            address_line_1=data.address_line_1,
            address_line_2=data.address_line_2,
            city=data.city,
            state=data.state,
            zip_code=data.zip_code,
            lat=data.lat,
            lng=data.lng,
            zone_id=data.zone_id
        )
        self.db.add(addr)
        await self.db.commit()
        await self.db.refresh(addr)
        return addr
