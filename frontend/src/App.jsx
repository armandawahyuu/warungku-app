import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import OpenSession from './pages/OpenSession';
import CloseSession from './pages/CloseSession';
import TransactionForm from './pages/TransactionForm';
import CategorySettings from './pages/CategorySettings';
import Reports from './pages/Reports';
import Login from './pages/Login';
import UserManagement from './pages/UserManagement';

import Layout from './components/Layout';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/open" element={<OpenSession />} />
                  <Route path="/close/:id" element={<CloseSession />} />
                  <Route path="/transaction/:type" element={<TransactionForm />} />
                  <Route path="/settings/categories" element={<CategorySettings />} />
                  <Route path="/settings/users" element={<UserManagement />} />
                  <Route path="/reports" element={<Reports />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
