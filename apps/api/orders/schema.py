from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum
import uuid
from auth.schemas import UserRead
from mess.schema import MessRead
from mess_table.schema import MessTableRead
from menu.schema import MenuItemResponse

class OrderStatusEnum(str, Enum):
    PENDING = "pending"
    RECEIVED = "received"
    PREPARING = "preparing"
    READY = "ready"
    SERVED = "served"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class OrderTransactionStatusEnum(str, Enum):
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"

# OrderItem schemas
class OrderItemBase(BaseModel):
    quantity: int = Field(..., gt=0)
    price: int = Field(..., ge=0)

class OrderItemCreate(OrderItemBase):
    menu_item_id: uuid.UUID

class OrderItemUpdate(BaseModel):
    quantity: Optional[int] = Field(None, gt=0)

class OrderItemResponse(OrderItemBase):
    id: uuid.UUID
    order_id: uuid.UUID
    menu_item_id: uuid.UUID
    menu_item: Optional['MenuItemResponse'] = None

    class Config:
        from_attributes = True

# OrderTransaction schemas
class OrderTransactionBase(BaseModel):
    transaction_id: str
    amount: int = Field(..., ge=0)
    status: OrderTransactionStatusEnum = OrderTransactionStatusEnum.PENDING

class OrderTransactionCreate(OrderTransactionBase):
    order_id: uuid.UUID

class OrderTransactionUpdate(BaseModel):
    status: Optional[OrderTransactionStatusEnum] = None
    amount: Optional[int] = Field(None, ge=0)

class OrderTransactionResponse(OrderTransactionBase):
    id: uuid.UUID
    order_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Order schemas
class OrderBase(BaseModel):
    status: OrderStatusEnum = OrderStatusEnum.PENDING

class OrderCreate(OrderBase):
    customer_id: uuid.UUID
    mess_id: uuid.UUID
    table_id: uuid.UUID
    items: List[OrderItemCreate] = Field(..., min_items=1)

class OrderUpdate(BaseModel):
    status: Optional[OrderStatusEnum] = None
    table_id: Optional[uuid.UUID] = None

class OrderResponse(OrderBase):
    id: uuid.UUID
    customer_id: uuid.UUID
    mess_id: uuid.UUID
    table_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse] = []
    transactions: List[OrderTransactionResponse] = []
    customer: Optional['UserRead'] = None
    mess: Optional['MessRead'] = None
    table: Optional['MessTableRead'] = None

    @property
    def total_amount(self) -> int:
        return sum(item.price * item.quantity for item in self.items)

    class Config:
        from_attributes = True

# Forward reference updates
OrderItemResponse.model_rebuild()
OrderResponse.model_rebuild()