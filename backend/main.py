from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import mongo_client, MONGODB_DATABASE
from routers import incidents

app = FastAPI(
    title="LIFELINK API",
    description="Backend API for the LIFELINK emergency response system",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://lifelink-swart.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(incidents.router)


@app.get("/")
def root():
    return {
        "message": "LIFELINK Backend is running",
        "status": "success",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "LIFELINK API",
    }


@app.get("/health/db")
def database_health_check():
    try:
        mongo_client.admin.command("ping")
        return {
            "status": "success",
            "database": MONGODB_DATABASE,
            "message": "MongoDB Atlas connected successfully",
        }
    except Exception as error:
        return {
            "status": "error",
            "message": str(error),
        }