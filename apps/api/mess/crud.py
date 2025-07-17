from typing import List, Optional
from uuid import UUID
from sqlalchemy import select,insert
from sqlalchemy.ext.asyncio import AsyncSession
from auth.models import Customer
from .models import Mess,mess_customer
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
        print("***************************")
        print(db_obj.slug)
        print("***************************")
        return db_obj

    async def remove(self, db: AsyncSession, id: UUID) -> None:
        """Delete a mess"""
        obj = await self.get(db, id)
        if obj:
            await db.delete(obj)
            await db.commit()

    async def get_by_slug(self, db: AsyncSession, slug: str) -> Optional[Mess]:
        """Get a mess by slug"""
        result = await db.execute(select(Mess).filter(Mess.slug == slug))
        return result.scalar_one_or_none()
    
    async def add_customer(self, db: AsyncSession, slug: str, customer: Customer) -> None:
        """Add a customer to a mess"""
        mess = await self.get_by_slug(db, slug)
        
        if not mess:
            raise ValueError(f"Mess with slug '{slug}' not found")
        
        # Direct insert into association table
        stmt = insert(mess_customer).values(
            mess_id=mess.id,
            customer_id=customer.id
        )
        
        await db.execute(stmt)
        await db.commit()
    



# Create a singleton instance
mess_crud = MessCRUD() 