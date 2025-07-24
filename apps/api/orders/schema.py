from locale import currency
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
import uuid
from auth.schemas import UserRead
from mess.schema import MessRead
from mess_table.schema import MessTableRead
from menu.schema import MenuItemResponse
from .models import OrderStatusEnum, OrderTransactionStatusEnum,PaymentMethodEnum


# OrderItem schemas
class OrderItemBase(BaseModel):
    quantity: int = Field(..., gt=0)
    total_price: Optional[int] = Field(..., ge=0)
    is_cancelled: bool = False

class OrderItemCreate(OrderItemBase):
    menu_item_id: uuid.UUID
    total_price: Optional[int] = None

class OrderItemUpdate(BaseModel):
    quantity: Optional[int] = Field(None, gt=0)


class OrderItemResponse(OrderItemBase):
    id: uuid.UUID
    order_id: uuid.UUID
    menu_item_id: uuid.UUID
    menu_item: Optional['MenuItemResponse'] = None

    class Config:
        from_attributes = True


class CustomerOrderItemResponse(BaseModel):
    items: List[OrderItemResponse]
    currency: str
    status: OrderStatusEnum
    total_price: int
    is_paid: bool
    transaction: Optional["OrderTransactionResponse"] = None

class AdminOrderItemResponse(BaseModel):
    items: List[OrderItemResponse]
    currency: str
    status: OrderStatusEnum
    total_price: int
    is_paid: bool
    transaction: Optional["OrderTransactionResponse"] = None



# OrderTransaction schemas
class OrderTransactionBase(BaseModel):
    transaction_id: str
    amount: int = Field(..., ge=0)
    status: OrderTransactionStatusEnum = OrderTransactionStatusEnum.PENDING
    payment_method: PaymentMethodEnum

    class Config:
        from_attributes = True

class OrderTransactionCreate(OrderTransactionBase):
    order_id: uuid.UUID

class OrderTransactionUpdate(BaseModel):
    status: Optional[OrderTransactionStatusEnum] = None
    amount: Optional[int] = Field(None, ge=0)

class OrderTransactionResponse(OrderTransactionBase):
    id: uuid.UUID
    order_id: uuid.UUID
    payment_url: str
    payment_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Order schemas
class OrderBase(BaseModel):
    status: OrderStatusEnum = OrderStatusEnum.PENDING

class OrderCreate(OrderBase):
    table_id: uuid.UUID
    items: List[OrderItemCreate] = Field(..., min_items=1)

class OrderUpdate(BaseModel):
    status: Optional[OrderStatusEnum] = None
    table_id: Optional[uuid.UUID] = None
    is_cancelled: Optional[bool] = None


class LiteOrderResponse(BaseModel):
    id: uuid.UUID
    customer_id: uuid.UUID
    mess_id: uuid.UUID
    table_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse] = []
    total_price: int

    class Config:
        from_attributes = True




class AdminOrderResponse(BaseModel):
    id: uuid.UUID
    table_id: Optional[uuid.UUID] = None
    created_at: datetime
    status: OrderStatusEnum
    total_price: int
    has_added_items: bool
    customer: Optional['UserRead'] = None
    table: Optional['MessTableRead'] = None
    transaction: Optional["OrderTransactionBase"] = None

    @property
    def is_paid(self):
        return self.transaction and self.transaction.status == OrderTransactionStatusEnum.SUCCESS

    class Config:
        from_attributes = True

class MyOrderResponse(BaseModel):
    orders:List[AdminOrderResponse]
    currency:str

    class Config:
        from_attributes = True

    




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
    total_price: int

    class Config:
        from_attributes = True

class OrderCreateResponse(BaseModel):
    id: uuid.UUID
    table_id: uuid.UUID
    mess_id: uuid.UUID
    status: OrderStatusEnum

class OrderPopupResponse(BaseModel):
    id: uuid.UUID
    total_price: int
    currency: str

# Forward reference updates
OrderItemResponse.model_rebuild()
OrderResponse.model_rebuild()