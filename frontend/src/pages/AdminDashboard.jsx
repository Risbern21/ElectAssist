import { useState, useEffect } from 'react';
import { ShieldAlert, Plus, Edit, Trash2, ShieldCheck, Loader, UploadCloud, Calendar, MapPin, Check, X } from 'lucide-react';
import { candidateApi, timelineApi, mapApi, videoApi } from '../lib/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
   const [formData, setFormData] = useState({
      name: '',
      party: '',
      ward: '',
      image: ''
   });
   
   const [electionData, setElectionData] = useState({
      title: '',
      date: '',
      status: 'upcoming',
      description: '',
      aiPrompt: ''
   });

   const [boothData, setBoothData] = useState({
      name: '',
      lat: '',
      lng: ''
   });

   const [isSubmitting, setIsSubmitting] = useState(false);
   const [message, setMessage] = useState(null);
   const [activeTab, setActiveTab] = useState('add_candidate');
   const [candidatesList, setCandidatesList] = useState([]);
   const [pendingVideos, setPendingVideos] = useState([]);

   useEffect(() => {
      if (activeTab === 'manage_candidates') {
         fetchCandidates();
      } else if (activeTab === 'moderation') {
         fetchVideos();
      }
   }, [activeTab]);

   const fetchCandidates = async () => {
      try {
         const data = await candidateApi.getAll();
         setCandidatesList(data);
      } catch (err) {
         console.error("Failed to load candidates", err);
      }
   };

   const fetchVideos = async () => {
      try {
         const data = await videoApi.getPending();
         setPendingVideos(data);
      } catch (err) {
         console.error("Failed to load videos", err);
      }
   };

   const handleDeleteCandidate = async (id) => {
      if (!window.confirm("Are you sure you want to delete this candidate?")) return;
      try {
         await candidateApi.delete(id);
         setMessage({ type: 'success', text: 'Candidate deleted.' });
         fetchCandidates();
      } catch (err) {
         setMessage({ type: 'error', text: 'Failed to delete candidate.' });
      }
   };

   const handleModerateVideo = async (id, action) => {
      try {
         await videoApi.moderate(id, action);
         setMessage({ type: 'success', text: `Video ${action}d successfully.` });
         fetchVideos();
      } catch (err) {
         setMessage({ type: 'error', text: `Failed to ${action} video.` });
      }
   };

   const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
   };

   const handleElectionChange = (e) => {
      const { name, value } = e.target;
      setElectionData(prev => ({ ...prev, [name]: value }));
   };

   const handleBoothChange = (e) => {
      const { name, value } = e.target;
      setBoothData(prev => ({ ...prev, [name]: value }));
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      setMessage(null);
      
      try {
         await candidateApi.create(formData);
         setMessage({ type: 'success', text: 'Candidate successfully added to the registry!' });
         setFormData({ name: '', party: '', ward: '', image: '' }); // Reset
      } catch (err) {
         console.error(err);
         setMessage({ type: 'error', text: err.message || 'Failed to add candidate. Ensure you have Admin privileges.' });
      } finally {
         setIsSubmitting(false);
      }
   };

   const handleElectionSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      setMessage(null);
      try {
         await timelineApi.createStage(electionData);
         setMessage({ type: 'success', text: 'Election stage added successfully!' });
         setElectionData({ title: '', date: '', status: 'upcoming', description: '', aiPrompt: '' });
      } catch (err) {
         console.error(err);
         setMessage({ type: 'error', text: err.message || 'Failed to declare election.' });
      } finally {
         setIsSubmitting(false);
      }
   };

   const handleBoothSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      setMessage(null);
      try {
         await mapApi.addBooth({ ...boothData, lat: parseFloat(boothData.lat), lng: parseFloat(boothData.lng) });
         setMessage({ type: 'success', text: 'Polling booth added to the map!' });
         setBoothData({ name: '', lat: '', lng: '' });
      } catch (err) {
         console.error(err);
         setMessage({ type: 'error', text: err.message || 'Failed to add polling booth.' });
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <div className="admin-page container animate-fade-in">
         <div className="admin-header">
            <div className="flex-center" style={{gap: '12px', justifyContent: 'flex-start'}}>
               <ShieldAlert className="text-accent" size={32} />
               <h1 style={{margin: 0}}>Admin Control Panel</h1>
            </div>
            <p className="text-muted mt-2">Secure portal for election management and moderation.</p>
         </div>

         <div className="admin-layout">
            <div className="admin-sidebar glass-panel">
               <nav className="admin-nav">
                  <button className={`admin-nav-item ${activeTab === 'add_candidate' ? 'active' : ''}`} onClick={() => { setActiveTab('add_candidate'); setMessage(null); }}>
                     <Plus size={18} /> Add Candidate
                  </button>
                  <button className={`admin-nav-item ${activeTab === 'declare_election' ? 'active' : ''}`} onClick={() => { setActiveTab('declare_election'); setMessage(null); }}>
                     <Calendar size={18} /> Declare Election
                  </button>
                  <button className={`admin-nav-item ${activeTab === 'add_booth' ? 'active' : ''}`} onClick={() => { setActiveTab('add_booth'); setMessage(null); }}>
                     <MapPin size={18} /> Add Polling Booth
                  </button>
                  <button className={`admin-nav-item ${activeTab === 'manage_candidates' ? 'active' : ''}`} onClick={() => setActiveTab('manage_candidates')}>
                     <Edit size={18} /> Manage Existing
                  </button>
                  <button className={`admin-nav-item ${activeTab === 'moderation' ? 'active' : ''}`} onClick={() => setActiveTab('moderation')}>
                     <ShieldCheck size={18} /> Video Moderation
                  </button>
               </nav>
            </div>

            <div className="admin-content glass-panel">
               {message && (
                  <div className={`admin-alert ${message.type}`}>
                     {message.text}
                  </div>
               )}

               {activeTab === 'add_candidate' && (
                  <>
                     <h2 style={{marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <Plus className="text-secondary" /> Register New Candidate
                     </h2>
                     <form onSubmit={handleSubmit} className="admin-form">
                        <div className="form-group">
                           <label>Candidate Full Name</label>
                           <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="input-glass" required placeholder="e.g. Ramesh Kumar" />
                        </div>
                        <div className="form-group">
                           <label>Political Party</label>
                           <input type="text" name="party" value={formData.party} onChange={handleInputChange} className="input-glass" required placeholder="e.g. Independent" />
                        </div>
                        <div className="form-group">
                           <label>Constituency / Ward</label>
                           <select name="ward" value={formData.ward} onChange={handleInputChange} className="input-glass" required>
                              <option value="" disabled>Select a Ward</option>
                              <option value="Ward 5">Ward 5</option>
                              <option value="Ward 8">Ward 8</option>
                              <option value="Ward 12">Ward 12</option>
                           </select>
                        </div>
                        <div className="form-group">
                           <label>Profile Image URL</label>
                           <input type="url" name="image" value={formData.image} onChange={handleInputChange} className="input-glass" placeholder="https://example.com/image.jpg" />
                        </div>
                        <button type="submit" className="btn btn-primary mt-4" disabled={isSubmitting}>
                           {isSubmitting ? <><Loader className="animate-spin" size={18} /> Registering...</> : <><UploadCloud size={18} /> Save Candidate Entry</>}
                        </button>
                     </form>
                  </>
               )}

               {activeTab === 'declare_election' && (
                  <>
                     <h2 style={{marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <Calendar className="text-secondary" /> Declare Election Stage
                     </h2>
                     <form onSubmit={handleElectionSubmit} className="admin-form">
                        <div className="form-group">
                           <label>Stage Title</label>
                           <input type="text" name="title" value={electionData.title} onChange={handleElectionChange} className="input-glass" required placeholder="e.g. Polling Day" />
                        </div>
                        <div className="form-group">
                           <label>Date / Duration</label>
                           <input type="text" name="date" value={electionData.date} onChange={handleElectionChange} className="input-glass" required placeholder="e.g. Nov 27, 2026" />
                        </div>
                        <div className="form-group">
                           <label>Status</label>
                           <select name="status" value={electionData.status} onChange={handleElectionChange} className="input-glass" required>
                              <option value="upcoming">Upcoming</option>
                              <option value="active">Active</option>
                              <option value="completed">Completed</option>
                           </select>
                        </div>
                        <div className="form-group">
                           <label>Description</label>
                           <textarea name="description" value={electionData.description} onChange={handleElectionChange} className="input-glass" required placeholder="Describe the stage..." />
                        </div>
                        <div className="form-group">
                           <label>AI Prompt (Optional)</label>
                           <input type="text" name="aiPrompt" value={electionData.aiPrompt} onChange={handleElectionChange} className="input-glass" placeholder="e.g. Where is my polling booth?" />
                        </div>
                        <button type="submit" className="btn btn-primary mt-4" disabled={isSubmitting}>
                           {isSubmitting ? <><Loader className="animate-spin" size={18} /> Saving...</> : <><UploadCloud size={18} /> Save Election Stage</>}
                        </button>
                     </form>
                  </>
               )}

               {activeTab === 'add_booth' && (
                  <>
                     <h2 style={{marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <MapPin className="text-secondary" /> Add Polling Booth
                     </h2>
                     <form onSubmit={handleBoothSubmit} className="admin-form">
                        <div className="form-group">
                           <label>Booth Name / Location</label>
                           <input type="text" name="name" value={boothData.name} onChange={handleBoothChange} className="input-glass" required placeholder="e.g. St. Mary's School, Ward 5" />
                        </div>
                        <div className="form-group">
                           <label>Latitude</label>
                           <input type="number" step="any" name="lat" value={boothData.lat} onChange={handleBoothChange} className="input-glass" required placeholder="e.g. 12.9716" />
                        </div>
                        <div className="form-group">
                           <label>Longitude</label>
                           <input type="number" step="any" name="lng" value={boothData.lng} onChange={handleBoothChange} className="input-glass" required placeholder="e.g. 77.5946" />
                        </div>
                        <button type="submit" className="btn btn-primary mt-4" disabled={isSubmitting}>
                           {isSubmitting ? <><Loader className="animate-spin" size={18} /> Saving...</> : <><UploadCloud size={18} /> Save Polling Booth</>}
                        </button>
                     </form>
                  </>
               )}

               {activeTab === 'manage_candidates' && (
                  <>
                     <h2 style={{marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <Edit className="text-secondary" /> Manage Candidates
                     </h2>
                     <div className="table-responsive">
                        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                           <thead>
                              <tr style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                                 <th style={{ padding: '12px' }}>Name</th>
                                 <th style={{ padding: '12px' }}>Party</th>
                                 <th style={{ padding: '12px' }}>Ward</th>
                                 <th style={{ padding: '12px' }}>Actions</th>
                              </tr>
                           </thead>
                           <tbody>
                              {candidatesList.map(cand => (
                                 <tr key={cand.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '12px' }}>{cand.name}</td>
                                    <td style={{ padding: '12px' }}>{cand.party}</td>
                                    <td style={{ padding: '12px' }}>{cand.ward}</td>
                                    <td style={{ padding: '12px' }}>
                                       <button onClick={() => handleDeleteCandidate(cand.id)} className="btn-icon" style={{color: 'var(--accent)'}}>
                                          <Trash2 size={18} />
                                       </button>
                                    </td>
                                 </tr>
                              ))}
                              {candidatesList.length === 0 && (
                                 <tr>
                                    <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)' }}>No candidates found.</td>
                                 </tr>
                              )}
                           </tbody>
                        </table>
                     </div>
                  </>
               )}

               {activeTab === 'moderation' && (
                  <>
                     <h2 style={{marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <ShieldCheck className="text-secondary" /> Video Moderation Queue
                     </h2>
                     <div style={{ display: 'grid', gap: '1.5rem' }}>
                        {pendingVideos.map(video => (
                           <div key={video.id} className="glass-panel" style={{ display: 'flex', gap: '1rem', padding: '1rem' }}>
                              <video src={video.url} controls style={{ width: '200px', borderRadius: '8px', background: '#000' }} />
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                 <div>
                                    <h4>Candidate ID: {video.candidate_id}</h4>
                                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>Uploaded By: {video.uploaded_by}</p>
                                 </div>
                                 <div style={{ display: 'flex', gap: '12px', marginTop: '1rem' }}>
                                    <button onClick={() => handleModerateVideo(video.id, 'approve')} className="btn btn-success" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                       <Check size={16} /> Approve
                                    </button>
                                    <button onClick={() => handleModerateVideo(video.id, 'reject')} className="btn" style={{ background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                       <X size={16} /> Reject
                                    </button>
                                 </div>
                              </div>
                           </div>
                        ))}
                        {pendingVideos.length === 0 && (
                           <div className="text-center text-muted" style={{ padding: '3rem 0' }}>
                              No videos pending moderation.
                           </div>
                        )}
                     </div>
                  </>
               )}
            </div>
         </div>
      </div>
   );
};

export default AdminDashboard;
