from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from db.session import get_async_session
from . import schema, models
import uuid
from datetime import datetime, UTC
from upload.route import file_router

router = APIRouter(prefix="/menu", tags=["menu"])

# Menu Routes
@router.post("/", response_model=schema.MenuResponse)
async def create_menu(
    request: Request,
    menu: schema.MenuCreate,
    db: Session = Depends(get_async_session)
):
    db_menu = models.Menu(**menu.model_dump(exclude={'image'}))
    if menu.image:
        # Upload image using the file router
        upload_response = await file_router.url_for("upload_file")(request=request, file=menu.image)
        db_menu.image = upload_response["url"]
    db.add(db_menu)
    db.commit()
    db.refresh(db_menu)
    return db_menu

@router.get("/{menu_id}", response_model=schema.MenuResponse)
def get_menu(menu_id: uuid.UUID, db: Session = Depends(get_async_session)):
    menu = db.query(models.Menu).filter(models.Menu.id == menu_id).first()
    if not menu:
        raise HTTPException(status_code=404, detail="Menu not found")
    return menu

@router.put("/{menu_id}", response_model=schema.MenuResponse)
async def update_menu(
    request: Request,
    menu_id: uuid.UUID,
    menu: schema.MenuUpdate,
    db: Session = Depends(get_async_session)
):
    db_menu = db.query(models.Menu).filter(models.Menu.id == menu_id).first()
    if not db_menu:
        raise HTTPException(status_code=404, detail="Menu not found")
    
    update_data = menu.model_dump(exclude_unset=True)
    if 'image' in update_data:
        if db_menu.image:
            # Extract category and filename from the URL
            image_url = db_menu.image
            category = image_url.split('/')[-2]
            filename = image_url.split('/')[-1]
            # Delete old image
            await file_router.url_for("delete_file")(category=category, filename=filename)
        
        # Upload new image
        upload_response = await file_router.url_for("upload_file")(request=request, file=update_data.pop('image'))
        update_data['image'] = upload_response["url"]
    
    for key, value in update_data.items():
        setattr(db_menu, key, value)
    
    db.commit()
    db.refresh(db_menu)
    return db_menu

