import React from 'react';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../store/slices/authSlice';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const { user } = useSelector(selectAuth);
  const sidebarOpen = useSelector((state) => state.ui?.sidebarOpen || false);

  return (
    <div className="min-h-screen bg-primary-black">
      {/* Header */}
      <Header />
      
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <main 
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'
          }`}
        >
          <div className="p-6 pt-20 min-h-screen">
            {children}
          </div>
        </main>
      </div>
      
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => {
            // Dispatch simple sin store específico por ahora
            window.dispatchEvent(new CustomEvent('closeSidebar'));
          }}
        />
      )}
    </div>
  );
};

export default Layout;