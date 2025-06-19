
from pydantic import BaseModel


class ResponseMessage(BaseModel):
    message: str
    status_code: int
