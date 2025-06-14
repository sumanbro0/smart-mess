from fastapi_users.router.oauth import get_oauth_router
from .config import auth_backend
from .main import get_user_manager
from core.config import settings
from httpx_oauth.clients.google import GoogleOAuth2

# Add these new configurations
GOOGLE_CLIENT_ID = settings.GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET = settings.GOOGLE_CLIENT_SECRET

# Create OAuth2 router
oauth2_router = get_oauth_router(
    oauth_client=GoogleOAuth2(
        client_id=GOOGLE_CLIENT_ID,
        client_secret=GOOGLE_CLIENT_SECRET,
        scopes=["profile", "email"],
    ),
    get_user_manager=get_user_manager,
    backend=auth_backend,
    state_secret=settings.SECRET_KEY.get_secret_value(),
    redirect_url=f"{settings.CLIENT_URL}/auth/google/callback",  # Change this to your callback URL
    associate_by_email=True,
    is_verified_by_default=True,
)