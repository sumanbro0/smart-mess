from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from httpx import AsyncClient
from sqlalchemy.orm import Session,selectinload,joinedload
from core.config import settings
from db.session import get_async_session
from . import schema, models
from menu.models import MenuItem
import uuid
from mess.dependencies import get_mess_and_customer_context, MessCustomerContext, require_mess_access
from sqlalchemy import select,update

from sqlalchemy.ext.asyncio import AsyncSession
from core.socket import sio
import json

router = APIRouter(prefix="/{mess_slug}/orders", tags=["orders"])


@router.get("/incomplete", response_model=List[schema.AdminOrderResponse])
async def get_orders(
    db: AsyncSession = Depends(get_async_session),
    context: MessCustomerContext = Depends(require_mess_access)
):
    orders = await db.execute(select(models.Order).filter(models.Order.mess_id == context.mess.id).options(selectinload(models.Order.customer),selectinload(models.Order.table),selectinload(models.Order.items),selectinload(models.Order.transaction)).order_by(models.status_order.desc(),models.Order.created_at.desc()))
    return orders.scalars().all()

@router.get("/my-orders", response_model=Optional[schema.MyOrderResponse])
async def get_my_orders(
    db: AsyncSession = Depends(get_async_session),
    context: MessCustomerContext = Depends(get_mess_and_customer_context)
):
    orders = await db.execute(select(models.Order).filter(models.Order.customer_id == context.customer.id).options(selectinload(models.Order.customer),selectinload(models.Order.table),selectinload(models.Order.items),selectinload(models.Order.transaction)))
    orders = orders.scalars().all()
    if not orders:
        return schema.MyOrderResponse(
            orders=[],
            currency=context.mess.currency
        )
    return schema.MyOrderResponse(
        # orders=[schema.AdminOrderResponse.model_validate(order) for order in orders],
        orders=orders,
        currency=context.mess.currency
    )

