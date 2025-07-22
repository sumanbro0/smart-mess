from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session,selectinload,load_only
from db.session import get_async_session
from . import schema, models
from menu.models import MenuItem
import uuid
from mess.dependencies import get_mess_and_customer_context, MessCustomerContext, require_mess_access
from sqlalchemy import select

from sqlalchemy.ext.asyncio import AsyncSession
from core.socket import sio

router = APIRouter(prefix="/{mess_slug}/orders", tags=["orders"])


@router.get("/incomplete", response_model=List[schema.AdminOrderResponse])
async def get_orders(
    db: AsyncSession = Depends(get_async_session),
    context: MessCustomerContext = Depends(require_mess_access)
):
    orders = await db.execute(select(models.Order).filter(models.Order.mess_id == context.mess.id).options(selectinload(models.Order.customer),selectinload(models.Order.table),selectinload(models.Order.items)))
    return orders.scalars().all()

@router.get("/{order_id}/admin-items", response_model=schema.AdminOrderItemResponse)
async def get_order(
    order_id: uuid.UUID,
    db: AsyncSession = Depends(get_async_session),
    context: MessCustomerContext = Depends(require_mess_access)
):
    order = await db.execute(select(models.Order).filter(models.Order.id == order_id).options(selectinload(models.Order.customer),selectinload(models.Order.table),selectinload(models.Order.items).selectinload(models.OrderItem.menu_item)))
    order = order.scalars().first()
    if order.has_added_items:
        order.has_added_items = False
        await db.commit()
        await db.refresh(order)
    return schema.AdminOrderItemResponse(
        items=order.items,
        currency=context.mess.currency,
        status=order.status,
        total_price=order.total_price
    )

@router.post("/", response_model=schema.OrderCreateResponse)
async def create_order(
    order: schema.OrderCreate,
    db: AsyncSession = Depends(get_async_session),
    context: MessCustomerContext = Depends(get_mess_and_customer_context)
):
    menu_item_ids = [item.menu_item_id for item in order.items]
    
    result = await db.execute(
        select(MenuItem).filter(MenuItem.id.in_(menu_item_ids))
    )
    menu_items = result.scalars().all()
    
    menu_items_dict = {item.id: item for item in menu_items}
    
    missing_items = set(menu_item_ids) - set(menu_items_dict.keys())
    if missing_items:
        raise HTTPException(
            status_code=404, 
            detail=f"Menu items not found: {list(missing_items)}"
        )
    
    # Create the order
    db_order = models.Order(
        customer_id=context.customer.id,
        mess_id=context.mess.id,
        table_id=order.table_id,
        status=order.status
    )
    db.add(db_order)
    await db.flush()  
    
    order_items = []
    for item in order.items:
        menu_item = menu_items_dict[item.menu_item_id]
        order_items.append(models.OrderItem(
            order_id=db_order.id,
            menu_item_id=item.menu_item_id,
            quantity=item.quantity,
            total_price=menu_item.price * item.quantity
        ))
    
    db.add_all(order_items)
    
    await db.commit()
    await db.refresh(db_order)
    await sio.emit("order_update", db_order.__dict__, room=f"mess_{context.mess.slug}_{context.customer.id}")
    return db_order


@router.get("/popup", response_model=Optional[schema.OrderPopupResponse])
async def get_order_popup(
    table_id: Optional[uuid.UUID] = None,
    db: AsyncSession = Depends(get_async_session),
    context: MessCustomerContext = Depends(get_mess_and_customer_context)
):
    
    if not table_id:
        return None
    
    order = await db.execute(
        select(models.Order)
        .options(selectinload(models.Order.items))
        .filter(
            models.Order.mess_id == context.mess.id,
            models.Order.customer_id == context.customer.id,
            models.Order.status.not_in([
                models.OrderStatusEnum.COMPLETED,
                models.OrderStatusEnum.CANCELLED
            ]),
            models.Order.table_id == table_id if table_id else True,
        )
        .order_by(models.Order.created_at.desc())
        .limit(1)
    )
    
    order = order.scalars().first()
    
    if not order:
        return None
    
    return schema.OrderPopupResponse(
        total_price=order.total_price,
        currency=context.mess.currency,
        id=order.id
    )



