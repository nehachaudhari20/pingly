from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.website import Website
from app.schemas.website import WebsiteCreate, WebsiteResponse

router = APIRouter(prefix="/api/websites", tags=["websites"])


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
