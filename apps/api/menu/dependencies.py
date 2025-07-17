from fastapi import Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from db.session import get_async_session
from mess.crud import mess_crud
from auth.security import current_active_user
from mess.models import mess_staff

class MessContext:
    def __init__(self, mess, user, is_owner: bool = False, is_staff: bool = False):
        self.mess = mess
        self.user = user
        self.is_owner = is_owner
        self.is_staff = is_staff
        self.can_modify = is_owner or is_staff

async def get_mess_and_user_context(
    mess_slug: str,
    db: AsyncSession = Depends(get_async_session),
    current_user = Depends(current_active_user)
) -> MessContext:
    """Get mess and check if user has access"""
    mess = await mess_crud.get_by_slug(db, mess_slug)
    if not mess:
        raise HTTPException(status_code=404, detail="Mess not found")
    
    is_owner = mess.owner_id == current_user.id
    if not is_owner:
        is_staff = await db.execute(
            select(mess_staff).where(
                mess_staff.c.user_id == current_user.id,
                mess_staff.c.mess_id == mess.id
            )
        ).scalar_one_or_none() is not None
    else:
        is_staff = True
    
    return MessContext(mess, current_user, is_owner, is_staff)

async def require_mess_access(
    context: MessContext = Depends(get_mess_and_user_context)
) -> MessContext:
    """Require user to be owner or staff"""
    if not context.can_modify:
        raise HTTPException(
            status_code=403, 
            detail="You don't have permission to modify this mess"
        )
    return context
