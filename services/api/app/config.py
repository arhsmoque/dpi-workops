from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"
CONFIG_DIR = BASE_DIR.parent.parent / "config"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=BASE_DIR / ".env", extra="ignore")

    app_name: str = "DPI WorkOps API"
    app_version: str = "0.1.0"
    debug: bool = False

    db_path: str = str(DATA_DIR / "workops.db")
    config_dir: str = str(CONFIG_DIR)

    # CORS — allow local Vite dev server and production Pages domain
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://localhost:4173",
        "https://dpi-workops.pages.dev",
    ]

    # Operating law: agents may not send email or submit documents autonomously
    allow_autonomous_send: bool = False
    allow_autonomous_submit: bool = False

    # Sprint 1 — Gmail OAuth
    google_client_id: str = ""
    google_client_secret: str = ""
    # Redirect URI must match Google Cloud Console configuration
    google_redirect_uri: str = "http://localhost:8000/api/gmail/oauth/callback"
    # How many days of email history to fetch on first sync
    gmail_history_days: int = 30


settings = Settings()
