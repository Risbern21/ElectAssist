import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials

# Load environment variables
load_dotenv()

# Initialize Firebase Admin SDK
try:
    if not firebase_admin._apps:
        # If you have a service account key JSON, you'd specify its path here or via GOOGLE_APPLICATION_CREDENTIALS
        # Initialize with explicit projectId to prevent fallback to ADC default project
        project_id = os.getenv("FIREBASE_PROJECT_ID", "elect-1e381")
        firebase_admin.initialize_app(options={
            'projectId': project_id,
            'storageBucket': f'{project_id}.firebasestorage.app'
        })
except Exception as e:
    print(f"Warning: Firebase Admin initialization failed or was already initialized. {e}")

app = FastAPI(
    title="ElectAssist API",
    description="AI-powered election intelligence platform backend.",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# Configure CORS — restrict to known origins in production
_raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000")
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)

# Initialize Rate Limiter
limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "ElectAssist"}

from routers.chat import router as chat_router
from routers.leaderboard import router as leaderboard_router
from routers.admin import router as admin_router
from routers.elections import router as elections_router
from routers.videos import router as videos_router
from routers.notifications import router as notifications_router
from routers.auth import router as auth_router
from routers.map import router as map_router

app.include_router(chat_router, prefix="/api")
app.include_router(leaderboard_router, prefix="/api")
app.include_router(admin_router, prefix="/api")
app.include_router(elections_router, prefix="/api")
app.include_router(videos_router, prefix="/api")
app.include_router(notifications_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(map_router, prefix="/api")

# Serve Frontend Static Files
# Ensure the 'static' directory exists in the container
if os.path.exists("static"):
    app.mount("/assets", StaticFiles(directory="static/assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Prevent intercepting API calls
        if full_path.startswith("api"):
            return None 
        return FileResponse("static/index.html")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
