from pydantic import BaseModel
from typing import List

class UploadResponse(BaseModel):
    filename: str
    stored_filename: str
    size: int
    category: str
    mime_type: str
    url: str

class UploadMultipleResponse(BaseModel):
    files: List[UploadResponse]