@router.get("/{order_id}/items", response_model=schema.CustomerOrderItemResponse)
async def get_order_items(
    order_id: uuid.UUID, 
    db: AsyncSession = Depends(get_async_session),
    context: MessCustomerContext = Depends(get_mess_and_customer_context)
):
    stmt = (
        select(models.Order)
        .options(
            selectinload(models.Order.items).selectinload(models.OrderItem.menu_item)
        )
        .where(models.Order.id == order_id)
    )
    
    result = await db.execute(stmt)
    order = result.scalars().first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.customer_id != context.customer.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return schema.CustomerOrderItemResponse(
        items=order.items, 
        currency=context.mess.currency, 
        status=order.status, 
        total_price=order.total_price
    )

@router.put("/{order_id}", response_model=schema.OrderUpdate)
async def update_order(
    order_id: uuid.UUID,
    order: schema.OrderUpdate,
    db: AsyncSession = Depends(get_async_session),
    context: MessCustomerContext = Depends(get_mess_and_customer_context)
):
    db_order = await db.execute(select(models.Order).filter(models.Order.id == order_id))
    db_order = db_order.scalars().first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if db_order.status in [models.OrderStatusEnum.COMPLETED, models.OrderStatusEnum.CANCELLED]:
        raise HTTPException(
            status_code=400,
            detail="Cannot update completed or cancelled order"
        )
    
    if order.status == models.OrderStatusEnum.CANCELLED:
        db_order.is_cancelled = True
    
    for key, value in order.model_dump(exclude_unset=True).items():
        setattr(db_order, key, value)
    
    await db.commit()
    await db.refresh(db_order)
    return db_order


@router.patch("/{order_id}/status", response_model=schema.OrderUpdate)
async def update_order_status(
    order_id: uuid.UUID,
    status: models.OrderStatusEnum,
    db: AsyncSession = Depends(get_async_session),
    context: MessCustomerContext = Depends(require_mess_access)
):
    db_order = await db.execute(select(models.Order).filter(models.Order.id == order_id,models.Order.mess_id == context.mess.id))
    db_order = db_order.scalars().first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    if db_order.status in [models.OrderStatusEnum.COMPLETED, models.OrderStatusEnum.CANCELLED]:
        raise HTTPException(status_code=400, detail=f"Cannot update already {db_order.status} order")

    if status == models.OrderStatusEnum.CANCELLED and db_order.status == models.OrderStatusEnum.SERVED:
        raise HTTPException(status_code=400, detail="order is already served")

    db_order.status = status
    db_order.is_cancelled = status==models.OrderStatusEnum.CANCELLED
    await db.commit()
    await db.refresh(db_order)
    return db_order

@router.patch("/{order_id}/customer-cancel", response_model=schema.OrderUpdate)
async def update_order_status(
    order_id: uuid.UUID,
    db: AsyncSession = Depends(get_async_session),
    context: MessCustomerContext = Depends(get_mess_and_customer_context)
):
    db_order = await db.execute(select(models.Order).filter(models.Order.id == order_id,models.Order.mess_id == context.mess.id))
    db_order = db_order.scalars().first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if db_order.status in [models.OrderStatusEnum.COMPLETED, models.OrderStatusEnum.CANCELLED,models.OrderStatusEnum.SERVED]:
        raise HTTPException(status_code=400, detail=f"Cannot cancel already {db_order.status} order")
    
    db_order.status = models.OrderStatusEnum.CANCELLED
    db_order.is_cancelled = True
    await db.commit()
    await db.refresh(db_order)
    return db_order

