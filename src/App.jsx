import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import User from './pages/User';
import Login from './pages/Auth/Login';
import Appointment from './pages/BookCategory';
import MakeAppointments from './pages/MakeAppointments';
import VaccineInfo from './pages/VaccineInfo';
import { AuthProvider } from '../context/authContext';
import News from './pages/News';
import './index.css';
import './App.css'
const App = () => {
  return (
    <>
      <Sidebar>
        <Routes>
          <Route path="/" element={<Appointment />} />
          <Route path="/user" element={<User />} />
          <Route path="/makeappointments" element={<MakeAppointments />} />
          <Route path="/news" element={<News />} />
          <Route path="/vaccineinfo" element={<VaccineInfo />} />
        </Routes>
      </Sidebar>

    </>
  );
};

export default App;
