from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.health_check import HealthCheck, HealthStatus
from app.models.website import Website
from app.schemas.dashboard import DashboardResponse, LatestWebsiteStatus

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardResponse)
def get_dashboard(db: Session = Depends(get_db)) -> DashboardResponse:
    latest_health_check_id = (
        select(HealthCheck.id)
        .where(HealthCheck.website_id == Website.id)
        .order_by(HealthCheck.checked_at.desc(), HealthCheck.id.desc())
        .limit(1)
        .correlate(Website)
        .scalar_subquery()
    )
    rows = db.execute(
        select(Website, HealthCheck)
        .outerjoin(HealthCheck, HealthCheck.id == latest_health_check_id)
        .where(Website.is_active.is_(True))
        .order_by(Website.created_at.desc())
    ).all()

    latest_statuses = [
        LatestWebsiteStatus(
            website_id=website.id,
            url=website.url,
            status=health_check.status.value if health_check else "unknown",
            status_code=health_check.status_code if health_check else None,
            response_time_ms=health_check.response_time_ms if health_check else None,
            checked_at=health_check.checked_at if health_check else None,
        )
        for website, health_check in rows
    ]
    response_times = [
        item.response_time_ms
        for item in latest_statuses
        if item.response_time_ms is not None
    ]

    return DashboardResponse(
        healthy_count=sum(item.status == HealthStatus.UP.value for item in latest_statuses),
        down_count=sum(item.status == HealthStatus.DOWN.value for item in latest_statuses),
        average_latency_ms=(sum(response_times) / len(response_times))
        if response_times
        else None,
        total_urls=len(latest_statuses),
        latest_website_statuses=latest_statuses,
    )
