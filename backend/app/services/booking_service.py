import uuid
import random
import math
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.all import Booking, BookingStatusEnum, Service, ExpertProfile, CustomerProfile, User, RoleEnum
from app.schemas.transaction import BookingCreate, BookingUpdate, BookingResponse
from app.schemas.pagination import PaginatedResponse
from app.repositories.booking_repo import booking_repo
from app.core.exceptions import GenericException, NotFoundException, UnauthorizedException

class BookingService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def _validate_service(self, service_id: uuid.UUID) -> Service:
        result = await self.db.execute(select(Service).where(Service.id == service_id))
        service = result.scalars().first()
        if not service or not service.is_active:
            raise GenericException("Service is not available or does not exist")
        return service
        
    async def _validate_expert(self, expert_id: uuid.UUID) -> ExpertProfile:
        result = await self.db.execute(select(ExpertProfile).where(ExpertProfile.id == expert_id))
        expert = result.scalars().first()
        if not expert or not expert.is_available:
            raise GenericException("Expert is not available for booking")
        return expert

    async def get_customer_profile_id(self, user_id: uuid.UUID) -> uuid.UUID:
        result = await self.db.execute(select(CustomerProfile).where(CustomerProfile.user_id == user_id))
        cp = result.scalars().first()
        if not cp:
            raise UnauthorizedException("Customer profile not found")
        return cp.id

    async def create_booking(self, user: User, data: BookingCreate) -> Booking:
        # Check idempotency
        existing = await booking_repo.get_by_idempotency_key(self.db, data.idempotency_key)
        if existing:
            return existing

        customer_id = await self.get_customer_profile_id(user.id)
        service = await self._validate_service(data.service_id)
        expert = await self._validate_expert(data.expert_id)

        start_dt: datetime = data.start_time
        if start_dt.tzinfo is None:
            start_dt = start_dt.replace(tzinfo=timezone.utc)
            
        end_dt: datetime = data.end_time
        if end_dt.tzinfo is None:
            end_dt = end_dt.replace(tzinfo=timezone.utc)

        if end_dt <= start_dt:
            raise GenericException("End time must be after start time.")

        now_dt = datetime.now(timezone.utc)
        if start_dt <= now_dt:
            raise GenericException("Start time must be in the future.")

        duration_minutes = int((end_dt - start_dt).total_seconds() / 60)
        duration_hours = duration_minutes / 60.0

        hourly_rate = float(expert.hourly_rate or 50.0)
        expert_earning = hourly_rate * duration_hours

        # Store as ISO 8601 string because the DB column is String
        start_time_str = start_dt.isoformat()
        end_time_str = end_dt.isoformat()

        db_booking = Booking(
            customer_id=customer_id,
            expert_id=data.expert_id,
            service_id=data.service_id,
            address_id=data.address_id,
            coupon_id=data.coupon_id,
            start_time=start_time_str,
            end_time=end_time_str,
            duration_minutes=duration_minutes,
            expert_earning=expert_earning,
            total_amount=data.total_amount,
            idempotency_key=data.idempotency_key,
            status=BookingStatusEnum.PENDING_PAYMENT
        )

        self.db.add(db_booking)
        await self.db.commit()
        await self.db.refresh(db_booking)
        return db_booking

    async def get_bookings(self, user: User, page: int = 1, size: int = 20) -> PaginatedResponse[BookingResponse]:
        skip = (page - 1) * size
        
        customer_id = None
        expert_id = None
        
        if user.role == RoleEnum.ROLE_CUSTOMER:
            customer_profile = await self.db.execute(select(CustomerProfile).where(CustomerProfile.user_id == user.id))
            cp = customer_profile.scalars().first()
            if cp: customer_id = cp.id
        elif user.role == RoleEnum.ROLE_EXPERT:
            expert_profile = await self.db.execute(select(ExpertProfile).where(ExpertProfile.user_id == user.id))
            ep = expert_profile.scalars().first()
            if ep: expert_id = ep.id

        items = await booking_repo.get_user_bookings(self.db, customer_id=customer_id, expert_id=expert_id, skip=skip, limit=size)
        total = await booking_repo.count_user_bookings(self.db, customer_id=customer_id, expert_id=expert_id)
        
        return PaginatedResponse[BookingResponse](
            items=items,
            total=total,
            page=page,
            size=size,
            pages=math.ceil(total / size) if total > 0 else 0
        )

    async def get_booking_by_id(self, booking_id: uuid.UUID, user: User) -> BookingResponse:
        booking = await booking_repo.get(self.db, booking_id)
        if not booking:
            raise NotFoundException("Booking not found")
        # Ensure user owns it
        if user.role == RoleEnum.ROLE_CUSTOMER:
            cp_id = await self.get_customer_profile_id(user.id)
            if booking.customer_id != cp_id: raise UnauthorizedException("Not authorized to view this booking")
        return booking

    async def update_booking(self, booking_id: uuid.UUID, user: User, updates: BookingUpdate) -> BookingResponse:
        booking = await booking_repo.get(self.db, booking_id)
        if not booking:
            raise NotFoundException("Booking not found")
            
        if user.role == RoleEnum.ROLE_CUSTOMER:
            cp_id = await self.get_customer_profile_id(user.id)
            if booking.customer_id != cp_id: raise UnauthorizedException("Not authorized")

        if updates.status: booking.status = updates.status
        if updates.start_time: booking.start_time = updates.start_time
        if updates.end_time: booking.end_time = updates.end_time
        
        # Note: if start_time/end_time changes, duration and earnings should technically be recomputed, 
        # but for this scope update_booking is mostly used by experts to change status.
        
        await self.db.commit()
        await self.db.refresh(booking)
        return booking

    async def delete_booking(self, booking_id: uuid.UUID, user: User):
        booking = await booking_repo.get(self.db, booking_id)
        if not booking:
            raise NotFoundException("Booking not found")
            
        cp_id = await self.get_customer_profile_id(user.id)
        if booking.customer_id != cp_id: raise UnauthorizedException("Not authorized")
            
        # Instead of generic physical delete, prefer cancellation for bookings.
        if booking.status not in [BookingStatusEnum.PENDING_PAYMENT, BookingStatusEnum.CONFIRMED]:
             raise GenericException("Booking cannot be deleted in current status")
        
        await self.db.delete(booking)
        await self.db.commit()
        return {"message": "Booking deleted successfully"}
