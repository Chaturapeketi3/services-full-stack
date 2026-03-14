from typing import Optional
import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies import get_db_session, RoleChecker
from app.schemas.pagination import PaginatedResponse
from app.schemas.service import CategorySchema, ServiceSchema, AddressSchema, AddressCreate
from app.schemas.user import ExpertProfileSchema
from app.services.catalog_service import CatalogService
from app.models.all import User

router = APIRouter(tags=["Catalog"])

@router.get("/categories", response_model=PaginatedResponse[CategorySchema])
async def list_categories(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db_session)
):
    """
    Get a paginated list of all active categories.
    """
    service = CatalogService(db)
    return await service.get_categories(page=page, size=size)

@router.get("/services", response_model=PaginatedResponse[ServiceSchema])
async def list_services(
    category_id: Optional[uuid.UUID] = Query(None, description="Filter by Category ID"),
    zone_id: Optional[uuid.UUID] = Query(None, description="Filter by Zone ID (Future Use)"),
    search: Optional[str] = Query(None, description="Search by Name or Description"),
    sort: Optional[str] = Query(None, description="Sort options: price_asc, price_desc"),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db_session)
):
    """
    Get a paginated list of services with optional filtering and sorting.
    """
    service = CatalogService(db)
    return await service.get_services(
        category_id=category_id, 
        zone_id=zone_id, 
        search=search, 
        sort=sort, 
        page=page, 
        size=size
    )

@router.get("/services/{service_id}", response_model=ServiceSchema)
async def get_service(
    service_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session)
):
    """
    Get a specific service by ID.
    """
    service = CatalogService(db)
    return await service.get_service_by_id(service_id)

@router.get("/experts", response_model=PaginatedResponse[ExpertProfileSchema])
async def list_available_experts(
    service_id: Optional[uuid.UUID] = Query(None, description="Filter by Service ID"),
    zone_id: Optional[uuid.UUID] = Query(None, description="Filter by Zone ID"),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db_session)
):
    """
    Get available experts.
    """
    service = CatalogService(db)
    return await service.get_available_experts(service_id=service_id, zone_id=zone_id, page=page, size=size)

@router.get("/addresses", response_model=list[AddressSchema])
async def list_customer_addresses(
    db: AsyncSession = Depends(get_db_session),
    user: User = Depends(RoleChecker(["ROLE_CUSTOMER"]))
):
    """
    Get the logged-in customer's saved addresses for use in the booking form.
    """
    service = CatalogService(db)
    return await service.get_customer_addresses(user)

@router.post("/addresses", response_model=AddressSchema, status_code=201)
async def create_customer_address(
    address: AddressCreate,
    db: AsyncSession = Depends(get_db_session),
    user: User = Depends(RoleChecker(["ROLE_CUSTOMER"]))
):
    """
    Add a new address for the logged-in customer.
    """
    service = CatalogService(db)
    return await service.create_customer_address(user, address)
