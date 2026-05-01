import { Link } from 'react-router-dom';
import { ShieldCheck, TrendingUp, Video, Bell, Users, Search } from 'lucide-react';
import './Home.css';

const FEATURES = [
  {
    id: 'feature-leaderboard',
    icon: TrendingUp,
    iconClass: 'bg-primary-light',
    iconColor: 'text-primary',
    title: 'Candidate Leaderboard',
    desc: 'Rankings based on verified community proofs and sentiment analysis of past performance.',
  },
  {
    id: 'feature-video',
    icon: Video,
    iconClass: 'bg-secondary-light',
    iconColor: 'text-secondary',
    title: 'Video Proof Upload',
    desc: 'Citizens upload ground-truth videos of candidate work, moderated seamlessly by AI.',
  },
  {
    id: 'feature-chat',
    icon: Search,
    iconClass: 'bg-success-light',
    iconColor: 'text-success',
    title: 'AI RAG Chatbot',
    desc: 'Chat with Gemini about candidates, their promises, and the election timeline in any language.',
  },
  {
    id: 'feature-notifications',
    icon: Bell,
    iconClass: 'bg-warning-light',
    iconColor: 'text-warning',
    title: 'Smart Notifications',
    desc: 'Get timely alerts for voting dates, new verified proofs, and booth updates in your locality.',
  },
];

const Home = () => {
  return (
    <div className="home animate-fade-in">

      {/* Hero Section */}
      <section className="hero container" aria-labelledby="hero-heading">
        <div className="hero-content">
          <div className="badge glass-panel" role="status" aria-live="polite">
            <span className="live-dot animate-pulse" aria-hidden="true"></span>
            <span>Upcoming Elections: 2026 Assembly</span>
          </div>

          <h1 id="hero-heading" className="hero-title">
            Empowering Citizens with <br />
            <span className="text-gradient">Election Intelligence</span>
          </h1>

          <p className="hero-subtitle">
            Track candidates, verify ground realities through community video proofs,
            and make informed voting decisions with AI assistance.
          </p>

          <div className="hero-actions" role="group" aria-label="Primary actions">
            <Link
              to="/chat"
              className="btn btn-primary"
              style={{ padding: '14px 28px', fontSize: '1.1rem' }}
              aria-label="Open AI Election Guide chat"
            >
              <Search size={22} aria-hidden="true" /> Ask the AI Guide
            </Link>
            <Link
              to="/candidates"
              className="btn btn-secondary"
              style={{ padding: '14px 28px', fontSize: '1.1rem' }}
              aria-label="Browse candidate leaderboard"
            >
              <Users size={22} aria-hidden="true" /> View Candidates
            </Link>
          </div>
        </div>

        {/* Decorative visual — hidden from screen readers */}
        <div className="hero-visual" aria-hidden="true">
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
      <section className="features container my-section" aria-labelledby="features-heading">
        <h2 id="features-heading" className="section-title text-center">Smart Democracy Platform</h2>

        <div className="features-grid" role="list">
          {FEATURES.map(({ id, icon: Icon, iconClass, iconColor, title, desc }) => (
            <article key={id} id={id} className="feature-card glass-panel" role="listitem">
              <div className={`feature-icon ${iconClass}`} aria-hidden="true">
                <Icon size={28} className={iconColor} />
              </div>
              <h3>{title}</h3>
              <p className="text-muted">{desc}</p>
            </article>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Home;
