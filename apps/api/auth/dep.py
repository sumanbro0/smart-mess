
from typing import Optional
from fastapi import Depends, Request
from fastapi.security import HTTPBearer
from auth.models import User,Customer
from auth.security import fastapi_customer,fastapi_users
from auth.config import get_database_strategy,get_customer_database_strategy

security = HTTPBearer(auto_error=False) 


async def optional_current_user(
    request: Request,
    token: Optional[str] = Depends(security),
    user_manager = Depends(fastapi_users.get_user_manager),
    strategy = Depends(get_database_strategy)
) -> Optional[User]:
    """
    Most performant optional authentication for AuthTokenDatabase
    """
    if not token:
        return None
    
    try:
        user = await strategy.read_token(token.credentials, user_manager)
        
        if user and user.is_active and user.is_verified:
            return user
    except:
        pass  
    
    return None


async def optional_current_customer(
    request: Request,
    token: Optional[str] = Depends(security),
    customer_manager = Depends(fastapi_customer.get_user_manager),
    strategy = Depends(get_customer_database_strategy)  # or your auth strategy
) -> Optional[Customer]:
    """
    Most performant optional authentication - no exception handling needed
    """
    if not token:
        return None
    
    try:
        customer = await strategy.read_token(token.credentials, customer_manager)
        
        if customer and customer.is_active and customer.is_verified:
            return customer
    except:
        pass 
    
    return None