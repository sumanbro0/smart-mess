from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum
import uuid

class SpicinessEnum(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

# Base schemas
class MenuItemImageBase(BaseModel):
    is_primary: bool = False

class MenuItemImageCreate(MenuItemImageBase):
    image: bytes = Field(..., description="Image file data")

class MenuItemImageUpdate(BaseModel):
    image: Optional[bytes] = Field(None, description="Image file data")
    is_primary: Optional[bool] = None

class MenuItemImageResponse(MenuItemImageBase):
    id: uuid.UUID
    image_url: str
    menu_item_id: uuid.UUID

    class Config:
        from_attributes = True

class MenuItemCategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = True

class MenuItemCategoryCreate(MenuItemCategoryBase):
    menu_id: uuid.UUID

class MenuItemCategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class MenuItemCategoryResponse(MenuItemCategoryBase):
    id: uuid.UUID
    menu_id: uuid.UUID
    menu_items: Optional[List['MenuItemResponse']] = []

    class Config:
        from_attributes = True

class MenuItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: int
    in_stock: bool = True
    is_active: bool = True
    calories: Optional[int] = None
    spiciness: Optional[SpicinessEnum] = None
    is_veg: bool = False

class MenuItemCreate(MenuItemBase):
    menu_id: uuid.UUID
    category_id: uuid.UUID
    images: Optional[List[bytes]] = Field(default=[], description="List of image file data")

class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[int] = None
    in_stock: Optional[bool] = None
    category_id: Optional[uuid.UUID] = None
    is_active: Optional[bool] = None
    calories: Optional[int] = None
    spiciness: Optional[SpicinessEnum] = None
    is_veg: Optional[bool] = None
    images: Optional[List[bytes]] = Field(None, description="List of image file data")

class MenuItemResponse(MenuItemBase):
    id: uuid.UUID
    menu_id: uuid.UUID
    category_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    images: List[MenuItemImageResponse] = []
    category: Optional[MenuItemCategoryResponse] = None

    class Config:
        from_attributes = True

class MenuBase(BaseModel):
    title: str
    description: Optional[str] = None
    is_active: bool = True

class MenuCreate(MenuBase):
    mess_id: uuid.UUID
    image: Optional[bytes] = Field(None, description="Menu image file data")

class MenuUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    image: Optional[bytes] = Field(None, description="Menu image file data")

class MenuResponse(MenuBase):
    id: uuid.UUID
    mess_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    image_url: Optional[str] = None
    items: List[MenuItemResponse] = []
    categories: List[MenuItemCategoryResponse] = []

    class Config:
        from_attributes = True

MenuItemCategoryResponse.model_rebuild()
MenuItemResponse.model_rebuild()