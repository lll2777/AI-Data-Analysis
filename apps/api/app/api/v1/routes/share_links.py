from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db_session
from app.schemas.auth import AuthUser
from app.schemas.share import PublicShareResponse, ShareLinkActionResponse
from app.services.share_links import ShareLinkService

router = APIRouter()


@router.post(
    "/dashboards/{dashboard_id}/share-link",
    response_model=ShareLinkActionResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_dashboard_share_link(
    dashboard_id: str,
    current_user: AuthUser = Depends(get_current_user),
    session: Session = Depends(get_db_session),
) -> ShareLinkActionResponse:
    try:
        return ShareLinkService(session).create_share_link(
            user=current_user,
            dashboard_id=dashboard_id,
        )
    except SQLAlchemyError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is unavailable for share link creation.",
        ) from exc


@router.delete(
    "/dashboards/{dashboard_id}/share-link",
    response_model=ShareLinkActionResponse,
)
async def revoke_dashboard_share_link(
    dashboard_id: str,
    current_user: AuthUser = Depends(get_current_user),
    session: Session = Depends(get_db_session),
) -> ShareLinkActionResponse:
    try:
        return ShareLinkService(session).revoke_share_link(
            user=current_user,
            dashboard_id=dashboard_id,
        )
    except SQLAlchemyError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is unavailable for share link revocation.",
        ) from exc


@router.get("/share/{token}", response_model=PublicShareResponse)
async def get_public_share(
    token: str,
    session: Session = Depends(get_db_session),
) -> PublicShareResponse:
    try:
        share = ShareLinkService(session).get_public_share(token=token)
    except SQLAlchemyError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is unavailable for shared dashboard lookup.",
        ) from exc

    if not share:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shared dashboard was not found or has been revoked.",
        )
    return share
