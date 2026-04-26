import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import ElectionGuide from './pages/ElectionGuide';
import Candidates from './pages/Candidates';
import Chat from './pages/Chat';
import MapView from './pages/Map';
import AdminDashboard from './pages/AdminDashboard';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="guide" element={<ElectionGuide />} />
          <Route path="candidates" element={<Candidates />} />
          <Route path="chat" element={<Chat />} />
          <Route path="map" element={<MapView />} />
          <Route path="admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
