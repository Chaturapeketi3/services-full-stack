from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.core.config import settings
from app.core.exceptions import UnauthorizedException
from app.models.all import User
import uuid

security = HTTPBearer()

async def get_db_session(db: AsyncSession = Depends(get_db)):
    """
    Dependency to get the database session.
    """
    return db

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db_session)
) -> User:
    try:
        payload = jwt.decode(
            credentials.credentials, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise UnauthorizedException("Could not validate credentials")
    except JWTError:
        raise UnauthorizedException("Could not validate credentials")
        
    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    user = result.scalars().first()
    
    if user is None:
        raise UnauthorizedException("User not found")
    if not user.is_active:
        raise UnauthorizedException("Inactive user")
        
    return user

def RoleChecker(allowed_roles: list[str]):
    async def role_dependency(user: User = Depends(get_current_user)):
        if user.role.value not in allowed_roles:
            raise UnauthorizedException("Operation not permitted")
        return user
    return role_dependency
