from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies import get_db_session
from app.schemas.user import UserCreate, UserResponse, UserLogin
from app.schemas.auth import Token
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db_session)
):
    """
    Register a new user (Customer or Expert)
    """
    auth_service = AuthService(db)
    return await auth_service.register(user_in)

@router.post("/login", response_model=Token)
async def login_user(
    user_in: UserLogin,
    db: AsyncSession = Depends(get_db_session)
):
    """
    Login user and return JWT token
    """
    auth_service = AuthService(db)
    return await auth_service.authenticate(user_in)

@router.post("/logout")
async def logout_user():
    """
    Logout user (Client-side token deletion is expected for JWT)
    """
    return {"message": "Successfully logged out"}