@router.post("/{order_id}/mark-paid", response_model=schema.OrderUpdate)
async def mark_order_as_paid(
    order_id: uuid.UUID,
    db: AsyncSession = Depends(get_async_session),
    context: MessCustomerContext = Depends(require_mess_access)
):
    db_order = await db.execute(select(models.Order).filter(models.Order.id == order_id,models.Order.mess_id == context.mess.id))
    db_order = db_order.scalars().first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if  db_order.transaction:
        raise HTTPException(status_code=400, detail="Order already paid")
    
    db_order.transaction = models.OrderTransaction(
        order_id=order_id,
        transaction_id=str(uuid.uuid4()),
        amount=db_order.total_price,
        currency=context.mess.currency,
        payment_method=models.PaymentMethodEnum.CASH,
        status=models.OrderTransactionStatusEnum.SUCCESS,

    )
    await db.commit()
    await db.refresh(db_order)
    return db_order

@router.patch("/{order_id}/items/{item_id}/customer-cancel", response_model=schema.OrderUpdate)
async def cancel_order_item(
    order_id: uuid.UUID,
    item_id: uuid.UUID,
    db: AsyncSession = Depends(get_async_session),
    context: MessCustomerContext = Depends(get_mess_and_customer_context)
):
    db_item = await db.execute(select(models.OrderItem).options(selectinload(models.OrderItem.order)).filter(models.OrderItem.id == item_id,models.OrderItem.order_id == order_id))
    db_item = db_item.scalars().first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Order item not found")
    
    
    if db_item.order.status in [models.OrderStatusEnum.COMPLETED, models.OrderStatusEnum.CANCELLED,models.OrderStatusEnum.SERVED]:
        raise HTTPException(
            status_code=400,
            detail="Cannot cancel item"
        )
    if db_item.is_cancelled:
        return db_item
    
    
  
    if db_item.order.items.count() == 1:
        db_item.order.status = models.OrderStatusEnum.CANCELLED
        db_item.order.is_cancelled = True
        db_item.order.has_added_items = True
        db_item.is_cancelled = True
        await db.commit()
        await db.refresh(db_item)
        return db_item
    
    db_item.is_cancelled = True
    db_item.order.has_added_items = True
    await db.commit()
    await db.refresh(db_item)
    return db_item

@router.patch("/{order_id}/items/{item_id}/admin-cancel", response_model=schema.OrderUpdate)
async def cancel_order_item(
    order_id: uuid.UUID,
    item_id: uuid.UUID,
    db: AsyncSession = Depends(get_async_session),
    context: MessCustomerContext = Depends(require_mess_access)
):
    db_item = await db.execute(select(models.OrderItem).options(selectinload(models.OrderItem.order)).filter(models.OrderItem.id == item_id,models.OrderItem.order_id == order_id))
    db_item = db_item.scalars().first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Order item not found")
    
  
    
    if db_item.order.status in [models.OrderStatusEnum.COMPLETED, models.OrderStatusEnum.CANCELLED,models.OrderStatusEnum.SERVED]:
        raise HTTPException(
            status_code=400,
            detail="Cannot cancel item"
        )
    
    if db_item.is_cancelled:
        return db_item
    
    db_item.is_cancelled = True
    await db.commit()
    await db.refresh(db_item)
    return db_item



@router.post("/{order_id}/items", response_model=List[schema.OrderItemCreate])
async def add_order_item(
    order_id: uuid.UUID,
    items: List[schema.OrderItemCreate],
    db: AsyncSession = Depends(get_async_session),
    context: MessCustomerContext = Depends(get_mess_and_customer_context)
):
    db_order = await db.execute(select(models.Order).filter(models.Order.id == order_id,models.Order.mess_id == context.mess.id))
    db_order = db_order.scalars().first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if db_order.status in [models.OrderStatusEnum.COMPLETED, models.OrderStatusEnum.CANCELLED]:
        raise HTTPException(
            status_code=400,
            detail="Cannot add items to completed or cancelled orders"
        )
    
    menu_item_ids = [item.menu_item_id for item in items]
    result = await db.execute(select(MenuItem).filter(MenuItem.id.in_(menu_item_ids)))
    menu_items = result.scalars().all()
    menu_items_dict = {item.id: item for item in menu_items}
    missing_items = set(menu_item_ids) - set(menu_items_dict.keys())
    if missing_items:
        raise HTTPException(status_code=404, detail=f"Menu items not found: {list(missing_items)}")

    for item in items:
        menu_item = menu_items_dict[item.menu_item_id]
        if not menu_item.is_active:
            raise HTTPException(status_code=400, detail=f"Menu item {item.menu_item_id} is not active")
        if not menu_item.in_stock:
            raise HTTPException(status_code=400, detail=f"Menu item {item.menu_item_id} is not in stock")
        
        
    db_items = []
    for item in items:
        menu_item = menu_items_dict[item.menu_item_id]
        db_items.append(models.OrderItem(
            order_id=order_id,
            menu_item_id=item.menu_item_id,
            quantity=item.quantity,
            total_price=menu_item.price * item.quantity,  # Use menu_item from dict
            is_cancelled=False
        ))
    db_order.has_added_items = True
    db_order.status = models.OrderStatusEnum.PENDING
    db.add_all(db_items)
    db.add(db_order)
    await db.commit()
    await db.refresh(db_order)
    return db_items

