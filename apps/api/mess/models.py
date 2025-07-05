from sqlalchemy import Column, String,  Boolean, DateTime, ForeignKey, Table, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime,UTC, timezone
import uuid
from db.base import Base

mess_customer = Table('mess_customer', Base.metadata,
    Column('user_id', UUID(as_uuid=True), ForeignKey('user.id')),
    Column('mess_id', UUID(as_uuid=True), ForeignKey('mess.id'))
)

mess_staff = Table('mess_staff', Base.metadata,
    Column('user_id', UUID(as_uuid=True), ForeignKey('user.id')),
    Column('mess_id', UUID(as_uuid=True), ForeignKey('mess.id'))
)

class Mess(Base):
    __tablename__ = "mess"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    slug = Column(String, nullable=False, unique=True, 
              server_default=text('gen_random_uuid()::text'))    
    description = Column(String, nullable=True)
    address = Column(String, nullable=True)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("user.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    currency = Column(String, default="NPR")
    logo = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    tables = relationship("MessTable", back_populates="mess")
    orders = relationship("Order", back_populates="mess")
    menu_items = relationship("MenuItem", back_populates="mess")
    menu_item_categories = relationship("MenuItemCategory", back_populates="mess")
    owner = relationship("User",  back_populates="messes")
    staff = relationship("User", secondary="mess_staff", back_populates="messes_as_staff")

    # TODO: Add customer Before adding this.
    # customers = relationship("User", secondary="mess_customer", back_populates="messes_as_customer")