from pydantic import field_validator, SecretStr
from pydantic_settings import BaseSettings
from typing import Optional, Dict, Any, List


class Settings(BaseSettings): 
    PROJECT_NAME: str = "Smart-Mess-Backend"  
    API_V1_STR: str = ""
    POSTGRES_USER: str
    PGPASSWORD: SecretStr
    POSTGRES_HOST: str
    POSTGRES_PORT: str
    POSTGRES_DB: str
    SSL_MODE: str = "require" 
    DATABASE_URI: Optional[str] = None
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    BASE_URL: str="http://127.0.0.1:8000"
    CLIENT_URL: str="http://localhost:3000"
    MENU_URL: str="http://localhost:3001"

    @field_validator("DATABASE_URI", mode="before")
    def assemble_db_connection(cls, v: Optional[str], info: Dict[str, Any]) -> Any:
        if isinstance(v, str):
            return v
            
        # Build PostgreSQL connection string with SSL parameters for Neon
        return f"postgresql+asyncpg://{info.data.get('POSTGRES_USER')}:{info.data.get('PGPASSWORD').get_secret_value()}@{info.data.get('POSTGRES_HOST')}:{info.data.get('POSTGRES_PORT')}/{info.data.get('POSTGRES_DB')}?sslmode={info.data.get('SSL_MODE')}"
    # Security
    SECRET_KEY: SecretStr
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str]=["http://localhost:8000","http://localhost:3000","http://localhost:3001","http://10.10.1.68/3001"]
    
    class Config:
        case_sensitive = True
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()

