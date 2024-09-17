import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './App.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Auth/Login.jsx';
import MakeAppointments from './pages/MakeAppointments.jsx';
import { AuthProvider } from '../context/authContext/index.jsx';

import ProtectedRoute from './pages/Auth/ProtectedRoute.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <App />
              </ProtectedRoute>
            }
            
          />
             
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);