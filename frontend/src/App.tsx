import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Background3D } from './components/Background3D';

import { Landing } from './pages/Landing';
import { AuthCallback } from './pages/AuthCallback';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { Roadmap } from './pages/Roadmap';

function App() {
  return (
    <Router>
      <Background3D />
      <div className="relative z-[1] min-h-screen">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/oauth2/redirect" element={<AuthCallback />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/roadmap" element={<Roadmap />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
