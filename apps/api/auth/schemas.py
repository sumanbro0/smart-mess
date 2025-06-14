from typing import Optional
from datetime import datetime
from pydantic import EmailStr
from fastapi_users import schemas
from uuid import UUID
from .enums import UserRole

class UserRead(schemas.BaseUser[UUID]):
    id: UUID
    email: EmailStr
    name: Optional[str] = None
    image: Optional[str] = None
    is_active: bool = True
    is_superuser: bool = False
    is_verified: bool = False
    role: UserRole= UserRole.USER
    created_at: datetime


class UserCreate(schemas.BaseUserCreate):
    email: EmailStr
    password: str
    name: Optional[str] = None
    image: Optional[str] = None
    is_active: Optional[bool] = True
    is_superuser: Optional[bool] = False
    is_verified: Optional[bool] = False
    role: Optional[UserRole] = UserRole.USER


class UserUpdate(schemas.BaseUserUpdate):
    password: Optional[str] = None
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    image: Optional[str] = None
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None
    is_verified: Optional[bool] = None
    role: Optional[UserRole] = None
