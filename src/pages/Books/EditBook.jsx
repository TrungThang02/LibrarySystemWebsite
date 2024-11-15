import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db, storage } from '../../firebase/firebase';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
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
      try {
        const bookDoc = await getDoc(doc(db, 'books', id));
        if (bookDoc.exists()) {
          setBook(bookDoc.data());
        } else {
          console.error("Book not found!");
        }
      } catch (error) {
        console.error("Error fetching book: ", error);
      }
    };

    const fetchData = async () => {
      try {
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
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
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
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Chỉnh Sửa Sách</h2>
      {book && (
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Tên sách:</label>
              <input
                type="text"
                name="title"
                value={book.title}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Tác giả:</label>
              <select
                name="author"
                value={book.author}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Chọn tác giả</option>
                {authors.map(author => (
                  <option key={author.id} value={author.name}>{author.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Danh mục:</label>
              <select
                name="category"
                value={book.category}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Chọn danh mục</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>{category.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Mô tả:</label>
              <input
                type="text"
                name="description"
                value={book.description}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Nhà xuất bản:</label>
              <select
                name="publisher"
                value={book.publisher}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Chọn nhà xuất bản</option>
                {publishers.map(publisher => (
                  <option key={publisher.id} value={publisher.name}>{publisher.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Người đóng góp:</label>
              <input
                type="text"
                name="contributor"
                value={book.contributor}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Ngày phát hành:</label>
              <input
                type="date"
                name="date"
                value={book.date}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Loại tài liệu:</label>
              <input
                type="text"
                name="type"
                value={book.type}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Định dạng:</label>
              <input
                type="text"
                name="format"
                value={book.format}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Mã định danh (ISBN):</label>
              <input
                type="text"
                name="identifier"
                value={book.identifier}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Nguồn:</label>
              <input
                type="text"
                name="source"
                value={book.source}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Ngôn ngữ:</label>
              <input
                type="text"
                name="language"
                value={book.language}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Mối liên hệ:</label>
              <input
                type="text"
                name="relation"
                value={book.relation}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Bản quyền:</label>
              <input
                type="text"
                name="rights"
                value={book.rights}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Phạm vi:</label>
              <input
                type="text"
                name="coverage"
                value={book.coverage}
                onChange={handleChange}
                className="form-control"
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
            <div className="col-md-4 mb-3">
              <label className="form-label">Số lượng:</label>
              <input
                type="number"
                name="quantity"
                value={book.quantity}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Vị trí:</label>
              <select
                name="location"
                value={book.location}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Chọn vị trí</option>
                {shelves.map(shelf => (
                  <option key={shelf.id} value={shelf.name}>{shelf.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Tình trạng:</label>
              <input
                type="text"
                name="condition"
                value={book.condition}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            
            <div className="col-md-4 mb-3">
              <label className="form-label">Ảnh bìa:</label>
              <input
                type="file"
                name="coverImage"
                onChange={handleFileChange}
                className="form-control"
              />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Tải lên PDF:</label>
              <input
                type="file"
                name="pdfFile"
                onChange={handlePdfChange}
                className="form-control"
              />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Tải lên Audio:</label>
              <input
                type="file"
                name="audioFile"
                onChange={handleAudioChange}
                className="form-control"
              />
            </div>
          </div>
          <div className="mt-4">
            <button type="submit" className="btn btn-primary">
              Cập Nhật Sách
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditBook;
