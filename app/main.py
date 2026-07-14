import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.config import get_settings
from app.database import init_db
from app.routers import email, professors, profile, scraper, url_extractor

settings = get_settings()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing database...")
    await init_db()
    logger.info("Database initialized.")
    yield


app = FastAPI(
    title="ProfessorMatch Agent",
    description="AI-powered professor matching and cold email assistant",
    version="2.0.0",
    lifespan=lifespan,
)

app.mount("/static", StaticFiles(directory="app/static"), name="static")

templates = Jinja2Templates(directory="app/templates")

app.include_router(profile.router)
app.include_router(professors.router)
app.include_router(email.router)
app.include_router(scraper.router)
app.include_router(url_extractor.router)


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "version": "2.0.0"}


@app.get("/")
async def home(request):
    return templates.TemplateResponse("home.html", {"request": request})


@app.get("/profile")
async def profile_page(request):
    return templates.TemplateResponse("profile.html", {"request": request})


@app.get("/professors")
async def professors_page(request):
    return templates.TemplateResponse("professors.html", {"request": request})


@app.get("/email")
async def email_page(request):
    return templates.TemplateResponse("email.html", {"request": request})


@app.get("/scraper")
async def scraper_page(request):
    return templates.TemplateResponse("scraper.html", {"request": request})


@app.get("/url-extractor")
async def url_extractor_page(request):
    return templates.TemplateResponse("url_extractor.html", {"request": request})


@app.get("/favorites")
async def favorites_page(request):
    return templates.TemplateResponse("favorites.html", {"request": request})


@app.get("/tracker")
async def tracker_page(request):
    return templates.TemplateResponse("tracker.html", {"request": request})


@app.get("/assistant")
async def assistant_page(request):
    return templates.TemplateResponse("assistant.html", {"request": request})
