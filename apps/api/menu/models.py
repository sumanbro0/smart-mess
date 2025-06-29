from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Enum as SqlEnum
from enum import Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime,UTC, timezone
import uuid
from db.base import Base


class SpicinessEnum(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class Menu(Base):
    __tablename__ = "menu"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    mess_id = Column(UUID(as_uuid=True), ForeignKey("mess.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    is_active = Column(Boolean, default=True)
    image = Column(String, nullable=True)
    mess = relationship("Mess", back_populates="menus")
    items = relationship("MenuItem", back_populates="menu")
    categories = relationship("MenuItemCategory", back_populates="menu")

class MenuItem(Base):
    __tablename__ = "menu_item"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    menu_id = Column(UUID(as_uuid=True), ForeignKey("menu.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    price = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    in_stock = Column(Boolean, default=True)
    category_id = Column(UUID(as_uuid=True), ForeignKey("menu_item_category.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    calories = Column(Integer, nullable=True)
    spiciness = Column(SqlEnum(SpicinessEnum), nullable=True)
    is_veg = Column(Boolean, default=False)
    images = relationship("MenuItemImage", back_populates="menu_item")
    menu = relationship("Menu", back_populates="items")
    category = relationship("MenuItemCategory", back_populates="menu_items")
    orders = relationship("OrderItem", back_populates="menu_item")

class MenuItemImage(Base):
    __tablename__ = "menu_item_image"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    image = Column(String, nullable=False)
    is_primary = Column(Boolean, default=False)
    menu_item_id = Column(UUID(as_uuid=True), ForeignKey("menu_item.id"), nullable=False)
    menu_item = relationship("MenuItem", back_populates="images")

class MenuItemCategory(Base):
    __tablename__ = "menu_item_category"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    menu_id = Column(UUID(as_uuid=True), ForeignKey("menu.id"), nullable=False)
    menu_items = relationship("MenuItem", back_populates="category")
    menu = relationship("Menu", back_populates="categories")


