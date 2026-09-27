import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "Antigravity Equity Research Platform"
    API_V1_STR: str = "/api/v1"
    
    # LLM API Keys
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Preferred LLM Provider (openai, anthropic, gemini, auto)
    DEFAULT_LLM_PROVIDER: str = os.getenv("DEFAULT_LLM_PROVIDER", "auto")
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./equity_research.db")
    
    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

settings = Settings()
