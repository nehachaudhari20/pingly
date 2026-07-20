from fastapi import FastAPI

from app.api.dashboard import router as dashboard_router
from app.api.websites import router as websites_router

app = FastAPI()

app.include_router(dashboard_router)
app.include_router(websites_router)


@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "Pingly Backend Running"}
