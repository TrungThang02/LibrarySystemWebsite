import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { collection, getDocs, addDoc, doc, deleteDoc, updateDoc } from "firebase/firestore";
import Swal from 'sweetalert2';
import { FaEdit, FaTrash } from 'react-icons/fa';
const BookCategory = () => {
  const [bookCategories, setBookCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBookCategoryId, setCurrentBookCategoryId] = useState(null);
  const [newBookCategory, setNewBookCategory] = useState({ categoryName: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({}); // State to track validation errors

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
    setErrors({}); // Reset errors when modal is closed
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewBookCategory(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const validateForm = () => {
    let formErrors = {};
    if (!newBookCategory.categoryName.trim()) {
      formErrors.categoryName = 'Tên danh mục không được để trống!';
    }
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {

      return;
    }

    setLoading(true);
    try {
      if (isEditing && currentBookCategoryId) {
        const bookCategoryRef = doc(db, 'category', currentBookCategoryId);
        await updateDoc(bookCategoryRef, newBookCategory);
        setBookCategories(prev => prev.map(bookCategory =>
          bookCategory.id === currentBookCategoryId ? { ...bookCategory, ...newBookCategory } : bookCategory
        ));
      } else {
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
      {/* <h2 className="text-2xl font-bold mb-4">Quản lý danh mục</h2> */}
      <button
        className="btn btn-primary mb-3"
        onClick={handleOpenModal}
      >
        Thêm Danh mục
      </button>
      <table className="table table-bordered table-hover">
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
                  className="btn btn-primary mr-2"
                  onClick={() => handleEdit(bookCategory)}
                  title="Sửa"
                >
                  <FaEdit size={18} />
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(bookCategory.id)}
                  title="Xóa"
                >
                  <FaTrash size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{isEditing ? "Chỉnh sửa danh mục" : "Thêm danh mục"}</h5>
                <button type="button" className="close" onClick={handleCloseModal}>&times;</button>
              </div>
              <div className="modal-body">
                <form id="categoryForm" noValidate>
                  <div className="form-group">
                    <label htmlFor="categoryName">Tên danh mục sách</label>
                    <input
                      type="text"
                      className={`form-control ${errors.categoryName ? 'is-invalid' : ''}`}
                      name="categoryName"
                      value={newBookCategory.categoryName}
                      onChange={handleChange}
                      placeholder="Nhập tên danh mục sách"
                      required
                    />
                    <div className="invalid-feedback">{errors.categoryName}</div>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Hủy</button>
                <button
                  type="button"
                  className={`btn btn-primary ${loading ? 'disabled' : ''}`}
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? "Đang lưu..." : (isEditing ? "Cập nhật" : "Lưu")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BookCategory;
