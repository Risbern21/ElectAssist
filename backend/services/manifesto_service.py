import os
import vertexai
from vertexai.generative_models import GenerativeModel
from firebase_admin import firestore

class ManifestoService:
    def __init__(self):
        self.project_id = os.getenv("FIREBASE_PROJECT_ID", "elect-1e381")
        self.location = os.getenv("VERTEX_AI_LOCATION", "us-central1")
        self.db = firestore.client()
        
        try:
            vertexai.init(project=self.project_id, location=self.location)
            self.model = GenerativeModel("gemini-2.5-flash")
        except Exception as e:
            print(f"Vertex AI Init Error for Manifesto Service: {e}")
            self.model = None

    async def summarize_manifesto(self, candidate_id: str, raw_manifesto_text: str) -> str:
        """
        Uses Gemini to extract key points from a raw, lengthy manifesto text 
        and updates the candidate's document in Firestore.
        """
        if not self.model:
            raise ValueError("Vertex AI model is not initialized.")

        prompt = (
            "You are a political analyst AI. Read the following political manifesto "
            "and provide a concise, neutral, bullet-point summary of the core promises "
            "and policy positions. Keep it accessible to a general voter audience.\n\n"
            f"--- MANIFESTO START ---\n{raw_manifesto_text}\n--- MANIFESTO END ---\n\n"
            "Summary:"
        )

        try:
            response = self.model.generate_content(prompt)
            summary = response.text.strip()
            
            # Save the summarized manifesto back to the candidate document
            candidate_ref = self.db.collection('candidates').document(candidate_id)
            candidate_ref.update({
                'manifesto_summary': summary
            })
            
            return summary
        except Exception as e:
            print(f"Failed to summarize manifesto: {e}")
            raise Exception("Failed to generate manifesto summary.")

manifesto_service = ManifestoService()
