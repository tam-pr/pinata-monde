"""Application configuration loaded from environment variables."""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=BACKEND_DIR / ".env", extra="ignore")

    database_url: str = ""
    upload_dir: Path = Path("uploads")
    max_image_bytes: int = 5 * 1024 * 1024
    max_images_per_quote: int = 3
    frontend_origin: str = "http://localhost:3000,http://127.0.0.1:3000"

    @property
    def frontend_origins(self) -> list[str]:
        return [origin.strip() for origin in self.frontend_origin.split(",") if origin.strip()]
    ml_backend: str = "baseline"
    # Odoo JSON-2 API (see app/services/odoo.py). ODOO_MOCK gates lead
    # *creation* only; the read-only connectivity check ignores it.
    odoo_mock: bool = True
    odoo_url: str = ""
    odoo_database: str = ""
    odoo_api_key: str = ""


@lru_cache
def get_settings() -> Settings:
    return Settings()
