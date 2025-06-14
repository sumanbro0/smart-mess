from typing import  Optional
from fastapi import Depends, Response, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi_users.db import SQLAlchemyUserDatabase
from fastapi_users import BaseUserManager, UUIDIDMixin, schemas 
import uuid
from db.session import get_async_session
from .models import User
from core.config import settings



async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    try:
        yield SQLAlchemyUserDatabase(session, User)
    except Exception as e:
        print(f"Error in get_user_db: {e}")
        raise


class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):  # Changed to UUIDIDMixin and uuid.UUID
    reset_password_token_secret = settings.SECRET_KEY.get_secret_value()
    verification_token_secret = settings.SECRET_KEY.get_secret_value()

    async def create(
        self,
        user_create: schemas.BaseUserCreate,
        safe: bool = False,
        request: Optional[Request] = None,
    ) -> User:
        # Extract role from UserCreate if available
        create_dict = user_create.model_dump()
        
        if safe:
            # If safe mode, remove role to prevent privilege escalation
            create_dict.pop("role", None)
            create_dict.pop("is_superuser", None)
        
        # Create the user with the parent method
        user = await super().create(user_create, safe, request)
        
        return user
    
    async def authenticate(self, credentials: OAuth2PasswordRequestForm) -> Optional[User]:
        """Override to use email instead of username"""
        try:

            print(credentials.username)
            user = await self.get_by_email(credentials.username) 
            if user and self.password_helper.verify_and_update(credentials.password, user.hashed_password)[0]:
                print(user)
                return user

        except Exception as e:
            print(e)
            pass
        return None

    async def on_after_login(self, user: User, request: Request | None = None, response: Response | None = None) -> None:
        print(f"User {user.id} logged in.")
        return await super().on_after_login(user, request, response)

    async def on_after_register(self, user: User, request: Request | None = None):
        print(f"User {user.id} has registered.")

    async def on_after_forgot_password(
        self, user: User, token: str, request: Request | None = None
    ):
        print(f"User {user.id} has forgot their password. Reset token: {token}")

    async def on_after_request_verify(
        self, user: User, token: str, request: Request | None = None
    ):
        print(f"Verification requested for user {user.id}. Verification token: {token}")

    async def on_after_google_login(
        self, user: User, request: Request | None = None
    ) -> None:
        print(f"User {user.id} logged in with Google.")


async def get_user_manager(user_db: SQLAlchemyUserDatabase = Depends(get_user_db)):
    try:
        yield UserManager(user_db)
    except Exception as e:
        print(f"Error in get_user_manager: {e}")
        raise


# Add the router to your FastAPI app
# In your main FastAPI app file:
