from typing import List, Optional, Dict, Any
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .models import Mess
from .schema import MessCreate, MessUpdate


class MessCRUD:
    async def get(self, db: AsyncSession, id: UUID) -> Optional[Mess]:
        """Get a single mess by ID"""
        result = await db.execute(select(Mess).filter(Mess.id == id))
        return result.scalar_one_or_none()

    async def get_user_messes(
        self, 
        db: AsyncSession, 
        user_id: UUID, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[Mess]:
        """Get all messes for a specific user with pagination"""
        result = await db.execute(
            select(Mess)
            .filter(Mess.owner_id == user_id)
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def create(
        self, 
        db: AsyncSession, 
        obj_in: MessCreate
    ) -> Mess:
        """Create a new mess"""
        db_obj = Mess(
            name=obj_in.name,
            description=obj_in.description,
            address=obj_in.address,
            owner_id=obj_in.owner_id,
            is_active=obj_in.is_active
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def update(
        self,
        db: AsyncSession,
        db_obj: Mess,
        obj_in: MessUpdate
    ) -> Mess:
        """Update a mess"""
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def remove(self, db: AsyncSession, id: UUID) -> None:
        """Delete a mess"""
        obj = await self.get(db, id)
        if obj:
            await db.delete(obj)
            await db.commit()


# Create a singleton instance
mess_crud = MessCRUD() 