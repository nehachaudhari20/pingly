from datetime import datetime
from typing import Literal

from pydantic import BaseModel


class LatestWebsiteStatus(BaseModel):
    website_id: int
    url: str
    status: Literal["up", "down", "unknown"]
    status_code: int | None
    response_time_ms: float | None
    checked_at: datetime | None


class DashboardResponse(BaseModel):
    healthy_count: int
    down_count: int
    average_latency_ms: float | None
    total_urls: int
    latest_website_statuses: list[LatestWebsiteStatus]
