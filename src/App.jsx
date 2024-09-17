<<<<<<< HEAD
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
=======
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
>>>>>>> 7494d21b8c68a214cba625db9f63a108230140c0
