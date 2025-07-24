from pydantic import BaseModel
from uuid import UUID
from typing import List

from menu.enums import SpicinessEnum

class AnalyticsOverviewResponse(BaseModel):
    revenue: float
    orders: int
    customers: int
    items: int

class AnalyticsTopMenuItemsResponse(BaseModel):
    id:UUID
    name: str
    image: str
    category_name: str
    price: int
    sold_count: int
    spicy_level: SpicinessEnum
    is_veg: bool
    in_stock: bool

class AnalyticsTopCustomersResponse(BaseModel):
    id:UUID
    name: str
    email: str
    image: str
    total_orders: int
    total_spent: int
    last_order_date: str

class AnalyticsResponse(BaseModel):
    overview: AnalyticsOverviewResponse
    top_menu_items: List[AnalyticsTopMenuItemsResponse]
    top_customers: List[AnalyticsTopCustomersResponse]
    currency: str
