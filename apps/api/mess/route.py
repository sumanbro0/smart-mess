from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from db.session import get_async_session
from auth.models import User
from auth.security import current_active_user
from .schema import MessRead, MessCreate, MessUpdate
from mess.crud import mess_crud

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


@router.get("/{mess_id}", response_model=MessRead)
async def get_mess(
    mess_id: UUID,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(current_active_user)
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
    current_user: User = Depends(current_active_user)
):
    """Create new mess"""
    mess_data.owner_id = current_user.id
    return await mess_crud.create(db, obj_in=mess_data)


@router.put("/{mess_id}", response_model=MessRead)
async def update_mess(
    mess_id: UUID,
    mess_data: MessUpdate,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(current_active_user)
):
    """Update mess"""
    mess = await mess_crud.get(db, id=mess_id)
    if not mess or mess.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Mess not found")
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