from typing import Optional
from datetime import datetime
import uuid
from pydantic import BaseModel, Field
from app.models.all import BookingStatusEnum, PaymentStatusEnum, PaymentMethodEnum
from app.schemas.base import BaseSchema

# --- Coupon ---
class CouponBase(BaseModel):
    code: str = Field(..., min_length=3, max_length=20)
    discount_percentage: float = Field(..., ge=0, le=100)
    max_discount_amount: Optional[float] = Field(None, ge=0)
    valid_until: str # ISO Timestamp from frontend expected
    is_active: bool = True

class CouponSchema(CouponBase, BaseSchema):
    pass

# --- Booking ---
class BookingBase(BaseModel):
    start_time: datetime
    end_time: datetime
    total_amount: float = Field(..., ge=0)

class BookingCreate(BookingBase):
    expert_id: uuid.UUID
    service_id: uuid.UUID
    address_id: uuid.UUID
    coupon_id: Optional[uuid.UUID] = None
    idempotency_key: str = Field(..., description="Unique key to prevent double booking")

class BookingUpdate(BaseModel):
    status: Optional[BookingStatusEnum] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None

class BookingResponse(BookingBase, BaseSchema):
    customer_id: uuid.UUID
    expert_id: uuid.UUID
    service_id: uuid.UUID
    address_id: uuid.UUID
    coupon_id: Optional[uuid.UUID]
    status: BookingStatusEnum
    idempotency_key: str
    duration_minutes: int
    expert_earning: float

# --- Payment ---
class PaymentCreate(BaseModel):
    booking_id: uuid.UUID
    amount: float = Field(..., ge=0)
    payment_method: PaymentMethodEnum
    idempotency_key: str = Field(..., description="Unique key to prevent double charging")

class PaymentResponse(BaseSchema):
    booking_id: uuid.UUID
    amount: float
    status: PaymentStatusEnum
    payment_method: PaymentMethodEnum
    transaction_ref: Optional[str]
    idempotency_key: str

# --- Rating ---
class RatingBase(BaseModel):
    score: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None

class RatingCreate(RatingBase):
    booking_id: uuid.UUID

class RatingSchema(RatingBase, BaseSchema):
    booking_id: uuid.UUID

# --- Finance Ledgers ---
class ExpertEarningsSchema(BaseSchema):
    expert_id: uuid.UUID
    booking_id: uuid.UUID
    amount_earned: float
    platform_fee: float

class ExpertPayoutSchema(BaseSchema):
    expert_id: uuid.UUID
    amount: float
    status: PaymentStatusEnum
    transaction_ref: Optional[str]
