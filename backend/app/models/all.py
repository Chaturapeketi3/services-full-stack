import uuid
from datetime import datetime
from enum import Enum as PyEnum
from sqlalchemy import String, Boolean, ForeignKey, Numeric, Text, Integer, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import ENUM, UUID
from app.models.base import Base

# --- ENUMs ---
class RoleEnum(PyEnum):
    ROLE_CUSTOMER = "ROLE_CUSTOMER"
    ROLE_EXPERT = "ROLE_EXPERT"
    ROLE_ADMIN = "ROLE_ADMIN"

class KYCStatusEnum(PyEnum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class BookingStatusEnum(PyEnum):
    PENDING_PAYMENT = "PENDING_PAYMENT"
    CONFIRMED = "CONFIRMED"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class PaymentStatusEnum(PyEnum):
    PENDING = "PENDING"
    SUCCEEDED = "SUCCEEDED"
    FAILED = "FAILED"

class PaymentMethodEnum(PyEnum):
    UPI = "UPI"
    CARD = "CARD"
    NET_BANKING = "NET_BANKING"

# --- Models ---

class User(Base):
    __tablename__ = "users"
    
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    role: Mapped[RoleEnum] = mapped_column(ENUM(RoleEnum, name="role_enum", create_type=False), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    customer_profile: Mapped["CustomerProfile"] = relationship(back_populates="user", uselist=False, cascade="all, delete-orphan")
    expert_profile: Mapped["ExpertProfile"] = relationship(back_populates="user", uselist=False, cascade="all, delete-orphan")

class CustomerProfile(Base):
    __tablename__ = "customers"
    
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    full_name: Mapped[str] = mapped_column(String, nullable=False)
    phone: Mapped[str] = mapped_column(String, nullable=True)
    
    user: Mapped["User"] = relationship(back_populates="customer_profile")
    addresses: Mapped[list["Address"]] = relationship(back_populates="customer", cascade="all, delete-orphan")
    bookings: Mapped[list["Booking"]] = relationship(back_populates="customer")

class ExpertProfile(Base):
    __tablename__ = "experts"
    
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    full_name: Mapped[str] = mapped_column(String, nullable=False)
    phone: Mapped[str] = mapped_column(String, nullable=True)
    kyc_status: Mapped[KYCStatusEnum] = mapped_column(ENUM(KYCStatusEnum, name="kyc_enum", create_type=False), default=KYCStatusEnum.PENDING)
    bio: Mapped[str | None] = mapped_column(Text)
    hourly_rate: Mapped[int | None] = mapped_column(Numeric(10, 2))
    is_available: Mapped[bool] = mapped_column(Boolean, default=False)
    
    user: Mapped["User"] = relationship(back_populates="expert_profile")
    expert_services: Mapped[list["ExpertJob"]] = relationship(back_populates="expert", cascade="all, delete-orphan")
    bookings: Mapped[list["Booking"]] = relationship(back_populates="expert")
    earnings: Mapped[list["ExpertEarnings"]] = relationship(back_populates="expert")
    payouts: Mapped[list["ExpertPayout"]] = relationship(back_populates="expert")

class Zone(Base):
    __tablename__ = "zones"
    
    name: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    city: Mapped[str] = mapped_column(String, nullable=False)
    zip_codes: Mapped[str] = mapped_column(String, nullable=False) # Store comma separated or switch to ARRAY
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

class Address(Base):
    __tablename__ = "addresses"
    
    customer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("customers.id", ondelete="CASCADE"))
    zone_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("zones.id", ondelete="SET NULL"))
    label: Mapped[str] = mapped_column(String, nullable=False) # e.g. Home, Work
    address_line_1: Mapped[str] = mapped_column(String, nullable=False)
    address_line_2: Mapped[str | None] = mapped_column(String)
    city: Mapped[str] = mapped_column(String, nullable=False)
    state: Mapped[str] = mapped_column(String, nullable=False)
    zip_code: Mapped[str] = mapped_column(String, nullable=False)
    lat: Mapped[float | None] = mapped_column(Numeric(10, 8))
    lng: Mapped[float | None] = mapped_column(Numeric(11, 8))
    
    customer: Mapped["CustomerProfile"] = relationship(back_populates="addresses")

class Category(Base):
    __tablename__ = "categories"
    
    name: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    icon_url: Mapped[str | None] = mapped_column(String)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    services: Mapped[list["Service"]] = relationship(back_populates="category")

