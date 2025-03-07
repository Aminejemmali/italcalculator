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

  const handleMenuItemClick = () => {
    setIsOpen(false); // Close the menu when a link is clicked
  };

  if (!currentUser) return null;

  return (
    <nav
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 w-11/12 max-w-7xl rounded-xl ${
        isScrolled
          ? 'bg-white shadow-lg py-3'
          : 'bg-white/80 backdrop-blur-md py-4 shadow-md'
      }`}
    >
      <div className="px-6 sm:px-8 lg:px-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src="/images/calculator.png" className="w-10 h-10" alt="Logo" />
            <span className="text-xl font-semibold text-indigo-600">
              Ital Abrasivi Calculator
            </span>
          </div>

          {/* Hamburger Button for small screens */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-indigo-600 focus:outline-none p-2"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {/* Desktop menu */}
          <div className="hidden lg:flex items-center space-x-6">
            <NavLink to="/" isActive={location.pathname === '/'}>
              Dashboard
            </NavLink>
            <NavLink to="/products" isActive={location.pathname === '/products'}>
              Products
            </NavLink>
            <NavLink to="/materials" isActive={location.pathname === '/materials'}>
              Materials
            </NavLink>
            <NavLink to="/calculator" isActive={location.pathname === '/calculator'}>
              Calculator
            </NavLink>
            <NavLink to="/history" isActive={location.pathname === '/history'}>
              History
            </NavLink>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu (when hamburger is clicked) */}
      {isOpen && (
        <div className="lg:hidden px-6 pt-4 pb-6 space-y-2 bg-white rounded-b-xl shadow-lg">
          <NavLink
            to="/"
            isActive={location.pathname === '/'}
            onClick={handleMenuItemClick}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/products"
            isActive={location.pathname === '/products'}
            onClick={handleMenuItemClick}
          >
            Products
          </NavLink>
          <NavLink
            to="/materials"
            isActive={location.pathname === '/materials'}
            onClick={handleMenuItemClick}
          >
            Materials
          </NavLink>
          <NavLink
            to="/calculator"
            isActive={location.pathname === '/calculator'}
            onClick={handleMenuItemClick}
          >
            Calculator
          </NavLink>
          <NavLink
            to="/history"
            isActive={location.pathname === '/history'}
            onClick={handleMenuItemClick}
          >
            History
          </NavLink>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors duration-200"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

function NavLink({ to, children, isActive, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
        isActive
          ? 'text-indigo-600 bg-indigo-50'
          : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
      }`}
    >
      {children}
    </Link>
  );
}