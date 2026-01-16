import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './components/landing/HomePage';
import ChartPage from './pages/ChartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/chart" element={<ChartPage />} />
        <Route path="/match" element={<ChartPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
