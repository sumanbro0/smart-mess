from fastapi import APIRouter, Depends,  HTTPException,  status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID
from db.session import get_async_session
from auth.models import User
from auth.security import current_active_user
from .schema import MessRead, MessCreate, MessUpdate
from mess.crud import mess_crud
from auth.enums import UserRole
from auth.schemas import RoleRead
from mess.models import Mess, mess_staff
from sqlalchemy import select

router = APIRouter(prefix="/mess", tags=["mess"])


@router.get("/", response_model=List[MessRead])
async def get_messes(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(current_active_user)
):
    """Get all messes for current user"""
    return await mess_crud.get_user_messes(db, user_id=current_user.id, skip=skip, limit=limit)



@router.get("/{slug}", response_model=MessRead)
async def get_mess_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(current_active_user),
):
    """Get mess by slug"""
    mess = await mess_crud.get_by_slug(db, slug=slug)
    if not mess or mess.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Mess not found")
    return mess




@router.get("/{slug}/whoami",response_model=RoleRead)
async def whoami(slug:str,current_user: User = Depends(current_active_user),db:AsyncSession=Depends(get_async_session)):

    mess=await db.execute(select(Mess).where(Mess.slug==slug))
    mess=mess.scalar_one_or_none()
    if not mess:
        raise HTTPException(status_code=404,detail="Mess not found")
    
    if mess.owner_id==current_user.id:
        return RoleRead(id=mess.id,role="owner")
    
    is_staff=await db.execute(select(mess_staff).where(mess_staff.c.user_id==current_user.id,mess_staff.c.mess_id==mess.id))
    is_staff=is_staff.scalar_one_or_none()
    if is_staff:
        return RoleRead(id=mess.id,role=UserRole.STAFF)
    
    return RoleRead(id=mess.id,role=UserRole.CUSTOMER)


@router.get("/{mess_id}", response_model=MessRead)
async def get_mess(
    mess_id: UUID,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(current_active_user),
):
    """Get specific mess"""

    mess = await mess_crud.get(db, id=mess_id)
    if not mess or mess.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Mess not found")
    return mess


@router.post("/", response_model=MessRead, status_code=status.HTTP_201_CREATED)
async def create_mess(
    mess_data: MessCreate,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(current_active_user),
):
    """Create new mess"""
    mess_data.owner_id = current_user.id

    mess_data.slug = mess_data.slug.lower()
    if await mess_crud.get_by_slug(db, slug=mess_data.slug):
        raise HTTPException(status_code=400, detail="Mess with this slug already exists")
     

    return await mess_crud.create(db, obj_in=mess_data)


@router.put("/{mess_id}", response_model=MessRead)
async def update_mess(
    mess_id: UUID,
    mess_data: MessUpdate,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(current_active_user),
):
    """Update mess"""
    mess = await mess_crud.get(db, id=mess_id)
  
    if not mess or mess.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Mess not found")
    
    existing_mess=await mess_crud.get_by_slug(db,slug=mess_data.slug)

    if existing_mess and existing_mess.id != mess_id:
        raise HTTPException(status_code=400, detail="Mess with this slug already exists")


    return await mess_crud.update(db, db_obj=mess, obj_in=mess_data)


@router.delete("/{mess_id}")
async def delete_mess(
    mess_id: UUID,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(current_active_user)
):
    """Delete mess"""
    mess = await mess_crud.get(db, id=mess_id)
    if not mess or mess.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Mess not found")
    await mess_crud.remove(db, id=mess_id)
    return {"message": "Mess deleted successfully"}