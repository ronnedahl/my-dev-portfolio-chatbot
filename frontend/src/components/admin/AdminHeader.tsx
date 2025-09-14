import React from 'react';
import { Link } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';

const AdminHeader: React.FC = () => {
  return (
    <div className="mb-8 flex items-center justify-between">
      <Link 
        to="/chat"
        className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
      >
        <IoArrowBack size={20} />
        <span>Tillbaka till chat</span>
      </Link>
      
      <h1 className="text-2xl font-bold text-white">
        Admin Panel
      </h1>
      
      <div className="w-32"></div> 
    </div>
  );
};

export default AdminHeader;