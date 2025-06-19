from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from mess_table.schema import MessTableRead

# Mess Schemas
class MessRead(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    address: Optional[str] = None
    owner_id: UUID
    created_at: datetime
    updated_at: datetime
    is_active: bool = True
    tables: Optional[List["MessTableRead"]] = []


class MessCreate(BaseModel):
    name: str = Field(..., min_length=1)
    description: Optional[str] = None
    address: Optional[str] = None
    owner_id: UUID
    is_active: Optional[bool] = True


class MessUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = None
    address: Optional[str] = None
    is_active: Optional[bool] = None

MessRead.model_rebuild()






