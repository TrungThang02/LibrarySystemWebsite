import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { collection, getDocs, addDoc, doc, deleteDoc, updateDoc } from "firebase/firestore";
import Swal from 'sweetalert2';

const BookCategory = () => {
  const [bookCategories, setBookCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBookCategoryId, setCurrentBookCategoryId] = useState(null);
  const [newBookCategory, setNewBookCategory] = useState({ categoryName: '' });
  const [loading, setLoading] = useState(false); // Loading state

  // Fetching categories from Firestore
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

  // Handle saving the category
  const handleSave = async () => {
    if (!newBookCategory.categoryName.trim()) {
      Swal.fire('Lỗi', 'Tên danh mục không được để trống!', 'error');
      return;
    }

    setLoading(true);
    try {
      if (isEditing && currentBookCategoryId) {
        // Update existing category
        const bookCategoryRef = doc(db, 'category', currentBookCategoryId);
        await updateDoc(bookCategoryRef, newBookCategory);
        setBookCategories(prev => prev.map(bookCategory =>
          bookCategory.id === currentBookCategoryId ? { ...bookCategory, ...newBookCategory } : bookCategory
        ));
      } else {
        // Add new category
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

  // Open modal for editing a category
  const handleEdit = (bookCategory) => {
    setNewBookCategory({ categoryName: bookCategory.categoryName });
    setCurrentBookCategoryId(bookCategory.id);
    setIsEditing(true);
    handleOpenModal();
  };

  // Handle category deletion
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
    <div className="container mt-5">
      <h2 className="h2">Danh mục</h2>
      <button
        className="btn btn-primary mb-4"
        onClick={handleOpenModal}
      >
        Thêm Danh mục
      </button>
      <table className="table table-striped table-hover">
        <thead>
          <tr>
            <th>Tên danh mục sách</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {bookCategories.map(bookCategory => (
            <tr key={bookCategory.id}>
              <td>{bookCategory.categoryName}</td>
              <td>
                <button
                  className="btn btn-warning mr-2"
                  onClick={() => handleEdit(bookCategory)}
                >
                  Sửa
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(bookCategory.id)}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for adding/editing categories */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">{isEditing ? "Chỉnh sửa danh mục" : "Thêm danh mục"}</h2>
            <div className="mb-4">
              <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700">Tên danh mục sách</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded mt-1"
                id="categoryName"
                name="categoryName"
                placeholder="Nhập tên danh mục sách"
                value={newBookCategory.categoryName}
                onChange={handleChange}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-500 text-white py-2 px-4 rounded"
                onClick={handleCloseModal}
              >
                Hủy
              </button>
              <button
                className={`bg-blue-500 text-white py-2 px-4 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleSave}
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
