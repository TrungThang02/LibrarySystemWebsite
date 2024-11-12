import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase/firebase';
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import Swal from 'sweetalert2';

const Books = () => {
  const [Books, setBooks] = useState([]);
  const navigate = useNavigate();

  const handleViewDetail = (id) => {
    navigate(`/book-detail/${id}`);
  };

  const handleEdit = (Book) => {
    navigate(`/edit-book/${Book.id}`);
  };

  const handleAddBook = () => {
    navigate('/add-book');
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Xóa sách?',
      text: "Bạn có chắc chắn muốn xóa sách này?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        // Add doc reference to delete the correct document
        const bookDocRef = doc(db, 'books', id);
        await deleteDoc(bookDocRef);
        
        // Update the local state after deleting the book
        setBooks(Books.filter(Book => Book.id !== id));
        
        Swal.fire('Đã xóa!', 'Sách đã được xóa.', 'success');
      } catch (error) {
        console.error("Error deleting Book: ", error);
        Swal.fire('Lỗi!', 'Có lỗi xảy ra khi xóa sách.', 'error');
      }
    }
  };

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const BooksCollection = collection(db, 'books');
        const BooksSnapshot = await getDocs(BooksCollection);
        const BooksList = BooksSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBooks(BooksList);
      } catch (error) {
        console.error("Error fetching Books: ", error);
      }
    };

    fetchBooks();
  }, []);

  return (
    <div className="mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Quản lý sách</h2>
      <button
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-green-600 mb-4"
        onClick={handleAddBook}
      >
        Thêm Sách
      </button>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="w-full bg-gray-100 border-b">
            <th className="py-2 px-4 border-r">Hình ảnh</th>
            <th className="py-2 px-4 border-r">Tên sách</th>
            <th className="py-2 px-4 border-r">Tác giả</th>
            <th className="py-2 px-4 border-r">Nhà xuất bản</th>
            <th className="py-2 px-4 border-r">Số lượng</th>
            <th className="py-2 px-4"></th>
          </tr>
        </thead>
        <tbody>
          {Books.map(Book => (
            <tr key={Book.id} className="border-b">
              <td className="py-2 px-4 border-r">
                <img src={Book.coverImage} alt={Book.title} className="w-16 h-24 object-cover" />
              </td>
              <td className="py-2 px-4 border-r">{Book.title}</td>
              <td className="py-2 px-4 border-r">{Book.author}</td>
              <td className="py-2 px-4 border-r">{Book.publisher}</td>
              <td className="py-2 px-4 border-r">{Book.quantity}</td>
              <td className="py-2 px-4">
                <button onClick={() => handleEdit(Book)} className="rounded py-1 px-4 bg-blue-300">Sửa</button>
                <button onClick={() => handleDelete(Book.id)} className="rounded py-1 px-4 ml-2 bg-green-300">Xóa</button>
                <button onClick={() => handleViewDetail(Book.id)} className="rounded py-1 px-4 ml-2 bg-red-300">Xem chi tiết</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Books;
