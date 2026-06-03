import unittest

from fastapi import HTTPException

from app.schemas.dashboard import DashboardResponse, DashboardSummaryResponse
from app.schemas.share import ShareLinkResponse
from app.services.share_links import ShareLinkService


class FakeDashboardService:
    def __init__(self) -> None:
        self.dashboard = DashboardResponse(
            id="dashboard-1",
            workspace_id="workspace-1",
            dataset_id="dataset-1",
            title="销售仪表盘",
            description="公开只读分享",
            layout={"version": 1, "items": []},
            status="active",
            chart_count=0,
            insight_count=0,
            charts=[],
            insights=[],
        )

    def get_dashboard(self, *, user, dashboard_id):
        if dashboard_id != self.dashboard.id:
            raise HTTPException(status_code=404, detail="not found")
        return self.dashboard

    def get_public_dashboard(self, *, dashboard_id):
        if dashboard_id != self.dashboard.id:
            return None
        return self.dashboard


class FakeShareLinkRepository:
    def __init__(self) -> None:
        self.active: ShareLinkResponse | None = None
        self.public_link: ShareLinkResponse | None = None
        self.revoked_dashboard_id: str | None = None

    def get_active_for_dashboard(self, *, dashboard_id, user_id):
        if self.active and self.active.dashboard_id == dashboard_id:
            return self.active
        return None

    def create(self, *, dashboard_id, owner_id, token):
        self.active = ShareLinkResponse(
            id="share-1",
            dashboard_id=dashboard_id,
            token=token,
            status="active",
            created_at="2026-06-03T00:00:00Z",
            revoked_at=None,
        )
        return self.active

    def revoke_active_for_dashboard(self, *, dashboard_id, user_id):
        self.revoked_dashboard_id = dashboard_id
        if self.active and self.active.dashboard_id == dashboard_id:
            self.active = ShareLinkResponse(
                **{
                    **self.active.model_dump(),
                    "status": "revoked",
                    "revoked_at": "2026-06-03T01:00:00Z",
                },
            )
            return self.active
        return None

    def get_active_by_token(self, *, token):
        if self.public_link and self.public_link.token == token:
            return self.public_link
        return None


class ShareLinkServiceTests(unittest.TestCase):
    def test_create_share_link_reuses_active_link(self) -> None:
        service = build_service()
        existing = ShareLinkResponse(
            id="share-existing",
            dashboard_id="dashboard-1",
            token="existing-token",
            status="active",
            created_at="2026-06-03T00:00:00Z",
            revoked_at=None,
        )
        service.share_repository.active = existing

        response = service.create_share_link(
            user=fake_user(),
            dashboard_id="dashboard-1",
        )

        self.assertEqual(response.share.token, "existing-token")
        self.assertEqual(response.url, "http://localhost:3000/share/existing-token")

    def test_get_public_share_returns_none_for_revoked_or_missing_token(self) -> None:
        service = build_service()

        response = service.get_public_share(token="missing-token")

        self.assertIsNone(response)

    def test_get_public_share_returns_dashboard_for_active_token(self) -> None:
        service = build_service()
        service.share_repository.public_link = ShareLinkResponse(
            id="share-1",
            dashboard_id="dashboard-1",
            token="active-token",
            status="active",
            created_at="2026-06-03T00:00:00Z",
            revoked_at=None,
        )

        response = service.get_public_share(token="active-token")

        self.assertIsNotNone(response)
        assert response is not None
        self.assertEqual(response.share.token, "active-token")
        self.assertEqual(response.dashboard.title, "销售仪表盘")

    def test_revoke_share_link_marks_active_link_revoked(self) -> None:
        service = build_service()
        service.share_repository.active = ShareLinkResponse(
            id="share-1",
            dashboard_id="dashboard-1",
            token="active-token",
            status="active",
            created_at="2026-06-03T00:00:00Z",
            revoked_at=None,
        )

        response = service.revoke_share_link(
            user=fake_user(),
            dashboard_id="dashboard-1",
        )

        self.assertEqual(response.share.status, "revoked")
        self.assertEqual(service.share_repository.revoked_dashboard_id, "dashboard-1")


def build_service() -> ShareLinkService:
    service = object.__new__(ShareLinkService)
    service.dashboard_service = FakeDashboardService()
    service.share_repository = FakeShareLinkRepository()
    service.public_app_url = "http://localhost:3000"
    return service


def fake_user():
    return type("User", (), {"id": "user-1"})()


if __name__ == "__main__":
    unittest.main()
