import uuid
import math
from typing import Optional
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.models.all import User, ExpertProfile, Booking, BookingStatusEnum, RoleEnum
from app.repositories.expert_repo import earnings_repo
from app.repositories.booking_repo import booking_repo
from app.schemas.pagination import PaginatedResponse
from app.schemas.transaction import ExpertEarningsSchema, BookingResponse
from app.core.exceptions import UnauthorizedException, NotFoundException, GenericException

class DashboardSummaryResponse(BaseModel):
    total_earnings: float
    completed_jobs_count: int
    pending_requests_count: int
    is_available: bool

class ExpertService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def _get_expert_profile(self, user: User) -> ExpertProfile:
        if user.role != RoleEnum.ROLE_EXPERT:
            raise UnauthorizedException("Not an expert")
            
        result = await self.db.execute(select(ExpertProfile).where(ExpertProfile.user_id == user.id))
        expert = result.scalars().first()
        if not expert:
            raise NotFoundException("Expert profile not found")
        return expert

    async def get_dashboard_summary(self, user: User) -> DashboardSummaryResponse:
        expert = await self._get_expert_profile(user)
        
        total_earnings = await earnings_repo.get_expert_total_earnings(self.db, expert.id)
        
        # Count based on custom statuses
        # Completed
        query_completed = select(func.count()).select_from(Booking).where(
            Booking.expert_id == expert.id, 
            Booking.status == BookingStatusEnum.COMPLETED
        )
        completed_result = await self.db.execute(query_completed)
        completed_jobs = completed_result.scalar() or 0
        
        # Pending / Confirmed
        query_pending = select(func.count()).select_from(Booking).where(
            Booking.expert_id == expert.id, 
            Booking.status.in_([BookingStatusEnum.PENDING_PAYMENT, BookingStatusEnum.CONFIRMED])
        )
        pending_result = await self.db.execute(query_pending)
        pending_jobs = pending_result.scalar() or 0
        
        return DashboardSummaryResponse(
            total_earnings=total_earnings,
            completed_jobs_count=completed_jobs,
            pending_requests_count=pending_jobs,
            is_available=expert.is_available
        )

    async def toggle_availability(self, user: User, is_available: bool) -> dict:
        expert = await self._get_expert_profile(user)
        expert.is_available = is_available
        await self.db.commit()
        return {"is_available": expert.is_available}

    async def get_jobs(self, user: User, status: str = None, page: int = 1, size: int = 20) -> PaginatedResponse[BookingResponse]:
        expert = await self._get_expert_profile(user)
        skip = (page - 1) * size
        
        # We rewrite this custom instead of repo method since we need status filtering specific for expert
        query = select(Booking).where(Booking.expert_id == expert.id)
        if status:
            try:
                enum_status = BookingStatusEnum[status]
                query = query.where(Booking.status == enum_status)
            except KeyError:
                raise GenericException("Invalid booking status filter")
                
        query = query.order_by(Booking.created_at.desc()).offset(skip).limit(limit=size)
        result = await self.db.execute(query)
        items = result.scalars().all()
        
        count_query = select(func.count()).select_from(Booking).where(Booking.expert_id == expert.id)
        if status: count_query = count_query.where(Booking.status == enum_status)
        count_result = await self.db.execute(count_query)
        total = count_result.scalar() or 0
        
        return PaginatedResponse[BookingResponse](
            items=items,
            total=total,
            page=page,
            size=size,
            pages=math.ceil(total/size) if total > 0 else 0
        )

    async def accept_job(self, booking_id: uuid.UUID, user: User) -> BookingResponse:
        expert = await self._get_expert_profile(user)
        booking = await booking_repo.get(self.db, booking_id)
        
        if not booking or booking.expert_id != expert.id:
            raise NotFoundException("Job not found or not assigned to you")
            
        if booking.status != BookingStatusEnum.CONFIRMED:
            raise GenericException("Job cannot be accepted. It must be CONFIRMED (paid).")
            
        booking.status = BookingStatusEnum.ACCEPTED
        await self.db.commit()
        await self.db.refresh(booking)
        return booking

    async def reject_job(self, booking_id: uuid.UUID, user: User) -> BookingResponse:
        expert = await self._get_expert_profile(user)
        booking = await booking_repo.get(self.db, booking_id)
        
        if not booking or booking.expert_id != expert.id:
            raise NotFoundException("Job not found or not assigned to you")
            
        if booking.status not in [BookingStatusEnum.PENDING_PAYMENT, BookingStatusEnum.CONFIRMED]:
            raise GenericException("Job cannot be rejected in current state.")
            
        booking.status = BookingStatusEnum.REJECTED
        # Note: If CONFIRMED, system logic would trigger a Refund here.
        await self.db.commit()
        await self.db.refresh(booking)
        return booking

    async def get_earnings(self, user: User, page: int = 1, size: int = 20) -> PaginatedResponse[ExpertEarningsSchema]:
        expert = await self._get_expert_profile(user)
        skip = (page - 1) * size
        
        items = await earnings_repo.get_expert_earnings_history(self.db, expert.id, skip, size)
        total = await earnings_repo.count_earnings_history(self.db, expert.id)
        
        return PaginatedResponse[ExpertEarningsSchema](
            items=items,
            total=total,
            page=page,
            size=size,
            pages=math.ceil(total/size) if total > 0 else 0
        )
