from datetime import time
from collections import defaultdict
from collections import deque
import asyncio
from typing import Dict
import time  # Add this import

from fastapi import HTTPException, Request, status

class InMemoryRateLimiter:
    def __init__(self):
        self.requests: Dict[str, deque] = defaultdict(deque)
        self.lock = asyncio.Lock()
    
    async def is_allowed(
        self, 
        key: str, 
        max_requests: int, 
        window_seconds: int
    ) -> tuple[bool, dict]:
        """
        Check if request is allowed and return rate limit info
        Returns: (is_allowed, {"remaining": int, "reset_time": int})
        """
        async with self.lock:
            now = time.time()  # Changed from time() to time.time()
            window_start = now - window_seconds
            
            # Clean old requests
            while self.requests[key] and self.requests[key][0] < window_start:
                self.requests[key].popleft()
            
            current_count = len(self.requests[key])
            
            if current_count >= max_requests:
                # Get reset time (when oldest request expires)
                reset_time = int(self.requests[key][0] + window_seconds)
                return False, {
                    "remaining": 0, 
                    "reset_time": reset_time,
                    "retry_after": reset_time - int(now)
                }
            
            # Add current request
            self.requests[key].append(now)
            
            return True, {
                "remaining": max_requests - current_count - 1,
                "reset_time": int(now + window_seconds),
                "retry_after": 0
            }
        
rate_limiter = InMemoryRateLimiter()

def create_rate_limit_dependency(max_requests: int, window_seconds: int):
    """Factory function to create rate limit dependencies"""
    async def rate_limit_check(request: Request):
        # Get identifier (IP or user ID)
        identifier = request.client.host
        if hasattr(request.state, 'user') and request.state.user:
            identifier = f"user:{request.state.user.id}"
        
        is_allowed, info = await rate_limiter.is_allowed(
            identifier, max_requests, window_seconds
        )
        
        if not is_allowed:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded",
                headers={
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(info["reset_time"]),
                    "Retry-After": str(info["retry_after"])
                }
            )
        
        # Add rate limit headers to response
        request.state.rate_limit_info = info
        return True
    
    return rate_limit_check