from typing import Optional
import uuid
from pydantic import BaseModel, EmailStr, Field
from app.models.all import RoleEnum, KYCStatusEnum
from app.schemas.base import BaseSchema

# --- Profiles ---

class CustomerProfileBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)

class CustomerProfileSchema(CustomerProfileBase, BaseSchema):
    user_id: uuid.UUID

# Note: Keeping bio/hourly_rate optional for initial creation
class ExpertProfileBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    bio: Optional[str] = None
    hourly_rate: Optional[float] = Field(None, ge=0)
    is_available: bool = False

class ExpertProfileSchema(ExpertProfileBase, BaseSchema):
    user_id: uuid.UUID
    kyc_status: KYCStatusEnum

# --- Users ---

class UserBase(BaseModel):
    email: EmailStr
    role: RoleEnum

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=128)
    # Require profile info during registration
    full_name: str = Field(..., min_length=2, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase, BaseSchema):
    is_active: bool
    customer_profile: Optional[CustomerProfileSchema] = None
    expert_profile: Optional[ExpertProfileSchema] = None
