from datetime import datetime

from pydantic import BaseModel, ConfigDict, HttpUrl


class WebsiteCreate(BaseModel):
    url: HttpUrl


class WebsiteResponse(BaseModel):
    id: int
    url: HttpUrl
    created_at: datetime
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class WebsiteStatusResponse(BaseModel):
    website_id: int
    status: str
    status_code: int | None
    response_time_ms: float | None
    checked_at: datetime | None
