import { useState, useEffect } from 'react';
import Timeline from '../components/Timeline/Timeline';
import { BookOpen, Loader } from 'lucide-react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const ElectionGuide = () => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  if (authLoading) {
    return <div className="flex-center" style={{ padding: '4rem' }}><Loader className="animate-spin text-primary" size={48} /></div>;
  }
  if (!user) {
    return (
      <div className="container glass-panel" style={{ padding: '4rem', textAlign: 'center', marginTop: '2rem' }}>
        <h2>Login Required</h2>
        <p className="text-muted" style={{ marginTop: '1rem' }}>Please sign in to access the election guide.</p>
      </div>
    );
  }

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
