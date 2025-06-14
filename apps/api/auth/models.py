from datetime import datetime
from sqlalchemy import Column, Enum, Integer, String, Boolean, DateTime
import uuid
from sqlalchemy.dialects.postgresql import UUID
from fastapi_users.db import SQLAlchemyBaseUserTableUUID  # Changed import
from .enums import UserRole
from fastapi_users_db_sqlalchemy.access_token import (
    SQLAlchemyBaseAccessTokenTableUUID,
)
from db.base import Base

class AccessToken(SQLAlchemyBaseAccessTokenTableUUID, Base):
    pass

class User(SQLAlchemyBaseUserTableUUID, Base):  # Changed to UUID version
    name = Column(String, nullable=True)
    image = Column(String, nullable=True, default="https://avatar.tobi.sh/jane")
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.USER, nullable=False)
    created_at = Column(DateTime, default=datetime.now)  # Fixed: removed ()