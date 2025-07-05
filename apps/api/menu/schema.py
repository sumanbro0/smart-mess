from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid
from .enums import SpicinessEnum


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
    image: Optional[str] = None
    slug: str
    description: Optional[str] = None
    is_active: bool = True
    mess_id: Optional[uuid.UUID] = None


class MenuItemCategoryDisplay(BaseModel):
    name:str

class MenuItemCategoryCreate(MenuItemCategoryBase):
    pass

class MenuItemCategoryUpdate(BaseModel):
    name: Optional[str] = None
    image: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    mess_id: Optional[uuid.UUID] = None

class CategoryResponse(MenuItemCategoryBase):
    id: uuid.UUID


class MenuItemCategoryResponse(MenuItemCategoryBase):
    id: uuid.UUID
    mess_id: uuid.UUID

    class Config:
        from_attributes = True

class MenuItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    in_stock: bool = True
    is_active: bool = True
    calories: Optional[float] = None
    spiciness: Optional[SpicinessEnum] = None
    primary_image: Optional[str] = None
    images: Optional[List[str]] = None
    is_veg: bool = False

    class Config:
        use_enum_values = True

class MenuItemCreate(MenuItemBase):
    mess_id: Optional[uuid.UUID] = None
    category_id: uuid.UUID
    primary_image: Optional[str] = None
    images: Optional[List[str]] = Field(default=[], description="List of image file data")

class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    in_stock: Optional[bool] = None
    category_id: Optional[uuid.UUID] = None
    is_active: Optional[bool] = None
    calories: Optional[float] = None
    spiciness: Optional[SpicinessEnum] = None
    is_veg: Optional[bool] = None
    primary_image: Optional[str] = None
    images: Optional[List[str]] = Field(None, description="List of image file data")

class MenuItemResponse(MenuItemBase):
    id: uuid.UUID
    mess_id: uuid.UUID
    category_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    images: Optional[List[str]] = [] 
  

    class Config:
        from_attributes = True

class MenuItemDisplayResponse(MenuItemBase):
    id: uuid.UUID
    category:Optional[MenuItemCategoryDisplay] = None
   

class MenuItemCreateResponse(BaseModel):
    id: uuid.UUID

MenuItemCategoryResponse.model_rebuild()
MenuItemResponse.model_rebuild()