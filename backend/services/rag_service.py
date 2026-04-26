import os
import vertexai
from vertexai.generative_models import GenerativeModel, Part
from firebase_admin import firestore

class RAGService:
    def __init__(self):
        self.project_id = os.getenv("FIREBASE_PROJECT_ID", "elect-1e381")
        self.location = os.getenv("VERTEX_AI_LOCATION", "us-central1")
        
        try:
            vertexai.init(project=self.project_id, location=self.location)
            # Use the requested Gemini 2.5 Preview model
            self.model = GenerativeModel("gemini-2.5-flash")
        except Exception as e:
            print(f"Vertex AI Init Error: {e}")
            self.model = None

    def _fetch_candidate_context(self) -> str:
        """
        In a full Vertex Vector Search setup, we would embed the user query
        and fetch nearest neighbors. 
        For this simplified phase, we will fetch all candidates and build a context string.
        """
        try:
            db = firestore.client()
            docs = db.collection('candidates').stream()
            
            context_pieces = []
            for doc in docs:
                data = doc.to_dict()
                context_pieces.append(
                    f"Candidate Name: {data.get('name')}\n"
                    f"Party: {data.get('party')}\n"
                    f"Ward/Constituency: {data.get('ward')}\n"
                    f"Trust Score: {data.get('score', 0)}%\n"
                    f"Verified Public Works: {data.get('verifiedWorks', 0)}\n"
                )
            
            if not context_pieces:
                return "There are no candidates currently registered in the database."
                
            return "\n---\n".join(context_pieces)
        except Exception as e:
            print(f"Error fetching candidate context: {e}")
            return "No local candidate context is currently accessible."

    async def generate_response(self, query: str) -> str:
        """
        Constructs the RAG prompt utilizing Live Firestore data and sends it to Gemini.
        """
        if not self.model:
             return "I'm currently unable to connect to the Gemini backend. Please verify your Vertex AI configuration."

        # Fetch local database context
        context_data = self._fetch_candidate_context()

        # Build prompt augmenting the query with local data
        system_instructions = (
            "You are ElectAssist, a helpful, unbiased, and knowledgeable AI guide for local elections. "
            "You provide information to citizens to help them vote effectively. "
            "Use the provided candidate data to inform your answers. If the requested information "
            "is not in the provided data, rely on your general knowledge but mention you are speaking generally.\n\n"
            "--- LOCAL CANDIDATE DATA START ---\n"
            f"{context_data}\n"
            "--- LOCAL CANDIDATE DATA END ---\n"
        )
        
        prompt = f"{system_instructions}\nUser Query: {query}\nResponse:"

        try:
            # Generate the answer using Gemini
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Gemini API Error: {e}")
            return "I'm sorry, I encountered an error while processing your request. Please try again."

# Singleton pattern for the service
rag_service = RAGService()
