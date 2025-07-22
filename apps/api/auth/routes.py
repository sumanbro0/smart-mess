from fastapi import APIRouter, HTTPException, Query,status
from fastapi.security import OAuth2PasswordRequestForm
from .schemas import CustomerCreate, CustomerRead, CustomerSessionTokenRead, UserRead, UserCreate
from .oauth2 import oauth2_router,customer_oauth2_router
from .models import Customer, CustomerSessionToken, User
from fastapi import Depends
from .security import  fastapi_users,current_active_customer,fastapi_customer
from db.session import get_async_session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import  select
from uuid import UUID
from .config import CustomerDatabaseStrategy, auth_backend, customer_auth_backend, get_customer_database_strategy
from mess.crud import mess_crud
from .main import CustomerManager, get_customer_manager
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

@router.post("/customer/login")
async def customer_login(
    credentials: OAuth2PasswordRequestForm = Depends(),
    mess_slug: str = Query(...),
    strategy: CustomerDatabaseStrategy = Depends(get_customer_database_strategy),
    customer_manager: CustomerManager = Depends(get_customer_manager)
):
    print("********************** Customer Login **********************")
    print(credentials, mess_slug)
    print("**********************")
    user = await customer_manager.authenticate_with_mess(credentials, mess_slug)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    return await customer_auth_backend.login(strategy, user)


router.include_router(
    fastapi_customer.get_auth_router(customer_auth_backend),
    prefix="/customer",
    tags=["customer"],
)




router.include_router(
    fastapi_customer.get_register_router(CustomerRead, CustomerCreate),
    prefix="/customer",
    tags=["customer"],
)



router.include_router(customer_oauth2_router, prefix="/customer/google")


router.include_router(
    fastapi_customer.get_reset_password_router(),
    prefix="/customer",
    tags=["customer"],

)

router.include_router(
    fastapi_customer.get_verify_router(CustomerRead),
    prefix="/customer",
    tags=["customer"],
)

@router.post("/{mess_slug}/customer/session",status_code=status.HTTP_201_CREATED,response_model=UUID)
async def create_customer_session(
    token:str,
    mess_slug:str,
    db: AsyncSession = Depends(get_async_session),
):
    mess=await mess_crud.get_by_slug(db,slug=mess_slug)
    if not mess:
        raise HTTPException(status_code=404, detail="Mess not found")
    
    customer_session=CustomerSessionToken(mess_id=mess.id,token=token)
    db.add(customer_session)
    await db.commit()
    await db.refresh(customer_session)
    return customer_session.id

@router.get("/customer/me",response_model=CustomerRead)
async def get_me(
    current_user: Customer = Depends(current_active_customer),
):
    return current_user
    
@router.get("/{mess_slug}/customer/session/{session_id}",response_model=CustomerSessionTokenRead)
async def get_customer_session(
    mess_slug:str,
    session_id:UUID,
    db: AsyncSession = Depends(get_async_session),
):
    mess=await mess_crud.get_by_slug(db,slug=mess_slug)
    if not mess:
        raise HTTPException(status_code=404, detail="Mess not found")
    
    customer_session=await db.execute(select(CustomerSessionToken).where(CustomerSessionToken.id==session_id,CustomerSessionToken.mess_id==mess.id))
    customer_session=customer_session.scalar_one_or_none()
    if not customer_session:
        raise HTTPException(status_code=404, detail="Customer session not found")
    result=CustomerSessionTokenRead(id=customer_session.id,mess_id=customer_session.mess_id,token=customer_session.token)
    await db.delete(customer_session)
    await db.commit()
    return result

