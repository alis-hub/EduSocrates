from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    APP_NAME: str = "GuruMera AI Gateway"
    API_PREFIX: str = "/api/v1"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    
    # LLM Settings
    DEFAULT_PROVIDER: str = "mock"  # "mock", "gemini", "openai"
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    LLM_TEMPERATURE: float = 0.3

    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    ENVIRONMENT: str = "development"
    # Shared secret the API gateway must send as X-Internal-Key.
    AI_GATEWAY_API_KEY: Optional[str] = None

    # Security & Encryption
    # No default: a known key in source control is no encryption. See core/auth.validate_security_config.
    AES_ENCRYPTION_KEY: Optional[str] = None
    
    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

