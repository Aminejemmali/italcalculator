import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function FloatingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // State for hamburger menu
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  if (!currentUser) return null;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-xl font-bold text-indigo-600">Ital Abrasivi Calculator</span>
          </div>

          {/* Hamburger Button for small screens */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>

          {/* Desktop menu */}
          <div className="hidden lg:flex space-x-4">
            <NavLink to="/" isActive={location.pathname === '/'}>Dashboard</NavLink>
            <NavLink to="/products" isActive={location.pathname === '/products'}>Products</NavLink>
            <NavLink to="/materials" isActive={location.pathname === '/materials'}>Materials</NavLink>
            <NavLink to="/calculator" isActive={location.pathname === '/calculator'}>Calculator</NavLink>
            <NavLink to="/history" isActive={location.pathname === '/history'}>History</NavLink>
            <button 
              onClick={handleLogout}
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu (when hamburger is clicked) */}
      {isOpen && (
        <div className="lg:hidden px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-md">
          <NavLink to="/" isActive={location.pathname === '/'}>Dashboard</NavLink>
          <NavLink to="/products" isActive={location.pathname === '/products'}>Products</NavLink>
          <NavLink to="/materials" isActive={location.pathname === '/materials'}>Materials</NavLink>
          <NavLink to="/calculator" isActive={location.pathname === '/calculator'}>Calculator</NavLink>
          <NavLink to="/history" isActive={location.pathname === '/history'}>History</NavLink>
          <button 
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

function NavLink({ to, children, isActive }) {
  return (
    <Link
      to={to}
      className={`block px-3 py-2 rounded-md text-sm font-medium ${
        isActive
          ? 'text-indigo-600 bg-indigo-50'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {children}
    </Link>
  );
}
