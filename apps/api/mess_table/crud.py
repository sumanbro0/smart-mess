from typing import List, Optional, Dict, Any
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .models import MessTable
from .schema import MessTableCreate, MessTableUpdate


class MessTableCRUD:
    async def get(self, db: AsyncSession, id: UUID) -> Optional[MessTable]:
        """Get a single mess table by ID"""
        result = await db.execute(select(MessTable).filter(MessTable.id == id))
        return result.scalar_one_or_none()

    async def get_by_mess(
        self, 
        db: AsyncSession, 
        mess_id: UUID, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[MessTable]:
        """Get all tables for a specific mess with pagination"""
        result = await db.execute(
            select(MessTable)
            .filter(MessTable.mess_id == mess_id)
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def create(
        self, 
        db: AsyncSession, 
        obj_in: MessTableCreate
    ) -> MessTable:
        """Create a new mess table"""
        db_obj = MessTable(
            name=obj_in.name,
            capacity=obj_in.capacity,
            mess_id=obj_in.mess_id,
            is_available=obj_in.is_available
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def update(
        self,
        db: AsyncSession,
        db_obj: MessTable,
        obj_in: MessTableUpdate
    ) -> MessTable:
        """Update a mess table"""
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def remove(self, db: AsyncSession, id: UUID) -> None:
        """Delete a mess table"""
        obj = await self.get(db, id)
        if obj:
            await db.delete(obj)
            await db.commit()


# Create a singleton instance
mess_table_crud = MessTableCRUD() 