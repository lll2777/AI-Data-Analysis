from sqlalchemy import text
from sqlalchemy.orm import Session

from app.repositories.records import normalize_record
from app.schemas.share import ShareLinkResponse


class ShareLinkRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def get_active_for_dashboard(
        self,
        *,
        dashboard_id: str,
        user_id: str,
    ) -> ShareLinkResponse | None:
        row = self.session.execute(
            text(
                """
                select
                  id,
                  dashboard_id,
                  token,
                  status,
                  created_at::text as created_at,
                  revoked_at::text as revoked_at
                from share_links
                where dashboard_id = :dashboard_id
                  and owner_id = :user_id
                  and status = 'active'
                limit 1
                """,
            ),
            {"dashboard_id": dashboard_id, "user_id": user_id},
        ).mappings().first()
        return ShareLinkResponse(**normalize_record(row)) if row else None

    def create(
        self,
        *,
        dashboard_id: str,
        owner_id: str,
        token: str,
    ) -> ShareLinkResponse:
        row = self.session.execute(
            text(
                """
                insert into share_links (
                  dashboard_id,
                  owner_id,
                  token,
                  status
                )
                values (
                  :dashboard_id,
                  :owner_id,
                  :token,
                  'active'
                )
                returning
                  id,
                  dashboard_id,
                  token,
                  status,
                  created_at::text as created_at,
                  revoked_at::text as revoked_at
                """,
            ),
            {
                "dashboard_id": dashboard_id,
                "owner_id": owner_id,
                "token": token,
            },
        ).mappings().one()
        self.session.commit()
        return ShareLinkResponse(**normalize_record(row))

    def revoke_active_for_dashboard(
        self,
        *,
        dashboard_id: str,
        user_id: str,
    ) -> ShareLinkResponse | None:
        row = self.session.execute(
            text(
                """
                update share_links
                set status = 'revoked',
                    revoked_at = now()
                where dashboard_id = :dashboard_id
                  and owner_id = :user_id
                  and status = 'active'
                returning
                  id,
                  dashboard_id,
                  token,
                  status,
                  created_at::text as created_at,
                  revoked_at::text as revoked_at
                """,
            ),
            {"dashboard_id": dashboard_id, "user_id": user_id},
        ).mappings().first()
        self.session.commit()
        return ShareLinkResponse(**normalize_record(row)) if row else None

    def get_active_by_token(self, *, token: str) -> ShareLinkResponse | None:
        row = self.session.execute(
            text(
                """
                select
                  id,
                  dashboard_id,
                  token,
                  status,
                  created_at::text as created_at,
                  revoked_at::text as revoked_at
                from share_links
                where token = :token
                  and status = 'active'
                limit 1
                """,
            ),
            {"token": token},
        ).mappings().first()
        return ShareLinkResponse(**normalize_record(row)) if row else None
