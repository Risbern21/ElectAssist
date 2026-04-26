import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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
        firebase_admin.initialize_app(options={'projectId': project_id})
except Exception as e:
    print(f"Warning: Firebase Admin initialization failed or was already initialized. {e}")

app = FastAPI(title="ElectAssist API")

# Configure CORS for Frontend Development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "ElectAssist"}

from routers.chat import router as chat_router
from routers.leaderboard import router as leaderboard_router
from routers.admin import router as admin_router
from routers.elections import router as elections_router
from routers.videos import router as videos_router
from routers.notifications import router as notifications_router

app.include_router(chat_router, prefix="/api")
app.include_router(leaderboard_router, prefix="/api")
app.include_router(admin_router, prefix="/api")
app.include_router(elections_router, prefix="/api")
app.include_router(videos_router, prefix="/api")
app.include_router(notifications_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
