import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/landing/HomePage';
import AuthPage from './components/AuthPage';
import ChartPage from './pages/ChartPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Navigate to="/chart" replace />} />
        <Route path="/chart" element={<ChartPage />} />
        <Route path="/match" element={<ChartPage />} />
        <Route path="/admin" element={<AdminPage />} />
        {/* App-specific auth routes */}
        <Route path="/codecity" element={<AuthPage app="codecity" />} />
        <Route path="/astrova" element={<AuthPage app="astrova" />} />
        <Route path="/graphini" element={<AuthPage app="graphini" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