@router.get("/{order_id}/admin-items", response_model=schema.AdminOrderItemResponse)
async def get_order(
    order_id: uuid.UUID,
    db: AsyncSession = Depends(get_async_session),
    context: MessCustomerContext = Depends(require_mess_access)
):
    order = await db.execute(select(models.Order).filter(models.Order.id == order_id).options(selectinload(models.Order.customer),selectinload(models.Order.table),selectinload(models.Order.items).selectinload(models.OrderItem.menu_item),selectinload(models.Order.transaction)))
    order = order.scalars().first()
    if order.has_added_items:
        order.has_added_items = False
        await db.commit()
        await db.refresh(order)
    return schema.AdminOrderItemResponse(
        items=order.items,
        currency=order.transaction.currency if order.transaction else context.mess.currency,
        status=order.status,
        total_price=order.total_price,
        is_paid=order.transaction.status == models.OrderTransactionStatusEnum.SUCCESS if order.transaction else False,
        transaction=order.transaction if order.transaction else None
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
    result = await db.execute(
    select(models.Order)
    .filter(models.Order.id == db_order.id)
    .options(
        selectinload(models.Order.customer),
        selectinload(models.Order.table),
        selectinload(models.Order.items),
        selectinload(models.Order.transaction)
    )
    )
    db_order = result.scalar_one()

    await sio.emit("add_order", schema.AdminOrderResponse.model_validate(db_order).model_dump(mode="json"), room=f"admin_order_{context.mess.slug}")
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
            selectinload(models.Order.items).selectinload(models.OrderItem.menu_item),
            selectinload(models.Order.transaction)
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
        total_price=order.total_price,
        transaction=order.transaction if order.transaction else None,
        is_paid=order.transaction.status == models.OrderTransactionStatusEnum.SUCCESS if order.transaction else False
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
    try:
        db_order = await db.execute(
            select(models.Order).filter(
                models.Order.id == order_id,
                models.Order.mess_id == context.mess.id
            ).options(selectinload(models.Order.transaction))
        )
        db_order = db_order.scalars().first()
        
        if not db_order:
            raise HTTPException(status_code=404, detail="Order not found")
            
        if db_order.status in [models.OrderStatusEnum.COMPLETED, models.OrderStatusEnum.CANCELLED]:
            raise HTTPException(
                status_code=400, 
                detail=f"Cannot update already {db_order.status} order"
            )

        if status == models.OrderStatusEnum.CANCELLED and db_order.status == models.OrderStatusEnum.SERVED:
            raise HTTPException(status_code=400, detail="Order is already served")

        # Update order status
        db_order.status = status
        
        if status == models.OrderStatusEnum.CANCELLED:
            db_order.is_cancelled = True
            await db.execute(
                update(models.OrderItem).where(
                    models.OrderItem.order_id == order_id,
                    models.OrderItem.is_cancelled == False
                ).values(is_cancelled=True)
            )
        
        # Commit the database transaction first
        await db.commit()
        
        # Only emit socket event after successful commit
        # Convert SQLAlchemy model to dict properly
        order_data = {
            "id": str(db_order.id),
            "status": db_order.status.value,
            "is_cancelled": db_order.is_cancelled,
            "mess_id": str(db_order.mess_id),
            "is_paid": db_order.transaction.status == models.OrderTransactionStatusEnum.SUCCESS if db_order.transaction else False,
        }
        await sio.emit("order_update", order_data, room=f"order_{db_order.id}")
        
        return db_order

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update order status")

@router.patch("/{order_id}/customer-cancel", response_model=schema.OrderUpdate)
async def update_order_status(
    order_id: uuid.UUID,
    db: AsyncSession = Depends(get_async_session),
    context: MessCustomerContext = Depends(get_mess_and_customer_context)
):
    db_order = await db.execute(
        select(models.Order).filter(
            models.Order.id == order_id,
            models.Order.mess_id == context.mess.id
        ).options(selectinload(models.Order.transaction))
    )
    db_order = db_order.scalars().first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if db_order.status in [models.OrderStatusEnum.COMPLETED, models.OrderStatusEnum.CANCELLED, models.OrderStatusEnum.SERVED]:
        raise HTTPException(status_code=400, detail=f"Cannot cancel already {db_order.status} order")
    
    # Update order
    db_order.status = models.OrderStatusEnum.CANCELLED
    db_order.is_cancelled = True
    
    # Update order items
    await db.execute(
        update(models.OrderItem)
        .where(
            models.OrderItem.order_id == order_id,
            models.OrderItem.is_cancelled == False
        )
        .values(is_cancelled=True)
    )
    
    await db.commit()
    await db.refresh(db_order)
    data={
        "id": str(db_order.id),
        "status": models.OrderStatusEnum.CANCELLED.value,
        "is_cancelled": True,
        "mess_id": str(db_order.mess_id),
        "is_paid": db_order.transaction.status == models.OrderTransactionStatusEnum.SUCCESS if db_order.transaction else False,
        
    }

    await sio.emit("cancel_order", data, room=f"admin_order_{context.mess.slug}")
    
    return db_order

@router.post("/{order_id}/complete", response_model=schema.OrderUpdate)
async def complete_order(
    order_id: uuid.UUID,
    db: AsyncSession = Depends(get_async_session),
    context: MessCustomerContext = Depends(require_mess_access)
):
    db_order = await db.execute(select(models.Order).options(selectinload(models.Order.transaction),selectinload(models.Order.items)).filter(models.Order.id == order_id,models.Order.mess_id == context.mess.id))
    db_order = db_order.scalars().first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if  db_order.transaction is not None:
        await db.execute(update(models.OrderTransaction).where(models.OrderTransaction.order_id == order_id).values(status=models.OrderTransactionStatusEnum.SUCCESS))
        db_order.status = models.OrderStatusEnum.COMPLETED
        await db.commit()
        return db_order
    
    if db_order.status == models.OrderStatusEnum.COMPLETED:
        return db_order
    
    db_order.transaction = models.OrderTransaction(
        order_id=order_id,
        transaction_id=str(uuid.uuid4()).replace("-", ""),
        payment_url=f"#",
        payment_id=str(uuid.uuid4()).replace("-", ""),
        amount=db_order.total_price,
        currency=context.mess.currency,
        payment_method=models.PaymentMethodEnum.CASH,
        status=models.OrderTransactionStatusEnum.SUCCESS,
    )
    db_order.status = models.OrderStatusEnum.COMPLETED
    await db.commit()
    await db.refresh(db_order)
    order_data = {
        "id": str(db_order.id),
        "status": db_order.status.value,
        "is_cancelled": db_order.is_cancelled,
        "mess_id": str(db_order.mess_id),
        "is_paid": db_order.transaction.status == models.OrderTransactionStatusEnum.SUCCESS if db_order.transaction else False,
    }
    await sio.emit("order_update", order_data, room=f"order_{db_order.id}")
    return db_order

@router.patch("/{order_id}/items/{item_id}/customer-cancel", response_model=schema.OrderUpdate)
async def cancel_order_item(
    order_id: uuid.UUID,
    item_id: uuid.UUID,
    db: AsyncSession = Depends(get_async_session),
    context: MessCustomerContext = Depends(get_mess_and_customer_context)
):
    db_item = await db.execute(
        select(models.OrderItem)
        .options(
            selectinload(models.OrderItem.order).selectinload(models.Order.transaction),
            selectinload(models.OrderItem.order).selectinload(models.Order.items)
        )
        .filter(
            models.OrderItem.id == item_id,
            models.OrderItem.order_id == order_id
        )
    )
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
    db_item.order.has_added_items = True
    await db.commit()
    await db.refresh(db_item)
    if len([item for item in db_item.order.items if not item.is_cancelled]) == 0:
        db_item.order.status = models.OrderStatusEnum.CANCELLED
        db_item.order.is_cancelled = True
        db_item.order.has_added_items = True
        db_item.is_cancelled = True
        await db.commit()
        data={
        "id": str(db_item.order.id),
        "status": models.OrderStatusEnum.CANCELLED.value,
        "is_cancelled": True,
        "mess_id": str(context.mess.id),
        "is_paid": db_item.order.transaction.status == models.OrderTransactionStatusEnum.SUCCESS if db_item.order.transaction else False,
        }
        await sio.emit("cancel_order", data, room=f"admin_order_{context.mess.slug}")
        return db_item

    await sio.emit("cancel_order_item", {"id": str(db_item.id),"order_id": str(db_item.order_id),"total_price": db_item.order.total_price}, room=f"admin_order_{context.mess.slug}")
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
    await sio.emit("cancel_order_item", str(db_item.id), room=f"order_{db_item.order_id}")
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
            total_price=menu_item.price * item.quantity,
            is_cancelled=False
        ))
    
    db_order.has_added_items = True
    db_order.status = models.OrderStatusEnum.PENDING
    db.add_all(db_items)
    db.add(db_order)
    await db.commit()
    
    for item in db_items:
        await db.refresh(item)
    
    new_item_ids = [item.id for item in db_items]
    stmt = (
        select(models.OrderItem)
        .options(selectinload(models.OrderItem.menu_item))
        .where(models.OrderItem.id.in_(new_item_ids))
    )
    
    result = await db.execute(stmt)
    new_order_items = result.scalars().all()
    new_items_response = [schema.OrderItemResponse.model_validate(item).model_dump(mode="json") for item in new_order_items]
    response={
        "items":new_items_response,
        "order_id":str(order_id)
    }
    await sio.emit("add_order_item", response, room=f"admin_order_{context.mess.slug}")
 
    
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


