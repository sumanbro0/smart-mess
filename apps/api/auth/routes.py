from typing import List
from fastapi import APIRouter, Header
from auth.security import fastapi_users,auth_backend
from auth.schemas import UserRead, UserCreate
from auth.oauth2 import oauth2_router
from auth.models import User
from fastapi import Depends
from auth.security import current_active_user
from db.session import get_async_session
from sqlalchemy.ext.asyncio import AsyncSession
from mess.models import Mess, mess_customer
from sqlalchemy import select

router = APIRouter(prefix="/auth",tags=["auth"])


router.include_router(
    fastapi_users.get_auth_router(auth_backend),

)

router.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),

)

router.include_router(oauth2_router, prefix="/google")


router.include_router(
    fastapi_users.get_reset_password_router(),

)

router.include_router(
    fastapi_users.get_verify_router(UserRead),

)


@router.get("/my-customers", response_model=List[UserRead])
async def my_customers(
    current_user: User = Depends(current_active_user),
    db: AsyncSession = Depends(get_async_session),
    mess_id: str = Header(None, alias="MessId")
):
    # Query User entities that are customers of current_user's messes
    stmt = (
        select(User)
        .join(mess_customer, User.id == mess_customer.c.user_id)
        .join(Mess, mess_customer.c.mess_id == Mess.id)
        .where(Mess.owner_id == current_user.id)
    )
    
    if mess_id:
        stmt = stmt.where(Mess.id == mess_id)
    
    result = await db.execute(stmt)
    customers = result.scalars().all()
    
    return customers


router.get("/my-staff")
async def my_staff(current_user: User = Depends(current_active_user)):
    return current_user.messes_as_staff
