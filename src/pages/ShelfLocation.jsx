import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { collection, getDocs, addDoc, doc, deleteDoc, updateDoc } from "firebase/firestore";
import Swal from 'sweetalert2';

const ShelfLocation = () => {
  const [BookShelfs, setBookShelfs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBookShelfId, setCurrentBookShelfId] = useState(null);
  const [newBookShelf, setNewBookShelf] = useState({ BookShelfName: '', Quantity: '' });

  useEffect(() => {
    const fetchBookShelfs = async () => {
      try {
        const BookShelfsCollection = collection(db, 'shelf');
        const BookShelfSnapshot = await getDocs(BookShelfsCollection);
        const BookShelfsList = BookShelfSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBookShelfs(BookShelfsList);
      } catch (error) {
        console.error("Error fetching BookShelfs: ", error);
      }
    };

    fetchBookShelfs();
  }, []);

  const handleOpenModal = () => setShowModal(true); // Open modal
  const handleCloseModal = () => {
    setShowModal(false); // Close modal
    setIsEditing(false);
    setNewBookShelf({ BookShelfName: '', Quantity: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewBookShelf(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      if (isEditing && currentBookShelfId) {
        // Update document in Firestore
        const BookShelfRef = doc(db, 'shelf', currentBookShelfId);
        await updateDoc(BookShelfRef, newBookShelf);
        setBookShelfs(prev => prev.map(BookShelf =>
          BookShelf.id === currentBookShelfId ? { ...BookShelf, ...newBookShelf } : BookShelf
        ));
      } else {
        // Add new document to Firestore
        const BookShelfsCollection = collection(db, 'shelf');
        const docRef = await addDoc(BookShelfsCollection, newBookShelf);
        setBookShelfs([...BookShelfs, { id: docRef.id, ...newBookShelf }]);
      }

      handleCloseModal();
    } catch (error) {
      console.error("Error saving BookShelf: ", error);
    }
  };

  const handleEdit = (BookShelf) => {
    setNewBookShelf({ BookShelfName: BookShelf.BookShelfName, Quantity: BookShelf.Quantity });
    setCurrentBookShelfId(BookShelf.id);
    setIsEditing(true);
    handleOpenModal();
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Xóa kệ này?',
      text: "Bạn có chắc chắn muốn xóa kệ này?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, 'shelf', id));
        setBookShelfs(BookShelfs.filter(BookShelf => BookShelf.id !== id));
        Swal.fire(
          'Đã xóa!',
          'Danh mục đã được xóa.',
          'success'
        );
      } catch (error) {
        console.error("Error deleting BookShelf: ", error);
      }
    }
  };

  return (
    <div className="mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Quản lý kệ sách</h2>
      <button
        className="btn btn-primary mb-4"
        onClick={handleOpenModal} // Open modal
      >
        Thêm kệ sách
      </button>

      <table className="table table-bordered table-striped mt-4">
        <thead>
          <tr>
            <th>Tên kệ sách</th>
            <th>Số lượng</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {BookShelfs.map(BookShelf => (
            <tr key={BookShelf.id}>
              <td>{BookShelf.BookShelfName}</td>
              <td>{BookShelf.Quantity}</td>
              <td className="text-center">
                <button
                  className="btn btn-warning me-2"
                  onClick={() => handleEdit(BookShelf)}
                >
                  Sửa
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(BookShelf.id)}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">{isEditing ? "Chỉnh sửa kệ sách" : "Thêm kệ sách"}</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="BookShelfName" className="form-label">Tên kệ sách</label>
                  <input
                    type="text"
                    className="form-control"
                    id="BookShelfName"
                    name="BookShelfName"
                    value={newBookShelf.BookShelfName}
                    onChange={handleChange}
                    placeholder="Nhập tên kệ sách"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="Quantity" className="form-label">Số lượng</label>
                  <input
                    type="number"
                    className="form-control"
                    id="Quantity"
                    name="Quantity"
                    value={newBookShelf.Quantity}
                    onChange={handleChange}
                    placeholder="Nhập số lượng"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Hủy</button>
                <button type="button" className="btn btn-primary" onClick={handleSave}>{isEditing ? "Cập nhật kệ" : "Lưu"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShelfLocation;
