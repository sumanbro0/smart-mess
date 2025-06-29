from datetime import datetime
from fastapi_users_db_sqlalchemy import SQLAlchemyBaseOAuthAccountTableUUID, SQLAlchemyBaseUserTableUUID, SQLAlchemyUserDatabase
from sqlalchemy import Column, Enum, Integer, String, Boolean, DateTime, ForeignKey
import uuid
from sqlalchemy.dialects.postgresql import UUID
from fastapi_users_db_sqlalchemy.access_token import (
    SQLAlchemyBaseAccessTokenTableUUID,
)
from db.base import Base
from sqlalchemy.orm import relationship, selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends
from db.session import get_async_session
from fastapi_users_db_sqlalchemy.access_token import SQLAlchemyAccessTokenDatabase
from sqlalchemy.sql import select

class AccessToken(SQLAlchemyBaseAccessTokenTableUUID, Base):
    pass

class OAuthAccount(SQLAlchemyBaseOAuthAccountTableUUID, Base):
    __tablename__ = "oauth_account"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("user.id", ondelete="cascade"), nullable=False)
    user = relationship("User", back_populates="oauth_accounts")

class User(SQLAlchemyBaseUserTableUUID, Base):
    __tablename__ = "user"
    
    name = Column(String, nullable=True)
    image = Column(String, nullable=True, default="https://avatar.tobi.sh/jane")
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.now)
    oauth_accounts = relationship("OAuthAccount", back_populates="user", cascade="all, delete-orphan", lazy="selectin")
    messes = relationship("Mess", back_populates="owner")
    messes_as_staff=relationship("Mess", secondary="mess_staff", back_populates="staff")
    

# TODO: Add customer Table including following fields too.
# messes_as_customer=relationship("Mess", secondary="mess_customer", back_populates="customers")
# orders = relationship("Order", back_populates="customer")


class SQLAlchemyUserDatabaseLocal(SQLAlchemyUserDatabase):
    async def get_by_oauth_account(self, oauth: str, account_id: str):
        """Get user by OAuth account."""
        query = select(User).options(selectinload(User.oauth_accounts)).join(OAuthAccount).where(
            OAuthAccount.oauth_name == oauth,
            OAuthAccount.account_id == account_id
        )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def add_oauth_account(self, user: User, oauth_account_dict: dict) -> User:
        """Add OAuth account to user."""
        oauth_account = OAuthAccount(
            oauth_name=oauth_account_dict["oauth_name"],
            access_token=oauth_account_dict["access_token"],
            expires_at=oauth_account_dict.get("expires_at"),
            refresh_token=oauth_account_dict.get("refresh_token"),
            account_id=oauth_account_dict["account_id"],
            account_email=oauth_account_dict["account_email"],
            user_id=user.id
        )
        self.session.add(oauth_account)
        await self.session.flush()
        
        # Explicitly load the oauth_accounts relationship
        query = select(User).options(selectinload(User.oauth_accounts)).where(User.id == user.id)
        result = await self.session.execute(query)
        user = result.scalar_one()
        return user
    
    

    async def update_oauth_account(self, user: User, oauth_account: OAuthAccount, update_dict: dict) -> User:
        """Update existing OAuth account."""
        # Update the OAuth account with new values
        oauth_account.access_token = update_dict["access_token"]
        oauth_account.expires_at = update_dict.get("expires_at")
        oauth_account.refresh_token = update_dict.get("refresh_token")
        oauth_account.account_email = update_dict["account_email"]


        await self.session.flush()
        
        # Reload user with updated oauth_accounts
        query = select(User).options(selectinload(User.oauth_accounts)).where(User.id == user.id)
        result = await self.session.execute(query)
        user = result.scalar_one()
        return user

async def get_access_token_db(session: AsyncSession = Depends(get_async_session)):
    yield SQLAlchemyAccessTokenDatabase(session, AccessToken)
