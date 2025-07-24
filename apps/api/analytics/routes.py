from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from db.session import get_async_session
from mess.dependencies import MessContext, require_mess_access
from orders.models import Order,OrderItem
from orders.schema import OrderStatusEnum
from .schema import AnalyticsResponse,AnalyticsOverviewResponse,AnalyticsTopMenuItemsResponse,AnalyticsTopCustomersResponse
from sqlalchemy import Integer, select
from auth.models import Customer
from menu.models import MenuItem,MenuItemCategory
from sqlalchemy import select, func, desc
from sqlalchemy.orm import joinedload

router = APIRouter(prefix="/{mess_slug}", tags=["analytics"])


@router.get("/", response_model=AnalyticsResponse)
async def get_analytics(
    db: AsyncSession = Depends(get_async_session),
    context: MessContext = Depends(require_mess_access)
):
    mess_id = context.mess.id
    
    # Get completed orders only (not cancelled)
    completed_orders = await db.execute(
        select(Order)
        .where(
            Order.mess_id == mess_id,
            Order.status == OrderStatusEnum.COMPLETED,
            Order.is_cancelled == False
        )
        .options(joinedload(Order.items))
    )
    completed_orders = completed_orders.unique().scalars().all()
    
    # Calculate overview metrics
    total_revenue = sum(order.total_price for order in completed_orders)
    total_orders = len(completed_orders)
    
    # Get total customers count
    customers_result = await db.execute(
        select(func.count(Customer.id)).where(Customer.mess_id == mess_id)
    )
    total_customers = customers_result.scalar()
    
    # Get total menu items count
    menu_items_result = await db.execute(
        select(func.count(MenuItem.id)).where(
            MenuItem.mess_id == mess_id,
            MenuItem.is_active == True
        )
    )
    total_menu_items = menu_items_result.scalar()
    
    # Get top menu items by sold count
    top_menu_items_query = await db.execute(
        select(
            MenuItem,
            func.sum(OrderItem.quantity.cast(Integer)).label('sold_count')
        )
        .join(OrderItem, MenuItem.id == OrderItem.menu_item_id)
        .join(Order, OrderItem.order_id == Order.id)
        .where(
            MenuItem.mess_id == mess_id,
            Order.status == OrderStatusEnum.COMPLETED,
            Order.is_cancelled == False,
            OrderItem.is_cancelled == False,
            MenuItem.is_active == True
        )
        .group_by(MenuItem.id)
        .order_by(desc('sold_count'))
        .limit(10)
    )
    top_menu_items_data = top_menu_items_query.all()
    
    # Load categories separately to avoid GROUP BY issues
    menu_item_ids = [item.MenuItem.id for item in top_menu_items_data]
    categories_query = await db.execute(
        select(MenuItem, MenuItemCategory)
        .join(MenuItemCategory, MenuItem.category_id == MenuItemCategory.id)
        .where(MenuItem.id.in_(menu_item_ids))
    )
    categories_data = {item.MenuItem.id: item.MenuItemCategory for item in categories_query.all()}
    
    # Get top customers by total spent - Calculate from OrderItems
    top_customers_query = await db.execute(
        select(
            Customer,
            func.count(func.distinct(Order.id)).label('total_orders'),
            func.sum(OrderItem.quantity * OrderItem.total_price).label('total_spent'),
            func.max(Order.created_at).label('last_order_date')
        )
        .join(Order, Customer.id == Order.customer_id)
        .join(OrderItem, Order.id == OrderItem.order_id)
        .where(
            Customer.mess_id == mess_id,
            Order.status == OrderStatusEnum.COMPLETED,
            Order.is_cancelled == False,
            OrderItem.is_cancelled == False
        )
        .group_by(Customer.id)
        .order_by(desc('total_spent'))
        .limit(10)
    )
    top_customers_data = top_customers_query.all()
    
    # Build response
    overview = AnalyticsOverviewResponse(
        revenue=float(total_revenue),
        orders=total_orders,
        customers=total_customers,
        items=total_menu_items
    )
    
    top_menu_items = [
        AnalyticsTopMenuItemsResponse(
            id=item.MenuItem.id,
            name=item.MenuItem.name,
            image=item.MenuItem.primary_image or "",
            category_name=categories_data[item.MenuItem.id].name,
            price=int(item.MenuItem.price),
            sold_count=int(item.sold_count),
            spicy_level=item.MenuItem.spiciness,
            is_veg=item.MenuItem.is_veg,
            in_stock=item.MenuItem.in_stock
        )
        for item in top_menu_items_data
    ]
    
    top_customers = [
        AnalyticsTopCustomersResponse(
            id=customer.Customer.id,
            name=customer.Customer.name,
            email=customer.Customer.email,
            image=customer.Customer.image or "",  # Assuming Customer has image field
            total_orders=int(customer.total_orders),
            total_spent=int(customer.total_spent),
            last_order_date=customer.last_order_date.isoformat()
        )
        for customer in top_customers_data
    ]
    
    return AnalyticsResponse(
        overview=overview,
        top_menu_items=top_menu_items,
        top_customers=top_customers,
        currency=context.mess.currency
    )