class Service(Base):
    __tablename__ = "services"
    
    category_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("categories.id", ondelete="RESTRICT"))
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    base_price: Mapped[int] = mapped_column(Numeric(10, 2), nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    category: Mapped["Category"] = relationship(back_populates="services")
    addons: Mapped[list["Addon"]] = relationship(back_populates="service", cascade="all, delete-orphan")
    expert_jobs: Mapped[list["ExpertJob"]] = relationship(back_populates="service")

class Addon(Base):
    __tablename__ = "addons"
    
    service_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("services.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String, nullable=False)
    price: Mapped[int] = mapped_column(Numeric(10, 2), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    
    service: Mapped["Service"] = relationship(back_populates="addons")

class ExpertJob(Base):
    __tablename__ = "expert_jobs"
    
    expert_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("experts.id", ondelete="CASCADE"))
    service_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("services.id", ondelete="CASCADE"))
    custom_price: Mapped[int | None] = mapped_column(Numeric(10, 2))
    
    expert: Mapped["ExpertProfile"] = relationship(back_populates="expert_services")
    service: Mapped["Service"] = relationship(back_populates="expert_jobs")
    
    __table_args__ = (Index("idx_expert_service", "expert_id", "service_id", unique=True),)

class Coupon(Base):
    __tablename__ = "coupons"
    
    code: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    discount_percentage: Mapped[int] = mapped_column(Numeric(5, 2))
    max_discount_amount: Mapped[int | None] = mapped_column(Numeric(10, 2))
    valid_until: Mapped[datetime] = mapped_column(String) # Store ISO or use SQLAlchemy Date, relying on string for generic
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

class Booking(Base):
    __tablename__ = "bookings"
    
    customer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("customers.id", ondelete="RESTRICT"))
    expert_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("experts.id", ondelete="RESTRICT"))
    service_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("services.id", ondelete="RESTRICT"))
    address_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("addresses.id", ondelete="RESTRICT"))
    coupon_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("coupons.id", ondelete="SET NULL"))
    
    status: Mapped[BookingStatusEnum] = mapped_column(ENUM(BookingStatusEnum, name="booking_status_enum", create_type=False), default=BookingStatusEnum.PENDING_PAYMENT, index=True)
    start_time: Mapped[str] = mapped_column(String, nullable=False) 
    end_time: Mapped[str] = mapped_column(String, nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    expert_earning: Mapped[int] = mapped_column(Numeric(10, 2), nullable=False)
    total_amount: Mapped[int] = mapped_column(Numeric(10, 2), nullable=False)
    idempotency_key: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    
    customer: Mapped["CustomerProfile"] = relationship(back_populates="bookings")
    expert: Mapped["ExpertProfile"] = relationship(back_populates="bookings")
    payment: Mapped["Payment"] = relationship(back_populates="booking", uselist=False)
    receipt: Mapped["Receipt"] = relationship(back_populates="booking", uselist=False)
    rating: Mapped["Rating"] = relationship(back_populates="booking", uselist=False)

class Payment(Base):
    __tablename__ = "payments"
    
    booking_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("bookings.id", ondelete="RESTRICT"), unique=True)
    amount: Mapped[int] = mapped_column(Numeric(10, 2), nullable=False)
    status: Mapped[PaymentStatusEnum] = mapped_column(ENUM(PaymentStatusEnum, name="payment_status_enum", create_type=False), default=PaymentStatusEnum.PENDING, index=True)
    payment_method: Mapped[PaymentMethodEnum] = mapped_column(ENUM(PaymentMethodEnum, name="payment_method_enum", create_type=False), nullable=False)
    transaction_ref: Mapped[str | None] = mapped_column(String, unique=True, index=True)
    idempotency_key: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    
    booking: Mapped["Booking"] = relationship(back_populates="payment")

class Receipt(Base):
    __tablename__ = "receipts"
    
    booking_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("bookings.id", ondelete="CASCADE"), unique=True)
    receipt_url: Mapped[str] = mapped_column(String, nullable=False)
    
    booking: Mapped["Booking"] = relationship(back_populates="receipt")

class Rating(Base):
    __tablename__ = "ratings"
    
    booking_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("bookings.id", ondelete="CASCADE"), unique=True)
    score: Mapped[int] = mapped_column(Integer, nullable=False) # 1-5
    comment: Mapped[str | None] = mapped_column(Text)
    
    booking: Mapped["Booking"] = relationship(back_populates="rating")
    
    __table_args__ = (Index("idx_rating_score", "score"),)

class ExpertEarnings(Base):
    __tablename__ = "expert_earnings"
    
    expert_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("experts.id", ondelete="CASCADE"))
    booking_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("bookings.id", ondelete="RESTRICT"), unique=True)
    amount_earned: Mapped[int] = mapped_column(Numeric(10, 2), nullable=False)
    platform_fee: Mapped[int] = mapped_column(Numeric(10, 2), nullable=False)
    
    expert: Mapped["ExpertProfile"] = relationship(back_populates="earnings")

class ExpertPayout(Base):
    __tablename__ = "expert_payouts"
    
    expert_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("experts.id", ondelete="CASCADE"))
    amount: Mapped[int] = mapped_column(Numeric(10, 2), nullable=False)
    status: Mapped[PaymentStatusEnum] = mapped_column(ENUM(PaymentStatusEnum, name="payment_status_enum", create_type=False), default=PaymentStatusEnum.PENDING)
    transaction_ref: Mapped[str | None] = mapped_column(String, unique=True, index=True)
    
    expert: Mapped["ExpertProfile"] = relationship(back_populates="payouts")
