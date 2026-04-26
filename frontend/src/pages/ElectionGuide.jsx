import Timeline from '../components/Timeline/Timeline';
import { BookOpen } from 'lucide-react';

const ElectionGuide = () => {
  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <div className="flex-center" style={{ gap: '12px', marginBottom: '1rem', marginTop: '1rem' }}>
        <BookOpen className="text-primary" size={32} />
        <h1 style={{ fontSize: '2.5rem', margin: 0 }}>Election Process Guide</h1>
      </div>
      <p className="text-center text-muted" style={{ maxWidth: '600px', margin: '0 auto 3rem auto', fontSize: '1.1rem' }}>
        Understand the stages of your local election. Step-by-step through the democractic flow, with our AI guide ready to answer your specific questions at each phase.
      </p>
      
      <Timeline />
    </div>
  );
};

export default ElectionGuide;
