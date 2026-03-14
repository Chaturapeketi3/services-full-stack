import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db_session, get_current_user, RoleChecker
from app.models.all import User
from app.schemas.transaction import BookingCreate, BookingUpdate, BookingResponse
from app.schemas.pagination import PaginatedResponse
from app.services.booking_service import BookingService

router = APIRouter(prefix="/bookings", tags=["Bookings"])

@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(
    data: BookingCreate,
    db: AsyncSession = Depends(get_db_session),
    user: User = Depends(RoleChecker(["ROLE_CUSTOMER"]))
):
    """
    Create a new booking (Requires Customer role).
    Enforces idempotency using `idempotency_key`.
    """
    service = BookingService(db)
    return await service.create_booking(user, data)

@router.get("", response_model=PaginatedResponse[BookingResponse])
async def list_bookings(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user)
):
    """
    List bookings. Returns customer specific bookings or expert specific jobs depending on auth context.
    """
    service = BookingService(db)
    return await service.get_bookings(user, page=page, size=size)

@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking(
    booking_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user)
):
    """
    Get booking details.
    """
    service = BookingService(db)
    return await service.get_booking_by_id(booking_id, user)

@router.put("/{booking_id}", response_model=BookingResponse)
async def update_booking(
    booking_id: uuid.UUID,
    data: BookingUpdate,
    db: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user)
):
    """
    Update booking details or transitions status.
    """
    service = BookingService(db)
    return await service.update_booking(booking_id, user, data)

@router.delete("/{booking_id}")
async def cancel_booking(
    booking_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
    user: User = Depends(RoleChecker(["ROLE_CUSTOMER", "ROLE_EXPERT"]))
):
    """
    Cancel or delete a booking physically if PENDING/CONFIRMED.
    """
    service = BookingService(db)
    return await service.delete_booking(booking_id, user)
