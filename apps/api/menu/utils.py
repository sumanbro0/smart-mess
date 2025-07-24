from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from db.session import get_async_session
from .models import MenuItem
from orders.models import Order, OrderItem
from auth.models import Customer
from async_lru import alru_cache
from datetime import datetime, timedelta

@alru_cache(maxsize=100, ttl=300)
async def get_user_menu_items(email: str):
    async for db in get_async_session():
        result = await db.execute(
        select(
            MenuItem.id,
            MenuItem.calories, 
            MenuItem.is_veg, 
            MenuItem.spiciness,
        )
        .join(OrderItem, OrderItem.menu_item_id == MenuItem.id)
        .join(Order, OrderItem.order_id == Order.id)
        .join(Customer, Order.customer_id == Customer.id)
        .where(Customer.email == email)
        .where(Order.is_cancelled == False)
        .where(OrderItem.is_cancelled == False)
        .group_by(MenuItem.id, MenuItem.calories, MenuItem.is_veg, MenuItem.spiciness)
        )
        return result.all()

@alru_cache(maxsize=100, ttl=300)
async def get_popular_menu_items(top_k: int = 7):
    async for db in get_async_session():
        today = datetime.now().date()
        result = await db.execute(
        select(
            MenuItem.id,
            MenuItem.calories, 
            MenuItem.is_veg, 
            MenuItem.spiciness,
            func.sum(OrderItem.quantity).label("total_quantity")
        )
        .join(OrderItem, OrderItem.menu_item_id == MenuItem.id)
        .join(Order, OrderItem.order_id == Order.id)
        .join(Customer, Order.customer_id == Customer.id)
        .where(Order.created_at.between(today, today - timedelta(days=1)))
        .group_by(MenuItem.id, MenuItem.calories, MenuItem.is_veg, MenuItem.spiciness)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(top_k)
        )
        return result.all()[:top_k]

