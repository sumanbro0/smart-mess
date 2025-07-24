from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime


class MessTableRead(BaseModel):
    id: UUID
    table_name: str
    capacity: int
    mess_id: UUID
    created_at: datetime
    updated_at: datetime
    is_active: bool = True

    class Config:
        from_attributes = True


class MessTableCreate(BaseModel):
    table_name: str = Field(..., min_length=1)
    capacity: int = Field(..., gt=0)
    is_active: Optional[bool] = True


class MessTableUpdate(BaseModel):
    table_name: Optional[str] = Field(None, min_length=1)
    capacity: Optional[int] = Field(None, gt=0)
    is_active: Optional[bool] = None

