from ..core.limiter import InMemoryRateLimiter
from fastapi import Request
from fastapi.responses import JSONResponse

rate_limiter = InMemoryRateLimiter()

class LoginRateLimitMiddleware:
    def __init__(self, app):
        self.app = app
        self.rate_limiter = rate_limiter
    
    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        
        request = Request(scope, receive)
        
        # Apply rate limiting to login endpoint
        if request.url.path == "/auth/login" and request.method == "POST":
            identifier = f"login:{request.client.host}"
            is_allowed, info = await self.rate_limiter.is_allowed(identifier, 2, 300)  # 5 per 5 minutes
            
            if not is_allowed:
                response = JSONResponse(
                    status_code=429,
                    content={
                        "detail": f"Too many login attempts. Try again in {info['retry_after']} seconds."
                    },
                    headers={
                        "X-RateLimit-Remaining": "0",
                        "X-RateLimit-Reset": str(info["reset_time"]),
                        "Retry-After": str(info["retry_after"])
                    }
                )
                await response(scope, receive, send)
                return
        
        # Apply general rate limiting to other endpoints
        elif not request.url.path.startswith("/static") and not request.url.path in ["/health", "/docs", "/openapi.json"]:
            identifier = f"ip:{request.client.host}"
            is_allowed, info = await self.rate_limiter.is_allowed(identifier, 1000, 3600)  # 100 per hour
            
            if not is_allowed:
                response = JSONResponse(
                    status_code=429,
                    content={"detail": "Rate limit exceeded"},
                    headers={
                        "X-RateLimit-Remaining": "0",
                        "X-RateLimit-Reset": str(info["reset_time"]),
                        "Retry-After": str(info["retry_after"])
                    }
                )
                await response(scope, receive, send)
                return
        
        await self.app(scope, receive, send)