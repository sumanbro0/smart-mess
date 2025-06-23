from pathlib import Path
from fastapi import UploadFile


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

def save_file(file: UploadFile, path: str) -> str:
    """Save file to media directory"""
    file_path = UPLOAD_DIR / path
    file_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(file_path, 'wb') as f:
        f.write(file.file.read())
    
    return str(file_path)


def delete_file(path: str) -> None:
    pass