import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ChatPage from './pages/ChatPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';
import ServerErrorPage from './pages/ServerErrorPage';

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
          
          {/* Error pages */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="/500" element={<ServerErrorPage />} />
          
          {/* 404 Not Found - Catch all route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;