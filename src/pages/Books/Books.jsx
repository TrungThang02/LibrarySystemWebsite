import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase/firebase';
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import Swal from 'sweetalert2';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
const Books = () => {
  const [Books, setBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [booksPerPage] = useState(5);
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
        const bookDocRef = doc(db, 'books', id);
        await deleteDoc(bookDocRef);
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

  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = Books.slice(indexOfFirstBook, indexOfLastBook);


  const paginate = pageNumber => setCurrentPage(pageNumber);

  return (
    <div className="mx-auto p-4">
      {/* <h2 className="text-2xl font-bold mb-4">Quản lý sách</h2> */}
      <button
        className="btn btn-primary mb-3"
        onClick={handleAddBook}
      >
        Thêm Sách
      </button>

      <table className="table table-bordered table-hover">
        <thead>
          <tr>
            <th>Hình ảnh</th>
            <th>Tên sách</th>
            <th>Tác giả</th>
            <th>Nhà xuất bản</th>
            <th>Số lượng</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {currentBooks.map(Book => (
            <tr key={Book.id} className="border-b">
              <td>
                <img src={Book.coverImage} alt={Book.title} className="w-16 h-24 object-cover" />
              </td>
              <td>{Book.title}</td>
              <td>{Book.author}</td>
              <td>{Book.publisher}</td>
              <td>{Book.quantity}</td>
              <td>
      <button
        onClick={() => handleEdit(Book)}
        className="btn btn-primary me-2"
        title="Sửa"
      >
        <FaEdit size={16} />
      </button>
      <button
        onClick={() => handleViewDetail(Book.id)}
        className="btn btn-success me-2"
        title="Xem chi tiết"
      >
        <FaEye size={16} />
      </button>
      <button
        onClick={() => handleDelete(Book.id)}
        className="btn btn-danger "
        title="Xóa"
      >
        <FaTrash size={16} />
      </button>
     
    </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-center mt-4">
        {[...Array(Math.ceil(Books.length / booksPerPage)).keys()].map(number => (
          <button key={number} onClick={() => paginate(number + 1)} className="mx-1 px-3 py-1 bg-gray-300 rounded">
            {number + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Books;
