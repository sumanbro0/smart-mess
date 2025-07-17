from fastapi import APIRouter, Depends, HTTPException, Query, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import  joinedload
from db.session import get_async_session
from .schema import CategoryResponse, MenuItemCategoryCreate, MenuItemCategoryUpdate, MenuItemCategoryResponse, MenuItemCreate, MenuItemCreateResponse, MenuItemDisplayResponse, MenuItemUpdate, MenuItemResponse, MenuResponse
from .models import MenuItem, MenuItemCategory
import uuid
from upload.route import file_router
from mess.dependencies import get_mess_and_user_context, require_mess_access, MessContext
from mess.crud import mess_crud
from .recommendation import get_menu_recommendations_content_based

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
    db: AsyncSession = Depends(get_async_session)
):
    result = await db.execute(select(MenuItem).options(
        joinedload(MenuItem.category).load_only(MenuItemCategory.name),
        ).filter(MenuItem.mess_id == context.mess.id)
        )
    items = result.scalars().all()
    return items


@router.get("/items/display", response_model=MenuResponse)
async def get_menu_items_display(
    mess_slug: str,
    calorieMins: list[int] = Query(default=[]),
    calorieMaxes: list[int] = Query(default=[]),
    spices: list[str] = Query(default=[]),
    vegTypesArray: list[str] = Query(default=[]),
    db: AsyncSession = Depends(get_async_session)
):
    print("_________________________")
    print(calorieMins)
    print(calorieMaxes)
    print(spices)
    print(vegTypesArray)
    print("_________________________")
    
    mess = await mess_crud.get_by_slug(db, mess_slug)

    if not mess:
        raise HTTPException(status_code=404, detail="Mess not found")
    result = await db.execute(select(MenuItem).options(
        joinedload(MenuItem.category).load_only(MenuItemCategory.name),
    ).filter(MenuItem.mess_id == mess.id))

    items = result.scalars().all()
    filtered_items = get_menu_recommendations_content_based(items=items, calorie_mins=calorieMins, calorie_maxes=calorieMaxes, spices=spices, vegTypesArray=vegTypesArray)
    return MenuResponse(currency=mess.currency, items=filtered_items)

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
