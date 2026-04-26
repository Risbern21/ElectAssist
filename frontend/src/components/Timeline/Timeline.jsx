import { useState, useEffect } from 'react';
import { CheckCircle2, ChevronRight, Info, AlertCircle, Loader } from 'lucide-react';
import { timelineApi } from '../../lib/api';
import './Timeline.css';

const Timeline = () => {
  const [timeline, setTimeline] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(null); 

  useEffect(() => {
    const fetchTimeline = async () => {
       setIsLoading(true);
       try {
          const data = await timelineApi.getStages();
          if (data && data.length > 0) {
             setTimeline(data);
             // Find current active step
             const active = data.find(s => s.status === 'active');
             setActiveStep(active ? active.id : data[0].id);
          }
       } catch (err) {
         console.warn("Using fallback timeline, backend not ready");
       } finally {
         setIsLoading(false);
       }
    };
    fetchTimeline();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-center" style={{padding: '3rem', flexDirection: 'column', gap: '1rem'}}>
          <Loader className="animate-spin text-primary" size={32} />
          <span className="text-muted">Loading Election Timeline...</span>
      </div>
    );
  }

  if (timeline.length === 0) {
     return (
        <div className="glass-panel text-center text-muted p-4">
           Election timeline has not been published yet.
        </div>
     );
  }

  return (
    <div className="timeline-container">
      <div className="timeline-track">
        {timeline.map((step, index) => (
          <div 
            key={step.id} 
            className={`timeline-step ${step.status} ${activeStep === step.id ? 'active-focus' : ''}`}
            onClick={() => setActiveStep(step.id)}
          >
            <div className="step-marker">
              {step.status === 'completed' ? (
                 <CheckCircle2 className="text-success marker-icon" />
              ) : step.status === 'active' ? (
                 <div className="active-dot animate-pulse"></div>
              ) : (
                 <div className="upcoming-dot"></div>
              )}
              {index < timeline.length - 1 && <div className={`step-line ${step.status === 'completed' ? 'bg-success' : 'line-inactive'}`}></div>}
            </div>
            
            <div className="step-content glass-panel">
               <div className="step-header">
                 <h3>{step.title}</h3>
                 <span className="step-date">{step.date}</span>
               </div>
               
               {activeStep === step.id && (
                 <div className="step-details animate-fade-in">
                   <p className="step-desc text-muted">{step.description}</p>
                   
                   <div className="ai-suggestion">
                     <AlertCircle size={16} className="text-primary" />
                     <span>Ask AI Guide: </span>
                     <button className="prompt-btn">"{step.aiPrompt}" <ChevronRight size={14} /></button>
                   </div>
                 </div>
               )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="timeline-info glass-panel">
        <div className="info-header">
          <Info className="text-secondary" />
          <h4>Why this matters?</h4>
        </div>
        <p className="text-muted text-sm mt-2">
          Participating in every stage of the election ensures your voice is heard. The active phase requires you to evaluate candidates before the campaign blackout period.
        </p>
      </div>
    </div>
  );
};

export default Timeline;
