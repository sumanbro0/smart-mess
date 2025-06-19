from fastapi_users.router.oauth import get_oauth_router
from .config import auth_backend
from .main import get_user_manager
from core.config import settings
from httpx_oauth.clients.google import GoogleOAuth2
import logging
from fastapi import HTTPException, Request
from httpx import HTTPError, AsyncClient
import json
from fastapi.responses import JSONResponse
from typing import Optional, Dict, Any
import urllib.parse

# Enable detailed logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Add these new configurations
GOOGLE_CLIENT_ID = settings.GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET = settings.GOOGLE_CLIENT_SECRET

logger.info(f"Initializing OAuth2 with CLIENT_URL: {settings.CLIENT_URL}")
logger.info(f"Google Client ID: {GOOGLE_CLIENT_ID[:10]}...")  # Log only first 10 chars for security

class CustomGoogleOAuth2(GoogleOAuth2):
    async def get_access_token(
        self,
        code: str,
        redirect_uri: Optional[str] = None,
        code_verifier: Optional[str] = None,
        **kwargs: Any
    ) -> Dict[str, Any]:
        try:
            # Ensure redirect_uri matches the one used in authorization
            if not redirect_uri:
                redirect_uri = f"{settings.CLIENT_URL}/auth/google/callback"
                logger.debug(f"Using default redirect URI: {redirect_uri}")

            # Prepare token request data
            data = {
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": redirect_uri,
            }

            # URL encode the data
            encoded_data = urllib.parse.urlencode(data)
            logger.debug("Token request data prepared")

            # Make the token request with additional security headers
            async with AsyncClient() as client:
                response = await client.post(
                    "https://oauth2.googleapis.com/token",
                    content=encoded_data,
                    headers={
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Accept": "application/json",
                        "User-Agent": "FastAPI-OAuth2-Client",
                        "X-Requested-With": "XMLHttpRequest",
                        "Origin": settings.CLIENT_URL,
                        "Referer": f"{settings.CLIENT_URL}/auth/google"
                    }
                )

                if response.status_code != 200:
                    error_data = response.json()
                    logger.error(f"Token request failed: {error_data}")
                    error_description = error_data.get("error_description", "Token request failed")
                    error_code = error_data.get("error", "unknown_error")
                    
                    # Provide more detailed error information
                    raise HTTPException(
                        status_code=400,
                        detail={
                            "error": "oauth_error",
                            "error_description": error_description,
                            "error_code": error_code,
                            "redirect_uri": redirect_uri,
                            "client_id": self.client_id[:10] + "...",  # Only show first 10 chars
                            "help": "Please check your OAuth consent screen configuration in Google Cloud Console"
                        }
                    )

                token_data = response.json()
                logger.debug("Successfully obtained access token")
                return token_data

        except HTTPError as e:
            logger.error(f"Error getting access token: {str(e)}")
            if hasattr(e, 'response'):
                logger.error(f"Response status: {e.response.status_code}")
                logger.error(f"Response headers: {dict(e.response.headers)}")
                try:
                    error_body = e.response.json()
                    logger.error(f"Response body: {json.dumps(error_body, indent=2)}")
                    raise HTTPException(
                        status_code=400,
                        detail={
                            "error": "oauth_error",
                            "error_description": error_body.get("error_description", str(e)),
                            "error_code": error_body.get("error", "unknown_error"),
                            "help": "Please check your OAuth consent screen configuration in Google Cloud Console"
                        }
                    )
                except:
                    logger.error(f"Raw response content: {e.response.text}")
                    raise HTTPException(
                        status_code=400,
                        detail={
                            "error": "oauth_error",
                            "error_description": e.response.text,
                            "error_code": "unknown_error",
                            "help": "Please check your OAuth consent screen configuration in Google Cloud Console"
                        }
                    )
            raise HTTPException(status_code=500, detail=f"OAuth error: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error in get_access_token: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

    async def get_id_email(self, token: str) -> tuple[str, str]:
        """Get user ID and email from Google API."""
        try:
            logger.debug("Attempting to get user ID and email from Google API")
            async with AsyncClient() as client:
                response = await client.get(
                    "https://www.googleapis.com/oauth2/v2/userinfo",
                    headers={
                        "Authorization": f"Bearer {token}",
                        "Accept": "application/json",
                    },
                )
                
                if response.status_code != 200:
                    error_data = response.json()
                    logger.error(f"Failed to get user info: {error_data}")
                    raise HTTPException(
                        status_code=400,
                        detail={
                            "error": "user_info_error",
                            "error_description": error_data.get("error_description", "Failed to get user info"),
                            "error_code": error_data.get("error", "unknown_error"),
                        }
                    )

                user_info = response.json()
                logger.debug(f"Successfully retrieved user info: {user_info.get('email')}")
                
                if not user_info.get("id") or not user_info.get("email"):
                    logger.error("Missing required user info fields")
                    raise HTTPException(
                        status_code=400,
                        detail={
                            "error": "missing_user_info",
                            "error_description": "Google API response missing required fields",
                        }
                    )

                return user_info["id"], user_info["email"]

        except HTTPError as e:
            logger.error(f"HTTP error getting user info: {str(e)}")
            if hasattr(e, 'response'):
                logger.error(f"Response status: {e.response.status_code}")
                logger.error(f"Response headers: {dict(e.response.headers)}")
                try:
                    error_body = e.response.json()
                    logger.error(f"Response body: {json.dumps(error_body, indent=2)}")
                except:
                    logger.error(f"Raw response content: {e.response.text}")
            raise HTTPException(
                status_code=500,
                detail={
                    "error": "user_info_error",
                    "error_description": "Failed to get user info from Google",
                }
            )
        except Exception as e:
            logger.error(f"Unexpected error getting user info: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail={
                    "error": "user_info_error",
                    "error_description": f"Unexpected error: {str(e)}",
                }
            )

# Create OAuth2 router with error handling
oauth2_router = get_oauth_router(
    oauth_client=CustomGoogleOAuth2(
        client_id=GOOGLE_CLIENT_ID,
        client_secret=GOOGLE_CLIENT_SECRET,
        scopes=["profile", "email"],
    ),
    get_user_manager=get_user_manager,
    backend=auth_backend,
    state_secret=settings.SECRET_KEY.get_secret_value(),
    redirect_url=f"{settings.CLIENT_URL}/auth/google/callback",
    associate_by_email=True,
    is_verified_by_default=True,
)
