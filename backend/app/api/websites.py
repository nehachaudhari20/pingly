from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.website import Website
from app.schemas.website import WebsiteCreate, WebsiteResponse

router = APIRouter(prefix="/api/websites", tags=["websites"])


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
