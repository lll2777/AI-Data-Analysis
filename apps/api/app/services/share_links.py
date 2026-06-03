from secrets import token_urlsafe

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.repositories.share_links import ShareLinkRepository
from app.schemas.auth import AuthUser
from app.schemas.share import PublicShareResponse, ShareLinkActionResponse
from app.services.dashboards import DashboardService


class ShareLinkService:
    def __init__(self, session: Session) -> None:
        self.dashboard_service = DashboardService(session)
        self.share_repository = ShareLinkRepository(session)
        self.public_app_url = get_public_app_url()

    def create_share_link(
        self,
        *,
        user: AuthUser,
        dashboard_id: str,
    ) -> ShareLinkActionResponse:
        self.dashboard_service.get_dashboard(user=user, dashboard_id=dashboard_id)
        share = self.share_repository.get_active_for_dashboard(
            dashboard_id=dashboard_id,
            user_id=user.id,
        )
        if not share:
            share = self.share_repository.create(
                dashboard_id=dashboard_id,
                owner_id=user.id,
                token=generate_share_token(),
            )
        return ShareLinkActionResponse(
            share=share,
            url=build_share_url(self.public_app_url, share.token),
        )

    def revoke_share_link(
        self,
        *,
        user: AuthUser,
        dashboard_id: str,
    ) -> ShareLinkActionResponse:
        self.dashboard_service.get_dashboard(user=user, dashboard_id=dashboard_id)
        share = self.share_repository.revoke_active_for_dashboard(
            dashboard_id=dashboard_id,
            user_id=user.id,
        )
        if not share:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Active share link was not found.",
            )
        return ShareLinkActionResponse(
            share=share,
            url=build_share_url(self.public_app_url, share.token),
        )

    def get_public_share(self, *, token: str) -> PublicShareResponse | None:
        share = self.share_repository.get_active_by_token(token=token)
        if not share:
            return None

        dashboard = self.dashboard_service.get_public_dashboard(
            dashboard_id=share.dashboard_id,
        )
        if not dashboard:
            return None

        return PublicShareResponse(share=share, dashboard=dashboard)


def generate_share_token() -> str:
    return token_urlsafe(24)


def build_share_url(public_app_url: str, token: str) -> str:
    return f"{public_app_url.rstrip('/')}/share/{token}"


def get_public_app_url() -> str:
    settings = get_settings()
    origins = settings.cors_origins
    if origins:
        return origins[0]
    return "http://localhost:3000"
