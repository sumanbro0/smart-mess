from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import exists, select, func
from sqlalchemy.orm import  selectinload, load_only
from db.session import get_async_session
from .schema import CategoryResponse, MenuItemCategoryCreate, MenuItemCategoryUpdate, MenuItemCategoryResponse, MenuItemCreate, MenuItemCreateResponse, MenuItemDisplayResponse, MenuItemUpdate, MenuItemResponse, MenuResponse
from .models import MenuItem, MenuItemCategory
import uuid
from upload.route import file_router
from mess.dependencies import  get_mess_and_user_context, require_mess_access, MessContext
from mess.crud import mess_crud
from orders.models import Order, OrderItem
from .recommendation import get_menu_recommendations_content_based, get_collaborative_filtering_recommendations
from auth.dep import optional_current_customer
from auth.models import Customer
from .utils import get_user_menu_items, get_popular_menu_items
router = APIRouter(prefix="/{mess_slug}/menu", tags=["menu"])

# Category Routes
@router.post("/categories", response_model=MenuItemCategoryResponse)
async def create_category(
    category: MenuItemCategoryCreate,
    context: MessContext = Depends(require_mess_access),
    db: AsyncSession = Depends(get_async_session)
):
    category.mess_id = context.mess.id

    result = await db.execute(
        select(MenuItemCategory).filter(
            MenuItemCategory.slug == category.slug,
            MenuItemCategory.mess_id == context.mess.id
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Category with this slug already exists")

    db_category = MenuItemCategory(**category.model_dump())
    db.add(db_category)
    await db.commit()
    await db.refresh(db_category)   
    return db_category

@router.get("/categories", response_model=list[CategoryResponse])
async def get_categories(
    context: MessContext = Depends(require_mess_access),
    db: AsyncSession = Depends(get_async_session)
):
    result = await db.execute(select(MenuItemCategory).filter(MenuItemCategory.mess_id == context.mess.id))
    categories = result.scalars().all()
    return categories


@router.get("/menu-categories", response_model=list[CategoryResponse])
async def get_menu_categories(
    mess_slug: str,
    db: AsyncSession = Depends(get_async_session)
):
    mess = await mess_crud.get_by_slug(db, mess_slug)
    if not mess:
        raise HTTPException(status_code=404, detail="Mess not found")
    result = await db.execute(select(MenuItemCategory).filter(MenuItemCategory.mess_id == mess.id))
    categories = result.scalars().all()
    return categories

@router.get("/categories/{category_id}", response_model=MenuItemCategoryResponse)
async def get_category(
    category_id: uuid.UUID,
    context: MessContext = Depends(require_mess_access),  # Read-only access
    db: AsyncSession = Depends(get_async_session)
):
    result = await db.execute(
        select(MenuItemCategory).filter(
            MenuItemCategory.id == category_id,
            MenuItemCategory.mess_id == context.mess.id
        )
    )
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@router.put("/categories/{category_id}", response_model=MenuItemCategoryResponse)
async def update_category(
    category_id: uuid.UUID,
    category: MenuItemCategoryUpdate,
    context: MessContext = Depends(require_mess_access),
    db: AsyncSession = Depends(get_async_session)
):
    result = await db.execute(
        select(MenuItemCategory).filter(
            MenuItemCategory.id == category_id,
            MenuItemCategory.mess_id == context.mess.id
        )
    )
    db_category = result.scalar_one_or_none()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    for key, value in category.model_dump(exclude_unset=True).items():
        setattr(db_category, key, value)
    
    await db.commit()
    await db.refresh(db_category)
    return db_category

@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: uuid.UUID,
    context: MessContext = Depends(require_mess_access),
    db: AsyncSession = Depends(get_async_session)
):
    result = await db.execute(
        select(MenuItemCategory).filter(
            MenuItemCategory.id == category_id,
            MenuItemCategory.mess_id == context.mess.id
        )
    )
    db_category = result.scalar_one_or_none()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    await db.delete(db_category)
    await db.commit()

# Menu Item Routes
@router.post("/items", response_model=MenuItemCreateResponse)
async def create_menu_item(
    item: MenuItemCreate,
    context: MessContext = Depends(require_mess_access),
    db: AsyncSession = Depends(get_async_session)
):
    print("***************************")
    print(item)
    print("***************************")
    item.mess_id = context.mess.id
    db_item = MenuItem(**item.model_dump())
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    
    return MenuItemCreateResponse(id=db_item.id)

@router.get("/items", response_model=list[MenuItemDisplayResponse])
async def get_menu_items(
    context: MessContext = Depends(require_mess_access),
    db: AsyncSession = Depends(get_async_session),
):
    # changed from joinedload to selectinload
    result = await db.execute(select(MenuItem).options(
        selectinload(MenuItem.category).load_only(MenuItemCategory.name),
        ).filter(MenuItem.mess_id == context.mess.id)
        )
    items = result.scalars().all()
    return items


@router.get("/items/display", response_model=MenuResponse)
async def get_menu_items_display(
    mess_slug: str,
    calorieMins: int = 0,
    calorieMaxes: int = 0,
    spiceLevel: str = "",
    vegType: str = "",
    category: str = "",
    q: str = "",
    db: AsyncSession = Depends(get_async_session),
    auth: Optional[Customer] = Depends(optional_current_customer)
):
    print("_________________________")
    print(auth)
    print(calorieMins)
    print(calorieMaxes)
    print(spiceLevel)
    print(vegType)
    print(category)
    print(q)
    print("_________________________")
    
    mess = await mess_crud.get_by_slug(db, mess_slug)

    if not mess:
        raise HTTPException(status_code=404, detail="Mess not found")
    # changed from joinedload to selectinload
    query = select(MenuItem).options(
        selectinload(MenuItem.category).load_only(MenuItemCategory.name),
    ).filter(MenuItem.mess_id == mess.id)
    
    if category and category != "all":
        query = query.filter(MenuItem.category.has(MenuItemCategory.slug == category))
    
    if q and q != "":
        query = query.filter(MenuItem.name.ilike(f"%{q}%"))

    if calorieMaxes and calorieMaxes != 0:
        query = query.filter(MenuItem.calories <= calorieMaxes)
    
    if calorieMins and calorieMins != 0:
        query = query.filter(MenuItem.calories >= calorieMins) 

    if spiceLevel and spiceLevel != "":
        query = query.filter(MenuItem.spiciness == spiceLevel)
    
    if vegType and vegType != "":
        query = query.filter(MenuItem.is_veg == (vegType == "veg"))

    
    
    result = await db.execute(query)
    items = result.scalars().all()
    try:
        if auth and len(items) > 5:
            print("***************************")
            print(get_user_menu_items.cache_info())
            print("***************************")
            user_menu_items = await get_user_menu_items(auth.email)
            calories=[]
            spices=[]
            vegTypesArray=[]
            for item in user_menu_items:
                calories.append(item.calories)
                spices.append(item.spiciness)
                vegTypesArray.append("veg" if item.is_veg else "non-veg")
        
            spices=list(set(spices)) if spices else []
            vegTypesArray=list(set(vegTypesArray)) if vegTypesArray else []
    
            sorted_items =get_menu_recommendations_content_based(
                items=items, 
                calories=calories, 
                spices=spices, 
                vegTypesArray=vegTypesArray
            )

            if len(user_menu_items)< 5:
                return MenuResponse(currency=mess.currency, items=sorted_items)

            collab_sorted_items =await get_collaborative_filtering_recommendations(
                items=sorted_items, 
                user_id=auth.id, 
            )

            return MenuResponse(currency=mess.currency, items=collab_sorted_items)
        else:
            popular_items = await get_popular_menu_items()
            calories=[]
            spices=[]
            vegTypesArray=[]
            for item in popular_items:
                calories.append(item.calories)
                spices.append(item.spiciness)
                vegTypesArray.append("veg" if item.is_veg else "non-veg")
            print("***************************")
            print(calories)
            print(spices)
            print(vegTypesArray)
            print("***************************")
            sorted_items =get_menu_recommendations_content_based(
                items=items, 
                calories=calories, 
                spices=spices, 
                vegTypesArray=vegTypesArray
            )
            return MenuResponse(currency=mess.currency, items=sorted_items)
    except Exception as e:
        print("*************************** error Recommendation ***************************")
        print(e)
        print("***************************")
        return MenuResponse(currency=mess.currency, items=items)
    

@router.get("/items/{item_id}", response_model=MenuItemResponse)
async def get_menu_item(
    item_id: uuid.UUID,
    context: MessContext = Depends(get_mess_and_user_context),
    db: AsyncSession = Depends(get_async_session)
):
    result = await db.execute(
        select(MenuItem).filter(
            MenuItem.id == item_id,
            MenuItem.mess_id == context.mess.id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return item

@router.put("/items/{item_id}", response_model=MenuItemResponse)
async def update_menu_item(
    item_id: uuid.UUID,
    item: MenuItemUpdate,
    context: MessContext = Depends(require_mess_access),
    db: AsyncSession = Depends(get_async_session)
):
    print("***************************")
    print(item)
    print("***************************")
    result = await db.execute(
        select(MenuItem).filter(
            MenuItem.id == item_id,
            MenuItem.mess_id == context.mess.id
        )
    )
    db_item = result.scalar_one_or_none()
    if not db_item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    update_data = item.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
    
    await db.commit()
    await db.refresh(db_item)
    return db_item

@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_menu_item(
    item_id: uuid.UUID,
    context: MessContext = Depends(require_mess_access),
    db: AsyncSession = Depends(get_async_session)
):
    result = await db.execute(
        select(MenuItem).filter(
            MenuItem.id == item_id,
            MenuItem.mess_id == context.mess.id
        )
    )
    db_item = result.scalar_one_or_none()
    if not db_item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    # Delete associated images
    for image in db_item.images:
        image_url = image.image
        category = image_url.split('/')[-2]
        filename = image_url.split('/')[-1]
        await file_router.url_for("delete_file")(category=category, filename=filename)
        await db.delete(image)
    
    await db.delete(db_item)
    await db.commit()
