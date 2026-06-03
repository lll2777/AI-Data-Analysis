from pydantic import BaseModel

from app.schemas.dashboard import DashboardResponse


class ShareLinkResponse(BaseModel):
    id: str
    dashboard_id: str
    token: str
    status: str
    created_at: str | None = None
    revoked_at: str | None = None


class ShareLinkActionResponse(BaseModel):
    share: ShareLinkResponse
    url: str


class PublicShareResponse(BaseModel):
    share: ShareLinkResponse
    dashboard: DashboardResponse
