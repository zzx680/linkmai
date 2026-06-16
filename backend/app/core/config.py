from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    app_name: str = "linkmai-api"
    app_env: str = "local"
    api_prefix: str = "/api/v1"
    database_url: str = "sqlite:///./linkmai.db"
    jwt_secret: str = "change-me"
    wechat_app_id: str = ""
    wechat_app_secret: str = ""
    aliyun_oss_endpoint: str = ""
    aliyun_oss_bucket: str = ""
    aliyun_access_key_id: str = ""
    aliyun_access_key_secret: str = ""
    cors_origins: list[str] = ["*"]
    access_token_expire_minutes: int = 60 * 24 * 7
    db_auto_create: bool = True


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
