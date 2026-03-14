import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db_session, get_current_user, RoleChecker
from app.models.all import User
from app.schemas.transaction import PaymentCreate, PaymentResponse
from app.services.payment_service import PaymentService

router = APIRouter(prefix="/payments", tags=["Payments"])

@router.post("", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
async def create_payment(
    data: PaymentCreate,
    db: AsyncSession = Depends(get_db_session),
    user: User = Depends(RoleChecker(["ROLE_CUSTOMER"]))
):
    """
    Process a payment for a booking using an idempotent key.
    Supported Payment Methods: UPI, CARD, NET_BANKING.
    On success, transitions the linked booking to CONFIRMED.
    """
    service = PaymentService(db)
    return await service.process_payment(user, data)

@router.get("/{payment_id}", response_model=PaymentResponse)
async def get_payment(
    payment_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user)
):
    """
    Retrieve payment receipt status.
    """
    service = PaymentService(db)
    return await service.get_payment(payment_id, user)
