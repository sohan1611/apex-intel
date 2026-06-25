import argparse
import asyncio
import sys

from sqlalchemy.future import select
from backend.db.connection import async_session_maker
from backend.db.models import User

async def make_admin(email: str) -> None:
    """Promote the user with the given email to admin."""
    async with async_session_maker() as db:
        # Locate the user
        stmt = select(User).where(User.email == email)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()

        if not user:
            print(f"❌ Error: User with email '{email}' not found.", file=sys.stderr)
            sys.exit(1)

        if user.is_admin:
            print(f"✅ User '{email}' is already an admin.")
            return

        # Set is_admin = True
        user.is_admin = True
        await db.commit()
        print(f"🎉 Success: User '{email}' has been promoted to Admin.")

def main():
    parser = argparse.ArgumentParser(description="Promote a user to Admin in Apex Intel.")
    parser.add_argument("email", type=str, help="The email address of the user to promote.")
    args = parser.parse_args()

    # Run the async promotion function
    asyncio.run(make_admin(args.email))

if __name__ == "__main__":
    main()