@router.get("/transactions/{transaction_id}", response_model=schema.OrderTransactionResponse)
async def get_order_transaction(transaction_id: uuid.UUID, db: AsyncSession = Depends(get_async_session)):
    transaction = await db.execute(select(models.OrderTransaction).filter(models.OrderTransaction.id == transaction_id))
    transaction = transaction.scalars().first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction

@router.post("/{order_id}/checkout/initiate/khalti", response_model=schema.OrderTransactionResponse)
async def checkout_khalti(order_id: uuid.UUID, db: AsyncSession = Depends(get_async_session),context: MessCustomerContext = Depends(get_mess_and_customer_context)):
    db_order = await db.execute(select(models.Order).options(selectinload(models.Order.transaction),selectinload(models.Order.items)).filter(models.Order.id == order_id))
    db_order = db_order.scalars().first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if db_order.status in [models.OrderStatusEnum.COMPLETED, models.OrderStatusEnum.CANCELLED]:
        raise HTTPException(status_code=400, detail="Cannot checkout completed or cancelled orders")
    
    if db_order.transaction and db_order.transaction.status == models.OrderTransactionStatusEnum.SUCCESS:
        raise HTTPException(status_code=400, detail="Order is already paid")
    


    payload = json.dumps({
        "return_url": f"{settings.MENU_URL}/{context.mess.slug}/{db_order.table_id}/checkout/complete/khalti",
        "website_url": settings.MENU_URL,
        "amount": db_order.total_price * 100,
        "purchase_order_id": str(order_id),
        "purchase_order_name": f"Order {order_id}",
        "customer_info": {
        "name": context.customer.name or context.customer.email.split("@")[0],
        "email": context.customer.email,
        "phone": "N/A"
        }
    })
    headers = {
        'Authorization': f'key {settings.KHALTI_SECRET_KEY}',
        'Content-Type': 'application/json',
    }
    try:
        async with AsyncClient() as client:
            response = await client.post(settings.KHALTI_URL, headers=headers, data=payload)
            response = response.json()
            if response.get("pidx",None) is not None:
                if db_order.transaction is None:
                    db_order.transaction = models.OrderTransaction(
                    order_id=order_id,
                    transaction_id=response.get("pidx"),
                    payment_url=response.get("payment_url"),
                    payment_id=response.get("pidx"),
                    amount=db_order.total_price * 100,
                    currency=context.mess.currency,
                    payment_method=models.PaymentMethodEnum.KHALTI,
                    status=models.OrderTransactionStatusEnum.PENDING,
                )
                    await db.commit()
                    await db.refresh(db_order)
                    return db_order.transaction
                else:
                    db_order.transaction.payment_url = response.get("payment_url")
                    db_order.transaction.payment_id = response.get("pidx")
                    db_order.transaction.status = models.OrderTransactionStatusEnum.PENDING
                    await db.commit()
                    await db.refresh(db_order)
                    return db_order.transaction
                
            else:
                raise HTTPException(status_code=400, detail="Failed to initiate payment")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to initiate payment")


    
