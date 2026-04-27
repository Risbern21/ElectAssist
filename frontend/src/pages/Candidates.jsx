import { useState, useEffect } from 'react';
import { Search, MapPin, Award, Filter, Video, ThumbsUp, Loader, UploadCloud } from 'lucide-react';
import { candidateApi, videoApi } from '../lib/api';
import './Candidates.css';

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWard, setSelectedWard] = useState('All');
  const [uploadingCandidate, setUploadingCandidate] = useState(null);

  const handleFileUpload = async (e, candidateId) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingCandidate(candidateId);
    try {
      const formData = new FormData();
      formData.append('candidate_id', candidateId);
      formData.append('file', file);
      
      await videoApi.upload(formData);
      alert('Video uploaded successfully! It is now pending moderation.');
    } catch (err) {
      console.error(err);
      alert('Failed to upload video: ' + err.message);
    } finally {
      setUploadingCandidate(null);
      e.target.value = null; // Reset input
    }
  };
  
  useEffect(() => {
    const fetchCandidates = async () => {
      setIsLoading(true);
      try {
        const data = await candidateApi.getAll(selectedWard);
        setCandidates(data);
      } catch (err) {
        console.error("Failed to fetch candidates", err);
        setCandidates([]); // Fallback to empty on error
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCandidates();
  }, [selectedWard]);

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.party.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="candidates-page container animate-fade-in">
      <div className="page-header">
        <h1 className="text-gradient">Candidate Leaderboard</h1>
        <p className="text-muted">Ranked by community verified work and video proofs.</p>
      </div>

      <div className="filters-section glass-panel">
        <div className="search-bar">
          <Search className="text-muted" size={20} />
          <input 
            type="text" 
            className="input-transparent" 
            placeholder="Search candidates or parties..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-dropdowns">
          <div className="dropdown">
            <MapPin size={18} className="text-primary"/>
            <select 
              className="select-glass" 
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
            >
              <option value="All">All Wards</option>
              <option value="Ward 5">Ward 5</option>
              <option value="Ward 8">Ward 8</option>
            </select>
          </div>
          <button className="btn btn-secondary">
             <Filter size={18} /> Filters
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-center" style={{padding: '4rem', flexDirection: 'column', gap: '1rem'}}>
          <Loader className="animate-spin text-primary" size={48} />
          <p className="text-muted">Loading candidate data...</p>
        </div>
      ) : (
        <div className="candidates-grid">
          {filteredCandidates.map((candidate, index) => (
          <div key={candidate.id} className="candidate-card glass-panel">
            <div className={`rank-badge ${index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : 'rank-3'}`}>
              #{index + 1}
            </div>
            
            <div className="candidate-header">
              <img src={candidate.image} alt={candidate.name} className="candidate-img" />
              <div>
                <h3>{candidate.name}</h3>
                <span className="party-badge">{candidate.party}</span>
                <div className="ward-info">
                  <MapPin size={14} className="text-muted" />
                  <span className="text-muted text-sm">{candidate.ward}</span>
                </div>
              </div>
            </div>
            
            <div className="stats-row">
               <div className="stat-item">
                 <Award size={18} className="text-success" />
                 <div className="stat-val">{candidate.score}%</div>
                 <div className="stat-label">Trust Score</div>
               </div>
               <div className="stat-item">
                 <Video size={18} className="text-secondary" />
                 <div className="stat-val">{candidate.videoProofs}</div>
                 <div className="stat-label">Video Proofs</div>
               </div>
               <div className="stat-item">
                 <div className="stat-val text-primary">{candidate.verifiedWorks}</div>
                 <div className="stat-label">Verified Works</div>
               </div>
            </div>
            
            <div className="card-actions">
               <button className="btn btn-primary w-full" style={{ position: 'relative' }} disabled={uploadingCandidate === candidate.id}>
                 {uploadingCandidate === candidate.id ? (
                   <><Loader className="animate-spin" size={18} style={{marginRight: '6px'}}/> Uploading...</>
                 ) : (
                   <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
                     <UploadCloud size={18} /> Upload Proof
                     <input 
                       type="file" 
                       accept="video/*" 
                       onChange={(e) => handleFileUpload(e, candidate.id)}
                       style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                     />
                   </div>
                 )}
               </button>
               <button className="btn btn-secondary action-icon" title="Endorse">
                 <ThumbsUp size={18} />
               </button>
            </div>
          </div>
        ))}
      </div>
      )}
      
      {!isLoading && filteredCandidates.length === 0 && (
         <div className="empty-state glass-panel" style={{maxWidth: '600px', margin: '0 auto'}}>
           <h3 style={{marginBottom: '10px'}}>No candidates found</h3>
           <p className="text-muted">
             {candidates.length === 0 
               ? "No candidates have been registered for this election yet. Backend systems may be initializing." 
               : "No candidates match your search criteria."}
           </p>
         </div>
      )}
    </div>
  );
};

export default Candidates;