@router.delete("/{menu_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_menu(menu_id: uuid.UUID, db: Session = Depends(get_async_session)):
    db_menu = db.query(models.Menu).filter(models.Menu.id == menu_id).first()
    if not db_menu:
        raise HTTPException(status_code=404, detail="Menu not found")
    
    if db_menu.image:
        # Extract category and filename from the URL
        image_url = db_menu.image
        category = image_url.split('/')[-2]
        filename = image_url.split('/')[-1]
        # Delete image
        await file_router.url_for("delete_file")(category=category, filename=filename)
    
    db.delete(db_menu)
    db.commit()

# MenuItemCategory Routes
@router.post("/category", response_model=schema.MenuItemCategoryResponse)
def create_category(
    category: schema.MenuItemCategoryCreate,
    db: Session = Depends(get_async_session)
):
    db_category = models.MenuItemCategory(**category.model_dump())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@router.get("/category/{category_id}", response_model=schema.MenuItemCategoryResponse)
def get_category(category_id: uuid.UUID, db: Session = Depends(get_async_session)):
    category = db.query(models.MenuItemCategory).filter(models.MenuItemCategory.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@router.put("/category/{category_id}", response_model=schema.MenuItemCategoryResponse)
def update_category(
    category_id: uuid.UUID,
    category: schema.MenuItemCategoryUpdate,
    db: Session = Depends(get_async_session)
):
    db_category = db.query(models.MenuItemCategory).filter(models.MenuItemCategory.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    for key, value in category.model_dump(exclude_unset=True).items():
        setattr(db_category, key, value)
    
    db.commit()
    db.refresh(db_category)
    return db_category

@router.delete("/category/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(category_id: uuid.UUID, db: Session = Depends(get_async_session)):
    db_category = db.query(models.MenuItemCategory).filter(models.MenuItemCategory.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    db.delete(db_category)
    db.commit()

# MenuItem Routes
@router.post("/item", response_model=schema.MenuItemResponse)
async def create_menu_item(
    request: Request,
    item: schema.MenuItemCreate,
    db: Session = Depends(get_async_session)
):
    db_item = models.MenuItem(**item.model_dump(exclude={'images'}))
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    
    if item.images:
        for image_data in item.images:
            # Upload image using the file router
            upload_response = await file_router.url_for("upload_file")(request=request, file=image_data)
            db_image = models.MenuItemImage(
                image=upload_response["url"],
                menu_item_id=db_item.id,
                is_primary=len(db_item.images) == 0
            )
            db.add(db_image)
        db.commit()
        db.refresh(db_item)
    
    return db_item

@router.get("/item/{item_id}", response_model=schema.MenuItemResponse)
def get_menu_item(item_id: uuid.UUID, db: Session = Depends(get_async_session)):
    item = db.query(models.MenuItem).filter(models.MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return item

@router.put("/item/{item_id}", response_model=schema.MenuItemResponse)
async def update_menu_item(
    request: Request,
    item_id: uuid.UUID,
    item: schema.MenuItemUpdate,
    db: Session = Depends(get_async_session)
):
    db_item = db.query(models.MenuItem).filter(models.MenuItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    update_data = item.model_dump(exclude_unset=True)
    if 'images' in update_data:
        images = update_data.pop('images')
        # Delete existing images
        for image in db_item.images:
            # Extract category and filename from the URL
            image_url = image.image
            category = image_url.split('/')[-2]
            filename = image_url.split('/')[-1]
            # Delete image
            await file_router.url_for("delete_file")(category=category, filename=filename)
            db.delete(image)
        
        # Add new images
        for image_data in images:
            # Upload new image
            upload_response = await file_router.url_for("upload_file")(request=request, file=image_data)
            db_image = models.MenuItemImage(
                image=upload_response["url"],
                menu_item_id=item_id,
                is_primary=len(db_item.images) == 0
            )
            db.add(db_image)
    
    for key, value in update_data.items():
        setattr(db_item, key, value)
    
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/item/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_menu_item(item_id: uuid.UUID, db: Session = Depends(get_async_session)):
    db_item = db.query(models.MenuItem).filter(models.MenuItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    # Delete associated images
    for image in db_item.images:
        # Extract category and filename from the URL
        image_url = image.image
        category = image_url.split('/')[-2]
        filename = image_url.split('/')[-1]
        # Delete image
        await file_router.url_for("delete_file")(category=category, filename=filename)
        db.delete(image)
    
    db.delete(db_item)
    db.commit()

# MenuItemImage Routes
@router.post("/item/{item_id}/image", response_model=schema.MenuItemImageResponse)
async def add_menu_item_image(
    request: Request,
    item_id: uuid.UUID,
    image: UploadFile = File(...),
    is_primary: bool = False,
    db: Session = Depends(get_async_session)
):
    db_item = db.query(models.MenuItem).filter(models.MenuItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    # Upload image using the file router
    upload_response = await file_router.url_for("upload_file")(request=request, file=image)
    
    if is_primary:
        # Set all other images as non-primary
        for existing_image in db_item.images:
            existing_image.is_primary = False
    
    db_image = models.MenuItemImage(
        image=upload_response["url"],
        menu_item_id=item_id,
        is_primary=is_primary
    )
    db.add(db_image)
    db.commit()
    db.refresh(db_image)
    return db_image

@router.delete("/item/image/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_menu_item_image(image_id: uuid.UUID, db: Session = Depends(get_async_session)):
    db_image = db.query(models.MenuItemImage).filter(models.MenuItemImage.id == image_id).first()
    if not db_image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    # Extract category and filename from the URL
    image_url = db_image.image
    category = image_url.split('/')[-2]
    filename = image_url.split('/')[-1]
    # Delete image
    await file_router.url_for("delete_file")(category=category, filename=filename)
    
    db.delete(db_image)
    db.commit()
