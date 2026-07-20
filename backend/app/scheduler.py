import asyncio

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy import select

from app.database.database import SessionLocal
from app.models.health_check import HealthCheck, HealthStatus
from app.models.website import Website
from app.services.ping import ping_url

scheduler = AsyncIOScheduler(timezone="UTC")


async def monitor_active_websites() -> None:
    db = SessionLocal()
    try:
        websites = list(
            db.scalars(select(Website).where(Website.is_active.is_(True)))
        )
        results = await asyncio.gather(*(ping_url(website.url) for website in websites))

        db.add_all(
            HealthCheck(
                website_id=website.id,
                status=HealthStatus(result["status"]),
                status_code=result["status_code"],
                response_time_ms=result["response_time_ms"],
            )
            for website, result in zip(websites, results, strict=True)
        )
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


scheduler.add_job(
    monitor_active_websites,
    trigger="interval",
    seconds=60,
    id="monitor_active_websites",
    replace_existing=True,
)
