import asyncio
import os
import sys

BASE_DIR = os.path.dirname(__file__)
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.services.auth_service import AuthService
from app.schemas.user import UserCreate, UserResponse
from app.models.all import RoleEnum


async def main() -> None:
    async with AsyncSessionLocal() as session:  # type: AsyncSession
        service = AuthService(session)
        payload = UserCreate(
            email="customer_debug@example.com",
            password="Password123!",
            role=RoleEnum.ROLE_CUSTOMER,
            full_name="Debug Customer",
            phone="5550000000",
        )
        try:
            user = await service.register(payload)
            print("Registered user ORM:", user.email)
            dto = UserResponse.model_validate(user, from_attributes=True)
            print("Pydantic DTO:", dto.model_dump())
        except Exception as exc:  # noqa: BLE001
            print("EXC TYPE:", type(exc))
            print("EXC REPR:", repr(exc))


if __name__ == "__main__":
    asyncio.run(main())

