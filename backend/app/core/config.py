from functools import lru_cache
from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_env_file = Path(".env")


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_env_file if _env_file.exists() else None,
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    app_name: str = "AW Client Report Portal"
    database_url: str = "postgresql://postgres:postgres@localhost:5432/aw_client_portal"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    cors_allow_vercel_previews: bool = False
    log_level: str = "INFO"

    @field_validator("database_url", mode="before")
    @classmethod
    def normalize_database_url(cls, value: str) -> str:
        if isinstance(value, str) and value.startswith("postgres://"):
            return value.replace("postgres://", "postgresql://", 1)
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()
