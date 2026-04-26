import { Link } from 'react-router-dom';
import { ShieldCheck, TrendingUp, Video, Bell, Users, Search } from 'lucide-react';
import './Home.css';

const Home = () => {
  return (
    <div className="home animate-fade-in">
      {/* Hero Section */}
      <section className="hero container">
        <div className="hero-content">
          <div className="badge glass-panel">
            <span className="live-dot animate-pulse"></span>
            Upcoming Elections: 2026 Assembly
          </div>
          <h1 className="hero-title">
            Empowering Citizens with <br/>
            <span className="text-gradient">Election Intelligence</span>
          </h1>
          <p className="hero-subtitle">
            Track candidates, verify ground realities through community video proofs, and make informed voting decisions with AI assistance.
          </p>
          <div className="hero-actions">
            <Link to="/chat" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1.1rem' }}>
              <Search size={22} /> Ask the AI Guide
            </Link>
            <Link to="/candidates" className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: '1.1rem' }}>
              <Users size={22} /> View Candidates
            </Link>
          </div>
        </div>
        
        <div className="hero-visual">
           {/* Abstract floating elements simulating the app UI */}
           <div className="floating-card glass-panel card-1">
              <div className="card-header">
                <div className="avatar bg-primary"></div>
                <div>
                  <div className="line title-line"></div>
                  <div className="line sub-line"></div>
                </div>
              </div>
              <div className="score-ring">
                 <span>92%</span>
              </div>
           </div>
           
           <div className="floating-card glass-panel card-2">
              <Video className="text-secondary" size={32} />
              <div>Video Proof Verified</div>
              <div className="line sub-line w-full"></div>
           </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features container my-section">
        <h2 className="section-title text-center">Smart Democracy Platform</h2>
        
        <div className="features-grid">
          <div className="feature-card glass-panel">
            <div className="feature-icon bg-primary-light">
               <TrendingUp size={28} className="text-primary" />
            </div>
            <h3>Candidate Leaderboard</h3>
            <p className="text-muted">Rankings based on verified community proofs and sentiment analysis of past performance.</p>
          </div>
          
          <div className="feature-card glass-panel">
            <div className="feature-icon bg-secondary-light">
               <Video size={28} className="text-secondary" />
            </div>
            <h3>Video Proof Upload</h3>
            <p className="text-muted">Citizens upload ground-truth videos of candidate work, moderated seamlessly by AI.</p>
          </div>
          
          <div className="feature-card glass-panel">
            <div className="feature-icon bg-success-light">
               <Search size={28} className="text-success" />
            </div>
            <h3>AI RAG Chatbot</h3>
            <p className="text-muted">Chat with Gemini about candidates, their promises, and the election timeline in any language.</p>
          </div>
          
          <div className="feature-card glass-panel">
            <div className="feature-icon bg-warning-light">
               <Bell size={28} className="text-warning" />
            </div>
            <h3>Smart Notifications</h3>
            <p className="text-muted">Get timely alerts for voting dates, new verified proofs, and booth updates in your locality.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
