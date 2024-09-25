import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { collection, getDocs, addDoc, doc, deleteDoc, updateDoc } from "firebase/firestore";
import Swal from 'sweetalert2';

import "../assets/modal.css";   
const ShelfLocation = () => {
  const [BookCategorys, setBookCategorys] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBookCategoryId, setCurrentBookCategoryId] = useState(null);
  const [newBookCategory, setNewBookCategory] = useState({ Name: '' });

  useEffect(() => {
    const fetchBookCategorys = async () => {
      try {
        const BookCategorysCollection = collection(db, 'category');
        const BookCategorySnapshot = await getDocs(BookCategorysCollection);
        const BookCategorysList = BookCategorySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBookCategorys(BookCategorysList);
      } catch (error) {
        console.error("Error fetching BookCategorys: ", error);
      }
    };

    fetchBookCategorys();
  }, []);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setNewBookCategory({ Name: ''});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewBookCategory(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      if (isEditing && currentBookCategoryId) {
        // Update document in Firestore
        const BookCategoryRef = doc(db, 'category', currentBookCategoryId);
        await updateDoc(BookCategoryRef, newBookCategory);
        setBookCategorys(prev => prev.map(BookCategory =>
          BookCategory.id === currentBookCategoryId ? { ...BookCategory, ...newBookCategory } : BookCategory
        ));
      } else {
        // Add new document to Firestore
        const BookCategorysCollection = collection(db, 'category');
        const docRef = await addDoc(BookCategorysCollection, newBookCategory);
        setBookCategorys([...BookCategorys, { id: docRef.id, ...newBookCategory }]);
      }

      handleCloseModal();
    } catch (error) {
      console.error("Error saving BookCategory: ", error);
    }
  };

  const handleEdit = (BookCategory) => {
    setNewBookCategory({ Name: BookCategory.Name});
    setCurrentBookCategoryId(BookCategory.id);
    setIsEditing(true);
    handleOpenModal();
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Xóa Danh mục?',
      text: "Bạn có chắc chắn muốn xóa Danh mục này?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, 'category', id));
        setBookCategorys(BookCategorys.filter(BookCategory => BookCategory.id !== id));
        Swal.fire(
          'Đã xóa!',
          'Danh mục đã được xóa.',
          'success'
        );
      } catch (error) {
        console.error("Error deleting BookCategory: ", error);
      }
    }
  };

  return (
    <div className="mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Danh mục</h2>
      <button
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-green-600 mb-4 "
        onClick={handleOpenModal}
      >
        Thêm Danh mục
      </button>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="w-full bg-gray-100 border-b">
            <th className="py-2 px-4 border-r">Tên danh mục sách</th>
            <th className="py-2 px-4"></th>
          </tr>
          
        </thead>
        <tbody>
          {BookCategorys.map(BookCategory => (
            <tr key={BookCategory.id} className="border-b hover:bg-gray-50">
              <td className="py-2 px-4 border-r">{BookCategory.Name}</td>
              <td className="py-2 px-4 flex gap-2">
                <button
                  className="bg-yellow-500 text-white py-1 px-2 rounded"
                  onClick={() => handleEdit(BookCategory)}
                >
                  Sửa
                </button>
                <button
                  className="bg-red-500 text-white py-1 px-2 rounded"
                  onClick={() => handleDelete(BookCategory.id)}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
  <div className={`fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center modal-overlay ${showModal ? 'show' : ''}`}>
    <div className={`bg-white p-4 rounded shadow-lg w-full max-w-xl md:max-w-xs lg:max-w-xs modal ${showModal ? 'show' : ''}`}>
      <h2 className="text-xl font-bold mb-4">{isEditing ? "Chỉnh sửa danh mục" : "Thêm danh mục"}</h2>
      <div className="mb-4">
        <input
          type="text"
          name="Name"
          placeholder="Nhập tên danh mục sách"
          value={newBookCategory.Name}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div className="flex justify-end">
        <button
          onClick={handleCloseModal}
          className="bg-gray-500 text-white py-2 px-4 rounded mr-2"
        >
          Hủy
        </button>
        <button
          onClick={handleSave}
          className="bg-blue-500 text-white py-2 px-4 rounded"
        >
          {isEditing ? "Cập nhật kệ" : "Lưu"}
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default ShelfLocation;
