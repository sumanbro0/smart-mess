from typing import List, Optional
from uuid import UUID
from async_lru import alru_cache
from sqlalchemy import select,insert
from sqlalchemy.ext.asyncio import AsyncSession
from db.session import get_async_session
from .models import Mess
from .schema import MessCreate, MessUpdate

@alru_cache(maxsize=100, ttl=300)
async def _get_mess_by_slug_cached(slug: str) -> Optional[Mess]:
    async for db in get_async_session():  
        result = await db.execute(select(Mess).filter(Mess.slug == slug))
        mess = result.scalar_one_or_none()
        if mess:
            db.expunge(mess)
        return mess
        break  

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
        obj_in: MessCreate,
    ) -> Mess:
        """Create a new mess"""
        
        

        db_obj = Mess(
            name=obj_in.name,
            description=obj_in.description,
            address=obj_in.address,
            owner_id=obj_in.owner_id,
            is_active=obj_in.is_active,
            currency=obj_in.currency,
            logo=obj_in.logo,
            slug=obj_in.slug,
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


        print("***************************")
        print(obj_in)
        print("***************************")
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
            if field == 'slug':
                print(f"db_obj.slug after setattr: {db_obj.slug}") 
        await db.commit()
        await db.refresh(db_obj)
        _get_mess_by_slug_cached.cache_clear()
        print("***************************")
        print(db_obj.slug)
        print("***************************")
        return db_obj

    async def remove(self, db: AsyncSession, id: UUID) -> None:
        """Delete a mess"""
        obj = await self.get(db, id)
        _get_mess_by_slug_cached.cache_clear()
        if obj:
            await db.delete(obj)
            await db.commit()

    async def get_by_slug(self, db: AsyncSession, slug: str) -> Optional[Mess]:
        """Get a mess by slug"""

        return await _get_mess_by_slug_cached(slug)

    



# Create a singleton instance
mess_crud = MessCRUD() 