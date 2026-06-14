from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db
from app.services.seed import seed_db
from app.routers import health, projects, actions, approvals, audit, gmail


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    seed_db()
    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="DPI Personal WorkOps Command Center — local backend API",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(projects.router)
app.include_router(actions.router)
app.include_router(approvals.router)
app.include_router(audit.router)
app.include_router(gmail.router)
