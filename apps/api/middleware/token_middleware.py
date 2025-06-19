from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response


class AccessTokenMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Check if Authorization header already exists
        print(request.headers,"***************",request.cookies)
        if "Authorization" not in request.headers:
            access_token = request.cookies.get("access_token")
            if access_token:
                headers = dict(request.headers)
                headers["Authorization"] = f"Bearer {access_token}"
                request._headers = headers
                request.scope["headers"] = [
                    (key.encode(), value.encode()) 
                    for key, value in headers.items()
                ]
        
        response = await call_next(request)
        return response