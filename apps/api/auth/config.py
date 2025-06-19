from fastapi_users.authentication import (
    AuthenticationBackend,
    BearerTransport,
)
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends
from typing import Optional, AsyncGenerator
from fastapi_users.authentication.strategy import DatabaseStrategy
from db.session import get_async_session
from .models import AccessToken, User
from .main import UserManager
from fastapi_users_db_sqlalchemy.access_token import (
    SQLAlchemyAccessTokenDatabase,
)
# Authentication backend

# Custom Database Strategy with additional validation
class CustomDatabaseStrategy(DatabaseStrategy):
    def __init__(self, database: SQLAlchemyAccessTokenDatabase):

        super().__init__(database, lifetime_seconds=None)
    
    async def read_token(self, token: Optional[str], user_manager: UserManager) -> Optional[User]:
        if not token:
            return None
            
        # Get user from parent method
        user = await super().read_token(token, user_manager)
        if not user:
            return None
        
        # Add any custom validation logic here
        # For example, check if user is still active, role changes, etc.
        if not user.is_active:
            # User deactivated - invalidate token
            try:
                await self.database.delete(token)
            except Exception:
                pass  # Ignore deletion errors
            return None
            
        return user



# Function to get database strategy - Fixed dependency injection
async def get_database_strategy(
    session: AsyncSession = Depends(get_async_session)
) -> CustomDatabaseStrategy:
    access_tokens_db = SQLAlchemyAccessTokenDatabase(session, AccessToken)
    
    # Strategy with configurable lifetime (1 hour = 3600 seconds)
    return CustomDatabaseStrategy(
        access_tokens_db,
    )

# Bearer transport
bearer_transport = BearerTransport(tokenUrl=f"/auth/login")  # Fixed URL
auth_backend = AuthenticationBackend(
    name="database",
    transport=bearer_transport,
    get_strategy=get_database_strategy,    
)