@router.get("/{order_id}/checkout/callback/khalti", response_model=Optional[schema.OrderTransactionResponse])
async def checkout_callback_khalti(order_id: uuid.UUID, is_success: bool,transaction_id: Optional[str] = None,db: AsyncSession = Depends(get_async_session),context: MessCustomerContext = Depends(get_mess_and_customer_context)):
    db_order = await db.execute(select(models.Order).options(selectinload(models.Order.transaction),selectinload(models.Order.items)).filter(models.Order.id == order_id))
    db_order = db_order.scalars().first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")

    if db_order.transaction is None:
        raise HTTPException(status_code=400, detail="Order is not paid")
   
    if db_order.transaction.status == models.OrderTransactionStatusEnum.SUCCESS:
        return db_order.transaction

    if is_success and transaction_id:
        await db.execute(update(models.OrderTransaction).where(models.OrderTransaction.order_id == order_id).values(status=models.OrderTransactionStatusEnum.SUCCESS ,transaction_id=transaction_id))
        await db.execute(update(models.Order).where(models.Order.id == order_id).values(status=models.OrderStatusEnum.COMPLETED))
        await sio.emit("order_paid", {"id": str(db_order.id), "status": models.OrderStatusEnum.COMPLETED.value,"paid_with":models.PaymentMethodEnum.KHALTI.value,"transaction_id":transaction_id}, room=f"admin_order_{context.mess.slug}")
    else:
        await db.delete(db_order.transaction)
    await db.commit()
    await db.refresh(db_order)
    return db_order.transaction
    
