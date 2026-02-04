from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.routes import employees, attendance


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="HRMS Lite API",
    description="Quess Corp - Human Resource Management System",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(employees.router, prefix="/api/employees", tags=["employees"])
app.include_router(attendance.router, prefix="/api/attendance", tags=["attendance"])


@app.get("/")
def root():
    return {
        "message": "HRMS Lite API - Quess Corp",
        "docs": "/docs",
        "health": "/api/health",
        "frontend": "Open http://localhost:4200 for the Angular UI",
    }


@app.get("/api/health")
def health():
    return {"status": "ok", "message": "HRMS Lite API - Quess Corp"}
