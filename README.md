# 🗳️ ElectAssist — Election Intelligence Platform

**Empowering Citizens with AI-Driven Election Insights**

ElectAssist is an interactive, AI-powered election assistant designed to help citizens navigate the complexities of the election process. By leveraging Google's advanced AI and cloud services, the platform provides real-time information about candidates, verifies community-contributed proofs of work, and ensures citizens stay informed about upcoming elections in their locality.

---

## 🏗️ System Architecture

```mermaid
graph TD
    User([User]) <--> Frontend[Frontend - React/Vite]
    Frontend <--> Backend[Backend - FastAPI/Cloud Run]
    
    subgraph Google Cloud & Firebase
        Backend <--> Gemini[Gemini 2.5 flash - Vertex AI]
        Backend <--> VectorSearch[Vertex AI Vector Search]
        Backend <--> VideoIntel[Video Intelligence API]
        Backend <--> Firestore[(Firestore DB)]
        Backend <--> Storage[(Cloud Storage - Videos)]
        Frontend <--> FirebaseAuth[Firebase Auth]
        Backend <--> FCM[Firebase Cloud Messaging]
    end
    
    Admin([Admin]) <--> Frontend
```

## 🌟 Key Features

- **🤖 AI Chatbot (RAG Agent):** Powered by **Gemini 2.5 flash**, providing grounded answers about candidates and election processes using semantic search over verified data.
- **🏆 Candidate Leaderboard:** A dynamic ranking system based on community endorsements, verified video proofs, and official work records.
- **📹 Community Video Proofs:** Citizens can upload short videos of candidate work, automatically moderated and summarized by the **Video Intelligence API**.
- **🗺️ Locality-Based Map:** Visualize candidates, polling booths, and election zones in your area using **Google Maps**.
- **🔔 Smart Notifications:** Stay updated with **Firebase Cloud Messaging** alerts for election dates and leaderboard changes.
- **🔐 Admin Dashboard:** Secure management of candidate profiles and moderation of community-contributed content.

---

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| **Frontend** | React, Vite, Vanilla CSS, Lucide Icons |
| **Backend** | FastAPI (Python), Uvicorn |
| **Database** | Firebase Firestore |
| **Authentication** | Firebase Auth (Google OAuth / Phone OTP) |
| **AI / ML** | Gemini 2.5 flash, Vertex AI Vector Search, Video Intelligence API |
| **Infrastructure** | Google Cloud Run, Firebase Hosting, Cloud Storage |
| **Integrations** | Google Maps Embed API, Custom Search API |

---

## 📁 Project Structure

```text
elect/
├── frontend/           # React + Vite (Web Interface)
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Main application views
│   │   └── lib/        # Firebase & API configurations
├── backend/            # FastAPI (Cloud Run API)
│   ├── routers/        # API endpoints
│   ├── services/       # Business logic & AI integrations
│   └── schemas/        # Pydantic models
└── infra/              # Security rules & infrastructure config
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python 3.9+
- Google Cloud Project with Vertex AI enabled
- Firebase Project

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env`:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables in `.env`:
   ```env
   GOOGLE_CLOUD_PROJECT=your_project_id
   GOOGLE_APPLICATION_CREDENTIALS=path/to/your/service-account.json
   ```
5. Run the API:
   ```bash
   uvicorn main:app --reload
   ```

---

## 🛡️ Security
- **Firebase Auth** ensures secure user identity.
- **Firestore Security Rules** protect data from unauthorized access.
- **Admin RBAC** restricts sensitive operations to authorized personnel.

---
