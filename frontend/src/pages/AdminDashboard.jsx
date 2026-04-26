import { useState } from 'react';
import { ShieldAlert, Plus, Edit, Trash2, ShieldCheck, Loader, UploadCloud } from 'lucide-react';
import { candidateApi } from '../lib/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
   const [formData, setFormData] = useState({
      name: '',
      party: '',
      ward: '',
      image: ''
   });
   
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [message, setMessage] = useState(null);
   const [activeTab, setActiveTab] = useState('add_candidate');

   const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      setMessage(null);
      
      try {
         // In production, backend validates the Firebase Admin Custom Claim
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
                  <button className={`admin-nav-item ${activeTab === 'add_candidate' ? 'active' : ''}`} onClick={() => setActiveTab('add_candidate')}>
                     <Plus size={18} /> Add Candidate
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
               {activeTab === 'add_candidate' && (
                  <>
                     <h2 style={{marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <Plus className="text-secondary" /> Register New Candidate
                     </h2>
                     
                     {message && (
                        <div className={`admin-alert ${message.type}`}>
                           {message.text}
                        </div>
                     )}

                     <form onSubmit={handleSubmit} className="admin-form">
                        <div className="form-group">
                           <label>Candidate Full Name</label>
                           <input 
                              type="text" 
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              className="input-glass" 
                              required 
                              placeholder="e.g. Ramesh Kumar"
                           />
                        </div>
                        
                        <div className="form-group">
                           <label>Political Party</label>
                           <input 
                              type="text" 
                              name="party"
                              value={formData.party}
                              onChange={handleInputChange}
                              className="input-glass" 
                              required 
                              placeholder="e.g. Independent"
                           />
                        </div>

                        <div className="form-group">
                           <label>Constituency / Ward</label>
                           <select 
                              name="ward" 
                              value={formData.ward} 
                              onChange={handleInputChange} 
                              className="input-glass"
                              required
                           >
                              <option value="" disabled>Select a Ward</option>
                              <option value="Ward 5">Ward 5</option>
                              <option value="Ward 8">Ward 8</option>
                              <option value="Ward 12">Ward 12</option>
                           </select>
                        </div>
                        
                        <div className="form-group">
                           <label>Profile Image URL</label>
                           <input 
                              type="url" 
                              name="image"
                              value={formData.image}
                              onChange={handleInputChange}
                              className="input-glass" 
                              placeholder="https://example.com/image.jpg"
                           />
                        </div>

                        <button type="submit" className="btn btn-primary mt-4" disabled={isSubmitting}>
                           {isSubmitting ? (
                              <><Loader className="animate-spin" size={18} /> Registering...</>
                           ) : (
                              <><UploadCloud size={18} /> Save Candidate Entry</>
                           )}
                        </button>
                     </form>
                  </>
               )}

               {activeTab !== 'add_candidate' && (
                  <div className="empty-state text-center" style={{padding: '4rem 0'}}>
                     <h3 className="text-muted">Module in Development</h3>
                     <p className="text-muted">Listings and video moderation UI will be connected in Phase 2.</p>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
};

export default AdminDashboard;
