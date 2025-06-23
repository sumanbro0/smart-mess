from typing import Optional
from fastapi import Header


async def get_mess_id(mess_id: Optional[str] = Header(None, alias="MessId")):
    return mess_id

