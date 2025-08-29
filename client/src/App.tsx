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
         
          <Route path="/" element={<Navigate to="/chat" replace />} />
          
          <Route path="/chat" element={<ChatPage />} />
          
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/admin" element={<AdminPage />} />
          
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="/500" element={<ServerErrorPage />} />
          
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;