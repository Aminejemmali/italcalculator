import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProductProvider } from './contexts/ProductContext';
import { MaterialProvider } from './contexts/MaterialContext';
import PrivateRoute from './components/PrivateRoute';
import FloatingNavbar from './components/FloatingNavbar';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Materials from './pages/Materials';
import Calculator from './pages/Calculator';
import History from './pages/History';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ProductProvider>
          <MaterialProvider>
            <div className="min-h-screen bg-gray-50">
              <FloatingNavbar />
              <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                  <Route path="/products" element={<PrivateRoute><Products /></PrivateRoute>} />
                  <Route path="/materials" element={<PrivateRoute><Materials /></PrivateRoute>} />
                  <Route path="/calculator" element={<PrivateRoute><Calculator /></PrivateRoute>} />
                  <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
                </Routes>
              </div>
            </div>
          </MaterialProvider>
        </ProductProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;