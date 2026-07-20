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
