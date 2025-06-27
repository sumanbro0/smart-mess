from fastapi import UploadFile
from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from mess_table.schema import MessTableRead

# Mess Schemas
class MessRead(BaseModel):
    id: UUID
    name: str
    slug: str
    description: Optional[str] = None
    address: Optional[str] = None
    owner_id: UUID
    created_at: datetime
    updated_at: datetime
    is_active: bool = True
    currency: str = "NPR"
    logo: Optional[str] = None


class MessCreate(BaseModel):
    name: str = Field(..., min_length=1)
    slug: str = Field(..., min_length=1)
    description: Optional[str] = None
    address: Optional[str] = None
    owner_id: Optional[UUID] = None
    is_active: Optional[bool] = True
    currency: Optional[str] = "NPR"
    logo: Optional[str] = None


class MessUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1)
    slug: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = None
    address: Optional[str] = None
    is_active: Optional[bool] = None
    currency: Optional[str] = None
    logo: Optional[str] = None

MessRead.model_rebuild()






