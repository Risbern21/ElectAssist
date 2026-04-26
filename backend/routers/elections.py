from fastapi import APIRouter
from typing import List, Dict

router = APIRouter(tags=["Elections Timeline"])

@router.get("/elections/timeline")
async def get_timeline():
    """
    Returns the current election cycle roadmap.
    In production, this queries the election calendar config in Firestore.
    """
    return [
        {
            "id": 1,
            "title": "Voter Registration",
            "date": "Until Oct 15, 2026",
            "status": "completed",
            "description": "Register to vote or update your electoral roll details online or at your local booth.",
            "aiPrompt": "How do I register to vote online in my state?"
        },
        {
            "id": 2,
            "title": "Candidate Nominations",
            "date": "Oct 20 - Nov 5, 2026",
            "status": "active",
            "description": "Candidates file their nomination papers and affidavits.",
            "aiPrompt": "Who are the nominated candidates from my constituency?"
        },
        {
            "id": 3,
            "title": "Campaign Period",
            "date": "Nov 6 - Nov 25, 2026",
            "status": "upcoming",
            "description": "Candidates share their manifestos and hold public rallies.",
            "aiPrompt": "Summarize the manifesto for candidate XYZ."
        },
        {
            "id": 4,
            "title": "Polling Day",
            "date": "Nov 27, 2026",
            "status": "upcoming",
            "description": "Cast your vote at your designated polling station (7 AM - 6 PM).",
            "aiPrompt": "Where is my polling booth?"
        },
        {
            "id": 5,
            "title": "Counting & Results",
            "date": "Dec 4, 2026",
            "status": "upcoming",
            "description": "Votes are counted and the winning candidates are officially declared.",
            "aiPrompt": "What happens during vote counting?"
        }
    ]
