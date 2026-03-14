from typing import Optional, List
import uuid
from pydantic import BaseModel, Field
from app.schemas.base import BaseSchema

# --- Zone ---
class ZoneBase(BaseModel):
    name: str = Field(..., min_length=2)
    city: str = Field(..., min_length=2)
    zip_codes: str # comma separated string
    is_active: bool = True

class ZoneSchema(ZoneBase, BaseSchema):
    pass

# --- Address ---
class AddressBase(BaseModel):
    label: str = Field(..., min_length=2, max_length=50) # Home, Work
    address_line_1: str = Field(..., min_length=5)
    address_line_2: Optional[str] = None
    city: str = Field(..., min_length=2)
    state: str = Field(..., min_length=2)
    zip_code: str = Field(..., min_length=4)
    lat: Optional[float] = Field(None, ge=-90, le=90)
    lng: Optional[float] = Field(None, ge=-180, le=180)

class AddressCreate(AddressBase):
    zone_id: Optional[uuid.UUID] = None

class AddressSchema(AddressBase, BaseSchema):
    customer_id: uuid.UUID
    zone_id: Optional[uuid.UUID] = None

# --- Category ---
class CategoryBase(BaseModel):
    name: str = Field(..., min_length=2)
    description: Optional[str] = None
    icon_url: Optional[str] = None
    is_active: bool = True


class CategoryCreate(CategoryBase):
    """Payload for creating categories."""
    pass


class CategorySchema(CategoryBase, BaseSchema):
    pass

# --- Service ---
class ServiceBase(BaseModel):
    name: str = Field(..., min_length=2)
    description: Optional[str] = None
    base_price: float = Field(..., ge=0)
    duration_minutes: int = Field(..., gt=0)
    is_active: bool = True

class ServiceCreate(ServiceBase):
    category_id: uuid.UUID

class ServiceSchema(ServiceBase, BaseSchema):
    category_id: uuid.UUID
    # category: Optional[CategorySchema] = None # Un-commenting creates cyclic dep without proper typing structure. For now return IDs.

# --- Addon ---
class AddonBase(BaseModel):
    name: str = Field(..., min_length=2)
    price: float = Field(..., ge=0)
    description: Optional[str] = None

class AddonCreate(AddonBase):
    service_id: uuid.UUID

class AddonSchema(AddonBase, BaseSchema):
    service_id: uuid.UUID

# --- Expert Job ---
class ExpertJobBase(BaseModel):
    custom_price: Optional[float] = Field(None, ge=0)

class ExpertJobCreate(ExpertJobBase):
    service_id: uuid.UUID

class ExpertJobSchema(ExpertJobBase, BaseSchema):
    expert_id: uuid.UUID
    service_id: uuid.UUID