@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: uuid.UUID, db: Session = Depends(get_async_session),context: MessCustomerContext = Depends(get_mess_and_customer_context)):
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Check if order can be deleted
    if db_order.status not in [models.OrderStatusEnum.PENDING, models.OrderStatusEnum.CANCELLED]:
        raise HTTPException(
            status_code=400,
            detail="Can only delete pending or cancelled orders"
        )
    
    db.delete(db_order)
    db.commit()


@router.put("/items/{item_id}", response_model=schema.OrderItemResponse)
def update_order_item(
    item_id: uuid.UUID,
    item: schema.OrderItemUpdate,
    db: Session = Depends(get_async_session),
    context: MessCustomerContext = Depends(get_mess_and_customer_context)
):
    db_item = db.query(models.OrderItem).filter(models.OrderItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Order item not found")
    
    # Check if order can be modified
    if db_item.order.status not in [models.OrderStatusEnum.PENDING, models.OrderStatusEnum.RECEIVED]:
        raise HTTPException(
            status_code=400,
            detail="Can only update items in pending or received orders"
        )
    
    for key, value in item.model_dump(exclude_unset=True).items():
        setattr(db_item, key, value)
    
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order_item(item_id: uuid.UUID, db: Session = Depends(get_async_session),context: MessCustomerContext = Depends(get_mess_and_customer_context)):
    db_item = db.query(models.OrderItem).filter(models.OrderItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Order item not found")
    
    # Check if order can be modified
    if db_item.order.status not in [models.OrderStatusEnum.PENDING, models.OrderStatusEnum.RECEIVED]:
        raise HTTPException(
            status_code=400,
            detail="Can only delete items from pending or received orders"
        )
    
    db.delete(db_item)
    db.commit()

# OrderTransaction Routes
@router.post("/{order_id}/transactions", response_model=schema.OrderTransactionResponse)
def create_order_transaction(
    order_id: uuid.UUID,
    transaction: schema.OrderTransactionCreate,
    db: Session = Depends(get_async_session)
):
    # Check if order exists
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Check if order can have transactions
    if db_order.status == models.OrderStatusEnum.CANCELLED:
        raise HTTPException(
            status_code=400,
            detail="Cannot add transactions to cancelled orders"
        )
    
    db_transaction = models.OrderTransaction(
        order_id=order_id,
        transaction_id=transaction.transaction_id,
        amount=transaction.amount,
        status=transaction.status
    )
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@router.put("/transactions/{transaction_id}", response_model=schema.OrderTransactionResponse)
def update_order_transaction(
    transaction_id: uuid.UUID,
    transaction: schema.OrderTransactionUpdate,
    db: Session = Depends(get_async_session)
):
    db_transaction = db.query(models.OrderTransaction).filter(models.OrderTransaction.id == transaction_id).first()
    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    for key, value in transaction.model_dump(exclude_unset=True).items():
        setattr(db_transaction, key, value)
    
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@router.get("/transactions/{transaction_id}", response_model=schema.OrderTransactionResponse)
def get_order_transaction(transaction_id: uuid.UUID, db: Session = Depends(get_async_session)):
    transaction = db.query(models.OrderTransaction).filter(models.OrderTransaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction
