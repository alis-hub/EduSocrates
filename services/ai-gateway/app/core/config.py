from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    APP_NAME: str = "EduSocrates AI Gateway"
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
    
    # Security & Encryption
    AES_ENCRYPTION_KEY: str = "edusocrates-aes256-secret-key-32b"
    
    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

