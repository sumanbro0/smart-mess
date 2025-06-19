from fastapi import APIRouter
from auth.security import fastapi_users,auth_backend
from auth.schemas import UserRead, UserCreate
from auth.oauth2 import oauth2_router


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
