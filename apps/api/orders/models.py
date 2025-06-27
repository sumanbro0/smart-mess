from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Enum as SqlEnum
from enum import Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime,UTC
import uuid
from db.base import Base

class OrderStatusEnum(Enum):
    PENDING = "pending"
    RECEIVED = "received"
    PREPARING = "preparing"
    READY = "ready"
    SERVED = "served"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class OrderTransactionStatusEnum(Enum):
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("user.id"), nullable=False)
    mess_id = Column(UUID(as_uuid=True), ForeignKey("mess.id"), nullable=False)
    table_id = Column(UUID(as_uuid=True), ForeignKey("mess_tables.id"), nullable=False)
    status = Column(SqlEnum(OrderStatusEnum), nullable=False, default=OrderStatusEnum.PENDING)
    created_at = Column(DateTime, default=datetime.now(UTC))
    updated_at = Column(DateTime, default=datetime.now(UTC), onupdate=datetime.now(UTC))
    mess = relationship("Mess", back_populates="orders")
    table = relationship("MessTable", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")
    transactions = relationship("OrderTransaction", back_populates="order")

    # TODO: Add customer relationship
    # customer = relationship("User", back_populates="orders")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False)
    menu_item_id = Column(UUID(as_uuid=True), ForeignKey("menu_item.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Integer, nullable=False)
    order = relationship("Order", back_populates="items")
    menu_item = relationship("MenuItem", back_populates="orders")


class OrderTransaction(Base):
    __tablename__ = "order_transactions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False)
    transaction_id = Column(String, nullable=False)
    amount = Column(Integer, nullable=False)
    status = Column(SqlEnum(OrderTransactionStatusEnum), nullable=False, default=OrderTransactionStatusEnum.PENDING)
    created_at = Column(DateTime, default=datetime.now(UTC))
    updated_at = Column(DateTime, default=datetime.now(UTC), onupdate=datetime.now(UTC))
    order = relationship("Order", back_populates="transactions")

