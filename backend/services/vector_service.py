import os
from vertexai.language_models import TextEmbeddingInput, TextEmbeddingModel
from firebase_admin import firestore

class VectorService:
    def __init__(self):
        self.db = firestore.client()
        try:
            # We use the text-embedding-004 model for general text embeddings
            self.model = TextEmbeddingModel.from_pretrained("text-embedding-004")
        except Exception as e:
            print(f"Error initializing Embedding Model: {e}")
            self.model = None

    def get_embeddings(self, texts: list[str]) -> list[list[float]]:
        """
        Generate embeddings for a list of strings using Vertex AI.
        """
        if not self.model:
            raise ValueError("Embedding model not initialized")
            
        inputs = [TextEmbeddingInput(text, "RETRIEVAL_DOCUMENT") for text in texts]
        embeddings = self.model.get_embeddings(inputs)
        return [embedding.values for embedding in embeddings]

    async def embed_candidate_profile(self, candidate_id: str, text_content: str):
        """
        Generates an embedding for a candidate's profile/manifesto and saves it
        to Firestore. This allows for similarity searches in the RAG pipeline.
        """
        embedding_values = self.get_embeddings([text_content])[0]
        
        # Save the vector array directly to the document
        # In a production environment, this would sync to Vertex AI Vector Search
        # or be stored in a specialized vector DB if Firestore isn't sufficient.
        candidate_ref = self.db.collection('candidates').document(candidate_id)
        candidate_ref.update({
            'profile_embedding': embedding_values
        })
        
        return len(embedding_values)

vector_service = VectorService()
