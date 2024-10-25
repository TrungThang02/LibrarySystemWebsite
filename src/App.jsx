import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import User from './pages/User';
import Login from './pages/Auth/Login';
import Appointment from './pages/BookCategory';

import BorrowReturnBooks from './pages/BorrowReturnBooks';
import { AuthProvider } from '../context/authContext';
import News from './pages/News';
import Books from './pages/Books';

import ShelfLocation from './pages/ShelfLocation';
import BookDetail from './pages/BookDetail';
import Author from './pages/Author';
import Publisher from './pages/Publisher';

import './index.css';
import './App.css'
const App = () => {
  return (
    <>
      <Sidebar>
        <Routes>
          <Route path="/" element={<Appointment />} />
          <Route path="/user" element={<User />} />
          <Route path="/news" element={<News />} />
          <Route path="/return" element={<BorrowReturnBooks />} />
          <Route path="/books" element={<Books />} />
          <Route path="/shelf" element={<ShelfLocation />} />
          <Route path="/publisher" element={<Publisher />} />
          <Route path="/author" element={<Author/>} />
      
        <Route path="/book-detail/:id" element={<BookDetail />} />
        <Route path="/home" element={<Home />} />
        

        </Routes>
      </Sidebar>

    </>
  );
};

export default App;
