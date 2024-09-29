import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, storage } from '../firebase/firebase'; // Đảm bảo rằng bạn đã import storage
import { collection, getDocs, addDoc, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Thêm import cho Storage
import Swal from 'sweetalert2';

const Books = () => {
  const [Books, setBooks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBookId, setCurrentBookId] = useState(null);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    publisher: '',
    publicationYear: '',
    isbn: '',
    language: '',
    genre: '', // Thể loại
    pageCount: '',
    description: '',
    quantity: '',
    condition: '',
    location: '',
    coverImage: '',
    pdfUrl: ''
  });
  const [shelves, setShelves] = useState([]);
  const [categories, setCategories] = useState([]); // Danh sách thể loại
  const [coverImageFile, setCoverImageFile] = useState(null); // Trạng thái lưu tệp hình ảnh
  const [pdfFile, setPdfFile] = useState(null);

  const navigate = useNavigate(); 

  const handleViewDetail = (id) => {
    navigate(`/book-detail/${id}`); 
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

  useEffect(() => {
    const fetchShelves = async () => {
      try {
        const shelvesCollection = collection(db, 'shelf');
        const shelvesSnapshot = await getDocs(shelvesCollection);
        const shelvesList = shelvesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setShelves(shelvesList);
      } catch (error) {
        console.error("Error fetching shelves: ", error);
      }
    };

    fetchShelves();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => { // Hàm lấy danh sách thể loại
      try {
        const categoriesCollection = collection(db, 'category');
        const categoriesSnapshot = await getDocs(categoriesCollection);
        const categoriesList = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCategories(categoriesList);
      } catch (error) {
        console.error("Error fetching categories: ", error);
      }
    };

    fetchCategories();
  }, []);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setNewBook({
      title: '',
      author: '',
      publisher: '',
      publicationYear: '',
      isbn: '',
      language: '',
      genre: '', // Đặt lại thể loại
      pageCount: '',
      description: '',
      quantity: '',
      condition: '',
      location: '',
      coverImage: '',
      pdfUrl: ''
    });
    setCoverImageFile(null); // Reset file image
    setPdfFile(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewBook(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setCoverImageFile(file); // Lưu tệp hình ảnh
  };
  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    setPdfFile(file); // Lưu tệp PDF
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let coverImageUrl = newBook.coverImage;
      let pdfUrl = newBook.pdfUrl;
      // Nếu có tệp hình ảnh được chọn, tải lên Firebase Storage
      if (coverImageFile) {
        const storageRef = ref(storage, `coverImages/${coverImageFile.name}`);
        await uploadBytes(storageRef, coverImageFile); // Tải tệp lên
        coverImageUrl = await getDownloadURL(storageRef); // Lấy URL tải lên
      }
      // Nếu có tệp PDF được chọn, tải lên Firebase Storage
      if (pdfFile) {
        const pdfRef = ref(storage, `pdfs/${pdfFile.name}`);
        await uploadBytes(pdfRef, pdfFile);
        pdfUrl = await getDownloadURL(pdfRef); // Lấy URL của PDF
      }
      if (isEditing && currentBookId) {
        const BookRef = doc(db, 'books', currentBookId);
        await updateDoc(BookRef, { ...newBook, coverImage: coverImageUrl, pdfUrl });
        setBooks(prev => prev.map(Book =>
          Book.id === currentBookId ? { ...Book, ...newBook, coverImage: coverImageUrl, pdfUrl } : Book
        ));
      } else {
        const BooksCollection = collection(db, 'books');
        const docRef = await addDoc(BooksCollection, { ...newBook, coverImage: coverImageUrl, pdfUrl });
        setBooks([...Books, { id: docRef.id, ...newBook, coverImage: coverImageUrl, pdfUrl }]);
      }

      handleCloseModal();
    } catch (error) {
      console.error("Error saving Book: ", error);
    }
  };

  const handleEdit = (Book) => {
    setNewBook(Book);
    setCurrentBookId(Book.id);
    setIsEditing(true);
    handleOpenModal();
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
        await deleteDoc(doc(db, 'books', id));
        setBooks(Books.filter(Book => Book.id !== id));
        Swal.fire('Đã xóa!', 'Sách đã được xóa.', 'success');
      } catch (error) {
        console.error("Error deleting Book: ", error);
      }
    }
  };

  return (
    <div className="mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Quản lý sách</h2>
      <button
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-green-600 mb-4"
        onClick={handleOpenModal}
      >
        Thêm Sách
      </button>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="w-full bg-gray-100 border-b">
            <th className="py-2 px-4 border-r">Hình ảnh</th>
            <th className="py-2 px-4 border-r">Tên sách</th>
            <th className="py-2 px-4 border-r">Nhà xuất bản</th>
            <th className="py-2 px-4 border-r">Số lượng</th>
            <th className="py-2 px-4"></th>
          </tr>
        </thead>
        <tbody>
          {Books.map(Book => (
            <tr key={Book.id} className="border-b hover:bg-gray-50">
              <td className="py-2 px-4 border-r"><img src={Book.coverImage} alt={Book.title} width="50" /></td>
              <td className="py-2 px-4 border-r">{Book.title}</td>
              <td className="py-2 px-4 border-r">{Book.publisher}</td>
              <td className="py-2 px-4 border-r">{Book.quantity}</td>
              <td className="py-2 px-4 flex gap-2">
                <button
                  className="bg-yellow-500 text-white py-1 px-2 rounded"
                  onClick={() => handleEdit(Book)}
                >
                  Sửa
                </button>
                <button
                  className="bg-blue-500 text-white py-1 px-2 rounded"
                  onClick={() => handleViewDetail(Book.id)} // Nút Xem chi tiết
                >
                  Xem chi tiết
                </button>
                <button
                  className="bg-red-500 text-white py-1 px-2 rounded"
                  onClick={() => handleDelete(Book.id)}
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
          <div className="bg-white p-5 rounded shadow-lg w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">{isEditing ? "Chỉnh sửa sách" : "Thêm sách"}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tên sách:</label>
                <input
                  type="text"
                  name="title"
                  value={newBook.title}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tác giả:</label>
                <input
                  type="text"
                  name="author"
                  value={newBook.author}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nhà xuất bản:</label>
                <input
                  type="text"
                  name="publisher"
                  value={newBook.publisher}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Năm xuất bản:</label>
                <input
                  type="text"
                  name="publicationYear"
                  value={newBook.publicationYear}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">ISBN:</label>
                <input
                  type="text"
                  name="isbn"
                  value={newBook.isbn}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ngôn ngữ:</label>
                <input
                  type="text"
                  name="language"
                  value={newBook.language}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Thể loại:</label>
                <select
                  name="genre"
                  value={newBook.genre}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded"
                  required
                >
                  <option value="">Chọn thể loại</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.categoryName}>
                      {category.categoryName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Số trang:</label>
                <input
                  type="number"
                  name="pageCount"
                  value={newBook.pageCount}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Mô tả:</label>
                <textarea
                  name="description"
                  value={newBook.description}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Số lượng:</label>
                <input
                  type="number"
                  name="quantity"
                  value={newBook.quantity}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tình trạng:</label>
                <select
                  name="condition"
                  value={newBook.condition}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded"
                  required
                >
                  <option value="">Chọn tình trạng</option>
                  <option value="Chưa mượn">Chưa mượn</option>
                  <option value="Đã mượn">Đã mượn</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Vị trí:</label>
                <select
                  name="location"
                  value={newBook.location}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded"
                  required
                >
                  <option value="">Chọn kệ sách</option>
                  {shelves.map(shelf => (
                    <option key={shelf.id} value={shelf.BookShelfName}>
                      {shelf.BookShelfName}
                    </option>
                  ))}
                </select>
              </div>

              <label className="block text-sm font-medium text-gray-700">Tải ảnh bìa:</label>
              <div className="col-span-3 flex justify-end">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <label className="block text-sm font-medium text-gray-700">Tải file sách:</label>
              <div className="col-span-3 flex justify-end">
                <input type="file" accept="application/pdf" onChange={handlePdfChange} className="mt-1 block w-full p-2 border border-gray-300 rounded"/>
              </div>
              <div className="col-span-3 flex justify-end">
                <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">
                  {isEditing ? "Cập nhật sách" : "Lưu"}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="bg-gray-500 text-white py-2 px-4 rounded ml-2"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Books;
