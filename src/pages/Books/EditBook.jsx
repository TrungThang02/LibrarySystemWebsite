import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db, storage } from '../../firebase/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const EditBook = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [shelves, setShelves] = useState([]);
  const [categories, setCategories] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBook = async () => {
      const bookDoc = await getDoc(doc(db, 'books', id));
      if (bookDoc.exists()) {
        setBook(bookDoc.data());
      } else {
        console.error("Book not found!");
      }
    };

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

    fetchBook();
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBook(prevState => ({
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
      let coverImageUrl = book.coverImage;
      let pdfUrl = book.pdfUrl;
      let audioUrl = book.audioUrl;

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

      const bookDoc = doc(db, 'books', id);
      await updateDoc(bookDoc, { ...book, coverImage: coverImageUrl, pdfUrl, audioUrl });
      navigate('/books');
    } catch (error) {
      console.error("Error updating book: ", error);
    }
  };

  return (
    <div className="mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Chỉnh Sửa Sách</h2>
      {book && (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block">Tên sách:</label>
              <input
                type="text"
                name="title"
                value={book.title}
                onChange={handleChange}
                className="border w-full px-2 py-1"
              />
            </div>
            <div>
              <label className="block">Tác giả:</label>
              <select
                name="author"
                value={book.author}
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
                value={book.subject}
                onChange={handleChange}
                className="border w-full px-2 py-1"
              />
            </div>
            <div>
              <label className="block">Mô tả:</label>
              <input
                type="text"
                name="description"
                value={book.description}
                onChange={handleChange}
                className="border w-full px-2 py-1"
              />
            </div>
            <div>
              <label className="block">Nhà xuất bản:</label>
              <select
                name="publisher"
                value={book.publisher}
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
                value={book.contributor}
                onChange={handleChange}
                className="border w-full px-2 py-1"
              />
            </div>
            <div>
              <label className="block">Ngày phát hành:</label>
              <input
                type="date"
                name="date"
                value={book.date}
                onChange={handleChange}
                className="border w-full px-2 py-1"
              />
            </div>
            <div>
              <label className="block">Loại tài liệu:</label>
              <input
                type="text"
                name="type"
                value={book.type}
                onChange={handleChange}
                className="border w-full px-2 py-1"
              />
            </div>
            <div>
              <label className="block">Định dạng:</label>
              <input
                type="text"
                name="format"
                value={book.format}
                onChange={handleChange}
                className="border w-full px-2 py-1"
              />
            </div>
            <div>
              <label className="block">Mã định danh (ISBN):</label>
              <input
                type="text"
                name="identifier"
                value={book.identifier}
                onChange={handleChange}
                className="border w-full px-2 py-1"
              />
            </div>
            <div>
              <label className="block">Nguồn:</label>
              <input
                type="text"
                name="source"
                value={book.source}
                onChange={handleChange}
                className="border w-full px-2 py-1"
              />
            </div>
            <div>
              <label className="block">Ngôn ngữ:</label>
              <input
                type="text"
                name="language"
                value={book.language}
                onChange={handleChange}
                className="border w-full px-2 py-1"
              />
            </div>
            <div>
              <label className="block">Mối quan hệ:</label>
              <input
                type="text"
                name="relation"
                value={book.relation}
                onChange={handleChange}
                className="border w-full px-2 py-1"
              />
            </div>
            <div>
              <label className="block">Phạm vi:</label>
              <input
                type="text"
                name="coverage"
                value={book.coverage}
                onChange={handleChange}
                className="border w-full px-2 py-1"
              />
            </div>
            <div>
              <label className="block">Quyền:</label>
              <input
                type="text"
                name="rights"
                value={book.rights}
                onChange={handleChange}
                className="border w-full px-2 py-1"
              />
            </div>
            <div>
              <label className="block">Số trang:</label>
              <input
                type="number"
                name="pageCount"
                value={book.pageCount}
                onChange={handleChange}
                className="border w-full px-2 py-1"
              />
            </div>
            <div>
              <label className="block">Số lượng:</label>
              <input
                type="number"
                name="quantity"
                value={book.quantity}
                onChange={handleChange}
                className="border w-full px-2 py-1"
              />
            </div>
            <div>
              <label className="block">Tình trạng:</label>
              <input
                type="text"
                name="condition"
                value={book.condition}
                onChange={handleChange}
                className="border w-full px-2 py-1"
              />
            </div>
            <div>
              <label className="block">Kệ sách:</label>
              <select
                name="location"
                value={book.location}
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
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Cập nhật sách</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditBook;
