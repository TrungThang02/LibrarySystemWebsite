import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, storage } from '../../firebase/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const AddBook = () => {
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
    status: 'available',
  });
  const [shelves, setShelves] = useState([]);
  const [categories, setCategories] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const shelvesCollection = collection(db, 'shelf');
      const shelvesSnapshot = await getDocs(shelvesCollection);
      setShelves(shelvesSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().BookShelfName })));

      const categoriesCollection = collection(db, 'category');
      const categoriesSnapshot = await getDocs(categoriesCollection);
      setCategories(categoriesSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().categoryName })));

      const publishersCollection = collection(db, 'publisher');
      const publishersSnapshot = await getDocs(publishersCollection);
      setPublishers(publishersSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().PublisherName })));

      const authorsCollection = collection(db, 'author');
      const authorsSnapshot = await getDocs(authorsCollection);
      setAuthors(authorsSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().authorName })));
    };

    fetchData();
  }, []);

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
      let coverImageUrl = '';
      let pdfUrl = '';
      let audioUrl = '';

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

      const BooksCollection = collection(db, 'books');
      await addDoc(BooksCollection, { ...newBook, coverImage: coverImageUrl, pdfUrl, audioUrl });
      navigate('/books');
    } catch (error) {
      console.error("Error adding book: ", error);
    }
  };

  return (
    <div className="mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Thêm Sách Mới</h2>
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
            <input
              type="text"
              name="condition"
              value={newBook.condition}
              onChange={handleChange}
              className="border w-full px-2 py-1"
            />
          </div>
          <div>
            <label className="block">Kệ sách:</label>
            <select
              name="location"
              value={newBook.location}
              onChange={handleChange}
              className="border w-full px-2 py-1 bg-slate-200"
            >
              <option value="">Chọn kệ sách</option>
              {shelves.map(shelf => (
                <option key={shelf.id} value={shelf.name}>{shelf.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block">Ảnh bìa:</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="border w-full px-2 py-1"
            />
          </div>
          <div>
            <label className="block">Tải lên PDF:</label>
            <input
              type="file"
              onChange={handlePdfChange}
              className="border w-full px-2 py-1"
            />
          </div>
          <div>
            <label className="block">Tải lên Audio:</label>
            <input
              type="file"
              onChange={handleAudioChange}
              className="border w-full px-2 py-1"
            />
          </div>
        </div>
        <div className="mt-4">
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Thêm sách</button>
        </div>
      </form>
    </div>
  );
};

export default AddBook;
