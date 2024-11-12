import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { collection, getDocs, addDoc, doc, deleteDoc, updateDoc } from "firebase/firestore";
import Swal from 'sweetalert2';
import "../assets/modal.css";

const BookCategory = () => {
  const [bookCategories, setBookCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBookCategoryId, setCurrentBookCategoryId] = useState(null);
  const [newBookCategory, setNewBookCategory] = useState({ categoryName: '' });
  const [loading, setLoading] = useState(false); // Loading state

  useEffect(() => {
    const fetchBookCategories = async () => {
      try {
        const bookCategoriesCollection = collection(db, 'category');
        const bookCategoriesSnapshot = await getDocs(bookCategoriesCollection);
        const bookCategoriesList = bookCategoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBookCategories(bookCategoriesList);
      } catch (error) {
        console.error("Error fetching BookCategories: ", error);
      }
    };

    fetchBookCategories();
  }, []);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setNewBookCategory({ categoryName: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewBookCategory(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!newBookCategory.categoryName.trim()) {
      Swal.fire('Lỗi', 'Tên danh mục không được để trống!', 'error');
      return;
    }

    setLoading(true);
    try {
      if (isEditing && currentBookCategoryId) {
        // Update document in Firestore
        const bookCategoryRef = doc(db, 'category', currentBookCategoryId);
        await updateDoc(bookCategoryRef, newBookCategory);
        setBookCategories(prev => prev.map(bookCategory =>
          bookCategory.id === currentBookCategoryId ? { ...bookCategory, ...newBookCategory } : bookCategory
        ));
      } else {
        // Add new document to Firestore
        const bookCategoriesCollection = collection(db, 'category');
        const docRef = await addDoc(bookCategoriesCollection, newBookCategory);
        setBookCategories([...bookCategories, { id: docRef.id, ...newBookCategory }]);
      }

      handleCloseModal();
    } catch (error) {
      console.error("Error saving BookCategory: ", error);
      Swal.fire('Lỗi', 'Có lỗi xảy ra khi lưu danh mục!', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (bookCategory) => {
    setNewBookCategory({ categoryName: bookCategory.categoryName });
    setCurrentBookCategoryId(bookCategory.id);
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
        setBookCategories(bookCategories.filter(bookCategory => bookCategory.id !== id));
        Swal.fire('Đã xóa!', 'Danh mục đã được xóa.', 'success');
      } catch (error) {
        console.error("Error deleting BookCategory: ", error);
      }
    }
  };

  return (
    <div className="mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Danh mục</h2>
      <button
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-green-600 mb-4"
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
          {bookCategories.map(bookCategory => (
            <tr key={bookCategory.id} className="border-b hover:bg-gray-50">
              <td className="py-2 px-4 border-r">{bookCategory.categoryName}</td>
              <td className="py-2 px-4 flex gap-2">
                <button
                  className="bg-yellow-500 text-white py-1 px-2 rounded"
                  onClick={() => handleEdit(bookCategory)}
                >
                  Sửa
                </button>
                <button
                  className="bg-red-500 text-white py-1 px-2 rounded"
                  onClick={() => handleDelete(bookCategory.id)}
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
          <div className={`bg-white p-4 rounded shadow-lg w-full max-w-xl modal ${showModal ? 'show' : ''}`}>
            <h2 className="text-xl font-bold mb-4">{isEditing ? "Chỉnh sửa danh mục" : "Thêm danh mục"}</h2>
            <div className="mb-4">
            <label htmlFor="address" className="block mb-2">Tên danh mục sách</label>
              <input
                type="text"
                name="categoryName"
                placeholder="Nhập tên danh mục sách"
                value={newBookCategory.categoryName}
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
                className={`bg-blue-500 text-white py-2 px-4 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={loading} 
              >
                {loading ? "Đang lưu..." : (isEditing ? "Cập nhật" : "Lưu")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookCategory;
