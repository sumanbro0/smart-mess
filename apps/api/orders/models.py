from sqlalchemy import Boolean, Column, String, Integer, DateTime, ForeignKey, Enum as SqlEnum
from enum import Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
from db.base import Base

class OrderStatusEnum(str,Enum):
    PENDING = "pending"
    RECEIVED = "received"
    PREPARING = "preparing"
    READY = "ready"
    SERVED = "served"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class OrderTransactionStatusEnum(str,Enum):
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"


class PaymentMethodEnum(str,Enum):
    CASH = "cash"
    ESEWA = "esewa"
    KHALTI = "khalti"
    STRIPE = "stripe"

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("customer.id"), nullable=False)
    mess_id = Column(UUID(as_uuid=True), ForeignKey("mess.id",ondelete="CASCADE"), nullable=False)
    table_id = Column(UUID(as_uuid=True), ForeignKey("mess_tables.id",ondelete="SET NULL"), nullable=True)
    status = Column(SqlEnum(OrderStatusEnum), nullable=False, default=OrderStatusEnum.PENDING)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), 
    onupdate=lambda: datetime.now(timezone.utc))
    is_cancelled = Column(Boolean, default=False)
    has_added_items = Column(Boolean, default=False)
    mess = relationship("Mess", back_populates="orders")
    table = relationship("MessTable", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")
    transaction = relationship("OrderTransaction", back_populates="order",uselist=False)
    customer = relationship("Customer", back_populates="orders")


    @property
    def total_price(self) -> int:
        return sum(item.total_price for item in self.items if not item.is_cancelled)



class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    menu_item_id = Column(UUID(as_uuid=True), ForeignKey("menu_item.id", ondelete="SET NULL"), nullable=True)
    quantity = Column(Integer, nullable=False)
    total_price = Column(Integer, nullable=False)
    is_cancelled = Column(Boolean, default=False)
    order = relationship("Order", back_populates="items")
    menu_item = relationship("MenuItem", back_populates="orders")


class OrderTransaction(Base):
    __tablename__ = "order_transactions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id",ondelete="CASCADE"), nullable=False,unique=True)
    transaction_id = Column(String, nullable=False)
    amount = Column(Integer, nullable=False)
    currency = Column(String, nullable=False)
    payment_method = Column(SqlEnum(PaymentMethodEnum), nullable=False)
    status = Column(SqlEnum(OrderTransactionStatusEnum), nullable=False, default=OrderTransactionStatusEnum.PENDING)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    order = relationship("Order", back_populates="transaction")

