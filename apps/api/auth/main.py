from typing import  Optional
from fastapi import Depends, HTTPException, Response, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi_users.db import SQLAlchemyUserDatabase
from fastapi_users import BaseUserManager, UUIDIDMixin, schemas 
import uuid
from db.session import get_async_session
from .models import Customer, SQLAlchemyCustomerDatabase, User, SQLAlchemyUserDatabaseLocal
from core.config import settings
from mess.crud import mess_crud


async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    try:
        yield SQLAlchemyUserDatabaseLocal(session, User)
    except Exception as e:
        print(f"Error in get_user_db: {e}")
        raise


async def get_customer_db(session: AsyncSession = Depends(get_async_session)):
    try:
        yield SQLAlchemyCustomerDatabase(session, Customer)
    except Exception as e:
        print(f"Error in get_customer_db: {e}")
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
            user = await self.get_by_email(credentials.username) 
            
            if user and self.password_helper.verify_and_update(credentials.password, user.hashed_password)[0]:
                print(user)
                return user
            else:
                raise HTTPException(status_code=400, detail="Invalid credentials")

        except Exception as e:
            print(e,"**********************")
            raise HTTPException(status_code=400, detail="Invalid credentials")


    async def on_after_login(self, user: User, request: Request | None = None, response: Response | None = None) -> None:
        print(f"User {user.id} logged in.*********************************************************************************************************")
        return await super().on_after_login(user, request, response)

    async def on_after_register(self, user: User, request: Request | None = None):
        print(f"User {user.id} has registered and is {user.is_active}.*********************************************************************************************************")

    async def on_after_forgot_password(
        self, user: User, token: str, request: Request | None = None
    ):
        print(f"User {user.id} has forgot their password. Reset token: {token}")

    async def on_after_request_verify(
        self, user: User, token: str, request: Request | None = None
    ):
        print(f"Verification requested for user {user.id}. Verification token: {token}")

    async def on_after_reset_password(self, user: User, request: Request | None = None) -> None:
        print(f"User {user.id} has reset their password.")







async def get_user_manager(user_db: SQLAlchemyUserDatabase = Depends(get_user_db)):
    try:
        yield UserManager(user_db)
    except Exception as e:
        print(f"Error in get_user_manager: {e}")
        raise




class CustomerManager(UUIDIDMixin, BaseUserManager[Customer, uuid.UUID]):
    reset_password_token_secret = settings.SECRET_KEY.get_secret_value()
    verification_token_secret = settings.SECRET_KEY.get_secret_value()

    def __init__(self, customer_db: SQLAlchemyCustomerDatabase):
        super().__init__(customer_db)
        self.customer_db = customer_db

    async def create(
        self,
        user_create: schemas.BaseUserCreate,
        safe: bool = False,
        request: Optional[Request] = None,
    ) -> Customer:
        # Extract role from UserCreate if available

        print("********************** Creating Customer **********************")
        print(user_create,request.query_params)
        print("**********************")
        create_dict = user_create.model_dump()
        if safe:
            # If safe mode, remove role to prevent privilege escalation
            create_dict.pop("role", None)
            create_dict.pop("is_superuser", None)
        
        # Create the user with the parent method
        user = await super().create(user_create, safe, request)
        mess_slug=request.query_params.get("mess_slug")
        mess=await mess_crud.get_by_slug(self.customer_db.session,slug=mess_slug)
        if mess:
            await mess_crud.add_customer(self.customer_db.session,mess.slug,user)
        
        return user
    
    async def authenticate(self, credentials: OAuth2PasswordRequestForm) -> Optional[Customer]:
        """Override to use email instead of username"""
        try:
            user = await self.get_by_email(credentials.username) 
            
            if user and self.password_helper.verify_and_update(credentials.password, user.hashed_password)[0]:
                print(user)
                return user
            else:
                raise HTTPException(status_code=400, detail="Invalid credentials")

        except Exception as e:
            print(e,"**********************")
            raise HTTPException(status_code=400, detail="Invalid credentials")


    async def on_after_login(self, user: Customer, request: Request | None = None, response: Response | None = None,db:AsyncSession=Depends(get_async_session)) -> None:
        print(f"Customer {user.id} logged in.*********************************************************************************************************")
      
        return await super().on_after_login(user, request, response)

    async def on_after_register(self, user: Customer, request: Request | None = None):
        print(f"User {user.id} has registered and is {user.is_active}.*********************************************************************************************************")
    

async def get_customer_manager(customer_db: SQLAlchemyCustomerDatabase = Depends(get_customer_db)):
    try:
        yield CustomerManager(customer_db)
    except Exception as e:
        print(f"Error in get_customer_manager: {e}")
        raise
