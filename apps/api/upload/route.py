from fastapi import APIRouter, Depends, File, Request, UploadFile, HTTPException
from fastapi.responses import FileResponse
import uuid
from pathlib import Path
from typing import List
import mimetypes

file_router = APIRouter(prefix="/files", tags=["files"])

# Create upload directory
UPLOAD_DIR = Path("media")
UPLOAD_DIR.mkdir(exist_ok=True)

# Allowed file types
ALLOWED_EXTENSIONS = {
    'image': ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    # 'video': ['mp4', 'avi', 'mov', 'wmv'],
    # 'audio': ['mp3', 'wav', 'ogg', 'flac'],
    # 'document': ['pdf', 'doc', 'docx', 'txt']
}

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def get_file_category(filename: str) -> str:
    """Determine file category based on extension"""
    extension = filename.split('.')[-1].lower()
    for category, extensions in ALLOWED_EXTENSIONS.items():
        if extension in extensions:
            return category
    return 'other'

def validate_file(file: UploadFile) -> bool:
    """Validate file type and size"""
    if not file.filename:
        return False
    
    extension = file.filename.split('.')[-1].lower()
    allowed_extensions = [ext for exts in ALLOWED_EXTENSIONS.values() for ext in exts]
    
    return extension in allowed_extensions

@file_router.post("/upload/")
async def upload_file(request:Request,file: UploadFile = File(...)):
    """Upload a single media file"""
    
    # Validate file
    if not validate_file(file):
        raise HTTPException(status_code=400, detail="File type not allowed")
    
    # Check file size
    file_size = 0
    content = await file.read()
    file_size = len(content)
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large")
    
    # Generate unique filename
    file_extension = file.filename.split('.')[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    
    # Determine category and create subdirectory
    category = get_file_category(file.filename)
    category_dir = UPLOAD_DIR / category
    category_dir.mkdir(exist_ok=True)
    
    file_path = category_dir / unique_filename
    
    # Save file
    try:
        with file_path.open("wb") as buffer:
            buffer.write(content)
        
        # Get file info
        mime_type = mimetypes.guess_type(file.filename)[0]
        file_url = f"{request.base_url}media/{category}/{unique_filename}"
        
        return {
            "filename": file.filename,
            "stored_filename": unique_filename,
            "size": file_size,
            "category": category,
            "mime_type": mime_type,
            "url": file_url
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {str(e)}")

@file_router.post("/upload/multiple/")
async def upload_multiple_files(files: List[UploadFile] = File(...)):
    """Upload multiple media files"""
    
    if len(files) > 10:  # Limit number of files
        raise HTTPException(status_code=400, detail="Too many files. Maximum 10 files allowed")
    
    results = []
    errors = []
    
    for file in files:
        try:
            # Validate file
            if not validate_file(file):
                errors.append(f"{file.filename}: File type not allowed")
                continue
            
            # Check file size
            content = await file.read()
            file_size = len(content)
            
            if file_size > MAX_FILE_SIZE:
                errors.append(f"{file.filename}: File too large")
                continue
            
            # Generate unique filename
            file_extension = file.filename.split('.')[-1]
            unique_filename = f"{uuid.uuid4()}.{file_extension}"
            
            # Determine category and create subdirectory
            category = get_file_category(file.filename)
            category_dir = UPLOAD_DIR / category
            category_dir.mkdir(exist_ok=True)
            
            file_path = category_dir / unique_filename
            
            # Save file
            with file_path.open("wb") as buffer:
                buffer.write(content)
            
            # Get file info
            file_url = f"/media/{category}/{unique_filename}"
            mime_type = mimetypes.guess_type(file.filename)[0]
            
            results.append({
                "filename": file.filename,
                "stored_filename": unique_filename,
                "size": file_size,
                "category": category,
                "mime_type": mime_type,
                "url": file_url
            })
        
        except Exception as e:
            errors.append(f"{file.filename}: {str(e)}")
    
    return {
        "uploaded": results,
        "errors": errors,
        "total_uploaded": len(results),
        "total_errors": len(errors)
    }

@file_router.get("/{category}/{filename}")
async def get_file(category: str, filename: str):
    """Serve uploaded files"""
    file_path = UPLOAD_DIR / category / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(file_path)

@file_router.delete("/{category}/{filename}")
async def delete_file(category: str, filename: str):
    """Delete uploaded file"""
    file_path = UPLOAD_DIR / category / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        file_path.unlink()
        return {"message": "File deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not delete file: {str(e)}")

@file_router.get("/info")
async def get_upload_info():
    """Get upload configuration info"""
    return {
        "max_file_size": MAX_FILE_SIZE,
        "allowed_extensions": ALLOWED_EXTENSIONS,
        "max_files_per_upload": 10
    }

# Remove the if __name__ == "__main__" block since this is a router