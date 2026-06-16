import httpx

from app.core.config import settings


class WeChatLoginError(RuntimeError):
    pass


def exchange_code_for_openid(code: str) -> str:
    if code.startswith("dev-") or not settings.wechat_app_id or not settings.wechat_app_secret:
        return f"dev-openid-{code}"

    response = httpx.get(
        "https://api.weixin.qq.com/sns/jscode2session",
        params={
            "appid": settings.wechat_app_id,
            "secret": settings.wechat_app_secret,
            "js_code": code,
            "grant_type": "authorization_code",
        },
        timeout=10,
    )
    response.raise_for_status()
    data = response.json()
    openid = data.get("openid")
    if not openid:
        raise WeChatLoginError(data.get("errmsg", "wechat login failed"))
    return openid
