from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.health_check import HealthCheck
from app.models.website import Website
from app.schemas.health_check import (
    HealthCheckResponse,
    PaginatedHealthCheckResponse,
)
from app.schemas.website import WebsiteCreate, WebsiteResponse, WebsiteStatusResponse

router = APIRouter(prefix="/api/websites", tags=["websites"])


@router.get("/{website_id}/history", response_model=PaginatedHealthCheckResponse)
def get_website_history(
    website_id: int,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> PaginatedHealthCheckResponse:
    website = db.get(Website, website_id)
    if website is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Website not found")

    filters = HealthCheck.website_id == website_id
    total = db.scalar(select(func.count()).where(filters)) or 0
    health_checks = list(
        db.scalars(
            select(HealthCheck)
            .where(filters)
            .order_by(desc(HealthCheck.checked_at))
            .offset((page - 1) * limit)
            .limit(limit)
        )
    )

    return PaginatedHealthCheckResponse(
        items=[HealthCheckResponse.model_validate(health_check) for health_check in health_checks],
        page=page,
        limit=limit,
        total=total,
        total_pages=(total + limit - 1) // limit,
    )


@router.get("/{website_id}/status", response_model=WebsiteStatusResponse)
def get_website_status(
    website_id: int,
    db: Session = Depends(get_db),
) -> WebsiteStatusResponse:
    website = db.get(Website, website_id)
    if website is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Website not found")

    statement = (
        select(HealthCheck)
        .where(HealthCheck.website_id == website_id)
        .order_by(desc(HealthCheck.checked_at))
        .limit(1)
    )
    health_check = db.scalar(statement)

    if health_check is None:
        return WebsiteStatusResponse(
            website_id=website_id,
            status="unknown",
            status_code=None,
            response_time_ms=None,
            checked_at=None,
        )

    return WebsiteStatusResponse(
        website_id=website_id,
        status=health_check.status.value,
        status_code=health_check.status_code,
        response_time_ms=health_check.response_time_ms,
        checked_at=health_check.checked_at,
    )


@router.get("", response_model=list[WebsiteResponse])
def list_active_websites(db: Session = Depends(get_db)) -> list[Website]:
    statement = select(Website).where(Website.is_active.is_(True))
    return list(db.scalars(statement))


@router.post("", response_model=WebsiteResponse, status_code=status.HTTP_201_CREATED)
def create_website(
    website_data: WebsiteCreate,
    db: Session = Depends(get_db),
) -> Website:
    website = Website(url=str(website_data.url))
    db.add(website)
    db.commit()
    db.refresh(website)
    return website


@router.delete("/{website_id}", status_code=status.HTTP_204_NO_CONTENT)
def deactivate_website(website_id: int, db: Session = Depends(get_db)) -> None:
    website = db.get(Website, website_id)
    if website is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Website not found")

    website.is_active = False
    db.commit()
