from datetime import UTC, datetime, timedelta
import uuid
from fastapi_users import FastAPIUsers
from fastapi_users_db_sqlalchemy.access_token import (
    SQLAlchemyAccessTokenDatabase,
)
from db.session import get_async_session
from core.config import settings
from auth.models import User, AccessToken,Customer
from auth.main import  get_user_manager,get_customer_manager
from auth.config import auth_backend,customer_auth_backend
from sqlalchemy import select, delete






# Create FastAPI Users instance
fastapi_users = FastAPIUsers[User, uuid.UUID](
    get_user_manager,
    [auth_backend],
)

fastapi_customer = FastAPIUsers[Customer, uuid.UUID](
    get_customer_manager,
    [customer_auth_backend],
)


# Current user dependencies
current_active_user = fastapi_users.current_user(active=True)
current_active_verified_user = fastapi_users.current_user(active=True, verified=True)
current_superuser = fastapi_users.current_user(active=True, superuser=True)
current_active_customer = fastapi_customer.current_user(active=True)      



# Utility functions for token management
async def revoke_user_tokens(user_id: uuid.UUID):
    """Revoke all tokens for a specific user"""
    
    async with get_async_session() as session:
        access_tokens_db = SQLAlchemyAccessTokenDatabase(session, AccessToken)
        # Get all user tokens and delete them
        
        result = await session.execute(
            select(AccessToken).where(AccessToken.user_id == user_id)
        )
        tokens = result.scalars().all()
        
        for token in tokens:
            await access_tokens_db.delete(token.token)

async def revoke_customer_tokens(customer_id: uuid.UUID):
    """Revoke all tokens for a specific customer"""
    async with get_async_session() as session:
        access_tokens_db = SQLAlchemyAccessTokenDatabase(session, AccessToken)
        result = await session.execute(
            select(AccessToken).where(AccessToken.user_id == customer_id)
        )
        tokens = result.scalars().all()
        for token in tokens:
            await access_tokens_db.delete(token.token)

async def revoke_token(token: str):
    """Revoke a specific token"""
    
    async with get_async_session() as session:
        access_tokens_db = SQLAlchemyAccessTokenDatabase(session, AccessToken)
        await access_tokens_db.delete(token)

async def cleanup_expired_tokens():
    """Clean up expired tokens - can be called by a background task"""
    from sqlalchemy import delete
    
    async with get_async_session() as session:
        # Calculate expiry time based on your token lifetime
        expiry_time = datetime.now(UTC) - timedelta(seconds=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60)
        
        await session.execute(
            delete(AccessToken).where(AccessToken.created_at < expiry_time)
        )
        await session.commit()

# Background task for token cleanup (optional)
# from fastapi import BackgroundTasks

# async def schedule_token_cleanup(background_tasks: BackgroundTasks):
#     """Schedule token cleanup as a background task"""
#     background_tasks.add_task(cleanup_expired_tokens)