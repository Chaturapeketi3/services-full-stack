import asyncio

import httpx


async def main() -> None:
    async with httpx.AsyncClient(base_url="http://127.0.0.1:8000") as client:
        payload = {
            "email": "customer_cli_debug@example.com",
            "password": "Password123!",
            "role": "ROLE_CUSTOMER",
            "full_name": "CLI Debug Customer",
            "phone": "5551112222",
        }
        resp = await client.post("/auth/register", json=payload)
        print("Status:", resp.status_code)
        print("Body:", resp.text)


if __name__ == "__main__":
    asyncio.run(main())

