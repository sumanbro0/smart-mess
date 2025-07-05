from sqlalchemy import ARRAY, Column, Float, String, Boolean, DateTime, ForeignKey, Enum as SqlEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime,UTC, timezone
import uuid
from db.base import Base
from .enums import SpicinessEnum





class MenuItem(Base):
    __tablename__ = "menu_item"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    mess_id = Column(UUID(as_uuid=True), ForeignKey("mess.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    price = Column(Float, nullable=False)
    in_stock = Column(Boolean, default=True)
    category_id = Column(UUID(as_uuid=True), ForeignKey("menu_item_category.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    calories = Column(Float, nullable=True)
    spiciness = Column(SqlEnum(SpicinessEnum), nullable=True)
    is_veg = Column(Boolean, default=False)
    primary_image = Column(String, nullable=True)
    images = Column(ARRAY(String), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    # relationships
    category = relationship("MenuItemCategory", back_populates="menu_items")
    orders = relationship("OrderItem", back_populates="menu_item")
    mess = relationship("Mess", back_populates="menu_items")



class MenuItemCategory(Base):
    __tablename__ = "menu_item_category"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    image = Column(String, nullable=True)
    slug = Column(String, nullable=False, unique=True)
    description = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    menu_items = relationship("MenuItem", back_populates="category")
    mess_id = Column(UUID(as_uuid=True), ForeignKey("mess.id"), nullable=False)
    mess = relationship("Mess", back_populates="menu_item_categories")



