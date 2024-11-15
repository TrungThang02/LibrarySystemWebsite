import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import User from './pages/User';
import Login from './pages/Auth/Login';


import BorrowReturnBooks from './pages/BorrowReturnBooks';
import { AuthProvider } from '../context/authContext';

import Books from './pages/Books/Books';
import BookCategory from './pages/BookCategory';
import ShelfLocation from './pages/ShelfLocation';
import BookDetail from './pages/Books/BookDetail';
import Author from './pages/Author';
import Publisher from './pages/Publisher';
import AddBook from './pages/Books/AddBook';
import EditBook from './pages/Books/EditBook';
import './index.css';
import './App.css'
const App = () => {
  return (
    <>
      <Sidebar>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/user" element={<User />} />
        
          <Route path="/return" element={<BorrowReturnBooks />} />
          <Route path="/books" element={<Books />} />
          <Route path="/shelf" element={<ShelfLocation />} />
          <Route path="/publisher" element={<Publisher />} />
          <Route path="/author" element={<Author />} />
          <Route path="/category" element={<BookCategory />} />
          <Route path="/add-book" element={<AddBook />} />
          <Route path="/edit-book/:id" element={<EditBook />} />
          <Route path="/book-detail/:id" element={<BookDetail />} />
          <Route path="/home" element={<Home />} />


        </Routes>
      </Sidebar>

    </>
  );
};

export default App;
