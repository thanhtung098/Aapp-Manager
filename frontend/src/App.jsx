import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Home, FileText, Settings } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import CalculatorPage from './pages/Calculator';
import History from './pages/History';
import InvoiceDetail from './pages/InvoiceDetail';
import SettingsPage from './pages/Settings';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/calculator/:roomId" element={<CalculatorPage />} />
        <Route path="/history" element={<History />} />
        <Route path="/invoice/:invoiceId" element={<InvoiceDetail />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>

      {/* Bottom Navigation */}
      <nav className="bottom-nav no-print">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
          <Home size={20} />
          <span>Phòng</span>
        </NavLink>
        <NavLink to="/history" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FileText size={20} />
          <span>Hóa đơn</span>
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Settings size={20} />
          <span>Cài đặt</span>
        </NavLink>
      </nav>
    </BrowserRouter>
  );
}

export default App;
