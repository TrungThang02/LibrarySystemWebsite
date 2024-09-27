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
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-green-600 mb-4"
        onClick={handleOpenModal} // Open modal
      >
        Thêm kệ sách
      </button>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="w-full bg-gray-100 border-b">
            <th className="py-2 px-4 border-r">Tên kệ sách</th>
            <th className="py-2 px-4 border-r">Số lượng</th>
            <th className="py-2 px-4"></th>
          </tr>
        </thead>
        <tbody>
          {BookShelfs.map(BookShelf => (
            <tr key={BookShelf.id} className="border-b hover:bg-gray-50">
              <td className="py-2 px-4 border-r">{BookShelf.BookShelfName}</td>
              <td className="py-2 px-4 border-r">{BookShelf.Quantity}</td>
              <td className="py-2 px-4 flex gap-2">
                <button
                  className="bg-yellow-500 text-white py-1 px-2 rounded"
                  onClick={() => handleEdit(BookShelf)}
                >
                  Sửa
                </button>
                <button
                  className="bg-red-500 text-white py-1 px-2 rounded"
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
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white p-4 rounded shadow-lg w-full max-w-xl md:max-w-xs lg:max-w-xs">
            <h2 className="text-xl font-bold mb-4">{isEditing ? "Chỉnh sửa kệ sách" : "Thêm kệ sách"}</h2>
            <div className="mb-4">
              <input
                type="text"
                name="BookShelfName"
                placeholder="Nhập tên kệ sách"
                value={newBookShelf.BookShelfName}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="mb-4">
              <input
                type="number"
                name="Quantity"
                placeholder="Nhập số lượng"
                value={newBookShelf.Quantity}
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
