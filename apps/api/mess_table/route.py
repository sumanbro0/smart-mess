from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from db.session import get_async_session
from auth.models import User
from auth.security import current_active_user
from .schema import MessTableRead, MessTableCreate, MessTableUpdate
from .crud import mess_table_crud
from mess.crud import mess_crud

router = APIRouter(prefix="/mess/{mess_id}/tables", tags=["mess-tables"])


@router.get("/", response_model=List[MessTableRead])
async def get_mess_tables(
    mess_id: UUID,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(current_active_user)
):
    """Get all tables for a specific mess"""
    mess = await mess_crud.get(db, id=mess_id)
    if not mess or mess.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Mess not found")
    return await mess_table_crud.get_by_mess(db, mess_id=mess_id, skip=skip, limit=limit)


@router.get("/{table_id}", response_model=MessTableRead)
async def get_mess_table(
    table_id: UUID,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(current_active_user)
):
    """Get specific table"""
    table = await mess_table_crud.get(db, id=table_id)
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    
    mess = await mess_crud.get(db, id=table.mess_id)
    if mess.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Table not found")
    return table


@router.post("/", response_model=MessTableRead, status_code=status.HTTP_201_CREATED)
async def create_mess_table(
    table_data: MessTableCreate,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(current_active_user)
):
    """Create new table"""
    mess = await mess_crud.get(db, id=table_data.mess_id)
    if not mess or mess.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Mess not found")
    return await mess_table_crud.create(db, obj_in=table_data)


@router.put("/{table_id}", response_model=MessTableRead)
async def update_mess_table(
    table_id: UUID,
    table_data: MessTableUpdate,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(current_active_user)
):
    """Update table"""
    table = await mess_table_crud.get(db, id=table_id)
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    
    mess = await mess_crud.get(db, id=table.mess_id)
    if mess.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Table not found")
    return await mess_table_crud.update(db, db_obj=table, obj_in=table_data)


@router.delete("/{table_id}")
async def delete_mess_table(
    table_id: UUID,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(current_active_user)
):
    """Delete table"""
    table = await mess_table_crud.get(db, id=table_id)
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    
    mess = await mess_crud.get(db, id=table.mess_id)
    if mess.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Table not found")
    
    await mess_table_crud.remove(db, id=table_id)
    return {"message": "Table deleted successfully"}