import uuid
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from fastapi import HTTPException, status

from app.models.all import User, CustomerProfile, ExpertProfile, RoleEnum
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.exceptions import UnauthorizedException, GenericException

class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_by_email(self, email: str) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalars().first()

    async def register(self, user_in: UserCreate) -> UserResponse:
        existing_user = await self.get_user_by_email(user_in.email)
        if existing_user:
            raise GenericException("User with this email already exists")

        # Create user
        db_user = User(
            email=user_in.email,
            password_hash=get_password_hash(user_in.password),
            role=user_in.role
        )
        self.db.add(db_user)
        await self.db.commit()
        await self.db.refresh(db_user)

        # Create respective role profile
        if user_in.role == RoleEnum.ROLE_CUSTOMER:
            profile = CustomerProfile(
                user_id=db_user.id,
                full_name=user_in.full_name,
                phone=user_in.phone
            )
            self.db.add(profile)
        elif user_in.role == RoleEnum.ROLE_EXPERT:
            profile = ExpertProfile(
                user_id=db_user.id,
                full_name=user_in.full_name,
                phone=user_in.phone
            )
            self.db.add(profile)
            
        await self.db.commit()
        
        # Load relations for response, eager loading profiles to avoid async lazy-load issues
        result = await self.db.execute(
            select(User)
            .options(
                selectinload(User.customer_profile),
                selectinload(User.expert_profile),
            )
            .where(User.id == db_user.id)
        )
        user = result.scalars().first()
        return UserResponse.model_validate(user, from_attributes=True)

    async def authenticate(self, user_in: UserLogin):
        # Initial fetch to verify credentials (no relationships needed yet)
        user = await self.get_user_by_email(user_in.email)
        if not user or not verify_password(user_in.password, user.password_hash):
            raise UnauthorizedException("Incorrect email or password")
        if not user.is_active:
            raise UnauthorizedException("Inactive user")

        # Re-fetch with eager loading to avoid lazy-load DetachedInstanceError
        # during serialization by FastAPI (async session may be closed by then)
        result = await self.db.execute(
            select(User)
            .options(
                selectinload(User.customer_profile),
                selectinload(User.expert_profile),
            )
            .where(User.id == user.id)
        )
        user_with_profiles = result.scalars().first()

        access_token = create_access_token(
            subject=str(user_with_profiles.id),
            role=user_with_profiles.role.value
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": UserResponse.model_validate(user_with_profiles, from_attributes=True),
        }
