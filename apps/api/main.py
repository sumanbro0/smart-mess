import sys
import os

from .middleware.login_rate_limiter import LoginRateLimitMiddleware

sys.path.append(os.path.dirname(__file__))

from typing import Union
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from auth.security import fastapi_users,auth_backend
from core.config import settings
from auth.schemas import UserRead, UserCreate, UserUpdate
from db.session import engine
from auth.oauth2 import oauth2_router
from pydantic import BaseModel

class ResponseMessage(BaseModel):
    message: str
    status_code: int


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await engine.dispose()

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(LoginRateLimitMiddleware)


app.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix=f"/auth",
    tags=["auth"],
)

app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix=f"{settings.API_V1_STR}/auth",
    tags=["auth"],
)


app.include_router(oauth2_router, prefix="/auth/google", tags=["auth"])
app.include_router(
    fastapi_users.get_reset_password_router(),
    prefix=f"{settings.API_V1_STR}/auth",
    tags=["auth"],
)

app.include_router(
    fastapi_users.get_verify_router(UserRead),
    prefix=f"{settings.API_V1_STR}/auth",
    tags=["auth"],
)

app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix=f"{settings.API_V1_STR}/users",
    tags=["users"],
)

@app.get("/", response_model=ResponseMessage)
def read_root():
    return ResponseMessage(message="Hello World", status_code=200)

@app.get("/health")
async def health_check():
    return {"message": "API is running"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}



