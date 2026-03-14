import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db_session, RoleChecker
from app.models.all import User
from app.schemas.transaction import BookingResponse, ExpertEarningsSchema
from app.schemas.pagination import PaginatedResponse
from app.services.expert_service import ExpertService, DashboardSummaryResponse

router = APIRouter(prefix="/experts", tags=["Experts"])

@router.get("/dashboard", response_model=DashboardSummaryResponse)
async def get_expert_dashboard(
    db: AsyncSession = Depends(get_db_session),
    user: User = Depends(RoleChecker(["ROLE_EXPERT"]))
):
    """
    Get earning summary and job counts for the logged-in Expert.
    """
    service = ExpertService(db)
    return await service.get_dashboard_summary(user)

@router.put("/availability")
async def toggle_availability(
    is_available: bool = Query(..., description="Set to True to go Online"),
    db: AsyncSession = Depends(get_db_session),
    user: User = Depends(RoleChecker(["ROLE_EXPERT"]))
):
    """
    Toggle online/offline status to receive jobs.
    """
    service = ExpertService(db)
    return await service.toggle_availability(user, is_available)

@router.get("/jobs", response_model=PaginatedResponse[BookingResponse])
async def list_expert_jobs(
    status: Optional[str] = Query(None, description="Filter by Booking Status (e.g., CONFIRMED, COMPLETED)"),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db_session),
    user: User = Depends(RoleChecker(["ROLE_EXPERT"]))
):
    """
    List all assigned appointments/jobs for this expert.
    """
    service = ExpertService(db)
    return await service.get_jobs(user, status, page, size)

@router.post("/jobs/{job_id}/accept", response_model=BookingResponse)
async def accept_job(
    job_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
    user: User = Depends(RoleChecker(["ROLE_EXPERT"]))
):
    """
    Accept a CONFIRMED job.
    """
    service = ExpertService(db)
    return await service.accept_job(job_id, user)

@router.post("/jobs/{job_id}/reject", response_model=BookingResponse)
async def reject_job(
    job_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
    user: User = Depends(RoleChecker(["ROLE_EXPERT"]))
):
    """
    Reject a job (triggers a refund/reassignment flow conceptually).
    """
    service = ExpertService(db)
    return await service.reject_job(job_id, user)

@router.get("/earnings", response_model=PaginatedResponse[ExpertEarningsSchema])
async def list_earnings(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db_session),
    user: User = Depends(RoleChecker(["ROLE_EXPERT"]))
):
    """
    List historical earnings ledger.
    """
    service = ExpertService(db)
    return await service.get_earnings(user, page, size)
