import sys
import os

from fastapi.staticfiles import StaticFiles

# from .middleware.login_rate_limiter import LoginRateLimitMiddleware
# from .middleware.token_middleware import AccessTokenMiddleware
sys.path.append(os.path.dirname(__file__))

from typing import Union
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from auth.security import fastapi_users
from core.config import settings
from auth.schemas import UserRead, UserUpdate
from db.session import engine
from core.schema import ResponseMessage
from auth.routes import router as auth_router
from upload.route import file_router
from mess.route import router as mess_router
from mess_table.route import router as mess_table_router
from menu.route import router as menu_router
from orders.route import router as orders_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await engine.dispose()

app = FastAPI(lifespan=lifespan)
app.mount("/media", StaticFiles(directory="media"), name="media")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# app.add_middleware(LoginRateLimitMiddleware)

app.include_router(auth_router)
app.include_router(file_router)
app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix=f"/users",
    tags=["users"],
)

app.include_router(mess_router)
app.include_router(mess_table_router)
app.include_router(menu_router)
app.include_router(orders_router)

@app.get("/", response_model=ResponseMessage)
def read_root():
    return ResponseMessage(message="Hello World", status_code=200)

@app.get("/health")
async def health_check():
    return {"message": "API is running"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}



