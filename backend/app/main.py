from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.dashboard import router as dashboard_router
from app.api.websites import router as websites_router
from app.database.database import initialize_database
from app.scheduler import scheduler


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    initialize_database()
    scheduler.start()
    try:
        yield
    finally:
        if scheduler.running:
            scheduler.shutdown(wait=False)


app = FastAPI(lifespan=lifespan)

app.include_router(dashboard_router)
app.include_router(websites_router)


@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "Pingly Backend Running"}
