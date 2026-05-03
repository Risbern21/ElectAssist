import { useState, useEffect } from 'react';
import { Search, MapPin, Award, Filter, Video, ThumbsUp, Loader, UploadCloud } from 'lucide-react';
import { candidateApi, videoApi, authApi } from '../lib/api';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import './Candidates.css';

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWard, setSelectedWard] = useState('All');
  const [uploadingCandidate, setUploadingCandidate] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  const handleFileUpload = async (e, candidateId, candidateName) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingCandidate(candidateId);
    setStatusMessage('');
    try {
      const formData = new FormData();
      formData.append('candidate_id', candidateId);
      formData.append('file', file);

      await videoApi.upload(formData);
      setStatusMessage(`Video for ${candidateName} uploaded successfully! Pending moderation.`);
    } catch (err) {
      console.error(err);
      setStatusMessage(`Upload failed: ${err.message}`);
    } finally {
      setUploadingCandidate(null);
      e.target.value = null;
    }
  };

  useEffect(() => {
    const fetchCandidates = async () => {
      setIsLoading(true);
      try {
        const data = await candidateApi.getAll(selectedWard);
        setCandidates(data);
      } catch (err) {
        console.error('Failed to fetch candidates', err);
        setCandidates([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCandidates();
  }, [selectedWard]);

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.party.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (authLoading) {
    return <div className="flex-center" style={{ padding: '4rem' }}><Loader className="animate-spin text-primary" size={48} /></div>;
  }
  if (!user) {
    return (
      <div className="container glass-panel" style={{ padding: '4rem', textAlign: 'center', marginTop: '2rem' }}>
        <h2>Login Required</h2>
        <p className="text-muted" style={{ marginTop: '1rem' }}>Please sign in to view candidates in your locality.</p>
      </div>
    );
  }

  return (
    <div className="candidates-page container animate-fade-in">
      <header className="page-header">
        <h1 className="text-gradient">Candidate Leaderboard</h1>
        <p className="text-muted">Ranked by community verified work and video proofs.</p>
      </header>

      {/* Accessible status announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="visually-hidden"
      >
        {isLoading
          ? 'Loading candidate data, please wait.'
          : `Showing ${filteredCandidates.length} candidate${filteredCandidates.length !== 1 ? 's' : ''}.`
        }
        {statusMessage && ` ${statusMessage}`}
      </div>

      <div className="filters-section glass-panel" role="search" aria-label="Filter candidates">
        <div className="search-bar">
          <Search className="text-muted" size={20} aria-hidden="true" />
          <label htmlFor="candidate-search" className="visually-hidden">
            Search candidates or parties
          </label>
          <input
            id="candidate-search"
            type="search"
            className="input-transparent"
            placeholder="Search candidates or parties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search candidates or parties"
          />
        </div>

        <div className="filter-dropdowns">
          <div className="dropdown">
            <MapPin size={18} className="text-primary" aria-hidden="true" />
            <label htmlFor="ward-select" className="visually-hidden">Filter by ward</label>
            <select
              id="ward-select"
              className="select-glass"
              value={selectedWard}
              onChange={(e) => {
                const newWard = e.target.value;
                setSelectedWard(newWard);
                // Save locality preference to backend
                authApi.updateWard(newWard);
              }}
              aria-label="Filter candidates by ward"
            >
              <option value="All">All Wards</option>
              <option value="Ward 5">Ward 5</option>
              <option value="Ward 8">Ward 8</option>
            </select>
          </div>
          <button className="btn btn-secondary" aria-label="Open advanced filters">
            <Filter size={18} aria-hidden="true" /> Filters
          </button>
        </div>
      </div>

      {isLoading ? (
        <div
          className="flex-center"
          style={{ padding: '4rem', flexDirection: 'column', gap: '1rem' }}
          role="status"
          aria-label="Loading candidates"
        >
          <Loader className="animate-spin text-primary" size={48} aria-hidden="true" />
          <p className="text-muted">Loading candidate data...</p>
        </div>
      ) : (
        <div
          className="candidates-grid"
          role="list"
          aria-label="Candidate leaderboard"
        >
          {filteredCandidates.map((candidate, index) => (
            <article
              key={candidate.id}
              className="candidate-card glass-panel"
              role="listitem"
              aria-label={`Rank ${index + 1}: ${candidate.name}, ${candidate.party}, ${candidate.ward}`}
            >
              <div
                className={`rank-badge ${index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : 'rank-3'}`}
                aria-label={`Rank ${index + 1}`}
              >
                #{index + 1}
              </div>

              <div className="candidate-header">
                <img
                  src={candidate.image}
                  alt={`Photo of ${candidate.name}`}
                  className="candidate-img"
                />
                <div>
                  <h2>{candidate.name}</h2>
                  <span className="party-badge" aria-label={`Party: ${candidate.party}`}>
                    {candidate.party}
                  </span>
                  <div className="ward-info">
                    <MapPin size={14} className="text-muted" aria-hidden="true" />
                    <span className="text-muted text-sm" aria-label={`Ward: ${candidate.ward}`}>
                      {candidate.ward}
                    </span>
                  </div>
                </div>
              </div>

              <dl className="stats-row">
                <div className="stat-item">
                  <Award size={18} className="text-success" aria-hidden="true" />
                  <dd className="stat-val">{candidate.score}%</dd>
                  <dt className="stat-label">Trust Score</dt>
                </div>
                <div className="stat-item">
                  <Video size={18} className="text-secondary" aria-hidden="true" />
                  <dd className="stat-val">{candidate.videoProofs}</dd>
                  <dt className="stat-label">Video Proofs</dt>
                </div>
                <div className="stat-item">
                  <dd className="stat-val text-primary">{candidate.verifiedWorks}</dd>
                  <dt className="stat-label">Verified Works</dt>
                </div>
              </dl>

              <div className="card-actions">
                <button
                  className="btn btn-primary w-full"
                  style={{ position: 'relative' }}
                  disabled={uploadingCandidate === candidate.id}
                  aria-label={
                    uploadingCandidate === candidate.id
                      ? `Uploading video for ${candidate.name}`
                      : `Upload video proof for ${candidate.name}`
                  }
                  aria-busy={uploadingCandidate === candidate.id}
                >
                  {uploadingCandidate === candidate.id ? (
                    <>
                      <Loader className="animate-spin" size={18} style={{ marginRight: '6px' }} aria-hidden="true" />
                      Uploading...
                    </>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <UploadCloud size={18} aria-hidden="true" /> Upload Proof
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleFileUpload(e, candidate.id, candidate.name)}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                        aria-label={`Choose video file to upload for ${candidate.name}`}
                        tabIndex="-1"
                      />
                    </div>
                  )}
                </button>
                <button
                  className="btn btn-secondary action-icon"
                  aria-label={`Endorse ${candidate.name}`}
                  title={`Endorse ${candidate.name}`}
                >
                  <ThumbsUp size={18} aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {!isLoading && filteredCandidates.length === 0 && (
        <div
          className="empty-state glass-panel"
          style={{ maxWidth: '600px', margin: '0 auto' }}
          role="status"
          aria-live="polite"
        >
          <h2 style={{ marginBottom: '10px' }}>No candidates found</h2>
          <p className="text-muted">
            {candidates.length === 0
              ? 'No candidates have been registered for this election yet. Backend systems may be initializing.'
              : 'No candidates match your search criteria. Try adjusting your filters.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Candidates;
