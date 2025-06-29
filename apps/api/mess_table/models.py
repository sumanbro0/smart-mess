from datetime import datetime,UTC, timezone
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from db.base import Base


class MessTable(Base):
    __tablename__ = "mess_tables"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    table_name = Column(String, nullable=False)
    capacity = Column(Integer, nullable=False)
    qr_code_url = Column(String, nullable=True)
    mess_id = Column(UUID(as_uuid=True), ForeignKey("mess.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    is_active = Column(Boolean, default=False)
    enabled = Column(Boolean, default=True)
    # Relationships
    mess = relationship("Mess", back_populates="tables")
    orders = relationship("Order", back_populates="table")


  