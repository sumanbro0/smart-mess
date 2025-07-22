from typing import  Optional
from fastapi import Depends, HTTPException,  Response, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi_users.db import SQLAlchemyUserDatabase
from fastapi_users import BaseUserManager, UUIDIDMixin, schemas 
import uuid
from db.session import get_async_session
from .models import Customer, SQLAlchemyCustomerDatabase, User, SQLAlchemyUserDatabaseLocal
from core.config import settings
from mess.crud import mess_crud
from mess.models import Mess
from httpx import AsyncClient




async def get_google_user_info(token: str) -> dict:
    try:
        async with AsyncClient() as client:
            response = await client.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                headers={"Authorization": f"Bearer {token}"}
            )
            return response.json()
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error": "user_info_error",
                "error_description": f"Unexpected error: {str(e)}",
            }
        )
    
    
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
        create_dict = user_create.model_dump()
        
        if safe:
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
        if user.oauth_accounts:
            user_info = await get_google_user_info(user.oauth_accounts[0].access_token)
            await self.user_db.update(user, {"name": user_info.get("name", user.email)})
        
        return await super().on_after_login(user, request, response)

    async def on_after_register(self, user: User, request: Request | None = None):
        print(f"User {user.id} has registered and is {user.is_active}.")
        
        if user.oauth_accounts:
            user_info = await get_google_user_info(user.oauth_accounts[0].access_token)
            await self.user_db.update(user, {"name": user_info.get("name", user.email)})
        
        return await super().on_after_register(user, request)

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

    async def get_by_email_and_mess(self, email: str, mess_slug: str) -> Optional[Customer]:
        """Get customer by email if they're a member of specific mess"""
        stmt = select(Customer).join(
            Mess, Customer.mess_id == Mess.id
        ).where(
            Customer.email == email,
            Mess.slug == mess_slug
        )
        result = await self.customer_db.session.execute(stmt)
        return result.scalar_one_or_none()

    async def create(
        self,
        user_create: schemas.BaseUserCreate,
        safe: bool = False,
        request: Optional[Request] = None,
    ) -> Customer:
        print("********************** Creating Customer **********************")
        print(user_create, request.query_params)
        print("**********************")
        
        mess_slug = request.query_params.get("mess_slug")
        mess = await mess_crud.get_by_slug(self.customer_db.session, slug=mess_slug)
        
        if not mess:
            raise HTTPException(status_code=404, detail="Mess not found")
            
        existing_user_in_mess = await self.get_by_email_and_mess(user_create.email, mess_slug)
        
        if existing_user_in_mess:
            raise HTTPException(
                status_code=400, 
                detail=f"User already registered to {mess.name}"
            )
                
        create_dict = user_create.create_update_dict()
        create_dict['mess_id'] = mess.id  # Add mess_id to the customer
        
        # Handle password hashing
        if 'password' in create_dict:
            password = create_dict.pop('password')
            create_dict['hashed_password'] = self.password_helper.hash(password)
        
        if safe:
            create_dict.pop("role", None)
            create_dict.pop("is_superuser", None)
        
        user = await self.customer_db.create(create_dict)
        await self.customer_db.session.commit()
        await self.customer_db.session.refresh(user)        
        return user
    
   

    async def oauth_callback(self, oauth_name: str, access_token: str, account_id: str, account_email: str, expires_at: int | None = None, refresh_token: str | None = None, request: Request | None = None, **kwargs) -> Customer:
        """Override OAuth callback to handle mess context"""

        print("********************** OAuth Callback **********************")
        user_info = await get_google_user_info(access_token)
        print("**********************")
        
        mess_slug = request.query_params.get("mess_slug")
        if not mess_slug:
            raise HTTPException(status_code=400, detail="mess_slug required")
        
        mess = await mess_crud.get_by_slug(self.customer_db.session, slug=mess_slug)
        if not mess:
            raise HTTPException(status_code=404, detail="Mess not found")
        
        existing_user = await self.get_by_email_and_mess(account_email, mess_slug)
        if existing_user:
            return existing_user
        password = self.password_helper.generate()
        
        user_dict = {
            "email": account_email,
            "name": user_info.get("name", account_email),  # Use actual name from Google
            "mess_id": mess.id,
            "is_verified": True,
            "hashed_password": self.password_helper.hash(password)
        }
        
        return await self.customer_db.create(user_dict)

    async def update(self, user_update: schemas.BaseUserUpdate, user: Customer, safe: bool = False, request: Request | None = None) -> Customer:
        mess_slug = request.query_params.get("mess_slug")
        mess = await mess_crud.get_by_slug(self.customer_db.session, slug=mess_slug)
        if not mess:
            raise HTTPException(status_code=404, detail="Mess not found")
        
        # Check if user belongs to this mess
        if user.mess_id != mess.id:
            raise HTTPException(status_code=400, detail="User not registered to this mess")
        
        update_dict = user_update.create_update_dict()
        if update_dict.get("email"):
            existing_user_in_mess = await self.get_by_email_and_mess(update_dict.get("email"), mess_slug)
            if existing_user_in_mess and existing_user_in_mess.id != user.id:
                raise HTTPException(status_code=400, detail="Email already registered to this mess")
        
        if update_dict.get("email") and update_dict.get("email") != user.email:
            update_dict["is_verified"] = False
        
        if update_dict.get("password"):
            await self.validate_password(update_dict.get("password"), user)
            update_dict["hashed_password"] = self.password_helper.hash(update_dict.get("password"))
        
        await self.customer_db.update(user, update_dict)
        await self.customer_db.session.commit()
        await self.customer_db.session.refresh(user)
        return user
        
    
    
    
    async def authenticate(self, credentials: OAuth2PasswordRequestForm, request: Request | None = None) -> Optional[Customer]:
        """Override to use email instead of username"""
        try:
            print("********************** Authenticating Customer **********************")
            print(credentials.grant_type,credentials.password,request)
            print("**********************")
            mess_slug = request.query_params.get("mess_slug")
            user = await self.get_by_email_and_mess(credentials.username, mess_slug)
            
            if user and self.password_helper.verify_and_update(credentials.password, user.hashed_password)[0]:
                return user
            else:
                raise HTTPException(status_code=400, detail="Invalid credentials")

        except Exception as e:
            print(e, "**********************")
            raise HTTPException(status_code=400, detail="Invalid credentials")
        
    async def authenticate_with_mess(
    self, 
    credentials: OAuth2PasswordRequestForm, 
    mess_slug: str
    ) -> Optional[Customer]:
        user = await self.get_by_email_and_mess(credentials.username, mess_slug)
        
        if user and self.password_helper.verify_and_update(credentials.password, user.hashed_password)[0]:
            return user
        return None


    

async def get_customer_manager(customer_db: SQLAlchemyCustomerDatabase = Depends(get_customer_db)):
    try:
        yield CustomerManager(customer_db)
    except Exception as e:
        print(f"Error in get_customer_manager: {e}")
        raise
