import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ChatPage from './pages/ChatPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        <Routes>
          {/* Default route redirects to chat */}
          <Route path="/" element={<Navigate to="/chat" replace />} />
          
          {/* Main chat interface */}
          <Route path="/chat" element={<ChatPage />} />
          
          {/* Admin login */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Admin panel */}
          <Route path="/admin" element={<AdminPage />} />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/chat" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;