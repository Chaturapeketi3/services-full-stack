import uuid
import secrets
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.all import Payment, BookingStatusEnum, PaymentStatusEnum, User, RoleEnum
from app.schemas.transaction import PaymentCreate, PaymentResponse
from app.repositories.payment_repo import payment_repo
from app.repositories.booking_repo import booking_repo
from app.core.exceptions import GenericException, NotFoundException, UnauthorizedException
from app.services.booking_service import BookingService

class PaymentService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.booking_service = BookingService(db)

    async def _generate_transaction_ref(self) -> str:
        return f"TXN-{secrets.token_hex(6).upper()}"

    async def process_payment(self, user: User, data: PaymentCreate) -> PaymentResponse:
        # Idempotency Check
        existing_payment = await payment_repo.get_by_idempotency_key(self.db, data.idempotency_key)
        if existing_payment:
            return existing_payment

        # Validate Booking
        booking = await booking_repo.get(self.db, data.booking_id)
        if not booking:
            raise NotFoundException("Booking not found")

        # Ensure user owns it
        cp_id = await self.booking_service.get_customer_profile_id(user.id)
        if booking.customer_id != cp_id:
             raise UnauthorizedException("Not authorized to pay for this booking")

        if booking.status != BookingStatusEnum.PENDING_PAYMENT:
            raise GenericException("Booking is not pending payment")

        # Check total amount matching (in a real system we double check prices here based on services)
        if data.amount != booking.total_amount:
            raise GenericException("Payment amount does not match booking total")

        # Mock External Gateway processing...
        mock_transaction_ref = await self._generate_transaction_ref()
        
        # Create Payment Line
        db_payment = Payment(
            booking_id=data.booking_id,
            amount=data.amount,
            status=PaymentStatusEnum.SUCCEEDED, # assuming immediate success for mock
            payment_method=data.payment_method,
            transaction_ref=mock_transaction_ref,
            idempotency_key=data.idempotency_key
        )
        self.db.add(db_payment)
        
        # Update Booking Status & trigger Mock Receipt Generation
        booking.status = BookingStatusEnum.CONFIRMED
        
        # (A Receipt model could be linked here)

        await self.db.commit()
        await self.db.refresh(db_payment)
        return db_payment

    async def get_payment(self, payment_id: uuid.UUID, user: User) -> PaymentResponse:
        payment = await payment_repo.get(self.db, payment_id)
        if not payment:
            raise NotFoundException("Payment not found")
        
        # Validate ownership through linked booking
        await self.booking_service.get_booking_by_id(payment.booking_id, user)
        return payment
