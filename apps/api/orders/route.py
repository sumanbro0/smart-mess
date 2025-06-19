from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from db.session import get_async_session
from . import schema, models
import uuid
from datetime import datetime, UTC

router = APIRouter(prefix="/orders", tags=["orders"])

# Order Routes
@router.post("/", response_model=schema.OrderResponse)
def create_order(
    order: schema.OrderCreate,
    db: Session = Depends(get_async_session)
):
    # Create the order
    db_order = models.Order(
        customer_id=order.customer_id,
        mess_id=order.mess_id,
        table_id=order.table_id,
        status=order.status
    )
    db.add(db_order)
    db.flush()  # Flush to get the order ID
    
    # Create order items
    for item in order.items:
        # Get menu item to get current price
        menu_item = db.query(models.MenuItem).filter(models.MenuItem.id == item.menu_item_id).first()
        if not menu_item:
            raise HTTPException(status_code=404, detail=f"Menu item {item.menu_item_id} not found")
        
        db_item = models.OrderItem(
            order_id=db_order.id,
            menu_item_id=item.menu_item_id,
            quantity=item.quantity,
            price=menu_item.price  # Use current menu item price
        )
        db.add(db_item)
    
    db.commit()
    db.refresh(db_order)
    return db_order

@router.get("/{order_id}", response_model=schema.OrderResponse)
def get_order(order_id: uuid.UUID, db: Session = Depends(get_async_session)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.put("/{order_id}", response_model=schema.OrderResponse)
def update_order(
    order_id: uuid.UUID,
    order: schema.OrderUpdate,
    db: Session = Depends(get_async_session)
):
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Check if order can be updated
    if db_order.status in [models.OrderStatusEnum.COMPLETED, models.OrderStatusEnum.CANCELLED]:
        raise HTTPException(
            status_code=400,
            detail="Cannot update completed or cancelled order"
        )
    
    for key, value in order.model_dump(exclude_unset=True).items():
        setattr(db_order, key, value)
    
    db.commit()
    db.refresh(db_order)
    return db_order

@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: uuid.UUID, db: Session = Depends(get_async_session)):
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

# OrderItem Routes
@router.post("/{order_id}/items", response_model=schema.OrderItemResponse)
def add_order_item(
    order_id: uuid.UUID,
    item: schema.OrderItemCreate,
    db: Session = Depends(get_async_session)
):
    # Check if order exists and can be modified
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if db_order.status not in [models.OrderStatusEnum.PENDING, models.OrderStatusEnum.RECEIVED]:
        raise HTTPException(
            status_code=400,
            detail="Can only add items to pending or received orders"
        )
    
    # Get menu item to get current price
    menu_item = db.query(models.MenuItem).filter(models.MenuItem.id == item.menu_item_id).first()
    if not menu_item:
        raise HTTPException(status_code=404, detail=f"Menu item {item.menu_item_id} not found")
    
    db_item = models.OrderItem(
        order_id=order_id,
        menu_item_id=item.menu_item_id,
        quantity=item.quantity,
        price=menu_item.price
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put("/items/{item_id}", response_model=schema.OrderItemResponse)
def update_order_item(
    item_id: uuid.UUID,
    item: schema.OrderItemUpdate,
    db: Session = Depends(get_async_session)
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
def delete_order_item(item_id: uuid.UUID, db: Session = Depends(get_async_session)):
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
