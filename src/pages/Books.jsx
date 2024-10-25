import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, storage } from '../firebase/firebase';
import { collection, getDocs, addDoc, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Swal from 'sweetalert2';

const Books = () => {
  const [Books, setBooks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBookId, setCurrentBookId] = useState(null);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    category: '',
    publisher: '',
    description: '',
    date: '',
    type: '',
    format: '',
    identifier: '',
    source: '',
    language: '',
    relation: '',
    coverage: '',
    rights: '',
    pageCount: '',
    quantity: '',
    condition: '',
    location: '',
    coverImage: '',
    pdfUrl: '',
    audioUrl: '',
    status: 'available'
  });
  const [shelves, setShelves] = useState([]);
  const [categories, setCategories] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);

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
          name: doc.data().BookShelfName,
        }));
        setShelves(shelvesList);
      } catch (error) {
        console.error("Error fetching shelves: ", error);
      }
    };

    fetchShelves();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesCollection = collection(db, 'category');
        const categoriesSnapshot = await getDocs(categoriesCollection);
        const categoriesList = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().categoryName,
        }));
        setCategories(categoriesList);
      } catch (error) {
        console.error("Error fetching categories: ", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchPublishers = async () => {
      try {
        const publishersCollection = collection(db, 'publisher');
        const publishersSnapshot = await getDocs(publishersCollection);
        const publishersList = publishersSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().PublisherName,
        }));
        setPublishers(publishersList);
      } catch (error) {
        console.error("Error fetching publishers: ", error);
      }
    };

    fetchPublishers();
  }, []);

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const authorsCollection = collection(db, 'author');
        const authorsSnapshot = await getDocs(authorsCollection);
        const authorsList = authorsSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().authorName,
        }));
        setAuthors(authorsList);
      } catch (error) {
        console.error("Error fetching authors: ", error);
      }
    };

    fetchAuthors();
  }, []);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setNewBook({
      title: '',
      author: '',
      category: '',
      publisher: '',
      description: '',
      date: '',
      type: '',
      format: '',
      identifier: '',
      source: '',
      language: '',
      relation: '',
      coverage: '',
      rights: '',
      pageCount: '',
      quantity: '',
      condition: '',
      location: '',
      coverImage: '',
      pdfUrl: '',
      audioUrl: '',
      status: 'available'
    });
    setCoverImageFile(null);
    setPdfFile(null);
    setAudioFile(null);
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
    setCoverImageFile(file);
  };

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    setPdfFile(file);
  };

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    setAudioFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let coverImageUrl = newBook.coverImage;
      let pdfUrl = newBook.pdfUrl;
      let audioUrl = newBook.audioUrl;

      if (coverImageFile) {
        const storageRef = ref(storage, `coverImages/${coverImageFile.name}`);
        await uploadBytes(storageRef, coverImageFile);
        coverImageUrl = await getDownloadURL(storageRef);
      }
      if (pdfFile) {
        const pdfRef = ref(storage, `pdfs/${pdfFile.name}`);
        await uploadBytes(pdfRef, pdfFile);
        pdfUrl = await getDownloadURL(pdfRef);
      }
      if (audioFile) {
        const audioRef = ref(storage, `audio/${audioFile.name}`);
        await uploadBytes(audioRef, audioFile);
        audioUrl = await getDownloadURL(audioRef);
      }

      if (isEditing && currentBookId) {
        const BookRef = doc(db, 'books', currentBookId);
        await updateDoc(BookRef, { ...newBook, coverImage: coverImageUrl, pdfUrl, audioUrl });
        setBooks(prev => prev.map(Book =>
          Book.id === currentBookId ? { ...Book, ...newBook, coverImage: coverImageUrl, pdfUrl, audioUrl } : Book
        ));
      } else {
        const BooksCollection = collection(db, 'books');
        const docRef = await addDoc(BooksCollection, { ...newBook, coverImage: coverImageUrl, pdfUrl, audioUrl });
        setBooks([...Books, { id: docRef.id, ...newBook, coverImage: coverImageUrl, pdfUrl, audioUrl }]);
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

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-white p-3 rounded shadow-lg w-full max-w-full max-h-full">
            <h2 className="text-2xl font-bold mb-2">{isEditing ? "Chỉnh sửa sách" : "Thêm sách mới"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-3 gap-4">
                
              <div>
                  <label className="block">Tên sách:</label>
                  <input
                    type="text"
                    name="title"
                    value={newBook.title}
                    onChange={handleChange}
                    className="border w-full px-2 py-1"
                  />
                </div>
                <div>
                  <label className="block">Tác giả:</label>
                  <select
                    name="author"
                    value={newBook.author}
                    onChange={handleChange}
                    className="border w-full px-2 py-1 bg-slate-200"
                  >
                    <option value="">Chọn tác giả</option>
                    {authors.map(author => (
                      <option key={author.id} value={author.name}>{author.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block">Chủ đề:</label>
                  <input
                    type="text"
                    name="subject"
                    value={newBook.subject}
                    onChange={handleChange}
                    className="border w-full px-2 py-1"
                  />
                </div>
                <div>
                  <label className="block">Mô tả:</label>
                  <input
                    type="text"
                    name="description"
                    value={newBook.description}
                    onChange={handleChange}
                    className="border w-full px-2 py-1"
                  />
                </div>
                <div>
                  <label className="block">Nhà xuất bản:</label>
                  <select
                    name="publisher"
                    value={newBook.publisher}
                    onChange={handleChange}
                    className="border w-full px-2 py-1 bg-slate-200"
                  >
                    <option value="">Chọn nhà xuất bản</option>
                    {publishers.map(publisher => (
                      <option key={publisher.id} value={publisher.name}>{publisher.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block">Người đóng góp:</label>
                  <input
                    type="text"
                    name="contributor"
                    value={newBook.contributor}
                    onChange={handleChange}
                    className="border w-full px-2 py-1"
                  />
                </div>
                <div>
                  <label className="block">Ngày phát hành:</label>
                  <input
                    type="date"
                    name="date"
                    value={newBook.date}
                    onChange={handleChange}
                    className="border w-full px-2 py-1"
                  />
                </div>
                <div>
                  <label className="block">Loại tài liệu:</label>
                  <input
                    type="text"
                    name="type"
                    value={newBook.type}
                    onChange={handleChange}
                    className="border w-full px-2 py-1"
                  />
                </div>
                <div>
                  <label className="block">Định dạng:</label>
                  <input
                    type="text"
                    name="format"
                    value={newBook.format}
                    onChange={handleChange}
                    className="border w-full px-2 py-1"
                  />
                </div>
                <div>
                  <label className="block">Mã định danh (ISBN):</label>
                  <input
                    type="text"
                    name="identifier"
                    value={newBook.identifier}
                    onChange={handleChange}
                    className="border w-full px-2 py-1"
                  />
                </div>
                <div>
                  <label className="block">Nguồn:</label>
                  <input
                    type="text"
                    name="source"
                    value={newBook.source}
                    onChange={handleChange}
                    className="border w-full px-2 py-1"
                  />
                </div>
                <div>
                  <label className="block">Ngôn ngữ:</label>
                  <input
                    type="text"
                    name="language"
                    value={newBook.language}
                    onChange={handleChange}
                    className="border w-full px-2 py-1"
                  />
                </div>
                <div>
                  <label className="block">Mối quan hệ:</label>
                  <input
                    type="text"
                    name="relation"
                    value={newBook.relation}
                    onChange={handleChange}
                    className="border w-full px-2 py-1"
                  />
                </div>
                <div>
                  <label className="block">Phạm vi:</label>
                  <input
                    type="text"
                    name="coverage"
                    value={newBook.coverage}
                    onChange={handleChange}
                    className="border w-full px-2 py-1"
                  />
                </div>
                <div>
                  <label className="block">Quyền:</label>
                  <input
                    type="text"
                    name="rights"
                    value={newBook.rights}
                    onChange={handleChange}
                    className="border w-full px-2 py-1"
                  />
                </div>
                <div>
                  <label className="block">Số trang:</label>
                  <input
                    type="number"
                    name="pageCount"
                    value={newBook.pageCount}
                    onChange={handleChange}
                    className="border w-full px-2 py-1"
                  />
                </div>
                <div>
                  <label className="block">Số lượng:</label>
                  <input
                    type="number"
                    name="quantity"
                    value={newBook.quantity}
                    onChange={handleChange}
                    className="border w-full px-2 py-1"
                  />
                </div>
                <div>
                  <label className="block">Tình trạng:</label>
                  <select
                    name="condition"
                    value={newBook.status}
                    onChange={handleChange}
                    className="border w-full px-2 py-1 bg-slate-200"
                  >
                    <option value="available">Chưa mượn</option>
                    <option value="borrowed">Đã mượn</option>
                  </select>
                </div>
                <div>
                  <label className="block">Vị trí:</label>
                  <select
                    name="location"
                    value={newBook.location}
                    onChange={handleChange}
                    className="border w-full px-2 py-1 bg-slate-200"
                  >
                    <option value="">Chọn kệ</option>
                    {shelves.map(shelf => (
                      <option key={shelf.id} value={shelf.name}>{shelf.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block">Thể loại:</label>
                  <select
                    name="category"
                    value={newBook.category}
                    onChange={handleChange}
                    className="border w-full px-2 py-1 bg-slate-200"
                  >
                    <option value="">Chọn thể loại</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.name}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block">Hình ảnh bìa:</label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="border w-full px-2 py-1"
                  />
                </div>
                <div>
                  <label className="block">Tệp PDF:</label>
                  <input
                    type="file"
                    onChange={handlePdfChange}
                    className="border w-full px-2 py-1"
                  />
                </div>
                <div>
                  <label className="block">Tệp âm thanh:</label>
                  <input
                    type="file"
                    onChange={handleAudioChange}
                    className="border w-full px-2 py-1"
                  />
                </div>
            
              </div>
               
              <div className="mt-4 flex justify-end">
                <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-green-600">
                  {isEditing ? "Cập nhật sách" : "Thêm sách"}
                </button>
                <button type="button" onClick={handleCloseModal} className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 ml-2">
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