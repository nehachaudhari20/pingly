from datetime import datetime

from pydantic import BaseModel, ConfigDict


class HealthCheckResponse(BaseModel):
    id: int
    website_id: int
    status: str
    status_code: int | None
    response_time_ms: float | None
    checked_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PaginatedHealthCheckResponse(BaseModel):
    items: list[HealthCheckResponse]
    page: int
    limit: int
    total: int
    total_pages: int
