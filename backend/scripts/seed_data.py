import asyncio
import os
import sys
import uuid
from datetime import datetime

from sqlalchemy import select

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.core.database import AsyncSessionLocal
from app.core.security import get_password_hash
from app.models.all import (
    User,
    RoleEnum,
    Zone,
    Address,
    Category,
    Service,
    CustomerProfile,
    ExpertProfile,
    Booking,
    BookingStatusEnum,
)


async def seed() -> None:
    async with AsyncSessionLocal() as session:
        # --- Categories ---
        category_names = ["Plumbing", "Electrical", "Cleaning", "Painting"]
        categories: dict[str, Category] = {}

        for name in category_names:
            result = await session.execute(select(Category).where(Category.name == name))
            category = result.scalars().first()
            if not category:
                category = Category(name=name, description=f"{name} services", is_active=True)
                session.add(category)
            categories[name] = category

        # --- Services ---
        service_defs = [
            ("Pipe repair", "Plumbing", "Fix leaking or broken pipes", 1500, 60),
            ("AC repair", "Electrical", "Diagnose and repair air conditioning units", 2000, 90),
            ("Deep home cleaning", "Cleaning", "Thorough deep cleaning of an entire home", 2500, 180),
            ("Wall painting", "Painting", "Interior wall painting service", 3000, 240),
        ]

        services: dict[str, Service] = {}
        for name, cat_name, desc, price, duration in service_defs:
            category = categories[cat_name]
            result = await session.execute(
                select(Service).where(Service.name == name, Service.category_id == category.id)
            )
            service = result.scalars().first()
            if not service:
                service = Service(
                    name=name,
                    description=desc,
                    base_price=price,
                    duration_minutes=duration,
                    is_active=True,
                    category_id=category.id,
                )
                session.add(service)
            services[name] = service

        # --- Users (customers & experts) ---
        user_defs = [
            ("customer1@example.com", "Password123!", RoleEnum.ROLE_CUSTOMER, "Alice Customer", "1111111111"),
            ("customer2@example.com", "Password123!", RoleEnum.ROLE_CUSTOMER, "Bob Customer", "2222222222"),
            ("expert1@example.com", "Password123!", RoleEnum.ROLE_EXPERT, "Eve Expert", "3333333333"),
            ("expert2@example.com", "Password123!", RoleEnum.ROLE_EXPERT, "Oscar Expert", "4444444444"),
        ]

        users: dict[str, User] = {}
        for email, password, role, full_name, phone in user_defs:
            result = await session.execute(select(User).where(User.email == email))
            user = result.scalars().first()
            if not user:
                user = User(
                    email=email,
                    password_hash=get_password_hash(password),
                    role=role,
                    is_active=True,
                )
                session.add(user)
                await session.flush()
            users[email] = user

        # --- Customer profiles + addresses ---
        result = await session.execute(select(Zone).where(Zone.name == "Downtown"))
        zone = result.scalars().first()
        if not zone:
            zone = Zone(name="Downtown", city="Metropolis", zip_codes="10001,10002", is_active=True)
            session.add(zone)
            await session.flush()

        customer_addresses: dict[str, Address] = {}
        for email, _, _, full_name, phone in user_defs:
            user = users[email]
            if user.role != RoleEnum.ROLE_CUSTOMER:
                continue

            result = await session.execute(
                select(CustomerProfile).where(CustomerProfile.user_id == user.id)
            )
            customer = result.scalars().first()
            if not customer:
                customer = CustomerProfile(user_id=user.id, full_name=full_name, phone=phone)
                session.add(customer)
                await session.flush()

            result = await session.execute(
                select(Address).where(Address.customer_id == customer.id)
            )
            address = result.scalars().first()
            if not address:
                address = Address(
                    customer_id=customer.id,
                    zone_id=zone.id,
                    label="Home",
                    address_line_1="123 Main St",
                    address_line_2=None,
                    city="Metropolis",
                    state="State",
                    zip_code="10001",
                    lat=None,
                    lng=None,
                )
                session.add(address)
                await session.flush()

            customer_addresses[email] = address

        # --- Expert profiles ---
        experts: dict[str, ExpertProfile] = {}
        for email, _, _, full_name, phone in user_defs:
            user = users[email]
            if user.role != RoleEnum.ROLE_EXPERT:
                continue

            result = await session.execute(
                select(ExpertProfile).where(ExpertProfile.user_id == user.id)
            )
            expert = result.scalars().first()
            if not expert:
                expert = ExpertProfile(
                    user_id=user.id,
                    full_name=full_name,
                    phone=phone,
                    is_available=True,
                )
                session.add(expert)
                await session.flush()

            experts[email] = expert

        # --- Example bookings ---
        existing = await session.execute(select(Booking).limit(1))
        if not existing.scalars().first():
            now_str = datetime.utcnow().isoformat()

            customer1 = users["customer1@example.com"]
            addr1 = customer_addresses["customer1@example.com"]
            expert1 = experts["expert1@example.com"]

            s_pipe = services["Pipe repair"]
            s_clean = services["Deep home cleaning"]

            booking1 = Booking(
                customer_id=addr1.customer_id,
                expert_id=expert1.id,
                service_id=s_pipe.id,
                address_id=addr1.id,
                coupon_id=None,
                status=BookingStatusEnum.PENDING_PAYMENT,
                scheduled_time=now_str,
                total_amount=s_pipe.base_price,
                idempotency_key=f"seed-{uuid.uuid4()}",
                start_otp="123456",
            )
            session.add(booking1)

            booking2 = Booking(
                customer_id=addr1.customer_id,
                expert_id=expert1.id,
                service_id=s_clean.id,
                address_id=addr1.id,
                coupon_id=None,
                status=BookingStatusEnum.CONFIRMED,
                scheduled_time=now_str,
                total_amount=s_clean.base_price,
                idempotency_key=f"seed-{uuid.uuid4()}",
                start_otp="654321",
            )
            session.add(booking2)

        await session.commit()


def main() -> None:
    asyncio.run(seed())


if __name__ == "__main__":
    main()

